const main = document.getElementById('main');
const footer = document.getElementById('footer');
const header = document.getElementById('header');
const cartIcon = header.querySelector('.cart');
const cartBlock = header.querySelector('.cart__block');
const closeButtons = header.querySelectorAll('[data-cart-close]')

export const closeCart = () => {
    cartBlock?.classList.remove('is-active');
    main?.classList.remove('is-active');
    footer?.classList.remove('is-active');
};

export const initCartToggle = () => {
    if (!cartIcon || !cartBlock) return;

    const open = () => {
        cartBlock.classList.add('is-active');
        main.classList.add('is-active');
        footer.classList.add('is-active');
    };

    const isOpen = () => cartBlock.classList.contains('is-active');

    cartBlock.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('[data-cart-close]');
        if (!closeBtn) return;
        e.preventDefault();
        closeCart();
    });

    cartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen() ? closeCart() : open();
    });

    document.addEventListener('click', (e) => {
        if (!isOpen()) return;
        if (cartBlock.contains(e.target) || cartIcon.contains(e.target)) return;
        closeCart();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCart();
    });
};