import json
import http
import fastapi

import config
import procasso_uns_sdk

last_system_status = {}

logger = procasso_uns_sdk.logs.get_logger()


async def react_and_save_event(event: procasso_uns_sdk.events.AttributeEvent):
    print("Event received")
    if not event.state.get("state"):
        print("no state passed")
        print("Full event: ", event)
        return

    state = json.loads(event.state["state"])
    state_data = json.loads(state)
    await save_event(event)

    status = state_data["state"]

    if event.system_id not in last_system_status:
        last_system_status[event.system_id] = status
        await save_system_status(event, status, event.state["timestamp"])
    elif status == 0 and last_system_status[event.system_id] != 0:
        last_system_status[event.system_id] = status
        await save_system_status(event, status, event.state["timestamp"])
    elif status != 0 and last_system_status[event.system_id] == 0:
        last_system_status[event.system_id] = status
        await save_system_status(event, status, event.state["timestamp"])


async def save_system_status(
    event: procasso_uns_sdk.events.AttributeEvent, system_state: int, timestamp: str
):
    connection = procasso_uns_sdk.get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO system_status(system_id,status,timestamp) VALUES(?,?,?)",
                (event.system_id, system_state, timestamp),
            )
    except Exception as e:
        logger.error(f"Couldn't save system status: {e}\n")
    finally:
        connection.close()


async def save_event(event: procasso_uns_sdk.events.AttributeEvent):
    connection = procasso_uns_sdk.get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO events(system_id,attribute_id,root,instrument,attribute,state,timestamp) VALUES(?,?,?,?,?,?,?)",
                (
                    event.system_id,
                    event.state["id"],
                    event.root,
                    event.instrument,
                    event.attribute,
                    event.state["state"],
                    event.state["timestamp"],
                ),
            )
    except Exception as e:
        logger.error(f"Couldn't save event: {e}\n")
    finally:
        connection.close()


@procasso_uns_sdk.authz.auth_context("logs", "read")
async def get_system_status_by_id(
    request: fastapi.Request,
    system_id: str,
    limit: int = 20,
):
    connection = procasso_uns_sdk.get_db_connection()

    stmt = ""
    if system_id != "all":
        stmt = f"SELECT system_id, status, timestamp FROM system_status WHERE system_id='{system_id}' ORDER BY timestamp DESC"
    else:
        stmt = "SELECT system_id, status, timestamp FROM system_status ORDER BY timestamp DESC"

    try:
        with connection.cursor() as cursor:
            cursor.execute(stmt)
            return cursor.fetchmany(limit)
    except Exception as e:
        logger.error(f"Couldn't retrieve system status: {e}\n")
    finally:
        connection.close()


@procasso_uns_sdk.authz.auth_context("logs", "read")
async def get_events_by_root(
    request: fastapi.Request,
    root: str,
    limit: int = 20,
):
    connection = procasso_uns_sdk.get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM events WHERE root=? ORDER BY timestamp DESC", [root]
            )
            return cursor.fetchmany(limit)
    except Exception as e:
        logger.error(f"Couldn't retrieve events: {e}\n")
    finally:
        connection.close()


def set_up_subscriber() -> procasso_uns_sdk.events.AttributeSubscriber:
    sub = procasso_uns_sdk.events.AttributeSubscriber(get_snapshot=False)

    event1 = procasso_uns_sdk.events.Attribute(
        root="phase", instrument="phase", attribute="state"
    )

    sub.subscribe(event1, func=react_and_save_event)
    return sub


@procasso_uns_sdk.authz.auth_context("files", "list")
async def list_files(
    request: fastapi.Request,  # pylint: disable=unused-argument
    token: str | None = None,
):
    resp = await procasso_uns_sdk.storage.list_files(continuation_token=token)
    if resp.status_code == http.HTTPStatus.OK:
        return resp.json()

    return {"status": "Files not listed", "error": resp.text}


@procasso_uns_sdk.authz.auth_context("files", "download")
async def download_file(
    request: fastapi.Request,  # pylint: disable=unused-argument
    filename: str,
):
    return await procasso_uns_sdk.storage.download_file(filename=filename)


@procasso_uns_sdk.authz.auth_context("files", "upload")
async def upload_file(
    request: fastapi.Request,  # pylint: disable=unused-argument
    file: fastapi.UploadFile,
):
    # Check if the file is an image
    if file.content_type.startswith("image/"):
        return {"status": "File not uploaded", "error": "Image uploads are not allowed"}

    try:
        response = await procasso_uns_sdk.storage.upload_file(
            file_bytes=file.file.read(),
            filename=file.filename,
        )
        if response.status_code == http.HTTPStatus.OK:
            return {"status": "File uploaded"}
    except ValueError as e:
        return {"status": "File not uploaded", "error": str(e)}

    return {"status": "File not uploaded", "error": response.text}


@procasso_uns_sdk.authz.auth_context("files", "delete")
async def delete_file(
    request: fastapi.Request,  # pylint: disable=unused-argument
    filename: str,
):
    response = await procasso_uns_sdk.storage.delete_file(filename=filename)
    if response.status_code == http.HTTPStatus.OK:
        return {"status": "File deleted"}

    return {"status": "File not deleted", "error": response.text}


@procasso_uns_sdk.authz.auth_context("files", "batchDelete")
async def batch_delete_files(
    request: fastapi.Request,  # pylint: disable=unused-argument
):
    body = await request.json()
    names = body.get("names", [])

    response = await procasso_uns_sdk.storage.batch_delete_files(names=names)
    if response.status_code == http.HTTPStatus.OK:
        return {"status": "Files deleted"}

    return {"status": "Files not deleted", "error": response.text}


@procasso_uns_sdk.authz.auth_context("packages", "read")
async def get_info_for_fns_package(
    request: fastapi.Request,
    package_id: str,
):
    return await procasso_uns_sdk.contact_service(
        procasso_uns_sdk.Service.UBIETY,
        f"fnsPackages/{package_id}",
        method="GET",
    )


def set_up_server() -> procasso_uns_sdk.server.Server:
    new_server = procasso_uns_sdk.server.Server()
    new_server.register_endpoint(
        route="/system/{system_id}/limit/{limit}",
        func=get_system_status_by_id,
        methods=["GET"],
    )
    new_server.register_endpoint(
        route="/fnsPackage/{package_id}",
        func=get_info_for_fns_package,
        methods=["GET"],
    )
    new_server.register_endpoint(
        route="/root/{root}/limit/{limit}", func=get_events_by_root, methods=["GET"]
    )
    new_server.register_endpoint(
        route="/storage/list", func=list_files, methods=["GET"]
    )
    new_server.register_endpoint(
        route="/storage/download/{filename}", func=download_file, methods=["GET"]
    )
    new_server.register_endpoint(route="/storage", func=upload_file, methods=["PUT"])

    new_server.register_endpoint(
        route="/storage/delete/{filename}", func=delete_file, methods=["DELETE"]
    )
    new_server.register_endpoint(
        route="/storage/batchDelete", func=batch_delete_files, methods=["POST"]
    )
    return new_server


def app_factory():
    new_server = set_up_server()

    logger.info("Set up the server")

    conf = config.get_config()
    logger.info(f"Example variable from config: {conf.example_config_variable}")

    # example on how to set up the DEV CONFIG
    # procasso_uns_sdk.set_dev_config(
    #     dev_url="http://localhost:8080",
    #     dev_token="dev_token",
    # )

    return new_server.create_app(set_up_subscriber())
