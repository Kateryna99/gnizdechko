from .utils import get_cart_summary

def cart_context(request):
    cart = request.session.get("cart", {"items": {}})

    return get_cart_summary(cart)