import os

import procaaso_fns_sdk
from fastapi.middleware.cors import CORSMiddleware

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
        route="/config",
        func=router_functions.new_get_config_handler(logger),
        methods=["GET"],
    )
    ```
    """

    newServer.register_endpoint(
        route="/config",
        func=router_functions.new_get_config_handler(logger, db_functions.get_config),
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

    new_server = set_up_server(logger)
    fast_api = new_server.create_app()

    if os.getenv("DEV_MODE"):
        fast_api.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:1234"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        db_functions.run_up_migrations()

    db_functions.seed_configs()

    return fast_api
