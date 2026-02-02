import json
from pathlib import Path

from django import template
from django.conf import settings

register = template.Library()

_manifest_cache = None


def _manifest_path() -> Path:
    return Path(settings.BASE_DIR) / "static" / "dist" / ".vite" / "manifest.json"


def _load_manifest() -> dict:
    global _manifest_cache
    if _manifest_cache is not None:
        return _manifest_cache

    path = _manifest_path()
    if not path.exists():
        _manifest_cache = {}
        return _manifest_cache

    _manifest_cache = json.loads(path.read_text(encoding="utf-8"))
    return _manifest_cache


@register.simple_tag
def vite_js(entry: str = "src/js/index.js") -> str:
    manifest = _load_manifest()
    item = manifest.get(entry)
    if not item:
        return ""
    return settings.STATIC_URL + "dist/" + item["file"]