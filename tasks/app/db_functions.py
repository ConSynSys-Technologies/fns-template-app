import os
from pathlib import Path

import procaaso_fns_sdk

from models import Config

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"

logger = procaaso_fns_sdk.logs.get_logger()

"""
DEFINE NEW DATABASE INTERACTION FUNCTIONS HERE

Example:
def get_config(config_id: str):
    conn = procaaso_fns_sdk.get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT config_id, config_value FROM configs WHERE config_id = ?",
        (config_id,),
    )
    row = cursor.fetchone()
    if not row:
        return None
    return Config(config_id=row[0], config_value=row[1])
"""


def get_config(config_id: str):
    conn = procaaso_fns_sdk.get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT config_id, config_value FROM configs WHERE config_id = ?",
        (config_id,),
    )
    row = cursor.fetchone()
    if not row:
        return None
    return Config(config_id=row[0], config_value=row[1])


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


def seed_configs():
    conn = procaaso_fns_sdk.get_db_connection()
    cursor = conn.cursor()
    seeds = [
        ("example", "hello from the seeded config"),
    ]
    cursor.executemany(
        "INSERT OR IGNORE INTO configs (config_id, config_value) VALUES (?, ?)",
        seeds,
    )
    conn.commit()
    logger.info(f"Seeded {len(seeds)} config row(s)")
