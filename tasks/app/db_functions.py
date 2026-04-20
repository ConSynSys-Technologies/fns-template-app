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
