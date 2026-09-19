"""Preview the generated GitHub Pages site at its real project URL path."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent.parent
BASE_PATH = "/kurahaus-sample/"


class ProjectPagesHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        pathname = urlsplit(path).path
        if pathname.startswith(BASE_PATH):
            return super().translate_path("/" + pathname[len(BASE_PATH) :])
        return super().translate_path("/__not_found__")


if __name__ == "__main__":
    server = ThreadingHTTPServer(
        ("127.0.0.1", 8766),
        partial(ProjectPagesHandler, directory=str(ROOT / "site-dist")),
    )
    print(f"Preview at http://127.0.0.1:8766{BASE_PATH}", flush=True)
    server.serve_forever()
