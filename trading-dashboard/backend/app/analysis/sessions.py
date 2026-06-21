from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

ET = ZoneInfo("America/New_York")


def classify_session(iso_timestamp: str) -> str:
    try:
        ts = datetime.fromisoformat(iso_timestamp.replace("Z", "+00:00"))
    except ValueError:
        return "unknown"

    et = ts.astimezone(ET)
    hour = et.hour
    minute = et.hour * 60 + et.minute

    # Approximate ICT sessions (ET)
    if 19 * 60 <= minute or minute < 0 * 60 + 60:
        return "asia"
    if 2 * 60 <= minute < 5 * 60:
        return "london"
    if 9 * 60 + 30 <= minute < 16 * 60:
        return "ny_rth"
    if 4 * 60 <= minute < 9 * 60 + 30:
        return "ny_pre"
    if 16 * 60 <= minute < 20 * 60:
        return "ny_eth"
    return "off_hours"


def session_label(session: str) -> str:
    return {
        "asia": "Asia",
        "london": "London",
        "ny_rth": "NY RTH",
        "ny_pre": "NY Pre-Market",
        "ny_eth": "NY After-Hours",
        "off_hours": "Off Hours",
        "unknown": "Unknown",
    }.get(session, session)
