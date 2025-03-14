import pydantic
import functools


class Config(pydantic.BaseSettings):
    example_config_variable: str = "default value"


@functools.lru_cache
def get_config() -> Config:
    return Config()
