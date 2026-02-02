const header = document.querySelector('.header')
const burger = header?.querySelector('.burger')
const menu = header?.querySelector('.nav-header')
const cartIcon = document.querySelector('.cart');

const BURGER_ACTIVE = 'burger--active'
const MENU_ACTIVE = 'nav-header--active'

const setState = (open) => {
  burger.classList.toggle(BURGER_ACTIVE, open)
  menu.classList.toggle(MENU_ACTIVE, open)

  burger.setAttribute('aria-expanded', String(open))

  document.body.style.overflow = open ? 'hidden' : ''
}

export const toggleBurgerMenu = () => {
  if (!burger || !menu) return
  setState(!menu.classList.contains(MENU_ACTIVE))
}

export const initBurgerMenu = () => {
  if (!burger || !menu) return

  if (!menu.id) menu.id = 'navHeader'
  burger.setAttribute('aria-controls', menu.id)
  burger.setAttribute('aria-expanded', 'false')
  if (!burger.getAttribute('aria-label')) burger.setAttribute('aria-label', 'Menu')

  burger.addEventListener('click', toggleBurgerMenu)

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setState(false)
  })

  cartIcon.addEventListener('click', () => setState(false))

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setState(false)
  })

  setState(false)
}