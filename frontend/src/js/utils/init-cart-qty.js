import {updateCartBlock, updateCartUI} from "./update-cart-ui.js";
import {getCookie} from "./add-product.js";

export const initCartQty = () => {
    const cartBlock = document.querySelector('.cart__block');
    if (!cartBlock) return;

    cartBlock.addEventListener('click', async (e) => {
        const btn = e.target.closest('.amount-container__button');
        if (!btn) return;

        e.preventDefault();

        const container = btn.closest('.amount-container');
        const key = container?.dataset.cartKey;
        if (!key) return;

        const valueEl = container.querySelector('[data-cart-amount]');
        const current = Number(valueEl?.textContent || 1);

        const action = btn.dataset.action;
        const next = action === 'increase' ? current + 1 : current - 1;

        if (next < 1) {
            return;
        }

        const res = await fetch('/cart/qty/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({key, qty: next}),
        });

        const data = await res.json();
        if (!res.ok) return console.error(data);

        valueEl.textContent = String(next);

        const productRow = container.closest('.cart-product');
        const qtyLabel = productRow?.querySelector('[data-cart-qty-label]');
        if (qtyLabel) qtyLabel.textContent = `${next} x `;

        updateCartBlock(data);
        updateCartUI(data);
    });
};