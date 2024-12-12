import json
import fastapi

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


async def get_system_status_by_id(system_id: str, limit: int = 20):
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
    return new_server


def app_factory():
    new_server = set_up_server()

    logger.info("Set up the server")

    return new_server.create_app(set_up_subscriber())
