from __future__ import annotations

from datetime import datetime

import numpy as np

from app.analysis.zerodte_options import build_chain_heatmap, _estimate_em_from_bars
from app.market.market_data import fetch_ohlcv


def get_options_context(symbol: str, last_price: float, level_price: float) -> dict:
    sym = "SPY" if symbol == "SPX" else symbol
    bars = fetch_ohlcv(sym, "5m")
    chain = build_chain_heatmap(sym, last_price, [level_price], bars)

    em = chain.get("expected_move")
    if not em and not bars.empty:
        em = _estimate_em_from_bars(bars, last_price)

    nearest_strike = round(level_price) if level_price else round(last_price)
    if chain.get("strikes"):
        nearest_strike = min(chain["strikes"], key=lambda s: abs(s["strike"] - level_price))["strike"]

    iv_rank = _estimate_iv_rank_from_bars(bars)
    dist_abs = last_price - level_price if last_price and level_price else None
    dist_pct = (dist_abs / level_price * 100) if dist_abs is not None and level_price else None
    em_pct = (em / last_price * 100) if em and last_price else None
    em_ratio = abs(dist_abs) / em if em and dist_abs is not None and em > 0 else None

    return {
        "nearest_strike": nearest_strike,
        "nearest_expiry": chain.get("expiry"),
        "dte": 0 if chain.get("is_0dte") else None,
        "iv_rank": iv_rank,
        "expected_move": em,
        "expected_move_pct": round(em_pct, 2) if em_pct else None,
        "distance_to_level": round(dist_abs, 2) if dist_abs is not None else None,
        "distance_to_level_pct": round(dist_pct, 3) if dist_pct is not None else None,
        "em_vs_distance_ratio": round(em_ratio, 2) if em_ratio else None,
        "note": chain.get("note"),
    }


def _estimate_iv_rank_from_bars(bars) -> float | None:
    if bars is None or bars.empty or len(bars) < 30:
        return None
    daily = bars.resample("1D").agg({"close": "last"}).dropna()
    if len(daily) < 20:
        returns = np.log(bars["close"] / bars["close"].shift(1)).dropna()
    else:
        returns = np.log(daily["close"] / daily["close"].shift(1)).dropna()
    if returns.empty:
        return None
    realized = returns.rolling(min(20, len(returns))).std() * np.sqrt(252) * 100
    current = float(realized.iloc[-1])
    window = realized.dropna()
    if window.empty:
        return None
    return round(float((window < current).sum() / len(window) * 100), 1)
