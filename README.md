# FNS Template app
This package is meant to act as an example. It can be packaged, uploaded and deployed.\
This ReadMe will go over the different files found in this example package.

## Package Manifest
The `pc2.json` is scoped to an FNS deployment. Within `pc2.json` we will define which custom-ui (pilet) is scoped to which system or component view.\
The `pc2.json` is used to describe all of the submodules (tasks and views) that this FNS deployment will depend on.

## Tasks Manifest
Within the tasks folder the `pyproject.toml` describes the app that will be deployed as a part of the overall package.\
Within the `pyproject.toml` we also describe the user code entry point via the tool.paracloud.definitions.\
The requirements must be listed inside the `pyproject.toml`. We generate a `requirements.txt` file from it.

## Migrations
The migrations folder is intended to store all the SQL files that will be executed **WHEN** the **APP** is deployed.\
They should be comprised of an up and a down file. Check the example currently there.\
When operating only with a DEV env you'll have to manually apply the migrations, in the same fashion as the function\
`get_events_by_root` in [./tasks/app/fns.py](./tasks/app/fns.py)

## Views manifest (Currently only one view can be built and deployed)
Within the views folder a pilet contains a `package.json` which is scoped to what that pilet needs to operate.\
The pilet `package.json` describes what it needs regardless of the overall deployment it is a part of.\
That is why the view - name, type, and context is all described within the pilet Manifest instead of the overall paracloud package Manifest.\
These pilets are intended to be self contained so they can be used in other ens packages. The only dependency that exists within the package Manifest is the aggregate name of the system or component view that will use the pilet.

### Frontend Development (UI)
If you are developing or modifying the **views** (frontend/UI), make sure to follow the dedicated [UI ReadMe](./views/README.md) located in the `views/` folder.

This guide contains essential instructions for working with:

- Dependencies
- Shadow DOM integration
- Customization and styling isolation
- Theme support (Light/Dark)
- Popper-based components (e.g. Tooltip, DatePicker)

**[Read the UI Development Guide →](./views/README.md)**

## pyproject.toml and poetry.lock
Within the `pyproject.toml` file, we can add packages we wish to have installed within in a system, you can see a few example packages used within the provided toml file.\
These are requested versions and packages, which are used to create a vitrual environment to run code within the ProCaaSo framework.\
The poetry lock file is used as a version control, along side our toml file.\
This lock file ensures the same version of packages is used within systems. This lock file can be updated to have the `pyproject.toml` file package versions with `poetry lock`.

## Uploading a new version
To upload a new version you'll need to change the versions in `pc2.json` and in `views/system-run-log-and-file-handling/package.json`.
When renaming `system-run-log-and-file-handling` folder, make sure to rename it in all places that matter such as: `pc2.json`, `lerna.json`, `package.json` etc.

## Installing Back-End dependencies

The only dependency that you need is the procaaso_fns_sdk.\
Make sure you have access to our internal tool **syndi**.

```
TOKEN=`syndi auth token --id`; pip install procaaso_fns_sdk -v --extra-index-url https://syndi:$TOKEN@pypi.procaas.us/simple
```

Or if you need to specify a version:
```
TOKEN=`syndi auth token --id`; pip install procaaso_fns_sdk==1.0.0 -v --extra-index-url https://syndi:$TOKEN@pypi.procaas.us/simple
```

# SDK Features 
**[Read the BE development guide →](./tasks/README.md)**
