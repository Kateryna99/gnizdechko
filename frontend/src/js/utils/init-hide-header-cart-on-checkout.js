export const initHideHeaderCartOnCheckout = () => {
  const isCheckout = document.querySelector('[data-page="checkout"]')
  if (!isCheckout) return

  const headerCart = document.querySelector('[data-header-cart]')
  if (!headerCart) return

  headerCart.setAttribute('aria-hidden', 'true')
  headerCart.style.pointerEvents = 'none'
  headerCart.style.opacity = '0'
}