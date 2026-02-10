const main = document.getElementById('main')
const footer = document.getElementById('footer')
const header = document.querySelector('.header')
const burger = header?.querySelector('.burger')
const menu = header?.querySelector('.nav-header')
const cartIcon = document.querySelector('.cart')

const BURGER_ACTIVE = 'burger--active'
const MENU_ACTIVE = 'nav-header--active'

const setState = (open) => {
  if (!burger || !menu) return

  burger.classList.toggle(BURGER_ACTIVE, open)
  menu.classList.toggle(MENU_ACTIVE, open)
  main?.classList.toggle('is-active', open)
  footer?.classList.toggle('is-active', open)

  burger.setAttribute('aria-expanded', String(open))
  burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню')
}

export const toggleBurgerMenu = () => {
  if (!burger || !menu) return
  setState(!menu.classList.contains(MENU_ACTIVE))
}

export const initBurgerMenu = () => {
  if (!burger || !menu) return

  if (!menu.id) menu.id = 'mobileMenu'
  burger.setAttribute('aria-controls', menu.id)
  burger.setAttribute('aria-expanded', 'false')
  burger.setAttribute('aria-label', 'Відкрити меню')

  burger.addEventListener('click', toggleBurgerMenu)

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setState(false)
  })

  cartIcon?.addEventListener('click', () => setState(false))

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setState(false)
  })

  document.addEventListener('click', (e) => {
    if (!menu.classList.contains(MENU_ACTIVE)) return
    if (menu.contains(e.target)) return
    if (burger.contains(e.target)) return
    setState(false)
  })

  setState(false)
}