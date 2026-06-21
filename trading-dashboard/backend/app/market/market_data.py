from __future__ import annotations

from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd
import yfinance as yf

from app.watchlist import TIMEFRAME_INTERVAL, TIMEFRAME_PERIOD, YFINANCE_SYMBOL_MAP


def resolve_yfinance_symbol(symbol: str) -> str:
    return YFINANCE_SYMBOL_MAP.get(symbol, symbol)


def fetch_ohlcv(symbol: str, timeframe: str) -> pd.DataFrame:
    yf_symbol = resolve_yfinance_symbol(symbol)
    period = TIMEFRAME_PERIOD[timeframe]
    interval = TIMEFRAME_INTERVAL[timeframe]

    ticker = yf.Ticker(yf_symbol)
    df = ticker.history(period=period, interval=interval, auto_adjust=True)

    if df.empty:
        return pd.DataFrame(columns=["open", "high", "low", "close", "volume"])

    df = df.rename(
        columns={
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume",
        }
    )
    df.index = pd.to_datetime(df.index, utc=True)
    df = df[["open", "high", "low", "close", "volume"]].dropna()

    if timeframe == "4h":
        df = _resample_4h(df)

    return df


def _resample_4h(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    resampled = df.resample("4h").agg(
        {
            "open": "first",
            "high": "max",
            "low": "min",
            "close": "last",
            "volume": "sum",
        }
    )
    return resampled.dropna(subset=["open", "high", "low", "close"])


def fetch_last_price(symbol: str) -> Optional[float]:
    df = fetch_ohlcv(symbol, "15m")
    if df.empty:
        info = yf.Ticker(resolve_yfinance_symbol(symbol)).fast_info
        price = getattr(info, "last_price", None)
        return float(price) if price else None
    return float(df["close"].iloc[-1])


def fetch_quote_meta(symbol: str) -> dict:
    yf_symbol = resolve_yfinance_symbol(symbol)
    ticker = yf.Ticker(yf_symbol)
    info = ticker.fast_info
    hist = ticker.history(period="5d", interval="1d")
    prev_close = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else None
    last = float(info.last_price) if getattr(info, "last_price", None) else None
    change = None
    change_pct = None
    if last is not None and prev_close:
        change = last - prev_close
        change_pct = (change / prev_close) * 100
    return {
        "symbol": symbol,
        "last": last,
        "change": change,
        "change_pct": change_pct,
        "prev_close": prev_close,
        "updated_at": datetime.utcnow().isoformat(),
    }
