"""
This file includes all the boilerplate code for setting up a connection to the Procaaso
database and handling sessions in a thread-safe way with retries on locking.
"""

import procaaso_fns_sdk
from functools import wraps
from sqlite3 import OperationalError
import time
from typing import Callable, Concatenate, Awaitable, overload, TypeVar, ParamSpec
import asyncio
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import sessionmaker, Session
# DONT DELETE IMPORT: Needed for sqlalchemy to recognize
# sqlite+pyrqlite as a dialect
import dialect.dialect as _

engine: Engine | None = None
session_maker = None
R = TypeVar("R")
P = ParamSpec("P")

logger = procaaso_fns_sdk.logs.get_logger()

class PyrqliteConnectionWrapper:
    """
    Wrapper to make Pyrqlite's connection compatible with SQLAlchemy
    """

    def __init__(self, conn):
        self._conn = conn

    def create_function(self, name, num_params, func, deterministic=False):
        return self._conn

    def cursor(self):
        return self._conn.cursor()

    def commit(self):
        return self._conn.commit()

    def rollback(self):
        return self._conn.rollback()

    def close(self):
        return self._conn.close()
    


def setup_db_connection():

    global engine

    def create_wrapped_connection():
        raw_connection = procaaso_fns_sdk.get_db_connection()
        return PyrqliteConnectionWrapper(raw_connection)

    engine = create_engine(
        "sqlite+pyrqlite://",
        creator=create_wrapped_connection,  # Ensures SQLAlchemy reuses this connection
        connect_args={
            "check_same_thread": False
        },  # Allows access across multipe threads
    )
    # create_tables(engine)

    global session_maker
    session_maker = sessionmaker(bind=engine)


@overload
def db_session_handler(
    func: Callable[Concatenate[Session, P], Awaitable[R]],
) -> Callable[P, Awaitable[R]]: ...


@overload
def db_session_handler(
    func: Callable[Concatenate[Session, P], R],
) -> Callable[P, R]: ...


def db_session_handler(
    func: Callable[Concatenate[Session, P], R],
) -> Callable[P, R] | Callable[P, Awaitable[R]]:
    """
    Thread-safe session handler with retry on SQLite locking.
    - Automatically retries on "database is locked" errors (exponential backoff).
    - Passes a new session as first argument to the wrapped function.
    - Automatically commits if no exception occurs.
    - Automatically rolls back and closes the session on failure.
    - Raises an exception if all retry attempts are exhausted.

    NOTE: The wrapped function must NOT call session.commit().
    """
    if asyncio.iscoroutinefunction(func):

        @wraps(func)
        async def async_wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            if not session_maker:
                raise RuntimeError("Session maker not initialized")

            session = session_maker()
            try:
                for attempt in range(5):
                    wait = 0.5 * (2**attempt)
                    try:
                        result = await func(session, *args, **kwargs)
                        session.commit()
                        return result
                    except OperationalError as e:
                        if "database is locked" in str(e):
                            logger.warning(
                                f"Database is locked. Retry {attempt+1}/5 in {wait:.2f}s."
                            )
                        else:
                            logger.error(
                                f"Unexpected OperationError on commit to database: {e} on attempt {attempt+1}/5"
                            )
                        session.rollback()
                        await asyncio.sleep(wait)

                raise OperationalError(
                    "Failed to acquire database lock after 5 attempts"
                )
            except Exception as e:
                logger.exception(f"Database error in {func.__name__}")
                try:
                    session.rollback()
                    logger.info("Rollback successful")
                except:
                    logger.exception(f"Rollback error in {func.__name__}")
                raise e
            finally:
                session.close()

        return async_wrapper
    else:

        @wraps(func)
        def sync_wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            if not session_maker:
                raise RuntimeError("Session maker not initialized")

            session = session_maker()
            try:
                for attempt in range(5):
                    wait = 0.5 * (2**attempt)
                    try:
                        result = func(session, *args, **kwargs)
                        session.commit()
                        return result
                    except OperationalError as e:
                        if "database is locked" in str(e):
                            logger.warning(
                                f"Database is locked. Retry {attempt+1}/5 in {wait:.2f}s."
                            )
                        else:
                            logger.error(
                                f"Unexpected OperationError on commit to database: {e} on attempt {attempt+1}/5"
                            )
                        session.rollback()
                        time.sleep(wait)

                raise OperationalError(
                    "Failed to acquire database lock after 5 attempts"
                )
            except Exception as e:
                logger.exception(f"Database error in {func.__name__}")
                try:
                    session.rollback()
                    logger.info("Rollback successful")
                except:
                    logger.exception(f"Rollback error in {func.__name__}")
                raise e
            finally:
                session.close()

        return sync_wrapper
