import procaaso_fns_sdk
import router_functions
import db_functions
from db_connection import setup_db_connection


def set_up_server(logger) -> procaaso_fns_sdk.server.Server:
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
        methods=["GET"],
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

    setup_db_connection()

    new_server = set_up_server(logger)
    fast_api = new_server.create_app()
    return fast_api
