import {initSwiper} from "./swiper/swiper.js";
import {initBurgerMenu} from './burger/burger.js'
import {initLoadMoreProducts} from "./utils/load-more.js";
import {initProductGallery} from "./utils/init-product-gallery.js";
import {initAmountCounter} from "./utils/init-amount-counter.js";
import {initCartToggle} from "./burger/cart.js";
import {initColorPicker} from "./utils/init-color-picker.js";
import {initAddToCart, initCartRemove} from "./utils/add-product.js";
import {initCartQty} from "./utils/init-cart-qty.js";

document.addEventListener('DOMContentLoaded', () => {
    initBurgerMenu()
    initLoadMoreProducts();
    initProductGallery();
    initAmountCounter();
    initCartToggle()
    initColorPicker()
    initAddToCart()
    initCartRemove()
    initCartQty()
    initSwiper()
});