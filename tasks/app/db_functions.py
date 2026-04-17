from typing import  ParamSpec, TypeVar
import procaaso_fns_sdk

from db_tables import *
from models import *

from sqlalchemy import Engine
from sqlalchemy.orm import Session

logger = procasso_uns_sdk.logs.get_logger()

engine: Engine | None = None
session_maker = None
R = TypeVar("R")
P = ParamSpec("P")

from enum import Enum
from db_connection import *

"""
DEFINE NEW DATABASE INTERACTION FUNCTIONS HERE

example:
@db_session_handler
def get_config(session: Session, config_id: str) -> Config | None:
    config = session.query(ConfigRow).filter_by(config_id=config_id).first()
    if not config:
        return None
    return Config(config_id=config.config_id, config_value=config.config_value)
"""


