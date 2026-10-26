// Refinos de animação do Modelo 3 (industrial): só transform/opacity, rAF, passivo; off com prefers-reduced-motion.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduce) {
  // Barra de progresso (hazard laranja) colada no topo
  const bar = document.createElement('div');
  bar.className = 'rf-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let t = false;
  const upd = () => {
    t = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0})`;
  };
  addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
}

if (!reduce && fino) {
  // Faísca laranja que acompanha o ponteiro em chapas, serviços e depoimentos
  document.querySelectorAll<HTMLElement>('.chapa, .tile, .dep-card, .num').forEach((el) => {
    const g = document.createElement('span');
    g.className = 'rf-glow';
    g.setAttribute('aria-hidden', 'true');
    el.appendChild(g);
    let f = 0, x = 0, y = 0;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left; y = e.clientY - r.top;
      if (!f) f = requestAnimationFrame(() => { f = 0; g.style.transform = `translate3d(${x - 150}px, ${y - 150}px, 0)`; });
      g.classList.add('on');
    });
    el.addEventListener('pointerleave', () => g.classList.remove('on'));
  });

  // Foto do hero se desloca em profundidade com o ponteiro
  const hero = document.querySelector<HTMLElement>('.hero');
  const foto = hero?.querySelector<HTMLElement>('.hero-foto img');
  if (hero && foto) {
    let f = 0, nx = 0, ny = 0;
    const ir = () => { f = 0; foto.style.translate = `${(nx * -18).toFixed(1)}px ${(ny * -12).toFixed(1)}px`; };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      if (!f) f = requestAnimationFrame(ir);
    });
    hero.addEventListener('pointerleave', () => { nx = ny = 0; f = requestAnimationFrame(ir); });
  }
}
