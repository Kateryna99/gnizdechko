import requests
from django.conf import settings
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods,require_GET
from django.http import JsonResponse
from django.contrib import messages
from .constants import COUNTRIES
from .services.novaposhta import np_get_cities, np_get_warehouses
from cart.utils import get_cart_summary

# Create your views here.
def checkout(request):
    context = {
        "countries": COUNTRIES
    }

    return render(request, "orders/checkout.html", context)

def ok(items):
    return JsonResponse({"ok": True, "items": items, "error": None})

def fail(message, status=400):
    return JsonResponse({"ok": False, "items": [], "error": message}, status=status)

@require_GET
def delivery_carriers(request):
    country = request.GET.get("country", "UA")

    if country != "UA":
        return ok([])

    items = [
        {"id": "np", "name": "Нова пошта"},
    ]
    return ok(items)


@require_GET
def delivery_cities(request):
    country = request.GET.get("country", "UA")
    carrier = request.GET.get("carrier")
    q = (request.GET.get("q") or "").strip()

    if country != "UA" or carrier != "np":
        return ok([])

    if carrier == "np":
        try:
            data = np_get_cities(q)
            items = [
                {"id": c["Ref"], "name": c["Description"]}
                for c in data
                if c.get("Ref") and c.get("Description")
            ]
            return ok(items)
        except Exception as e:
            return fail(str(e), status=502)

    return ok([])


@require_GET
def delivery_warehouses(request):
    country = request.GET.get("country", "UA")
    carrier = request.GET.get("carrier")
    city_id = request.GET.get("city_id")
    q = (request.GET.get("q") or "").strip()

    if country != "UA" or carrier not in {"np", "up"} or not city_id:
        return ok([])

    if carrier == "np":
        try:
            data = np_get_warehouses(city_id, q)
            items = [
                {"id": w["Ref"], "name": w["Description"]}
                for w in data
                if w.get("Ref") and w.get("Description")
            ]
            return ok(items)
        except Exception as e:
            return fail(str(e), status=502)

    return ok([])


def _tg_send(text: str) -> None:
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    requests.post(url, json={"chat_id": chat_id, "text": text}, timeout=10)


@require_http_methods(["GET", "POST"])
def checkout_telegram(request):
    if request.method == "GET":
        return render(request, "orders/checkout.html")

    cart = request.session.get("cart", {"items": {}})
    ctx = get_cart_summary(cart)

    if not ctx["cart_items"]:
        return redirect("checkout")

    lines = [
        "🧺 НОВЕ ЗАМОВЛЕННЯ",
        "",
        "📦 ТОВАРИ:"
    ]

    for i, item in enumerate(ctx["cart_items"], start=1):
        color = (
            f"\n   🎨 Колір: {item['color_name']}"
            if item.get("color_name")
            else ""
        )

        lines.append(
            f"{i}. {item['title']}"
            f"{color}\n"
            f"   🔢 Кількість: {item['qty']}\n"
            f"   💰 Ціна: {item['price']}₴\n"
            f"   🧾 Сума: {item['total']}₴"
        )

    lines.extend([
        "",
        f"🧮 ЗАГАЛОМ: {ctx['cart_total_sum']}₴",
    ])

    _tg_send("\n".join(lines))

    return redirect("checkout")
