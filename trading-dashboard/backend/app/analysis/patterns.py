from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import numpy as np
import pandas as pd

LevelType = Literal["EQL", "EQH"]
StructureType = Literal["bullish", "bearish", "ranging", "unclear"]


@dataclass
class SwingPoint:
    index: int
    timestamp: str
    price: float
    kind: Literal["high", "low"]


@dataclass
class LiquidityLevel:
    symbol: str
    timeframe: str
    level_type: LevelType
    price: float
    touches: int
    touch_timestamps: list[str]
    first_touch: str
    last_touch: str
    session: str


@dataclass
class MarketStructure:
    symbol: str
    timeframe: str
    structure: StructureType
    last_swing_high: float | None
    last_swing_low: float | None


def find_swing_points(df: pd.DataFrame, lookback: int = 5) -> list[SwingPoint]:
    if len(df) < lookback * 2 + 1:
        return []

    highs = df["high"].values
    lows = df["low"].values
    swings: list[SwingPoint] = []

    for i in range(lookback, len(df) - lookback):
        window_high = highs[i - lookback : i + lookback + 1]
        window_low = lows[i - lookback : i + lookback + 1]

        ts = df.index[i].isoformat()

        if highs[i] == np.max(window_high):
            swings.append(SwingPoint(index=i, timestamp=ts, price=float(highs[i]), kind="high"))
        elif lows[i] == np.min(window_low):
            swings.append(SwingPoint(index=i, timestamp=ts, price=float(lows[i]), kind="low"))

    return swings


def cluster_equal_levels(
    swings: list[SwingPoint],
    kind: Literal["high", "low"],
    tolerance_pct: float,
    min_touches: int,
) -> list[tuple[float, list[SwingPoint]]]:
    filtered = [s for s in swings if s.kind == kind]
    if not filtered:
        return []

    clusters: list[list[SwingPoint]] = []

    for swing in sorted(filtered, key=lambda s: s.price):
        placed = False
        for cluster in clusters:
            anchor = cluster[0].price
            if anchor == 0:
                continue
            if abs(swing.price - anchor) / anchor * 100 <= tolerance_pct:
                cluster.append(swing)
                placed = True
                break
        if not placed:
            clusters.append([swing])

    result: list[tuple[float, list[SwingPoint]]] = []
    for cluster in clusters:
        if len(cluster) < min_touches:
            continue
        avg_price = float(np.mean([s.price for s in cluster]))
        result.append((avg_price, cluster))

    return result


def detect_liquidity_levels(
    symbol: str,
    timeframe: str,
    df: pd.DataFrame,
    tolerance_pct: float,
    min_touches: int,
    lookback: int,
) -> list[LiquidityLevel]:
    from app.analysis.sessions import classify_session

    swings = find_swing_points(df, lookback=lookback)
    levels: list[LiquidityLevel] = []

    for level_type, kind in [("EQH", "high"), ("EQL", "low")]:
        for price, cluster in cluster_equal_levels(swings, kind, tolerance_pct, min_touches):
            timestamps = [s.timestamp for s in cluster]
            levels.append(
                LiquidityLevel(
                    symbol=symbol,
                    timeframe=timeframe,
                    level_type=level_type,
                    price=price,
                    touches=len(cluster),
                    touch_timestamps=timestamps,
                    first_touch=min(timestamps),
                    last_touch=max(timestamps),
                    session=classify_session(max(timestamps)),
                )
            )

    return levels


def determine_market_structure(df: pd.DataFrame, lookback: int = 5) -> MarketStructure:
    swings = find_swing_points(df, lookback=lookback)
    highs = [s for s in swings if s.kind == "high"][-3:]
    lows = [s for s in swings if s.kind == "low"][-3:]

    structure: StructureType = "unclear"
    if len(highs) >= 2 and len(lows) >= 2:
        hh = highs[-1].price > highs[-2].price
        hl = lows[-1].price > lows[-2].price
        lh = highs[-1].price < highs[-2].price
        ll = lows[-1].price < lows[-2].price

        if hh and hl:
            structure = "bullish"
        elif lh and ll:
            structure = "bearish"
        elif not hh and not ll:
            structure = "ranging"
        else:
            structure = "unclear"

    return MarketStructure(
        symbol="",
        timeframe="",
        structure=structure,
        last_swing_high=highs[-1].price if highs else None,
        last_swing_low=lows[-1].price if lows else None,
    )


