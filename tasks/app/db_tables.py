from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import declarative_base, MappedColumn

Base = declarative_base()


"""
Define your database tables here. Each table should be a class that inherits from Base.

Example:
class ConfigRow(Base):
    __tablename__ = "configs"
    config_id = MappedColumn(String, primary_key=True)
    config_value = MappedColumn(String)
"""


