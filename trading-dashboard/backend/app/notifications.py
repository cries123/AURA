from __future__ import annotations

import httpx

from app.config import settings


async def send_notifications(message: str) -> list[str]:
    sent: list[str] = []

    if settings.telegram_bot_token and settings.telegram_chat_id:
        ok = await _send_telegram(message)
        if ok:
            sent.append("telegram")

    if settings.discord_webhook_url:
        ok = await _send_discord(message)
        if ok:
            sent.append("discord")

    return sent


async def _send_telegram(message: str) -> bool:
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                url,
                json={
                    "chat_id": settings.telegram_chat_id,
                    "text": message,
                    "parse_mode": "HTML",
                    "disable_web_page_preview": True,
                },
            )
            return resp.status_code == 200
    except Exception:
        return False


async def _send_discord(message: str) -> bool:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                settings.discord_webhook_url,
                json={"content": message[:2000]},
            )
            return resp.status_code in (200, 204)
    except Exception:
        return False
