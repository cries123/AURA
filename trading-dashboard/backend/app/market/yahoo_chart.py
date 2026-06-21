"""Live market data via Yahoo Finance chart API (direct HTTP — more reliable than yfinance)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

import httpx
import pandas as pd

from app.watchlist import YFINANCE_SYMBOL_MAP

YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart"

# Yahoo interval + range params per dashboard timeframe
TIMEFRAME_PARAMS = {
    "1m": ("1m", "1d"),
    "5m": ("5m", "5d"),
    "15m": ("15m", "5d"),
    "1h": ("1h", "60d"),
    "4h": ("1h", "60d"),  # resampled
    "1d": ("1d", "2y"),
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}


def resolve_symbol(symbol: str) -> str:
    return YFINANCE_SYMBOL_MAP.get(symbol, symbol)


def fetch_chart(symbol: str, interval: str, range_: str) -> tuple[pd.DataFrame, dict]:
    yahoo_sym = resolve_symbol(symbol)
    url = f"{YAHOO_CHART}/{yahoo_sym}"
    params = {"interval": interval, "range": range_}

    with httpx.Client(timeout=20, headers=HEADERS) as client:
        resp = client.get(url, params=params)
        resp.raise_for_status()
        payload = resp.json()

    results = payload.get("chart", {}).get("result")
    if not results:
        return pd.DataFrame(), {}

    result = results[0]
    meta = result.get("meta", {})
    timestamps = result.get("timestamp") or []
    quote = (result.get("indicators", {}).get("quote") or [{}])[0]

    if not timestamps:
        return pd.DataFrame(), meta

    df = pd.DataFrame(
        {
            "open": quote.get("open"),
            "high": quote.get("high"),
            "low": quote.get("low"),
            "close": quote.get("close"),
            "volume": quote.get("volume"),
        },
        index=pd.to_datetime(timestamps, unit="s", utc=True),
    )
    df = df.dropna(subset=["open", "high", "low", "close"])
    df["volume"] = df["volume"].fillna(0)
    return df, meta


def fetch_ohlcv(symbol: str, timeframe: str) -> pd.DataFrame:
    interval, range_ = TIMEFRAME_PARAMS.get(timeframe, ("1h", "60d"))
    df, _ = fetch_chart(symbol, interval, range_)

    if timeframe == "4h" and not df.empty:
        df = df.resample("4h").agg(
            {"open": "first", "high": "max", "low": "min", "close": "last", "volume": "sum"}
        ).dropna(subset=["open", "high", "low", "close"])

    return df


def fetch_last_price(symbol: str) -> Optional[float]:
    df, meta = fetch_chart(symbol, "5m", "1d")
    if not df.empty:
        return float(df["close"].iloc[-1])
    price = meta.get("regularMarketPrice")
    return float(price) if price is not None else None


def fetch_quote_meta(symbol: str) -> dict:
    df, meta = fetch_chart(symbol, "5m", "5d")
    last = meta.get("regularMarketPrice")
    if last is None and not df.empty:
        last = float(df["close"].iloc[-1])

    prev_close = meta.get("chartPreviousClose") or meta.get("previousClose")
    if prev_close is None and len(df) >= 2:
        # Previous RTH close from daily context
        daily = df.resample("1D").agg({"close": "last"}).dropna()
        if len(daily) >= 2:
            prev_close = float(daily["close"].iloc[-2])

    change = None
    change_pct = None
    if last is not None and prev_close:
        change = float(last) - float(prev_close)
        change_pct = change / float(prev_close) * 100

    return {
        "symbol": symbol,
        "last": float(last) if last is not None else None,
        "change": round(change, 2) if change is not None else None,
        "change_pct": round(change_pct, 2) if change_pct is not None else None,
        "prev_close": float(prev_close) if prev_close is not None else None,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "data_source": "yahoo_live",
    }