def detect_sweep_reclaim(
    df: pd.DataFrame,
    level_price: float,
    level_type: LevelType,
    tolerance_pct: float,
) -> dict | None:
    """Detect liquidity sweep through level followed by reclaim on latest bars."""
    if len(df) < 3:
        return None

    tol = level_price * (tolerance_pct / 100)
    recent = df.tail(5)

    for i in range(1, len(recent)):
        bar = recent.iloc[i]
        prev = recent.iloc[i - 1]

        if level_type == "EQL":
            swept = float(bar["low"]) < level_price - tol
            reclaimed = float(bar["close"]) > level_price
            if swept and reclaimed:
                return {
                    "event": "sweep_reclaim",
                    "direction": "bullish",
                    "sweep_low": float(bar["low"]),
                    "reclaim_close": float(bar["close"]),
                    "bar_time": recent.index[i].isoformat(),
                }
        else:  # EQH
            swept = float(bar["high"]) > level_price + tol
            reclaimed = float(bar["close"]) < level_price
            if swept and reclaimed:
                return {
                    "event": "sweep_reclaim",
                    "direction": "bearish",
                    "sweep_high": float(bar["high"]),
                    "reclaim_close": float(bar["close"]),
                    "bar_time": recent.index[i].isoformat(),
                }

    return None


def detect_proximity(last_price: float, level_price: float, proximity_pct: float) -> bool:
    if level_price == 0:
        return False
    return abs(last_price - level_price) / level_price * 100 <= proximity_pct


def detect_acceptance(df: pd.DataFrame, level_price: float, level_type: LevelType) -> bool:
    if df.empty:
        return False
    close = float(df["close"].iloc[-1])
    if level_type == "EQH":
        return close > level_price
    return close < level_price


def compute_dealing_range(df: pd.DataFrame, lookback: int = 5) -> dict:
    swings = find_swing_points(df, lookback=lookback)
    highs = [s.price for s in swings if s.kind == "high"]
    lows = [s.price for s in swings if s.kind == "low"]
    if not highs or not lows:
        return {"high": None, "low": None, "equilibrium": None, "premium_discount": None}

    dr_high = max(highs[-3:]) if highs else None
    dr_low = min(lows[-3:]) if lows else None
    eq = (dr_high + dr_low) / 2 if dr_high and dr_low else None
    last = float(df["close"].iloc[-1])
    pd_zone = None
    if eq and dr_high and dr_low:
        if last > eq:
            pd_zone = "premium"
        elif last < eq:
            pd_zone = "discount"
        else:
            pd_zone = "equilibrium"

    return {
        "high": dr_high,
        "low": dr_low,
        "equilibrium": eq,
        "premium_discount": pd_zone,
    }


def find_fair_value_gaps(df: pd.DataFrame, lookback: int = 50) -> list[dict]:
    gaps: list[dict] = []
    subset = df.tail(lookback)
    for i in range(2, len(subset)):
        c1 = subset.iloc[i - 2]
        c3 = subset.iloc[i]
        # Bullish FVG: gap between candle 1 high and candle 3 low
        if float(c3["low"]) > float(c1["high"]):
            gaps.append(
                {
                    "type": "bullish",
                    "top": float(c3["low"]),
                    "bottom": float(c1["high"]),
                    "time": subset.index[i].isoformat(),
                }
            )
        # Bearish FVG
        if float(c3["high"]) < float(c1["low"]):
            gaps.append(
                {
                    "type": "bearish",
                    "top": float(c1["low"]),
                    "bottom": float(c3["high"]),
                    "time": subset.index[i].isoformat(),
                }
            )
    return gaps[-10:]
