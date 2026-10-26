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
