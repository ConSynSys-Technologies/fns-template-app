import os
import uvicorn


source_directory = os.path.dirname(os.path.realpath(__file__))
os.environ["UVICORN_RELOAD_DIRS"] = source_directory
uvicorn.main()
