import { copy } from './common';

const nodes = [...document.querySelectorAll<HTMLButtonElement>('[data-node]')];
const sections = [...document.querySelectorAll<HTMLElement>('[data-niche]')];
const hint = document.getElementById('hint')!;
const all = nodes.map((n) => n.dataset.node!);
const sel = new Set((new URLSearchParams(location.search).get('g') ?? '').split(',').filter((s) => all.includes(s)));

function apply(push = true) {
  nodes.forEach((n) => n.setAttribute('aria-pressed', String(sel.has(n.dataset.node!))));
  sections.forEach((s) => (s.hidden = sel.size > 0 && !sel.has(s.dataset.niche!)));
  hint.textContent = sel.size ? `Mostrando ${sel.size} de ${all.length} grupos` : 'Mostrando todos os grupos';
  if (push) history.replaceState(null, '', sel.size ? `?g=${[...sel].join(',')}` : location.pathname);
}
nodes.forEach((n) =>
  n.addEventListener('click', () => {
    const k = n.dataset.node!;
    sel.has(k) ? sel.delete(k) : sel.add(k);
    apply();
  })
);
document.getElementById('copy-sel')!.addEventListener('click', () => {
  const q = sel.size ? `?g=${[...sel].join(',')}` : '';
  copy(location.origin + '/' + q);
});
apply(false);
