import procasso_uns_sdk


def set_up_server() -> procasso_uns_sdk.server.Server:
    newServer = procasso_uns_sdk.server.Server()
    return newServer


def app_factory():
    new_server = set_up_server()
    fast_api = new_server.create_app()
    return fast_api
