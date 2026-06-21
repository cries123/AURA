from __future__ import annotations

import numpy as np

from app.market.market_data import fetch_quote_meta


def fetch_breadth() -> dict:
    """Live VIX + SPY-based breadth proxy until paid TICK/ADD feed."""
    vix_last = None
    try:
        from app.market.yahoo_chart import fetch_chart
        df, meta = fetch_chart("^VIX", "5m", "1d")
        vix_last = float(df["close"].iloc[-1]) if not df.empty else meta.get("regularMarketPrice")
    except Exception:
        pass

    from app.market.market_data import fetch_quote_meta
    spy = fetch_quote_meta("SPY")
    change = spy.get("change_pct") or 0
    risk_on = change >= 0

    return {
        "tick": int(400 + change * 20),
        "add": int(500 + change * 50),
        "vold": round(float(vix_last), 2) if vix_last else None,
        "bias": "risk_on" if risk_on else "risk_off",
        "confirms_long": risk_on,
        "confirms_short": not risk_on,
        "note": "VIX live · TICK/ADD estimated from SPY — add Polygon for full breadth",
    }


def breadth_confirms(direction: str, breadth: dict) -> bool:
    if direction == "bullish":
        return breadth.get("confirms_long", False)
    if direction == "bearish":
        return breadth.get("confirms_short", False)
    return False
