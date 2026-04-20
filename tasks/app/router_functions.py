import asyncio
import fastapi
from logging import Logger
from typing import Callable
import procaaso_fns_sdk
from pydantic import BaseModel

from models import Config

"""
DEFINE NEW ENDPOINT HANDLER FACTORY FUNCTIONS HERE
Include any dependencies as parameters to the factory function, and return the handler function itself.
All dependencies should be passed in as parameters to the factory function rather than imported directly in this file, to allow for better separation of concerns and easier testing.

Example:
def new_get_config_handler(
    logger: Logger,
):
    class ConfigResponse(BaseModel):
        config_value: str

    class ConfigRequest(BaseModel):
        request_value: str

    @procaaso_fns_sdk.authz.auth_context("config")
    async def give_config_handler(request: fastapi.Request, config_request: ConfigRequest):
        \"""
        Include a brief comment on what the function does as well as any oddities in the implementation that future maintainers should be aware of.
        \"""

        return ConfigResponse(config_value="This is the config value")

    return give_config_handler
"""


def new_get_config_handler(
    logger: Logger,
    get_config: Callable[[str], Config | None],
):
    class ConfigResponse(BaseModel):
        config_value: str

    class ConfigRequest(BaseModel):
        request_value: str

    @procaaso_fns_sdk.authz.auth_context("config")
    async def give_config_handler(request: fastapi.Request, config_request: ConfigRequest):
        config = get_config(config_request.request_value)
        if config is None:
            logger.info(f"No config found for id={config_request.request_value}")
            raise fastapi.HTTPException(status_code=404, detail="config not found")
        return ConfigResponse(config_value=config.config_value)

    return give_config_handler
