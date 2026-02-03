export const initHeaderScroll = () => {
  const header = document.getElementById('header');
  if (!header) return;

  const OFFSET = 80;

  const onScroll = () => {
    header.classList.toggle('header--active', window.scrollY >= OFFSET);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
};