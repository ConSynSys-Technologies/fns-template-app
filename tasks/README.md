## Connecting to the Development Environment

When the development environment has been created and is running, you'll have to copy the url.
Generate a new short token via `syndi auth token`.

Add this part in the start_app function (or whatever function that creates the Fastapi app)

```
procasso_uns_sdk.set_dev_config(
    dev_url="http://localhost:8080",
    dev_token="dev_token",
)
```
Keep in mind that the token will work only for 1 hour.

E.g.

```
def app_factory():
    new_server = set_up_server()

    procasso_uns_sdk.set_dev_config(
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

```@procasso_uns_sdk.authz.auth_context("GROUP", "ACTION")```

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
You can reach other services like ubiety, stream, control, structure via the sdk.\
An example of this can be seen from the function `get_info_for_fns_package`.\
The comment of the sdk function `procasso_uns_sdk.contact_service` will give you\
further insight how it works.

## Running this example

Install Uvicorn -> https://www.uvicorn.org

```UVICORN_FACTORY=true UVICORN_RELOAD=true python ./tasks/app -- fns:app_factory --port=7474```
