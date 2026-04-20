import asyncio
import fastapi
from logging import Logger
from typing import Callable
import procaaso_fns_sdk
from pydantic import BaseModel

from models import Boat

"""
DEFINE NEW ENDPOINT HANDLER FACTORY FUNCTIONS HERE
Include any dependencies as parameters to the factory function, and return the handler function itself.
All dependencies should be passed in as parameters to the factory function rather than imported directly in this file, to allow for better separation of concerns and easier testing.

Example:
def new_get_boat_handler(
    logger: Logger,
):
    class BoatResponse(BaseModel):
        color: str

    class BoatRequest(BaseModel):
        name: str

    @procaaso_fns_sdk.authz.auth_context("boat", "read")
    async def give_boat_handler(request: fastapi.Request, boat_request: BoatRequest):
        \"""
        Include a brief comment on what the function does as well as any oddities in the implementation that future maintainers should be aware of.
        \"""

        return BoatResponse(color="red")

    return give_boat_handler
"""


def new_get_boat_handler(
    logger: Logger,
    get_boat: Callable[[str], Boat | None],
):
    class BoatResponse(BaseModel):
        color: str

    class BoatRequest(BaseModel):
        name: str

    @procaaso_fns_sdk.authz.auth_context("boat", "read")
    async def give_boat_handler(request: fastapi.Request, boat_request: BoatRequest):
        boat = get_boat(boat_request.name)
        if boat is None:
            logger.info(f"No boat found for name={boat_request.name}")
            raise fastapi.HTTPException(status_code=404, detail="boat not found")
        return BoatResponse(color=boat.color)

    return give_boat_handler
