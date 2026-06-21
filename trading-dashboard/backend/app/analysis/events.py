from __future__ import annotations

from datetime import datetime, time
from zoneinfo import ZoneInfo

ET = ZoneInfo("America/New_York")

# Static high-impact events (extend via API later)
SCHEDULED_EVENTS = [
    {"date": "2026-06-18", "time_et": "08:30", "name": "Jobless Claims", "impact": "medium"},
    {"date": "2026-07-11", "time_et": "08:30", "name": "CPI", "impact": "high"},
    {"date": "2026-07-30", "time_et": "14:00", "name": "FOMC Rate Decision", "impact": "high"},
]


def now_et() -> datetime:
    return datetime.now(ET)


def is_rth() -> bool:
    n = now_et()
    if n.weekday() >= 5:
        return False
    t = n.time()
    return time(9, 30) <= t <= time(16, 0)


def is_power_hour() -> bool:
    n = now_et()
    return n.weekday() < 5 and time(15, 0) <= n.time() <= time(16, 0)


def is_blocked_window(block_first_last_min: int = 5) -> bool:
    n = now_et()
    if n.weekday() >= 5:
        return True
    t = n.time()
    open_block_end = time(9, 30 + block_first_last_min) if block_first_last_min < 30 else time(9, 59)
    close_block_start = time(16 - 1, 60 - block_first_last_min) if block_first_last_min < 60 else time(15, 55)
    if time(9, 30) <= t <= open_block_end:
        return True
    if t >= close_block_start and t <= time(16, 0):
        return True
    return False


def get_event_context() -> dict:
    today = now_et().strftime("%Y-%m-%d")
    upcoming = [e for e in SCHEDULED_EVENTS if e["date"] >= today][:5]
    today_events = [e for e in SCHEDULED_EVENTS if e["date"] == today]
    return {
        "now_et": now_et().isoformat(),
        "is_rth": is_rth(),
        "is_power_hour": is_power_hour(),
        "is_blocked_window": is_blocked_window(),
        "today_events": today_events,
        "upcoming_events": upcoming,
    }


def event_gate_allows_alert() -> tuple[bool, str | None]:
    ctx = get_event_context()
    if ctx["is_blocked_window"]:
        return False, "blocked: first/last 5 min of RTH"
    for ev in ctx["today_events"]:
        if ev["impact"] == "high":
            return False, f"blocked: {ev['name']} day"
    return True, None
