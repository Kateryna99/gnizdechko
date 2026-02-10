export const initProductGallery = () => {
  const mainImage = document.getElementById('product-main-image')
  const thumbs = document.querySelectorAll('.product-detail__thumb')

  if (!mainImage || !thumbs.length) return

  const setMain = (thumb) => {
    const sm = thumb.dataset.imageSm
    const md = thumb.dataset.imageMd
    const lg = thumb.dataset.imageLg

    const single = thumb.dataset.image

    if (sm && md && lg) {
      mainImage.src = md
      mainImage.srcset = `${sm} 360w, ${md} 767w, ${lg} 1024w`
    } else if (single) {
      mainImage.src = single
      mainImage.removeAttribute('srcset')
    } else {
      return
    }

    thumbs.forEach(t => t.classList.remove('is-active'))
    thumb.classList.add('is-active')
  }

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => setMain(thumb))
  })
}