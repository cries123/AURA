from __future__ import annotations

import pandas as pd


def detect_candle_patterns(df: pd.DataFrame, level_price: float, level_type: str) -> list[dict]:
    if len(df) < 3:
        return []

    patterns: list[dict] = []
    c1, c2, c3 = df.iloc[-3], df.iloc[-2], df.iloc[-1]
    tol = level_price * 0.001

    touched = float(c3["low"]) <= level_price + tol <= float(c3["high"]) or (
        level_type == "EQL" and float(c3["low"]) <= level_price + tol
    ) or (level_type == "EQH" and float(c3["high"]) >= level_price - tol)

    if not touched:
        return patterns

    # Engulfing rejection at EQL
    if level_type == "EQL":
        bullish_engulf = float(c3["close"]) > float(c3["open"]) and float(c3["close"]) > float(c2["open"]) and float(c3["open"]) <= float(c2["close"])
        if bullish_engulf and float(c3["low"]) < level_price:
            patterns.append({"pattern": "bullish_engulfing", "bias": "bullish", "bar_time": df.index[-1].isoformat()})

    if level_type == "EQH":
        bearish_engulf = float(c3["close"]) < float(c3["open"]) and float(c3["close"]) < float(c2["open"]) and float(c3["open"]) >= float(c2["close"])
        if bearish_engulf and float(c3["high"]) > level_price:
            patterns.append({"pattern": "bearish_engulfing", "bias": "bearish", "bar_time": df.index[-1].isoformat()})

    # Failed breakout
    if level_type == "EQH" and float(c2["close"]) > level_price and float(c3["close"]) < level_price:
        patterns.append({"pattern": "failed_breakout", "bias": "bearish", "bar_time": df.index[-1].isoformat()})
    if level_type == "EQL" and float(c2["close"]) < level_price and float(c3["close"]) > level_price:
        patterns.append({"pattern": "failed_breakdown", "bias": "bullish", "bar_time": df.index[-1].isoformat()})

    # Wick rejection
    body = abs(float(c3["close"]) - float(c3["open"]))
    upper_wick = float(c3["high"]) - max(float(c3["close"]), float(c3["open"]))
    lower_wick = min(float(c3["close"]), float(c3["open"])) - float(c3["low"])
    if level_type == "EQH" and upper_wick > body * 1.5:
        patterns.append({"pattern": "upper_wick_rejection", "bias": "bearish", "bar_time": df.index[-1].isoformat()})
    if level_type == "EQL" and lower_wick > body * 1.5:
        patterns.append({"pattern": "lower_wick_rejection", "bias": "bullish", "bar_time": df.index[-1].isoformat()})

    return patterns
