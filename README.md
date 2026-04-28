# Minimal FNS
This is the bare minimum required for an FNS

## Node version

Use Node 22 for anything under `views/`. The procaaso framework this deploys to is pinned to an older version of piral, which forces this package to the same older piral version — and that piral version depends on an older Node. Node 22 is the highest compatible release; do not upgrade past it.

## Backend module layout

The FNS task is built and deployed as a standalone backend: at runtime the contents of `tasks/app/` are placed directly on the Python path, with `app/` itself acting as the project root. There is no `app` package wrapping these modules in production. Files inside `tasks/app/` import each other as siblings:

```python
import router_functions
from models import BoatRequest
```

Not as `import app.router_functions` or `from app.models import ...` — those resolve in some local-dev setups but break the deploy. The `Debug Backend` entry in `.vscode/launch.json` runs the backend the same way, so sibling imports also work locally. Keep new files consistent with this style.
