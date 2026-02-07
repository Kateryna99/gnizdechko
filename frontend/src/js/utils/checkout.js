import { createLoader } from './ui-loader.js'

const showThanksModal = () => {
  const modal = document.querySelector('[data-thanks-modal]')
  if (!modal) return
  modal.hidden = false
  modal.setAttribute('aria-hidden', 'false')
}

const hideThanksModal = () => {
  const modal = document.querySelector('[data-thanks-modal]')
  if (!modal) return
  modal.hidden = true
  modal.setAttribute('aria-hidden', 'true')
}

const setFieldError = (name, message) => {
  const p = document.querySelector(`[data-error-for="${name}"]`)
  if (!p) return
  p.hidden = false
  p.textContent = message
}

const clearClientErrors = () => {
  document.querySelectorAll('[data-error-for]').forEach(p => {
    p.hidden = true
    p.textContent = ''
  })
}

const validateRequiredInput = (form, name, message) => {
  const el = form.querySelector(`[name="${name}"]`)
  if (!el) return true
  const v = (el.value || '').trim()
  if (v) return true
  setFieldError(name, message)
  return false
}

const validateEmail = (form, name, requiredMsg, invalidMsg) => {
  const el = form.querySelector(`[name="${name}"]`)
  if (!el) return true
  const v = (el.value || '').trim()
  if (!v) {
    setFieldError(name, requiredMsg)
    return false
  }
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  if (!ok) {
    setFieldError(name, invalidMsg)
    return false
  }
  return true
}

const validateUiSelectRequired = (form, name, message) => {
  const hidden = form.querySelector(`input[name="${name}"]`)
  if (!hidden) return true
  if ((hidden.value || '').trim()) return true
  setFieldError(name, message)
  return false
}

export const initCheckoutSubmit = () => {
  const form = document.querySelector('[data-checkout-form]')
  if (!form) return

  const loader = createLoader()
  const minLoaderMs = 1500

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-thanks-close]')) hideThanksModal()
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    clearClientErrors()

    let ok = true

    ok = validateRequiredInput(form, 'first_name', 'Вкажіть імʼя') && ok
    ok = validateRequiredInput(form, 'last_name', 'Вкажіть прізвище') && ok
    ok = validateRequiredInput(form, 'phone', 'Вкажіть номер телефону') && ok
    ok = validateEmail(form, 'email', 'Вкажіть email', 'Вкажіть коректний email') && ok

    ok = validateUiSelectRequired(form, 'country', 'Оберіть країну') && ok

    const country = form.querySelector('input[name="country"]')?.value || 'UA'
    if (country === 'UA') {
      ok = validateUiSelectRequired(form, 'delivery_city', 'Оберіть місто') && ok
      ok = validateUiSelectRequired(form, 'delivery_warehouse', 'Оберіть відділення') && ok
    } else {
      ok = validateRequiredInput(form, 'intl_city', 'Вкажіть місто') && ok
      ok = validateRequiredInput(form, 'intl_postcode', 'Вкажіть поштовий індекс') && ok
      ok = validateRequiredInput(form, 'intl_street', 'Вкажіть адресу') && ok
    }

    if (!ok) return

    loader?.show()

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: new FormData(form),
      })

      const data = await res.json()
      await loader?.hide(minLoaderMs)

      if (!res.ok || !data.ok) {
        if (data?.errors) {
          Object.entries(data.errors).forEach(([field, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs[0] : String(msgs)
            setFieldError(field, msg)
          })
        }
        return
      }

      showThanksModal()
    } catch (err) {
      await loader?.hide(minLoaderMs)
      console.log(err)
    }
  })
}