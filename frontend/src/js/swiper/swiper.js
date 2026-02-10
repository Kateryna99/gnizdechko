import Swiper, {Navigation, Pagination, Autoplay} from 'swiper'

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

Swiper.use([Navigation, Pagination, Autoplay])

const aboutSwiper = document.querySelector('.swiper-about')
if (aboutSwiper) {
    new Swiper('.swiper-about', {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        navigation: {
            enabled: false,
        },

        pagination: {
            el: '.swiper-pagination-about',
            clickable: true,
        },
        breakpoints: {
            767: {
                slidesPerView: 1.3,
                centeredSlides: true,
            },
            1024: {
                loop: false,
            },
            1240: {
                slidesPerView: 1,
            }
        },
    })
}

new Swiper('.swiper-special', {
    slidesPerView: 1,
    spaceBetween: 8,

    autoplay: {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },

    pagination: {
        el: '.swiper-pagination-special',
        clickable: true,
    },
    breakpoints: {
        767: {
            slidesPerView: 4,
        },
    },
})

