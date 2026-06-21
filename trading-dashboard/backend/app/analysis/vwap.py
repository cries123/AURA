from __future__ import annotations

import pandas as pd


def compute_vwap(df: pd.DataFrame) -> pd.Series:
    if df.empty or "volume" not in df.columns:
        return pd.Series(dtype=float)
    typical = (df["high"] + df["low"] + df["close"]) / 3
    vol = df["volume"].replace(0, 1)
    cum_vol = vol.cumsum()
    cum_pv = (typical * vol).cumsum()
    return cum_pv / cum_vol


def vwap_context(df: pd.DataFrame, last_price: float) -> dict:
    if df.empty:
        return {"vwap": None, "position": None, "distance_pct": None, "series_tail": []}

    vwap = compute_vwap(df)
    current_vwap = float(vwap.iloc[-1])
    dist_pct = (last_price - current_vwap) / current_vwap * 100 if current_vwap else None
    position = "above" if last_price > current_vwap else "below" if last_price < current_vwap else "at"

    tail = [
        {"time": idx.isoformat(), "value": round(float(v), 4)}
        for idx, v in vwap.tail(50).items()
    ]

    return {
        "vwap": round(current_vwap, 4),
        "position": position,
        "distance_pct": round(dist_pct, 3) if dist_pct is not None else None,
        "series_tail": tail,
    }


def anchored_vwap(df: pd.DataFrame, anchor_index: int = 0) -> dict:
    if df.empty or anchor_index >= len(df):
        return {"anchor_time": None, "avwap": None}
    subset = df.iloc[anchor_index:]
    vwap = compute_vwap(subset)
    return {
        "anchor_time": subset.index[0].isoformat(),
        "avwap": round(float(vwap.iloc[-1]), 4) if not vwap.empty else None,
    }
