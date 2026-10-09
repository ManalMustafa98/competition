import os
import uuid
import sqlite3
import logging
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("expense_analyzer.database")
logging.basicConfig(level=logging.INFO)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip() or os.getenv("SUPABASE_KEY", "").strip()
DISABLE_SAMPLE_DATA = os.getenv("DISABLE_SAMPLE_DATA", "false").lower() in ("true", "1", "yes")

# Check if valid Supabase configuration is present
_use_supabase = False
_supabase_client = None

if SUPABASE_URL and SUPABASE_KEY and not SUPABASE_URL.startswith("https://your-project-id") and not SUPABASE_KEY.startswith("your_"):
    try:
        from supabase import create_client, Client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        _use_supabase = True
        logger.info(f"Connected successfully to Supabase at: {SUPABASE_URL}")
    except Exception as e:
        logger.error(f"Failed to connect to Supabase: {e}. Falling back to local persistent storage.")
        _use_supabase = False
else:
    logger.info("Supabase credentials not configured or placeholder detected in .env. Using persistent local database.")

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "expenses.db")


def _init_sqlite():
    """Initializes local SQLite database if Supabase credentials are not provided."""
    with sqlite3.connect(SQLITE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                amount REAL NOT NULL CHECK (amount > 0),
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category)")
        conn.commit()


# Initialize local DB structure if needed
if not _use_supabase:
    _init_sqlite()


