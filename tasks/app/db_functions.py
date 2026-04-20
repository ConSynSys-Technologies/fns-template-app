import os
from pathlib import Path

import procaaso_fns_sdk

from models import Boat

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"

logger = procaaso_fns_sdk.logs.get_logger()

"""
DEFINE NEW DATABASE INTERACTION FUNCTIONS HERE

Example:
def get_boat(name: str):
    conn = procaaso_fns_sdk.get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT name, color FROM boats WHERE name = ?",
        (name,),
    )
    row = cursor.fetchone()
    if not row:
        return None
    return Boat(name=row[0], color=row[1])
"""


def get_boat(name: str):
    conn = procaaso_fns_sdk.get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT name, color FROM boats WHERE name = ?",
        (name,),
    )
    row = cursor.fetchone()
    if not row:
        return None
    return Boat(name=row[0], color=row[1])


def run_up_migrations():
    logger.info("Running up migrations...")
    connection = procaaso_fns_sdk.get_db_connection()
    cursor = connection.cursor()
    migration_files = os.listdir(MIGRATIONS_DIR)
    up_migrations = sorted(f for f in migration_files if f.endswith(".up.sql"))
    for migration in up_migrations:
        migration_path = MIGRATIONS_DIR / migration
        logger.info(f"Running up migration {migration}")
        with open(migration_path, "r") as file:
            sql = file.read()
            try:
                cursor.execute(sql)
                logger.info(f"Ran up migration: {migration}")
            except Exception as e:
                logger.error(f"Error running up migration {migration}: {e}")
    connection.commit()
    connection.close()


def seed_boats():
    conn = procaaso_fns_sdk.get_db_connection()
    cursor = conn.cursor()
    seeds = [
        ("example", "red"),
    ]
    cursor.executemany(
        "INSERT OR IGNORE INTO boats (name, color) VALUES (?, ?)",
        seeds,
    )
    conn.commit()
    logger.info(f"Seeded {len(seeds)} boat row(s)")
