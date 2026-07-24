from pydantic import BaseModel

"""
Define any data models here. All sqlalchemy table row models should have a mirror model in this directory.
Example:
class Boat(BaseModel):
    name: str
    color: str
"""


class Boat(BaseModel):
    name: str
    color: str
