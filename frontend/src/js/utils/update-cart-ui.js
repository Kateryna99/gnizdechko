export const updateCartUI = (data) => {
  const cartIcon = document.querySelector('.cart');
  const badge = document.querySelector('[data-cart-badge]');

  if (data?.cart_total_qty > 0) {
    if (badge) {
      badge.textContent = data?.cart_display_qty;
    } else if (cartIcon) {
      const el = document.createElement('span');
      el.className = 'cart__badge';
      el.dataset.cartBadge = '';
      el.textContent = data.cart_display_qty;
      cartIcon.appendChild(el);
    }
  } else {
    badge?.remove();
  }

  const totalEl = document.querySelector('[data-cart-total]');
  if (totalEl) totalEl.textContent = data?.cart_total_sum+'₴';
};

export const updateCartBlock = (data) => {
  const block = document.querySelector('[data-cart-block]');
  if (!block || !data.cart_html) return;
  block.innerHTML = data.cart_html;
};