## Connecting to the Development Environment

When the development environment has been created and is running, you'll have to copy the url.
Generate a new short token via `syndi auth token`.

Add this part in the start_app function (or whatever function that creates the Fastapi app)

```
procaaso_fns_sdk.set_dev_config(
    dev_url="http://localhost:8080",
    dev_token="dev_token",
)
```
Keep in mind that the token will work only for 1 hour.

E.g.

```
def app_factory():
    new_server = set_up_server()

    procaaso_fns_sdk.set_dev_config(
        dev_url="http://localhost:8080",
        dev_token="dev_token",
    )

    return new_server.create_app(set_up_subscriber())
```

If no messages are arriving, refresh token or restart the dev env.

# Finished developing and you want to deploy your app?

Revert the change that you made to the database connection code.
(Remove the https url and token) and continue\
**WARNING**: DEV TOKEN must be removed before deploying!

## Authorization
See functions in fns.py:\
 &emsp; get_system_status_by_id\
 &emsp; get_events_by_root\
 &emsp; get_info_for_fns_package

### How to use it
Above each function you want to enable it add this line

```@procaaso_fns_sdk.authz.auth_context("GROUP", "ACTION")```

You also need to add/pass the ```request: fastapi.Request``` parameter to the function.

E.g. Group is logs. Action is read.
In `pc2.json` you have the permissions listed.
Those permissions serve only as an example. You should define your own as you please.

## FNS API
When an FNS has been deployed it will have an api in this format:\
`https://PROJECT_ID.fns-tasks.YOUR_ENV_DOMAIN`

## Setting log level
POST request to `fns_api/set_logging_level`.
Body:
```
{
    "level": "LEVEL"
}
```
Allowed level values: debug, warning, info, error, critical

## Fetching logs
GET request to `fns_api/logs`
Query parameters:
```
year: int
month: int
day: int
last_days: int
```

## Reaching other services
Use `procaaso_fns_sdk.contact_service` to contact services such as Ubiety, Stream,
Control, and Structure. Pass the service, its relative endpoint path, and the HTTP
method.

GET requests do not require an auth token or the `request` argument:

```python
response = await procaaso_fns_sdk.contact_service(
    procaaso_fns_sdk.Service.STRUCTURE,
    f"systems/{id}",
    method="GET",
)
```

The auth token is required only for non-GET requests, such as POST, PATCH and PUT.
Pass the incoming `fastapi.Request` using `request=request` so the SDK
can forward the caller's auth token. Use `json` to send a JSON payload when needed.

For example, `change_running_mode` updates a system's operation mode:

```python
async def change_running_mode(request: fastapi.Request, id: str, data: dict):
    response = await procaaso_fns_sdk.contact_service(
        procaaso_fns_sdk.Service.STRUCTURE,
        f"systems/{id}",
        method="PATCH",
        request=request,
        json=data,
    )

    if response.status_code == 204:
        return fastapi.Response(status_code=204)

    return fastapi.responses.JSONResponse(
        content=response.json(), status_code=response.status_code
    )
```

For this PATCH request, `data` is `{"operationMode": "BATCH_BASED"}`. The supported
modes are `BATCH_BASED`, `CONTINUOUS`, and `S88_BATCH_BASED`.

See `get_info_for_system`, `get_info_for_fns_package`, and `change_running_mode` in
`app/fns.py` for examples, and the `procaaso_fns_sdk.contact_service` docstring for
more details.

## File handling
You can upload/download/list/delete/batch-delete files via functions provided by this sdk.\
To understand how to use them, please head over to fns.py and look for these functions:\

```
list_files
download_file
upload_file
delete_file
batch_delete_files
```

## Running this example

Install Uvicorn -> https://www.uvicorn.org

```UVICORN_FACTORY=true UVICORN_RELOAD=true python ./tasks/app --port=7474 -- fns:app_factory ```
