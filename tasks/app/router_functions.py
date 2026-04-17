import asyncio
import fastapi
from logging import Logger
import procaaso_fns_sdk
from pydantic import BaseModel

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