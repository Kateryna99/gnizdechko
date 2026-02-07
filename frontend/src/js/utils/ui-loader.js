const sleep = (ms) => new Promise(r => setTimeout(r, ms))

export const createLoader = (selector = '[data-ui-loader]') => {
  const el = document.querySelector(selector)
  if (!el) return null

  let startedAt = 0

  const show = () => {
    startedAt = Date.now()
    el.hidden = false
    el.setAttribute('aria-hidden', 'false')
  }

  const hide = async (minMs = 0) => {
    const elapsed = Date.now() - startedAt
    const left = Math.max(minMs - elapsed, 0)
    if (left) await sleep(left)

    el.hidden = true
    el.setAttribute('aria-hidden', 'true')
  }

  return { show, hide }
}