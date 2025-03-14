import os
import uvicorn


source_directory = os.path.dirname(os.path.realpath(__file__))
os.environ["UVICORN_RELOAD_DIRS"] = source_directory

if __name__ == "__main__":
    uvicorn.run(host="0.0.0.0", app="fns:app_factory")
