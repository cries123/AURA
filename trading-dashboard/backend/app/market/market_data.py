from __future__ import annotations

from typing import Optional

import pandas as pd

from app.config import settings


def fetch_ohlcv(symbol: str, timeframe: str) -> pd.DataFrame:
    if settings.data_provider == "polygon" and settings.polygon_api_key:
        from app.market import polygon_provider

        df = polygon_provider.fetch_ohlcv(symbol, timeframe)
        if not df.empty:
            return df

    from app.market import yahoo_chart

    return yahoo_chart.fetch_ohlcv(symbol, timeframe)


def fetch_last_price(symbol: str) -> Optional[float]:
    if settings.data_provider == "polygon" and settings.polygon_api_key:
        from app.market import polygon_provider

        price = polygon_provider.fetch_last_price(symbol)
        if price is not None:
            return price

    from app.market import yahoo_chart

    return yahoo_chart.fetch_last_price(symbol)


def fetch_quote_meta(symbol: str) -> dict:
    if settings.data_provider == "polygon" and settings.polygon_api_key:
        from app.market import polygon_provider

        quote = polygon_provider.fetch_quote_meta(symbol)
        if quote.get("last") is not None:
            return quote

    from app.market import yahoo_chart

    return yahoo_chart.fetch_quote_meta(symbol)


def active_data_source() -> str:
    if settings.data_provider == "polygon" and settings.polygon_api_key:
        return "polygon_live"
    return "yahoo_live"


def is_live_available(symbol: str = "SPY") -> bool:
    df = fetch_ohlcv(symbol, "5m")
    return not df.empty


# Backwards compat
resolve_yfinance_symbol = lambda s: __import__("app.market.yahoo_chart", fromlist=["resolve_symbol"]).resolve_symbol(s)
