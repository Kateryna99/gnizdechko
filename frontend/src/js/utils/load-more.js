export const initLoadMoreProducts = () => {
  const loadMoreBtn = document.querySelector('.products-list__more')
  const grid = document.querySelector('.products-list__grid')
  if (!loadMoreBtn || !grid) return

  loadMoreBtn.addEventListener('click', async () => {
    const nextPage = loadMoreBtn.dataset.nextPage
    if (!nextPage) {
      loadMoreBtn.remove()
      return
    }

    try {
      const url = new URL(window.location.href)
      url.searchParams.set('page', nextPage)

      const response = await fetch(url.toString(), {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
      const html = await response.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')

      const newCards = doc.querySelectorAll('.products-list__card')
      newCards.forEach(card => grid.appendChild(card))

      const newBtn = doc.querySelector('.products-list__more')

      if (!newCards.length || !newBtn?.dataset?.nextPage) {
        loadMoreBtn.remove()
        return
      }

      loadMoreBtn.dataset.nextPage = newBtn.dataset.nextPage
    } catch (error) {
      console.error('Load more products failed:', error)
    }
  })
}