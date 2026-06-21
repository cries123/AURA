from __future__ import annotations

import math
from datetime import datetime

import yfinance as yf

from app.market.market_data import resolve_yfinance_symbol


def _today_expiry(expirations: list[str]) -> str | None:
    today = datetime.utcnow().strftime("%Y-%m-%d")
    for exp in expirations:
        if exp == today:
            return exp
    return expirations[0] if expirations else None


def build_chain_heatmap(symbol: str, last_price: float, level_prices: list[float]) -> dict:
    if symbol == "SPX":
        return _demo_chain(symbol, last_price, level_prices, note="SPX — use SPY chain as proxy")

    yf_symbol = resolve_yfinance_symbol(symbol)
    ticker = yf.Ticker(yf_symbol)
    try:
        expirations = list(ticker.options or [])
    except Exception:
        expirations = []

    if not expirations:
        return _demo_chain(symbol, last_price, level_prices)

    expiry = _today_expiry(expirations)
    try:
        chain = ticker.option_chain(expiry)
        calls, puts = chain.calls, chain.puts
    except Exception:
        return _demo_chain(symbol, last_price, level_prices)

    if calls.empty and puts.empty:
        return _demo_chain(symbol, last_price, level_prices)

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

    gex = _estimate_gex(rows, last_price)
    max_pain = _compute_max_pain(calls, puts, strikes)

    return {
        "expiry": expiry,
        "is_0dte": expiry == datetime.utcnow().strftime("%Y-%m-%d"),
        "strikes": rows,
        "expected_move": round(em, 2) if em else None,
        "expected_move_pct": round(em / last_price * 100, 2) if em and last_price else None,
        "max_pain": max_pain,
        "gex": gex,
        "note": None,
    }


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
    """Simplified GEX proxy from OI — not true gamma without greeks feed."""
    call_gex = sum(r["call_oi"] for r in rows)
    put_gex = sum(r["put_oi"] for r in rows)
    net = call_gex - put_gex
    regime = "positive" if net > 0 else "negative"
    flip = spot * (1 - 0.005 if net > 0 else 1 + 0.005)
    return {
        "net_oi_bias": net,
        "regime": regime,
        "gamma_flip_estimate": round(flip, 2),
        "note": "OI-based proxy; use Polygon for true GEX",
    }


def _demo_chain(symbol: str, last_price: float, level_prices: list[float], note: str | None = None) -> dict:
    atm = round(last_price)
    strikes = [atm + i for i in range(-5, 6)]
    rows = []
    for i, strike in enumerate(strikes):
        call_oi = 3000 + (10 - abs(i)) * 800
        put_oi = 2800 + abs(i) * 600
        at_level = any(abs(strike - lp) / lp * 100 < 0.2 for lp in level_prices if lp)
        rows.append({
            "strike": float(strike),
            "call_oi": call_oi,
            "put_oi": put_oi,
            "call_volume": 1200 + i * 100,
            "put_volume": 1100 + i * 80,
            "net_oi": call_oi - put_oi,
            "at_liquidity_level": at_level,
            "wall": call_oi > 5000 or put_oi > 5000,
        })
    em = round(last_price * 0.012, 2)
    max_pain = float(atm)
    return {
        "expiry": datetime.utcnow().strftime("%Y-%m-%d"),
        "is_0dte": True,
        "strikes": rows,
        "expected_move": em,
        "expected_move_pct": round(em / last_price * 100, 2),
        "max_pain": max_pain,
        "gex": _estimate_gex(rows, last_price),
        "note": note or "Demo chain data",
    }
