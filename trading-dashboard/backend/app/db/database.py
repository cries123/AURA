from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from app.config import settings


def _ensure_db_dir() -> None:
    Path(settings.database_path).parent.mkdir(parents=True, exist_ok=True)


@contextmanager
def get_connection():
    _ensure_db_dir()
    conn = sqlite3.connect(settings.database_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS liquidity_levels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                timeframe TEXT NOT NULL,
                level_type TEXT NOT NULL,
                price REAL NOT NULL,
                touches INTEGER NOT NULL,
                touch_timestamps TEXT,
                first_touch TEXT,
                last_touch TEXT,
                session TEXT,
                score INTEGER DEFAULT 0,
                score_factors TEXT,
                structure TEXT,
                updated_at TEXT NOT NULL,
                UNIQUE(symbol, timeframe, level_type, price)
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                timeframe TEXT NOT NULL,
                event_type TEXT NOT NULL,
                level_type TEXT,
                level_price REAL,
                message TEXT NOT NULL,
                score INTEGER DEFAULT 0,
                score_factors TEXT,
                options_context TEXT,
                created_at TEXT NOT NULL,
                notified INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS scan_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                data_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS alert_cooldowns (
                key TEXT PRIMARY KEY,
                last_sent_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS journal (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id INTEGER,
                symbol TEXT NOT NULL,
                setup TEXT,
                level_price REAL,
                score INTEGER,
                tier TEXT,
                outcome_15m REAL,
                outcome_30m REAL,
                outcome_60m REAL,
                notes TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
        _migrate_alerts_tier(conn)


def _migrate_alerts_tier(conn: sqlite3.Connection) -> None:
    cols = {row[1] for row in conn.execute("PRAGMA table_info(alerts)").fetchall()}
    if "tier" not in cols:
        conn.execute("ALTER TABLE alerts ADD COLUMN tier TEXT DEFAULT 'B'")


def upsert_level(level: dict[str, Any]) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO liquidity_levels (
                symbol, timeframe, level_type, price, touches, touch_timestamps,
                first_touch, last_touch, session, score, score_factors, structure, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(symbol, timeframe, level_type, price) DO UPDATE SET
                touches=excluded.touches,
                touch_timestamps=excluded.touch_timestamps,
                last_touch=excluded.last_touch,
                session=excluded.session,
                score=excluded.score,
                score_factors=excluded.score_factors,
                structure=excluded.structure,
                updated_at=excluded.updated_at
            """,
            (
                level["symbol"],
                level["timeframe"],
                level["level_type"],
                level["price"],
                level["touches"],
                json.dumps(level.get("touch_timestamps", [])),
                level.get("first_touch"),
                level.get("last_touch"),
                level.get("session"),
                level.get("score", 0),
                json.dumps(level.get("score_factors", [])),
                level.get("structure"),
                level.get("updated_at", datetime.utcnow().isoformat()),
            ),
        )


def insert_alert(alert: dict[str, Any]) -> int:
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO alerts (
                symbol, timeframe, event_type, level_type, level_price,
                message, score, score_factors, options_context, created_at, notified, tier
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                alert["symbol"],
                alert["timeframe"],
                alert["event_type"],
                alert.get("level_type"),
                alert.get("level_price"),
                alert["message"],
                alert.get("score", 0),
                json.dumps(alert.get("score_factors", [])),
                json.dumps(alert.get("options_context")),
                alert.get("created_at", datetime.utcnow().isoformat()),
                alert.get("notified", 0),
                alert.get("tier", "B"),
            ),
        )
        return int(cur.lastrowid)


def insert_journal(entry: dict[str, Any]) -> int:
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO journal (alert_id, symbol, setup, level_price, score, tier, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entry.get("alert_id"),
                entry["symbol"],
                entry.get("setup"),
                entry.get("level_price"),
                entry.get("score", 0),
                entry.get("tier", "C"),
                entry.get("notes"),
                entry.get("created_at", datetime.utcnow().isoformat()),
            ),
        )
        return int(cur.lastrowid)


def get_journal(limit: int = 100) -> list[dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM journal ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    return [dict(row) for row in rows]


def save_snapshot(symbol: str, data: dict[str, Any]) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO scan_snapshots (symbol, data_json, updated_at)
            VALUES (?, ?, ?)
            """,
            (symbol, json.dumps(data), datetime.utcnow().isoformat()),
        )
        conn.execute(
            "DELETE FROM scan_snapshots WHERE symbol = ? AND id NOT IN "
            "(SELECT id FROM scan_snapshots WHERE symbol = ? ORDER BY id DESC LIMIT 5)",
            (symbol, symbol),
        )


def get_latest_snapshots() -> list[dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT s.* FROM scan_snapshots s
            INNER JOIN (
                SELECT symbol, MAX(id) as max_id FROM scan_snapshots GROUP BY symbol
            ) latest ON s.id = latest.max_id
            ORDER BY s.symbol
            """
        ).fetchall()
    return [
        {**json.loads(row["data_json"]), "updated_at": row["updated_at"]}
        for row in rows
    ]


def get_levels(symbol: str | None = None, timeframe: str | None = None) -> list[dict[str, Any]]:
    query = "SELECT * FROM liquidity_levels WHERE 1=1"
    params: list[Any] = []
    if symbol:
        query += " AND symbol = ?"
        params.append(symbol)
    if timeframe:
        query += " AND timeframe = ?"
        params.append(timeframe)
    query += " ORDER BY score DESC, symbol, timeframe"
    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
    return [_row_to_level(row) for row in rows]


def get_alerts(limit: int = 100, min_score: int = 0, tier: str | None = None) -> list[dict[str, Any]]:
    query = "SELECT * FROM alerts WHERE score >= ?"
    params: list[Any] = [min_score]
    if tier:
        query += " AND tier = ?"
        params.append(tier)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
    return [_row_to_alert(row) for row in rows]


def check_cooldown(key: str, cooldown_minutes: int) -> bool:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT last_sent_at FROM alert_cooldowns WHERE key = ?", (key,)
        ).fetchone()
        if not row:
            return True
        last = datetime.fromisoformat(row["last_sent_at"])
        return datetime.utcnow() - last > timedelta(minutes=cooldown_minutes)


def set_cooldown(key: str) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO alert_cooldowns (key, last_sent_at) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET last_sent_at=excluded.last_sent_at
            """,
            (key, datetime.utcnow().isoformat()),
        )


def mark_alert_notified(alert_id: int) -> None:
    with get_connection() as conn:
        conn.execute("UPDATE alerts SET notified = 1 WHERE id = ?", (alert_id,))


def _row_to_level(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "symbol": row["symbol"],
        "timeframe": row["timeframe"],
        "level_type": row["level_type"],
        "price": row["price"],
        "touches": row["touches"],
        "touch_timestamps": json.loads(row["touch_timestamps"] or "[]"),
        "first_touch": row["first_touch"],
        "last_touch": row["last_touch"],
        "session": row["session"],
        "score": row["score"],
        "score_factors": json.loads(row["score_factors"] or "[]"),
        "structure": row["structure"],
        "updated_at": row["updated_at"],
    }


def _row_to_alert(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "symbol": row["symbol"],
        "timeframe": row["timeframe"],
        "event_type": row["event_type"],
        "level_type": row["level_type"],
        "level_price": row["level_price"],
        "message": row["message"],
        "score": row["score"],
        "score_factors": json.loads(row["score_factors"] or "[]"),
        "options_context": json.loads(row["options_context"]) if row["options_context"] else None,
        "created_at": row["created_at"],
        "notified": bool(row["notified"]),
        "tier": row["tier"] if "tier" in row.keys() else "B",
    }
