from __future__ import annotations

import pandas as pd


def approach_velocity(df: pd.DataFrame, target_price: float, lookback: int = 5) -> dict:
    if df.empty or len(df) < 2:
        return {"velocity_pct_per_min": None, "velocity_dollars_per_min": None, "minutes_to_level": None}

    recent = df.tail(lookback)
    if len(recent) < 2:
        return {"velocity_pct_per_min": None, "velocity_dollars_per_min": None, "minutes_to_level": None}

    start_price = float(recent["close"].iloc[0])
    end_price = float(recent["close"].iloc[-1])
    delta = end_price - start_price

    t0 = recent.index[0]
    t1 = recent.index[-1]
    minutes = max((t1 - t0).total_seconds() / 60, 1)

    vel_dollar = delta / minutes
    vel_pct = (delta / start_price * 100) / minutes if start_price else 0

    dist = target_price - end_price
    minutes_to = abs(dist / vel_dollar) if vel_dollar != 0 else None

    return {
        "velocity_pct_per_min": round(vel_pct, 4),
        "velocity_dollars_per_min": round(vel_dollar, 4),
        "minutes_to_level": round(minutes_to, 1) if minutes_to is not None else None,
        "approaching": (dist > 0 and vel_dollar > 0) or (dist < 0 and vel_dollar < 0),
    }


def time_at_level(df: pd.DataFrame, level_price: float, tolerance_pct: float = 0.1) -> dict:
    if df.empty:
        return {"bars_at_level": 0, "minutes_at_level": 0}

    tol = level_price * (tolerance_pct / 100)
    at_level = (df["low"] <= level_price + tol) & (df["high"] >= level_price - tol)
    count = int(at_level.tail(20).sum())

    recent = df.tail(20)
    if len(recent) >= 2:
        bar_minutes = max((recent.index[-1] - recent.index[0]).total_seconds() / 60 / len(recent), 1)
    else:
        bar_minutes = 1

    return {"bars_at_level": count, "minutes_at_level": round(count * bar_minutes, 1)}
