export const initProductGallery = () => {
  const mainImage = document.getElementById('product-main-image');
  const thumbs = document.querySelectorAll('.product-detail__thumb');

  if (!mainImage || !thumbs.length) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      mainImage.src = thumb.dataset.image;

      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
  });
};