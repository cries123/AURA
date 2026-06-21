from __future__ import annotations

import pandas as pd

from app.analysis.patterns import LevelType

# Max bars since last touch before level is considered stale
MAX_BARS_SINCE_TOUCH = {
    "1m": 120,
    "5m": 78,
    "15m": 52,
    "1h": 48,
    "4h": 30,
    "1d": 20,
}

ValidityStatus = str  # valid | testing | stale | invalidated


def assess_level_validity(
    df: pd.DataFrame,
    level_type: LevelType,
    level_price: float,
    timeframe: str,
    tolerance_pct: float,
    last_price: float | None = None,
) -> dict:
    """Determine whether an EQL/EQH level is still actionable."""
    if df.empty or level_price == 0:
        return _result(False, "invalidated", "no data", 0, 0)

    tol = level_price * (tolerance_pct / 100)
    bars_since = _bars_since_last_touch(df, level_type, level_price, tol)
    max_stale = MAX_BARS_SINCE_TOUCH.get(timeframe, 50)

    last_close = float(df["close"].iloc[-1])
    last_high = float(df["high"].iloc[-1])
    last_low = float(df["low"].iloc[-1])

    consec_beyond = _consecutive_closes_beyond(df, level_type, level_price, lookback=8)
    closes_beyond = _closes_beyond_count(df, level_type, level_price, lookback=10)

    # Hard invalidation: acceptance beyond level
    if level_type == "EQH" and last_close > level_price + tol:
        return _result(
            False,
            "invalidated",
            "closed above EQH",
            bars_since,
            consec_beyond,
        )
    if level_type == "EQL" and last_close < level_price - tol:
        return _result(
            False,
            "invalidated",
            "closed below EQL",
            bars_since,
            consec_beyond,
        )

    # Sustained break (2+ consecutive closes beyond)
    if consec_beyond >= 2:
        reason = "sustained above EQH" if level_type == "EQH" else "sustained below EQL"
        return _result(False, "invalidated", reason, bars_since, consec_beyond)

    # Stale: no touch in too long
    if bars_since > max_stale:
        return _result(
            False,
            "stale",
            f"no touch in {bars_since} bars",
            bars_since,
            consec_beyond,
        )

    # Testing: price interacting with level now
    at_level = False
    if level_type == "EQH":
        at_level = last_high >= level_price - tol and last_close <= level_price + tol
    else:
        at_level = last_low <= level_price + tol and last_close >= level_price - tol

    if at_level or (last_price and abs(last_price - level_price) / level_price * 100 <= tolerance_pct):
        return _result(True, "testing", "price at level", bars_since, consec_beyond)

    # Valid: untested liquidity still in play
    if closes_beyond == 0:
        return _result(True, "valid", "untested", bars_since, consec_beyond)

    return _result(True, "valid", "holding", bars_since, consec_beyond)


def is_level_actionable(validity: dict) -> bool:
    return validity.get("is_valid", False) and validity.get("status") in ("valid", "testing")


def _bars_since_last_touch(
    df: pd.DataFrame, level_type: LevelType, level_price: float, tol: float
) -> int:
    for i in range(len(df) - 1, -1, -1):
        bar = df.iloc[i]
        if level_type == "EQH" and float(bar["high"]) >= level_price - tol:
            return len(df) - 1 - i
        if level_type == "EQL" and float(bar["low"]) <= level_price + tol:
            return len(df) - 1 - i
    return len(df)


def _consecutive_closes_beyond(
    df: pd.DataFrame, level_type: LevelType, level_price: float, lookback: int = 8
) -> int:
    count = 0
    for _, bar in df.tail(lookback).iloc[::-1].iterrows():
        close = float(bar["close"])
        if level_type == "EQH" and close > level_price:
            count += 1
        elif level_type == "EQL" and close < level_price:
            count += 1
        else:
            break
    return count


def _closes_beyond_count(
    df: pd.DataFrame, level_type: LevelType, level_price: float, lookback: int = 10
) -> int:
    recent = df.tail(lookback)
    if level_type == "EQH":
        return int((recent["close"] > level_price).sum())
    return int((recent["close"] < level_price).sum())


def _result(
    is_valid: bool,
    status: ValidityStatus,
    reason: str,
    bars_since_touch: int,
    consecutive_beyond: int,
) -> dict:
    return {
        "is_valid": is_valid,
        "status": status,
        "reason": reason,
        "bars_since_touch": bars_since_touch,
        "consecutive_beyond": consecutive_beyond,
    }
