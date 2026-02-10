from django.shortcuts import render, get_object_or_404
import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from django.template.loader import render_to_string
from gnizdechko_app.models import Product, Color
from .utils import get_cart_summary

@require_POST
@csrf_protect
def cart_add(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    product_id = payload.get("product_id")
    color_id = payload.get("color_id")
    qty = payload.get("qty", 1)

    if not isinstance(product_id, int):
        return JsonResponse({"error": "product_id must be int"}, status=400)

    if not isinstance(qty, int) or qty < 1 or qty > 99:
        return JsonResponse({"error": "qty must be 1..99"}, status=400)

    product = get_object_or_404(Product, id=product_id)
    price = product.sale_price if product.sale_price is not None else product.price

    color = None
    if color_id is not None:
        if not isinstance(color_id, int):
            return JsonResponse({"error": "color_id must be int or null"}, status=400)

        color = get_object_or_404(Color, id=color_id)

        if not product.colors.filter(id=color.id).exists():
            return JsonResponse({"error": "Color not available for this product"}, status=400)

    cart = request.session.get("cart", {"items": {}})
    items = cart.setdefault("items", {})

    key = f"{product.id}:{color.id if color else 0}"

    if key in items:
        items[key]["qty"] = min(99, items[key]["qty"] + qty)
    else:
        items[key] = {
            "key": key,
            "product_id": product.id,
            "title": product.title,
            "color_id": color.id if color else 0,
            "color_name": color.name if color else None,
            "color_hex": color.hex if color else None,
            "qty": qty,
            "price": int(price),
            "image": product.main_image_webp.url,
        }

    request.session["cart"] = cart
    request.session.modified = True

    summary = get_cart_summary(cart)

    cart_html = render_to_string(
        "cart/cart_block.html",
        summary,
        request=request,
    )

    return JsonResponse({
        "ok": True,
        **summary,
        "cart_html": cart_html,
    })

@require_POST
@csrf_protect
def cart_remove(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    key = payload.get("key")
    if not isinstance(key, str) or ":" not in key:
        return JsonResponse({"error": "key must be string like 'product:color'"}, status=400)

    cart = request.session.get("cart", {"items": {}})
    items = cart.get("items", {})

    if key in items:
        del items[key]
        request.session["cart"] = cart
        request.session.modified = True

    summary = get_cart_summary(cart)

    cart_html = render_to_string(
        "cart/cart_block.html",
        summary,
        request=request,
    )

    return JsonResponse({
        "ok": True,
        **summary,
        "cart_html": cart_html,
    })

@require_POST
@csrf_protect
def cart_qty(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    key = payload.get("key")
    qty = payload.get("qty")

    if not isinstance(key, str) or not key:
        return JsonResponse({"error": "key required"}, status=400)

    if not isinstance(qty, int) or qty < 0 or qty > 99:
        return JsonResponse({"error": "qty must be 0..99"}, status=400)

    cart = request.session.get("cart", {"items": {}})

    if key not in cart["items"]:
        return JsonResponse({"error": "item not found"}, status=404)

    if qty == 0:
        del cart["items"][key]
    else:
        cart["items"][key]["qty"] = qty

    request.session["cart"] = cart
    request.session.modified = True

    return JsonResponse({"ok": True, **get_cart_summary(cart)})