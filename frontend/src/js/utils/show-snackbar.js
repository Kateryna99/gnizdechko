let snackbarTimer = null;

export const showSnackbar = (text, ms = 1800) => {
  const el = document.getElementById('snackbar');
  const textEl = document.getElementById('snackbarText');
  if (!el || !textEl) return;

  textEl.textContent = text;

  el.classList.add('is-active');

  clearTimeout(snackbarTimer);
  snackbarTimer = setTimeout(() => {
    el.classList.remove('is-active');
  }, ms);
};