export const initColorPicker = () => {
  const scope = document.querySelector('[data-product-scope]');
  if (!scope) return;

  const dots = scope.querySelectorAll('.colors__dot');
  if (!dots.length) return;

  if (!scope.querySelector('.colors__dot.is-active')) {
    dots[0].classList.add('is-active');
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('is-active'));
      dot.classList.add('is-active');
    });
  });
};