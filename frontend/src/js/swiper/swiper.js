import Swiper from 'swiper'
import {Pagination, Navigation, Autoplay} from 'swiper/modules'

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const aboutSwiper = document.querySelector('.swiper-about')
if (aboutSwiper) {
    new Swiper('.swiper-about', {
        modules: [Pagination, Navigation],
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        pagination: {
            el: '.swiper-about .swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            0: {
                navigation: false,
            },
            767: {
                slidesPerView: 1.3,
                centeredSlides: true,
                // navigation: {
                //     nextEl: '.swiper-button-next',
                //     prevEl: '.swiper-button-prev',
                // },
            },
            1024: {
                slidesPerView: 2.1,
                loop: false,

                pagination: {
                    el: '.swiper-pagination-about',
                    clickable: true,
                },
            },
            1240: {
                slidesPerView: 1,
            }
        },
    })
}

const newSwiper = document.querySelector('.swiper-new')
if (newSwiper) {
    new Swiper('.swiper-new', {
        modules: [Pagination, Autoplay],
        slidesPerView: 2,
        spaceBetween: 8,

        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },

        pagination: {
            el: '.swiper-pagination-new',
            clickable: true,
        },
        breakpoints: {
            0: {
                navigation: false,
            },
            767: {
                slidesPerView: 4,
                // navigation: {
                //     nextEl: '.swiper-button-next',
                //     prevEl: '.swiper-button-prev',
                // },
            },
            1240: {
                slidesPerView: 5,
            }
        },
    })
}
