import json
import os
from pathlib import Path
from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

register = template.Library()

VITE_DEV_SERVER = os.getenv("VITE_DEV_SERVER", "http://localhost:5173")
VITE_DEV = os.getenv("VITE_DEV", "0") == "1"

MANIFEST_PATH = Path(settings.BASE_DIR) / "static" / "dist" / ".vite" / "manifest.json"


def _load_manifest():
    if not MANIFEST_PATH.exists():
        return {}
    return json.loads(MANIFEST_PATH.read_text())


@register.simple_tag
def vite_client():
    if not VITE_DEV:
        return ""
    return mark_safe(f'<script type="module" src="{VITE_DEV_SERVER}/@vite/client"></script>')


@register.simple_tag
def vite_js(entry="src/js/index.js"):
    if VITE_DEV:
        return f"{VITE_DEV_SERVER}/{entry}"

    manifest = _load_manifest()
    item = manifest.get(entry) or manifest.get(f"./{entry}")
    if not item:
        return ""
    return settings.STATIC_URL + "dist/" + item["file"]


@register.simple_tag
def vite_css(entry="src/js/index.js"):
    if VITE_DEV:
        return ""

    manifest = _load_manifest()
    item = manifest.get(entry) or manifest.get(f"./{entry}")
    if not item:
        return ""

    css = item.get("css", [])
    if not css:
        return ""

    return settings.STATIC_URL + "dist/" + css[0]