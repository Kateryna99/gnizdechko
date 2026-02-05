import {updateCartBlock, updateCartUI} from "./update-cart-ui.js";
import {closeCart} from "../burger/cart.js";
import {showSnackbar} from "./show-snackbar.js";

export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

export const initAddToCart = () => {
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-add-to-cart]');
        if (!btn) return;

        e.preventDefault();

        const productId = Number(btn.dataset.productId);
        if (!productId) return;

        const detailScope = btn.closest('[data-product-scope]');

        let colorId;

        if (detailScope) {
            colorId = detailScope.querySelector('.colors__dot.is-active')?.dataset.colorId || null;
        } else {
            colorId = btn.dataset.firstColorId || null;
        }

        const qtyEl = detailScope?.querySelector('[data-amount]');
        const qty = qtyEl ? Number(qtyEl.textContent) || 1 : 1;

        const payload = {
            product_id: productId,
            color_id: colorId ? Number(colorId) : null,
            qty,
        };

        const res = await fetch('/cart/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) return console.error(data);

        updateCartBlock(data);
        updateCartUI(data);
        showSnackbar('Товар успішно додано до кошика!')
    });
};

export const initCartRemove = () => {
    document.addEventListener('click', async (e) => {
            const btn = e.target.closest('.cart-product__delete');
            if (!btn) return;

            e.preventDefault();
            e.stopPropagation();

            const key = btn.dataset.cartKey;
            if (!key) return;

            const res = await fetch('/cart/remove/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({key}),
            });

            const data = await res.json();
            if (!res.ok) {
                console.error(data);
                return;
            }

            const item = btn.closest('.cart-product');
            item?.remove();

            updateCartBlock(data);
            updateCartUI(data);

            const qty = Number(data.cart_total_qty ?? 0)

            if (!qty) {
                const isCheckout = document.querySelector('[data-page="checkout"]')

                if (isCheckout) {
                    window.location.href = '/';
                    return;
                }

                closeCart();
            }
        }
    )
    ;
};