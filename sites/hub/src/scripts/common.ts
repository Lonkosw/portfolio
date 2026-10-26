const toast = document.getElementById('toast')!;
let timer: number;
export function say(msg: string) {
  toast.textContent = msg;
  toast.classList.add('on');
  clearTimeout(timer);
  timer = window.setTimeout(() => toast.classList.remove('on'), 1800);
}
export async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement('textarea');
    t.value = text;
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
  say('Link copiado ✓');
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-copy],[data-copy-abs]');
  if (!b) return;
  copy(b.dataset.copyAbs ?? location.origin + b.dataset.copy);
});

// Revela ao rolar e só anima (flutuação) o que está na tela.
const items = document.querySelectorAll<HTMLElement>('.card, .niche-head');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        const el = en.target as HTMLElement;
        el.classList.toggle('live', en.isIntersecting);
        if (en.isIntersecting) el.classList.add('in');
      }
    },
    { rootMargin: '80px 0px' }
  );
  items.forEach((el) => io.observe(el));
} else items.forEach((el) => el.classList.add('in', 'live'));

// Mascote: deriva com a rolagem e inclina com a velocidade; o avatar do hero segue o ponteiro.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mascot = document.getElementById('mascot');
if (mascot && !reduce) {
  let last = scrollY, vel = 0, f = 0;
  const loop = () => {
    f = 0;
    vel += (scrollY - last - vel) * 0.18;
    last = scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = scrollY / max;
    const x = Math.sin(p * Math.PI * 3) * 26;
    mascot.style.transform = `translate3d(${x.toFixed(1)}px, ${(p * 40).toFixed(1)}px, 0) rotate(${Math.max(-25, Math.min(25, vel * 0.6)).toFixed(1)}deg)`;
    if (Math.abs(vel) > 0.05) f = requestAnimationFrame(loop);
  };
  addEventListener('scroll', () => { if (!f) f = requestAnimationFrame(loop); }, { passive: true });
  loop();
}
const av = document.querySelector<HTMLElement>('.avatar img');
if (av && !reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let f = 0, nx = 0, ny = 0;
  addEventListener('pointermove', (e) => {
    nx = e.clientX / innerWidth - 0.5; ny = e.clientY / innerHeight - 0.5;
    if (!f) f = requestAnimationFrame(() => { f = 0; av.style.translate = `${(nx * 14).toFixed(1)}px ${(ny * 10).toFixed(1)}px`; av.style.rotate = `${(nx * 6).toFixed(1)}deg`; });
  });
}
