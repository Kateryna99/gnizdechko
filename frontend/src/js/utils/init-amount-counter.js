export const initAmountCounter = () => {
  const scope = document.querySelector('[data-product-scope]');
  if (!scope) return;

  const c = scope.querySelector('.amount-container');
  if (!c) return;

  const valueEl = c.querySelector('[data-amount]');
  const dec = c.querySelector('[data-action="decrease"]');
  const inc = c.querySelector('[data-action="increase"]');

  let value = Number(valueEl.textContent) || 1;

  const sync = () => {
    valueEl.textContent = value;
    dec.disabled = value <= 1;
  };

  c.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn === inc) value += 1;
    if (btn === dec && value > 1) value -= 1;

    sync();
  });

  sync();
};