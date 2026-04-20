"""
Native SQL alternative to db_functions.py (no SQLAlchemy).

Table definitions live in the migrations/ directory. This file contains the
database interaction functions that execute raw SQL against the connection
returned by procaaso_fns_sdk.get_db_connection().

To use: in fns.py, import from db_functions_native instead of db_functions.
"""

import procaaso_fns_sdk

from models import Config

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
