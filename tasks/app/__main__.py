import os
import uvicorn


source_directory = os.path.dirname(os.path.realpath(__file__))
os.environ["UVICORN_RELOAD_DIRS"] = source_directory
<<<<<<< HEAD
uvicorn.main()
=======

if __name__ == "__main__":
    uvicorn.main()
>>>>>>> 3e4e68f (applying comments)
