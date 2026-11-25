from pydantic import BaseModel

"""
Define any data models here. Every database table should have a mirror model in this file, built from the rows the db functions read.
Example:
class Boat(BaseModel):
    name: str
    color: str
"""


class Boat(BaseModel):
    name: str
    color: str
