def get_cart_summary(cart: dict):
    items_out = []
    total_qty = 0
    total_sum = 0

    for item in cart.get("items", {}).values():
        item_total = item["qty"] * item["price"]

        items_out.append({**item, "total": item_total})

        total_qty += item["qty"]
        total_sum += item_total

    if total_qty > 99:
        display_qty = "99+"
    elif total_qty > 9:
        display_qty = "9+"
    else:
        display_qty = total_qty

    return {
        "cart_items": items_out,
        "cart_total_qty": total_qty,
        "cart_display_qty": display_qty,
        "cart_total_sum": total_sum,
    }