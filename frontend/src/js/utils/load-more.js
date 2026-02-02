export const initLoadMoreProducts = () => {
  const loadMoreBtn = document.querySelector('.products-list__more');
  const grid = document.querySelector('.products-list__grid');

  if (!loadMoreBtn || !grid) return;

  loadMoreBtn.addEventListener('click', async () => {
    const nextPage = loadMoreBtn.dataset.nextPage;

    try {
      const response = await fetch(`?page=${nextPage}`);
      const html = await response.text();

      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newCards = doc.querySelectorAll('.products-list__card');

      newCards.forEach(card => grid.appendChild(card));

      const newBtn = doc.querySelector('.products-list__more');

      if (newBtn) {
        loadMoreBtn.dataset.nextPage = newBtn.dataset.nextPage;
      } else {
        loadMoreBtn.remove();
      }
    } catch (error) {
      console.error('Load more products failed:', error);
    }
  });
};