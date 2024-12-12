import pydantic
import functools


class Config(pydantic.BaseSettings):
    fns_url: str = ""
    fns_token: str | None = None


@functools.lru_cache
def get_config() -> Config:
    return Config()
