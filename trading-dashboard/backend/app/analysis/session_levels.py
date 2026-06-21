from __future__ import annotations

from zoneinfo import ZoneInfo

import pandas as pd

ET = ZoneInfo("America/New_York")


def _to_et(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    out = df.copy()
    if out.index.tz is None:
        out.index = out.index.tz_localize("UTC")
    out.index = out.index.tz_convert(ET)
    return out


def _today_bars(df: pd.DataFrame) -> pd.DataFrame:
    df = _to_et(df)
    if df.empty:
        return df
    today = df.index[-1].date()
    return df[df.index.date == today]


def compute_session_levels(df: pd.DataFrame) -> dict:
    """Premarket, opening range, and prior-day levels."""
    df = _to_et(df)
    if df.empty:
        return {}

    today = _today_bars(df)
    daily = df.resample("1D").agg({"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()

    prior = daily.iloc[-2] if len(daily) >= 2 else None
    result: dict = {
        "prior_day_high": float(prior["high"]) if prior is not None else None,
        "prior_day_low": float(prior["low"]) if prior is not None else None,
        "prior_day_close": float(prior["close"]) if prior is not None else None,
    }

    if today.empty:
        return result

    premarket = today[today.index.hour < 9]
    rth = today[(today.index.hour > 9) | ((today.index.hour == 9) & (today.index.minute >= 30))]
    if rth.empty:
        rth = today

    if not premarket.empty:
        result["premarket_high"] = float(premarket["high"].max())
        result["premarket_low"] = float(premarket["low"].min())

    for label, minutes in [("or_5m", 5), ("or_15m", 15), ("or_30m", 30)]:
        or_bars = rth.head(minutes) if len(rth) >= minutes else rth
        if not or_bars.empty:
            result[f"{label}_high"] = float(or_bars["high"].max())
            result[f"{label}_low"] = float(or_bars["low"].min())

    return result


def levels_near_price(levels: dict, price: float, tolerance_pct: float = 0.15) -> list[str]:
    hits = []
    for name, val in levels.items():
        if val is None or price == 0:
            continue
        if abs(price - val) / price * 100 <= tolerance_pct:
            hits.append(name)
    return hits
