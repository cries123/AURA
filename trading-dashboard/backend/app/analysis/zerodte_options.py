from __future__ import annotations

from datetime import datetime

import pandas as pd


def _today_expiry(expirations: list[str]) -> str | None:
    today = datetime.utcnow().strftime("%Y-%m-%d")
    for exp in expirations:
        if exp == today:
            return exp
    return expirations[0] if expirations else None


def build_chain_heatmap(
    symbol: str, last_price: float, level_prices: list[float], bars_df=None
) -> dict:
    sym = "SPY" if symbol == "SPX" else symbol

    chain = _try_yfinance_chain(sym, last_price, level_prices)
    if chain:
        return chain

    return _live_estimated_chain(sym, last_price, level_prices, bars_df)


def _try_yfinance_chain(symbol: str, last_price: float, level_prices: list[float]) -> dict | None:
    try:
        import yfinance as yf
        from app.market.yahoo_chart import resolve_symbol

        ticker = yf.Ticker(resolve_symbol(symbol))
        expirations = list(ticker.options or [])
        if not expirations:
            return None
        expiry = _today_expiry(expirations)
        oc = ticker.option_chain(expiry)
        calls, puts = oc.calls, oc.puts
        if calls.empty and puts.empty:
            return None

        strikes = sorted(set(calls["strike"].tolist() + puts["strike"].tolist()))
        lo, hi = last_price * 0.97, last_price * 1.03
        near = [s for s in strikes if lo <= s <= hi]

        rows = []
        for strike in near:
            c = calls[calls["strike"] == strike]
            p = puts[puts["strike"] == strike]
            call_oi = int(c["openInterest"].iloc[0]) if not c.empty and c["openInterest"].notna().any() else 0
            put_oi = int(p["openInterest"].iloc[0]) if not p.empty and p["openInterest"].notna().any() else 0
            call_vol = int(c["volume"].iloc[0]) if not c.empty and c["volume"].notna().any() else 0
            put_vol = int(p["volume"].iloc[0]) if not p.empty and p["volume"].notna().any() else 0
            at_level = any(abs(strike - lp) / lp * 100 < 0.2 for lp in level_prices if lp)
            rows.append({
                "strike": float(strike),
                "call_oi": call_oi,
                "put_oi": put_oi,
                "call_volume": call_vol,
                "put_volume": put_vol,
                "net_oi": call_oi - put_oi,
                "at_liquidity_level": at_level,
                "wall": call_oi > 5000 or put_oi > 5000,
            })

        atm = min(strikes, key=lambda s: abs(s - last_price))
        atm_c = calls[calls["strike"] == atm]
        atm_p = puts[puts["strike"] == atm]
        em = None
        if not atm_c.empty and not atm_p.empty:
            em = _mid(atm_c) + _mid(atm_p)

        return {
            "expiry": expiry,
            "is_0dte": expiry == datetime.utcnow().strftime("%Y-%m-%d"),
            "strikes": rows,
            "expected_move": round(em, 2) if em else None,
            "expected_move_pct": round(em / last_price * 100, 2) if em and last_price else None,
            "max_pain": _compute_max_pain(calls, puts, strikes),
            "gex": _estimate_gex(rows, last_price),
            "note": "Live options chain",
        }
    except Exception:
        return None


def _live_estimated_chain(
    symbol: str, last_price: float, level_prices: list[float], bars_df=None
) -> dict:
    em = _estimate_em_from_bars(bars_df, last_price)
    atm = round(last_price)
    step = 1 if last_price < 200 else 5 if last_price < 500 else 10
    strikes = [atm + i * step for i in range(-5, 6)]
    rows = []
    for strike in strikes:
        at_level = any(abs(strike - lp) / lp * 100 < 0.2 for lp in level_prices if lp)
        rows.append({
            "strike": float(strike),
            "call_oi": 0,
            "put_oi": 0,
            "call_volume": 0,
            "put_volume": 0,
            "net_oi": 0,
            "at_liquidity_level": at_level,
            "wall": at_level,
        })

    return {
        "expiry": datetime.utcnow().strftime("%Y-%m-%d"),
        "is_0dte": True,
        "strikes": rows,
        "expected_move": em,
        "expected_move_pct": round(em / last_price * 100, 2) if em and last_price else None,
        "max_pain": float(atm),
        "gex": {
            "net_oi_bias": 0,
            "regime": "unknown",
            "gamma_flip_estimate": round(last_price, 2),
            "note": "Add POLYGON_API_KEY for live GEX/OI",
        },
        "note": "Live price + ATR expected move (no OI feed)",
    }


def _estimate_em_from_bars(bars_df, last_price: float) -> float | None:
    if bars_df is None or bars_df.empty or not last_price:
        return round(last_price * 0.01, 2)
    df = bars_df.tail(78)  # ~6.5h of 5m bars
    if len(df) < 5:
        return round(last_price * 0.01, 2)
    hl = (df["high"] - df["low"]).mean()
    return round(float(hl) * 1.5, 2)


def em_consumed(last_price: float, open_price: float, expected_move: float | None) -> dict:
    if not expected_move or expected_move <= 0 or not open_price:
        return {"traveled": None, "consumed_pct": None, "remaining": None}
    traveled = abs(last_price - open_price)
    consumed = traveled / expected_move * 100
    return {
        "traveled": round(traveled, 2),
        "consumed_pct": round(consumed, 1),
        "remaining": round(max(expected_move - traveled, 0), 2),
    }


def pin_risk(last_price: float, max_pain: float | None, minutes_to_close: int = 60) -> dict:
    if not max_pain:
        return {"pin_risk": None, "distance_to_pin": None, "pull_direction": None}
    dist = last_price - max_pain
    risk = "elevated" if abs(dist) / last_price * 100 < 0.3 and minutes_to_close <= 90 else "normal"
    direction = "down" if dist > 0 else "up" if dist < 0 else "at_pin"
    return {
        "pin_risk": risk,
        "distance_to_pin": round(dist, 2),
        "distance_to_pin_pct": round(abs(dist) / last_price * 100, 3),
        "pull_direction": direction,
    }


def _mid(df) -> float:
    bid = float(df["bid"].iloc[0]) if df["bid"].notna().any() else 0
    ask = float(df["ask"].iloc[0]) if df["ask"].notna().any() else 0
    return (bid + ask) / 2 if bid or ask else float(df["lastPrice"].iloc[0] or 0)


def _compute_max_pain(calls, puts, strikes: list[float]) -> float | None:
    if not strikes:
        return None
    pains = []
    for expiry_price in strikes:
        pain = 0.0
        for _, row in calls.iterrows():
            oi = row.get("openInterest") or 0
            pain += max(expiry_price - row["strike"], 0) * oi * 100
        for _, row in puts.iterrows():
            oi = row.get("openInterest") or 0
            pain += max(row["strike"] - expiry_price, 0) * oi * 100
        pains.append((expiry_price, pain))
    return float(min(pains, key=lambda x: x[1])[0]) if pains else None


def _estimate_gex(rows: list[dict], spot: float) -> dict:
    call_gex = sum(r["call_oi"] for r in rows)
    put_gex = sum(r["put_oi"] for r in rows)
    net = call_gex - put_gex
    regime = "positive" if net > 0 else "negative"
    flip = spot * (1 - 0.005 if net > 0 else 1 + 0.005)
    return {
        "net_oi_bias": net,
        "regime": regime,
        "gamma_flip_estimate": round(flip, 2),
        "note": "Live OI from chain",
    }
