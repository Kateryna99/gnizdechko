export const initUiSelect = (root = document) => {
  const selects = []

  if (root?.matches?.('[data-select]')) selects.push(root)
  selects.push(...(root.querySelectorAll?.('[data-select]') || []))

  selects.forEach(select => {
    if (select.dataset.uiSelectInit === '1') return
    select.dataset.uiSelectInit = '1'

    const trigger = select.querySelector('.ui-select__trigger')
    const valueEl = select.querySelector('.ui-select__value')
    const hiddenInput = select.querySelector('input[type="hidden"]')
    const searchInput = select.querySelector('.ui-select__search-input')
    const emptyEl = select.querySelector('.ui-select__empty')

    if (!trigger || !valueEl || !hiddenInput) return

    const getOptions = () => Array.from(select.querySelectorAll('.ui-select__option'))

    const filter = (q) => {
      const query = (q || '').trim().toLowerCase()
      const options = getOptions()
      let visible = 0

      options.forEach(o => {
        const text = o.textContent.trim().toLowerCase()
        const show = text.includes(query)
        o.hidden = !show
        if (show) visible += 1
      })

      if (emptyEl) emptyEl.hidden = visible !== 0
    }

    const close = () => {
      select.classList.remove('is-open')
      trigger.setAttribute('aria-expanded', 'false')

      if (searchInput) {
        searchInput.value = ''
        filter('')
      }
    }

    const open = () => {
      select.classList.add('is-open')
      trigger.setAttribute('aria-expanded', 'true')
      searchInput?.focus()
    }

    const setSelected = (optionEl) => {
      getOptions().forEach(o => o.classList.remove('is-selected'))

      optionEl.classList.add('is-selected')
      valueEl.textContent = optionEl.textContent.trim()
      hiddenInput.value = optionEl.dataset.value || ''

      close()

      select.dispatchEvent(
        new CustomEvent('ui-select:change', {
          detail: { value: hiddenInput.value, text: valueEl.textContent.trim() },
        })
      )
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (select.classList.contains('ui-select--disabled') || trigger.disabled) return
      select.classList.contains('is-open') ? close() : open()
    })

    select.addEventListener('click', (e) => {
      const opt = e.target.closest('.ui-select__option')
      if (!opt || !select.contains(opt)) return
      e.stopPropagation()
      setSelected(opt)
    })

    let t = null
    searchInput?.addEventListener('input', (e) => {
      const q = e.target.value || ''
      filter(q)

      clearTimeout(t)
      t = setTimeout(() => {
        select.dispatchEvent(new CustomEvent('ui-select:search', { detail: { query: q.trim() } }))
      }, 300)
    })

    document.addEventListener('click', (e) => {
      if (!select.contains(e.target)) close()
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && select.classList.contains('is-open')) close()
    })
  })
}


export const setUiSelectDisabled = (selectEl, disabled, placeholderText, emptyText) => {
  if (!selectEl) return

  const trigger = selectEl.querySelector('.ui-select__trigger')
  const search = selectEl.querySelector('.ui-select__search-input')
  const hidden = selectEl.querySelector('input[type="hidden"]')
  const valueEl = selectEl.querySelector('.ui-select__value')
  const list = selectEl.querySelector('[data-options]')
  const emptyEl = selectEl.querySelector('.ui-select__empty')

  if (Boolean(disabled)) {
    selectEl.classList.remove('is-open')
    if (trigger) trigger.setAttribute('aria-expanded', 'false')
  }

  selectEl.classList.toggle('ui-select--disabled', Boolean(disabled))
  if (trigger) trigger.disabled = Boolean(disabled)
  if (search) search.disabled = Boolean(disabled)

  if (Boolean(disabled)) {
    if (hidden) hidden.value = ''
    if (valueEl && placeholderText) valueEl.textContent = placeholderText

    if (list) list.querySelectorAll('.ui-select__option').forEach(o => o.remove())
    else selectEl.querySelectorAll('.ui-select__option').forEach(o => o.remove())

    if (emptyEl) {
      emptyEl.hidden = false
      if (emptyText) emptyEl.textContent = emptyText
    }
  } else {
    if (valueEl && placeholderText) valueEl.textContent = placeholderText
    if (emptyEl && emptyText) emptyEl.textContent = emptyText
  }
}

export const renderOptions = (selectEl, items = [], emptyText = 'Нічого не знайдено') => {
  const list = selectEl?.querySelector?.('[data-options]')
  const emptyEl = selectEl?.querySelector?.('.ui-select__empty')
  if (!list) return

  list.querySelectorAll('.ui-select__option').forEach(o => o.remove())

  if (items.length) {
    list.insertAdjacentHTML(
      'afterbegin',
      items.map(i => `<div class="ui-select__option" data-value="${i.id}">${i.name}</div>`).join('')
    )
  }

  if (emptyEl) {
    emptyEl.textContent = emptyText
    emptyEl.hidden = items.length !== 0
  }
}

export const resetUiSelectValue = (selectEl, placeholderText) => {
    const valueEl = selectEl?.querySelector?.('.ui-select__value')
    const hidden = selectEl?.querySelector?.('input[type="hidden"]')
    if (valueEl) valueEl.textContent = placeholderText
    if (hidden) hidden.value = ''
}