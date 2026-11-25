# Imports here are sibling-style on purpose: at deploy time the contents of
# `tasks/app/` are placed directly on the runtime path, so `app` is not a
# package. See README "Backend module layout".
import os

import procaaso_fns_sdk

import router_functions
import db_functions
import environments


def set_up_server(logger):
    newServer = procaaso_fns_sdk.server.Server()
    """
    REGISTER NEW ENDPOINTS HERE
    Example:
    ```
    newServer.register_endpoint(
        route="/boat",
        func=router_functions.new_get_boat_handler(logger, db_functions.get_boat),
        methods=["POST"],
    )
    ```
    """

    newServer.register_endpoint(
        route="/boat",
        func=router_functions.new_get_boat_handler(logger, db_functions.get_boat),
        methods=["POST"],
    )

    return newServer


def app_factory():
    """
    Define any handler dependencies here and pass them into the handler factory functions when
    registering the endpoints in set_up_server() above. This allows for better separation of
    concerns and easier testing.

    example:

    logger = procaaso_fns_sdk.get_logger()
    """

    logger = procaaso_fns_sdk.logs.get_logger()

    if os.getenv("DEV_MODE"):
        environments.set_dev_config(logger)
        db_functions.run_up_migrations()

    new_server = set_up_server(logger)
    fast_api = new_server.create_app()

    db_functions.seed_boats()

    return fast_api