def seed_sample_data_if_empty():
    """
    Seeds realistic sample expenses once if the database is currently empty,
    unless DISABLE_SAMPLE_DATA is set to true.
    """
    if DISABLE_SAMPLE_DATA:
        logger.info("Sample data seeding disabled via DISABLE_SAMPLE_DATA configuration.")
        return

    today = date.today()
    sample_records = [
        {"title": "Grocery Shopping at Whole Foods", "amount": 142.50, "category": "Groceries", "date": (today - timedelta(days=1)).isoformat()},
        {"title": "Monthly Internet Subscription", "amount": 65.00, "category": "Utilities", "date": (today - timedelta(days=3)).isoformat()},
        {"title": "Dinner with Friends", "amount": 78.20, "category": "Dining Out", "date": (today - timedelta(days=4)).isoformat()},
        {"title": "Gas Station Refill", "amount": 45.00, "category": "Transportation", "date": (today - timedelta(days=6)).isoformat()},
        {"title": "Electric Bill", "amount": 115.40, "category": "Utilities", "date": (today - timedelta(days=8)).isoformat()},
        {"title": "Gym Membership", "amount": 50.00, "category": "Health & Fitness", "date": (today - timedelta(days=10)).isoformat()},
        {"title": "Coffee & Bakery Snacks", "amount": 18.75, "category": "Dining Out", "date": (today - timedelta(days=11)).isoformat()},
        {"title": "Supermarket Weekly Supplies", "amount": 95.80, "category": "Groceries", "date": (today - timedelta(days=14)).isoformat()},
        {"title": "Streaming Services Bundle", "amount": 29.99, "category": "Entertainment", "date": (today - timedelta(days=15)).isoformat()},
        {"title": "Pharmacy & Medicine", "amount": 34.50, "category": "Health & Fitness", "date": (today - timedelta(days=18)).isoformat()},
    ]

    if _use_supabase and _supabase_client:
        try:
            res = _supabase_client.table("expenses").select("id", count="exact").limit(1).execute()
            count = res.count if res.count is not None else len(res.data)
            if count == 0:
                logger.info("Supabase expenses table is empty. Inserting initial sample records...")
                rows_to_insert = [
                    {
                        "id": str(uuid.uuid4()),
                        "title": r["title"],
                        "amount": r["amount"],
                        "category": r["category"],
                        "date": r["date"],
                        "created_at": datetime.utcnow().isoformat() + "Z"
                    }
                    for r in sample_records
                ]
                _supabase_client.table("expenses").insert(rows_to_insert).execute()
                logger.info(f"Successfully inserted {len(rows_to_insert)} sample expenses into Supabase.")
        except Exception as e:
            logger.error(f"Error checking/seeding Supabase data: {e}")
    else:
        with sqlite3.connect(SQLITE_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM expenses")
            count = cursor.fetchone()[0]
            if count == 0:
                logger.info("Local expenses table is empty. Inserting initial sample records...")
                now_str = datetime.utcnow().isoformat() + "Z"
                for r in sample_records:
                    cursor.execute(
                        "INSERT INTO expenses (id, title, amount, category, date, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                        (str(uuid.uuid4()), r["title"], r["amount"], r["category"], r["date"], now_str)
                    )
                conn.commit()
                logger.info("Seeded initial sample records to local persistent storage.")


def get_all_expenses() -> List[Dict[str, Any]]:
    """Retrieves all expenses ordered by date descending."""
    if _use_supabase and _supabase_client:
        try:
            res = _supabase_client.table("expenses").select("*").order("date", desc=True).order("created_at", desc=True).execute()
            return res.data or []
        except Exception as e:
            logger.error(f"Supabase fetch error: {e}")
            raise e
    else:
        with sqlite3.connect(SQLITE_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, amount, category, date, created_at FROM expenses ORDER BY date DESC, created_at DESC")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]


def add_expense(expense_data: Dict[str, Any]) -> Dict[str, Any]:
    """Adds a new expense to persistent storage."""
    record_id = str(uuid.uuid4())
    now_str = datetime.utcnow().isoformat() + "Z"
    new_record = {
        "id": record_id,
        "title": expense_data["title"],
        "amount": round(float(expense_data["amount"]), 2),
        "category": expense_data["category"],
        "date": expense_data["date"],
        "created_at": now_str
    }

    if _use_supabase and _supabase_client:
        try:
            res = _supabase_client.table("expenses").insert(new_record).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return new_record
        except Exception as e:
            logger.error(f"Supabase insert error: {e}")
            raise e
    else:
        with sqlite3.connect(SQLITE_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO expenses (id, title, amount, category, date, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (new_record["id"], new_record["title"], new_record["amount"], new_record["category"], new_record["date"], new_record["created_at"])
            )
            conn.commit()
            return new_record


def delete_expense(expense_id: str) -> bool:
    """Deletes an expense by its ID. Returns True if deleted, False otherwise."""
    if _use_supabase and _supabase_client:
        try:
            res = _supabase_client.table("expenses").delete().eq("id", expense_id).execute()
            return bool(res.data and len(res.data) > 0)
        except Exception as e:
            logger.error(f"Supabase delete error: {e}")
            raise e
    else:
        with sqlite3.connect(SQLITE_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
            conn.commit()
            return cursor.rowcount > 0


def get_summary_statistics() -> Dict[str, Any]:
    """
    Calculates total spending, transaction count, and highest-spending category
    directly from persistent storage.
    """
    expenses = get_all_expenses()
    total_spending = round(sum(float(e["amount"]) for e in expenses), 2)
    transaction_count = len(expenses)

    # Category totals
    category_totals: Dict[str, float] = {}
    for e in expenses:
        cat = e["category"]
        category_totals[cat] = category_totals.get(cat, 0.0) + float(e["amount"])

    highest_category = None
    if category_totals:
        highest_category = max(category_totals.items(), key=lambda x: x[1])[0]

    return {
        "total_spending": total_spending,
        "transaction_count": transaction_count,
        "highest_spending_category": highest_category
    }


def get_category_breakdown() -> List[Dict[str, Any]]:
    """
    Calculates category spending totals and their percentage share
    directly from persistent storage.
    """
    expenses = get_all_expenses()
    total_spending = sum(float(e["amount"]) for e in expenses)

    category_totals: Dict[str, float] = {}
    for e in expenses:
        cat = e["category"]
        category_totals[cat] = category_totals.get(cat, 0.0) + float(e["amount"])

    breakdown = []
    for cat, total in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        pct = round((total / total_spending * 100), 1) if total_spending > 0 else 0.0
        breakdown.append({
            "category": cat,
            "total": round(total, 2),
            "percentage": pct
        })

    return breakdown


def get_storage_type() -> str:
    """Returns the active storage backend name."""
    return "Supabase" if _use_supabase else "Local Persistent SQLite (Set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY to switch to Supabase Cloud)"
