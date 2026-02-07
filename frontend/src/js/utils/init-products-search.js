export const initProductsSearch = () => {
  const form = document.querySelector('[data-products-search-form]')
  const input = form?.querySelector('[data-products-search]')
  const grid = document.querySelector('.products-list__grid')
  const btn = document.querySelector('.products-list__more')
  const emptyEl = document.querySelector('[data-products-empty]')
  if (!form || !input || !grid) return

  let t = null

  const setMoreVisible = (visible) => {
    if (!btn) return
    btn.hidden = !visible
    btn.disabled = !visible
  }

  const setEmptyVisible = (visible) => {
    if (!emptyEl) return
    emptyEl.hidden = !visible
  }

  const apply = async () => {
    const q = input.value.trim()
    const url = new URL(window.location.href)

    if (q) url.searchParams.set('q', q)
    else url.searchParams.delete('q')

    url.searchParams.delete('page')

    const res = await fetch(url.toString(), {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const newGrid = doc.querySelector('.products-list__grid')
    const newBtn = doc.querySelector('.products-list__more')
    const newEmpty = doc.querySelector('[data-products-empty]')

    grid.innerHTML = newGrid ? newGrid.innerHTML : ''

    const cardsCount = grid.querySelectorAll('.products-list__card').length
    const canLoadMore = Boolean(newBtn?.dataset?.nextPage) && cardsCount

    if (btn && newBtn?.dataset?.nextPage) btn.dataset.nextPage = newBtn.dataset.nextPage
    setMoreVisible(canLoadMore)

    const shouldShowEmpty = !cardsCount
    setEmptyVisible(shouldShowEmpty)

    if (shouldShowEmpty && emptyEl && newEmpty) {
      emptyEl.textContent = newEmpty.textContent.trim()
    }

    window.history.replaceState({}, '', url.toString())
    input.focus()
  }

  form.addEventListener('submit', (e) => e.preventDefault())

  input.addEventListener('input', () => {
    clearTimeout(t)
    t = setTimeout(apply, 350)
  })
}