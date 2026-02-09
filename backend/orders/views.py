import requests
from django.conf import settings
from django.shortcuts import render, redirect, reverse
from django.views.decorators.http import require_http_methods, require_GET
from django.http import JsonResponse
from .constants import EXCLUDE
from .services.novaposhta import np_get_cities, np_get_warehouses
from cart.utils import get_cart_summary
from .forms import CheckoutForm
from babel import Locale


# Create your views here.
def checkout(request):
    return render(request, "orders/checkout.html")


def ok(items):
    return JsonResponse({"ok": True, "items": items, "error": None})


def fail(message, status=400):
    return JsonResponse({"ok": False, "items": [], "error": message}, status=status)


@require_GET
def countries_api(request):
    url = "https://restcountries.com/v3.1/all?fields=cca2,name"
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    data = r.json()

    uk = Locale.parse("uk")

    items = []
    for c in data:
        code = (c.get("cca2") or "").upper()
        if not code or code in EXCLUDE:
            continue

        en_name = ((c.get("name") or {}).get("common")) or code

        ua_name = uk.territories.get(code, en_name)

        items.append({"id": code, "name": ua_name})

    items.sort(key=lambda x: (x["id"] != "UA", x["name"].lower()))
    return JsonResponse({"ok": True, "items": items})


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
    cart = request.session.get("cart", {"items": {}})
    ctx = get_cart_summary(cart)

    if request.method == "GET":
        return render(request, "orders/checkout.html", {**ctx, "form": CheckoutForm()})

    else:
        form = CheckoutForm(request.POST)

        if not form.is_valid():
            print("FORM ERRORS:", form.errors)
            print("POST:", request.POST)
            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse({"ok": False, "errors": form.errors}, status=400)

            return render(request, "orders/checkout.html", {**ctx, "form": form})

        cd = form.cleaned_data

        lines = [
            "🧺 НОВЕ ЗАМОВЛЕННЯ",
            "",
            "👤 КЛІЄНТ:",
            f"   🧍 Імʼя: {cd['first_name']} {cd['last_name']}",
            f"   📞 Телефон: {cd['phone']}",
            f"   ✉️ Email: {cd['email']}",
            f"   🌍 Країна: {cd['country'] + '/' + cd['country_name']}",
            "",
            "🚚 ДОСТАВКА:",
        ]

        if cd["country"] == "UA":
            lines.extend([
                f"   🏙 Місто: {cd.get('delivery_city_name') or cd.get('delivery_city')}",
                f"   🏤 Відділення: {cd.get('delivery_warehouse_name') or cd.get('delivery_warehouse')}",
            ])
        else:
            lines.extend([
                f"   🏙 Місто: {cd.get('intl_city')}",
                f"   📮 Індекс: {cd.get('intl_postcode')}",
                f"   🏠 Адреса: {cd.get('intl_street')}",
            ])

        comment = (cd.get("delivery_comment") or "").strip()
        if comment:
            lines.append(f"   📝 Коментар: {comment}")

        lines.extend([
            "",
            "📦 ТОВАРИ:",
        ])

        for i, item in enumerate(ctx["cart_items"], start=1):
            color = f"\n   🎨 Колір: {item['color_name']}" if item.get("color_name") else ""
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

        request.session["cart"] = {"items": {}}
        request.session.modified = True

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({"ok": True, "redirect": reverse("home")})

        return redirect("home")
