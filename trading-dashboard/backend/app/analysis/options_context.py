from __future__ import annotations

from datetime import datetime, timedelta

import numpy as np
import yfinance as yf

from app.market.market_data import resolve_yfinance_symbol


def get_options_context(symbol: str, last_price: float, level_price: float) -> dict:
    """Build options context using yfinance options chain when available."""
    if symbol in ("SPX",):
        return _fallback_options_context(last_price, level_price, note="Index — use SPY for chain")

    yf_symbol = resolve_yfinance_symbol(symbol)
    ticker = yf.Ticker(yf_symbol)

    try:
        expirations = ticker.options
    except Exception:
        expirations = []

    if not expirations:
        return _fallback_options_context(last_price, level_price)

    nearest_exp = expirations[0]
    try:
        chain = ticker.option_chain(nearest_exp)
    except Exception:
        return _fallback_options_context(last_price, level_price)

    calls = chain.calls
    puts = chain.puts
    if calls.empty and puts.empty:
        return _fallback_options_context(last_price, level_price)

    all_strikes = sorted(set(calls["strike"].tolist() + puts["strike"].tolist()))
    nearest_strike = min(all_strikes, key=lambda s: abs(s - level_price))

    atm_strike = min(all_strikes, key=lambda s: abs(s - last_price)) if last_price else None
    expected_move = None
    if atm_strike is not None:
        atm_calls = calls[calls["strike"] == atm_strike]
        atm_puts = puts[puts["strike"] == atm_strike]
        if not atm_calls.empty and not atm_puts.empty:
            call_mid = (float(atm_calls["bid"].iloc[0]) + float(atm_calls["ask"].iloc[0])) / 2
            put_mid = (float(atm_puts["bid"].iloc[0]) + float(atm_puts["ask"].iloc[0])) / 2
            expected_move = call_mid + put_mid

    iv_rank = _estimate_iv_rank(ticker)

    dte = (datetime.strptime(nearest_exp, "%Y-%m-%d").date() - datetime.utcnow().date()).days
    dist_abs = last_price - level_price
    dist_pct = (dist_abs / level_price * 100) if level_price else None

    em_pct = (expected_move / last_price * 100) if expected_move and last_price else None
    em_ratio = None
    if expected_move and dist_abs is not None:
        em_ratio = abs(dist_abs) / expected_move if expected_move > 0 else None

    return {
        "nearest_strike": nearest_strike,
        "nearest_expiry": nearest_exp,
        "dte": dte,
        "iv_rank": iv_rank,
        "expected_move": round(expected_move, 2) if expected_move else None,
        "expected_move_pct": round(em_pct, 2) if em_pct else None,
        "distance_to_level": round(dist_abs, 2) if dist_abs is not None else None,
        "distance_to_level_pct": round(dist_pct, 3) if dist_pct is not None else None,
        "em_vs_distance_ratio": round(em_ratio, 2) if em_ratio else None,
        "note": None,
    }


def _estimate_iv_rank(ticker: yf.Ticker) -> float | None:
    try:
        hist = ticker.history(period="1y", interval="1d")
        if len(hist) < 30:
            return None
        returns = np.log(hist["Close"] / hist["Close"].shift(1)).dropna()
        realized = returns.rolling(20).std() * np.sqrt(252) * 100
        current = float(realized.iloc[-1])
        window = realized.dropna()
        if window.empty:
            return None
        rank = float((window < current).sum() / len(window) * 100)
        return round(rank, 1)
    except Exception:
        return None


def _fallback_options_context(last_price: float, level_price: float, note: str | None = None) -> dict:
    dist_abs = last_price - level_price if last_price and level_price else None
    dist_pct = (dist_abs / level_price * 100) if dist_abs is not None and level_price else None
    strike = round(level_price) if level_price else None
    return {
        "nearest_strike": strike,
        "nearest_expiry": None,
        "dte": None,
        "iv_rank": None,
        "expected_move": None,
        "expected_move_pct": None,
        "distance_to_level": round(dist_abs, 2) if dist_abs is not None else None,
        "distance_to_level_pct": round(dist_pct, 3) if dist_pct is not None else None,
        "em_vs_distance_ratio": None,
        "note": note or "Options chain unavailable",
    }
