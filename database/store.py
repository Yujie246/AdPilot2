from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = Path(
    os.getenv(
        "ADPILOT_DB_PATH",
        "/tmp/adpilot.db" if os.getenv("VERCEL") else str(ROOT / "database" / "adpilot.db")
    )
).expanduser()


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS interactions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              question TEXT NOT NULL,
              choice TEXT NOT NULL,
              profile TEXT NOT NULL,
              created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              payload TEXT NOT NULL,
              created_at TEXT NOT NULL
            )
            """
        )


def record_interaction(question: str, choice: str, profile: str) -> None:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO interactions (question, choice, profile, created_at) VALUES (?, ?, ?, ?)",
            (question, choice, profile, _now())
        )


def save_report(title: str, payload: dict[str, Any]) -> None:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO reports (title, payload, created_at) VALUES (?, ?, ?)",
            (title, json.dumps(payload, ensure_ascii=False), _now())
        )


def interaction_count() -> int:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute("SELECT COUNT(*) FROM interactions").fetchone()
    return int(row[0])


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
