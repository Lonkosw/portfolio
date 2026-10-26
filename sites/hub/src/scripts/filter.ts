import { copy } from './common';

const nodes = [...document.querySelectorAll<HTMLButtonElement>('[data-node]')];
const sections = [...document.querySelectorAll<HTMLElement>('[data-niche]')];
const hint = document.getElementById('hint')!;
const all = nodes.map((n) => n.dataset.node!);
const sel = new Set((new URLSearchParams(location.search).get('g') ?? '').split(',').filter((s) => all.includes(s)));

const nodesUl = document.querySelector<HTMLElement>('.nodes')!;
const NS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(NS, 'svg');
svg.setAttribute('class', 'links');
svg.setAttribute('aria-hidden', 'true');
nodesUl.prepend(svg);
function links() {
  svg.replaceChildren();
  const base = nodesUl.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`);
  const pts = nodes
    .filter((n) => sel.has(n.dataset.node!))
    .map((n) => { const r = n.querySelector('i')!.getBoundingClientRect(); return [r.left - base.left + r.width / 2, r.top - base.top + r.height / 2]; });
  for (let k = 1; k < pts.length; k++) {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', String(pts[k - 1][0])); l.setAttribute('y1', String(pts[k - 1][1]));
    l.setAttribute('x2', String(pts[k][0])); l.setAttribute('y2', String(pts[k][1]));
    svg.appendChild(l);
  }
}
addEventListener('resize', links);

function apply(push = true) {
  nodes.forEach((n) => n.setAttribute('aria-pressed', String(sel.has(n.dataset.node!))));
  sections.forEach((s) => (s.hidden = sel.size > 0 && !sel.has(s.dataset.niche!)));
  hint.textContent = sel.size ? `Mostrando ${sel.size} de ${all.length} grupos` : 'Mostrando todos os grupos';
  links();
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
document.fonts?.ready.then(links);
