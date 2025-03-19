# FNS Template app
This package is meant to act as an example. It can be packaged, uploaded and deployed.
This ReadMe will go over the different files found in this example package.

## Package Manifest
The `pc2.json` is scoped to an FNS deployment. Within `pc2.json` we will define which custom-ui (pilet) is scoped to which system or component view. The `pc2.json` is used to describe all of the submodules (tasks and views) that this FNS deployment will depend on. 

## Tasks Manifest
Within the tasks folder the `pyproject.toml` describes the app that will be deployed as a part of the overall package. Within the `pyproject.toml` we also describe the user code entry point via the tool.paracloud.definitions.
THe requirements must be listed inside the `pyproject.toml`. We generate a `requirements.txt` file from it.

## Views manifest (Currently only one view can be built and deployed)
Within the views folder a pilet contains a `package.json` which is scoped to what that pilet needs to operate. The pilet `package.json` describes what it needs regardless of the overall deployment it is a part of. That is why the view - name, type, and context is all described within the pilet Manifest instead of the overall paracloud package Manifest. These pilets are intended to be self contained so they can be used in other ens packages. The only dependency that exists within the package Manifest is the aggregate name of the system or component view that will use the pilet. 

## pyproject.toml and poetry.lock
Within the `pyproject.toml` file, we can add packages we wish to have installed within in a system, you can see a few example packages used within the provided toml file. These are requested versions and packages, which are used to create a vitrual environment to run code within the ProCaaSo framework. The poetry lock file is used as a version control, along side our toml file. This lock file ensures the same version of packages is used within systems. This lock file can be updated to have the `pyproject.toml` file package versions with `poetry lock`.

## Uploading a new version
To upload a new version you'll need to change the versions in `pc2.json` and in `views/system-run-log/package.json`.
When renaming `system-run-log` folder, make sure to rename it in all places that matter such as: `pc2.json`, `lerna.json`, `package.json` etc.


# SDK Features

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
Keep in mind that the token will work only for 1 hour as a default.

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
(Remove the https url and token) and continue 

## Authorization
See functions in fns.py:
    get_system_status_by_id
    get_events_by_root
    get_info_for_fns_package

### How to use it
Above each function you want to enable it add this line

```@procasso_uns_sdk.authz.auth_context("GROUP", "ACTION")```

You also need to add/pass the ```request: fastapi.Request``` parameter to the function.

E.g. Group is logs. Action is read.
In `pc2.json` you have the permissions listed.
Those permissions serve only as an example. You should define your own as you please.

## FNS API
When an FNS has been deployed it will have an api in this format:
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
You can reach other services like ubiety, stream, control, structure via the sdk.
An example of this can be seen from the function `get_info_for_fns_package`.
The comment of the sdk function `procasso_uns_sdk.contact_service` will give you 
further insight how it works.

## Running this example

Install Uvicorn -> https://www.uvicorn.org

```UVICORN_FACTORY=true UVICORN_RELOAD=true python ./tasks/app -- fns:app_factory```
