import Swiper from 'swiper'
import {Pagination, Navigation} from 'swiper/modules'

export const initSwiper = () => {
    new Swiper('.swiper', {
    modules: [Pagination, Navigation],
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    pagination: {
        el: '.swiper-pagination',
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