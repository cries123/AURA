"""Optional Polygon.io provider — set POLYGON_API_KEY and DATA_PROVIDER=polygon."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
import pandas as pd

from app.config import settings
from app.watchlist import YFINANCE_SYMBOL_MAP

POLYGON_BASE = "https://api.polygon.io"

TIMEFRAME_MAP = {
    "1m": (1, "minute"),
    "5m": (5, "minute"),
    "15m": (15, "minute"),
    "1h": (1, "hour"),
    "4h": (4, "hour"),
    "1d": (1, "day"),
}

RANGE_DAYS = {"1m": 1, "5m": 5, "15m": 5, "1h": 60, "4h": 120, "1d": 730}


def _ticker(symbol: str) -> str:
    if symbol == "SPX":
        return "I:SPX"
    return YFINANCE_SYMBOL_MAP.get(symbol, symbol)


def fetch_ohlcv(symbol: str, timeframe: str) -> pd.DataFrame:
    if not settings.polygon_api_key:
        return pd.DataFrame()

    mult, span = TIMEFRAME_MAP.get(timeframe, (5, "minute"))
    days = RANGE_DAYS.get(timeframe, 5)
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    ticker = _ticker(symbol)

    url = (
        f"{POLYGON_BASE}/v2/aggs/ticker/{ticker}/range/{mult}/{span}/"
        f"{start.strftime('%Y-%m-%d')}/{end.strftime('%Y-%m-%d')}"
    )
    with httpx.Client(timeout=20) as client:
        resp = client.get(url, params={"apiKey": settings.polygon_api_key, "limit": 50000})
        resp.raise_for_status()
        data = resp.json()

    rows = data.get("results") or []
    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame(rows)
    df["time"] = pd.to_datetime(df["t"], unit="ms", utc=True)
    df = df.set_index("time").rename(
        columns={"o": "open", "h": "high", "l": "low", "c": "close", "v": "volume"}
    )
    return df[["open", "high", "low", "close", "volume"]]


def fetch_last_price(symbol: str) -> Optional[float]:
    if not settings.polygon_api_key:
        return None
    ticker = _ticker(symbol)
    url = f"{POLYGON_BASE}/v2/last/trade/{ticker}"
    with httpx.Client(timeout=15) as client:
        resp = client.get(url, params={"apiKey": settings.polygon_api_key})
        resp.raise_for_status()
        data = resp.json()
    return float(data["results"]["p"])


def fetch_quote_meta(symbol: str) -> dict:
    last = fetch_last_price(symbol)
    df = fetch_ohlcv(symbol, "1d")
    prev_close = float(df["close"].iloc[-2]) if len(df) >= 2 else None
    change = change_pct = None
    if last and prev_close:
        change = last - prev_close
        change_pct = change / prev_close * 100
    return {
        "symbol": symbol,
        "last": last,
        "change": round(change, 2) if change is not None else None,
        "change_pct": round(change_pct, 2) if change_pct is not None else None,
        "prev_close": prev_close,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "data_source": "polygon_live",
    }
