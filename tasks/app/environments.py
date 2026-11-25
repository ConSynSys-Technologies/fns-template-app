"""
Loads environments.json from the repo root and exposes helpers for switching
between fns environments during local dev.
"""

import json
import platform
import subprocess
from logging import Logger, config
from pathlib import Path

import procaaso_fns_sdk
from pydantic import BaseModel


class EnvironmentContext(BaseModel):
    syndiTokenCommand: str
    environmentUrl: str
    devUrl: str


class EnvironmentConfig(BaseModel):
    environments: dict[str, EnvironmentContext]
    activeEnvironment: str


def load_environment_config():
    path = Path(__file__).resolve().parents[2] / "environments.json"
    with open(path, "r") as f:
        return EnvironmentConfig(**json.load(f))


def get_syndi_token(command: str):
    """Retrieves the syndi token based on the operating system."""

    def get_syndi_token_windows():
        return subprocess.run(
            ["powershell", "-Command", command],
            capture_output=True,
            text=True,
            check=False,
        )

    def get_syndi_token_linux():
        return subprocess.run(
            ["bash", "-c", command], capture_output=True, text=True, check=False
        )

    os_name = platform.system()
    if os_name == "Windows":
        result = get_syndi_token_windows()
    elif os_name == "Linux":
        result = get_syndi_token_linux()
    else:
        raise ValueError(f"OS type is not `Windows` or `Linux`, got: {os_name}")

    if result.returncode != 0:
        raise Exception(
            f"{command} returned non zero exit code: {result.returncode} {result.stderr}"
        )
    return result.stdout


def set_dev_config(logger: Logger):
    """
    In dev mode, allows for easily switching between fns environments.
    See environments.json to change environments.
    """
    config = load_environment_config()
    try:
        active_env = config.environments[config.activeEnvironment]
    except Exception as e:
        raise ValueError(
            f"activeEnvironment {config.activeEnvironment!r} is not a key in environments.json"
        ) from e

    dev_token = get_syndi_token(active_env.syndiTokenCommand)
    procaaso_fns_sdk.set_dev_config(
        dev_url=active_env.devUrl, dev_token=dev_token
    )
    logger.info(f"Using dev env: {active_env.devUrl}")
    procaaso_fns_sdk.get_config.cache_clear()
