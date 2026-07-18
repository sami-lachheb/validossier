import sqlite3
import json
from .config import DATABASE_PATH

def get_db():
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING',
            iteration_count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            data TEXT NOT NULL DEFAULT '{}'
        )
    """)
    conn.commit()
    conn.close()

def get_submission(submission_id: int):
    conn = get_db()
    row = conn.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,)).fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "filename": row["filename"],
        "status": row["status"],
        "iteration_count": row["iteration_count"],
        "created_at": row["created_at"],
        "data": json.loads(row["data"])
    }

def update_submission(submission_id: int, **kwargs):
    conn = get_db()
    set_clauses = []
    values = []
    for key, val in kwargs.items():
        if val is not None:
            set_clauses.append(f"{key} = ?")
            values.append(json.dumps(val) if key == "data" else val)
    values.append(submission_id)
    conn.execute(f"UPDATE submissions SET {', '.join(set_clauses)} WHERE id = ?", values)
    conn.commit()
    conn.close()

def get_all_submissions():
    conn = get_db()
    rows = conn.execute("SELECT * FROM submissions ORDER BY id DESC").fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "filename": r["filename"],
            "status": r["status"],
            "iteration_count": r["iteration_count"],
            "created_at": r["created_at"],
            "data": json.loads(r["data"])
        }
        for r in rows
    ]
