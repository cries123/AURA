from __future__ import annotations


def fetch_breadth() -> dict:
    """Breadth proxies — real $TICK/$ADD need a paid feed."""
    return {
        "tick": 412,
        "add": 628,
        "vold": 0.82,
        "bias": "risk_on",
        "confirms_long": True,
        "confirms_short": False,
        "note": "Synthetic breadth — connect Polygon/Tradier for live $TICK/$ADD",
    }


def breadth_confirms(direction: str, breadth: dict) -> bool:
    if direction == "bullish":
        return breadth.get("confirms_long", False)
    if direction == "bearish":
        return breadth.get("confirms_short", False)
    return False
