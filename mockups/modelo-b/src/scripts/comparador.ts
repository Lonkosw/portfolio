/**
 * Antes/depois arrastável.
 *
 * O HTML já faz quase tudo: o recorte é `clip-path` lendo a custom property
 * `--p`, e o gesto vem de um `<input type="range">` transparente por cima.
 * Este script só existe para três coisas que o CSS não resolve:
 *
 *   1. copiar o valor do range para `--p` (uma escrita, não uma por nó);
 *   2. esconder a etiqueta que o divisor cobriu;
 *   3. ligar/desligar `will-change` durante o arrasto.
 *
 * Não há mousedown/mousemove aqui de propósito. O navegador já implementa o
 * arrasto do range — com teclado, toque, leitor de tela e captura de ponteiro
 * corretos. Reimplementar isso na mão é mais código e pior.
 */

/** Ponto em que a etiqueta é considerada coberta pelo divisor. */
const LIMITE_TAG_ANTES = 22;
const LIMITE_TAG_DEPOIS = 78;

function setupComparador(raiz: HTMLElement) {
  const range = raiz.querySelector<HTMLInputElement>('[data-comparador-range]');
  if (!range) return;

  const tagAntes = raiz.querySelector<HTMLElement>('[data-comparador-tag="antes"]');
  const tagDepois = raiz.querySelector<HTMLElement>('[data-comparador-tag="depois"]');

  /**
   * Uma escrita por quadro. O evento `input` de um range dispara mais rápido
   * que o refresh da tela durante um arrasto; sem o rAF a gente pintaria
   * várias vezes o mesmo quadro à toa.
   */
  let pendente = false;
  let valor = Number(range.value);

  const pintar = () => {
    pendente = false;
    raiz.style.setProperty('--p', String(valor));

    // `toggleAttribute` em vez de classe: o CSS casa por [data-oculta] e não
    // há risco de brigar com as classes do Tailwind no mesmo elemento.
    tagAntes?.toggleAttribute('data-oculta', valor < LIMITE_TAG_ANTES);
    tagDepois?.toggleAttribute('data-oculta', valor > LIMITE_TAG_DEPOIS);
  };

  const agendar = () => {
    valor = Number(range.value);
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(pintar);
  };

  range.addEventListener('input', agendar);

  // `will-change` só enquanto o dedo/mouse está em contato. Permanente, ele
  // segura uma camada de GPU por comparador para sempre — em duas imagens
  // grandes isso pesa no celular mesmo com a seção fora da tela.
  const liga = () => raiz.classList.add('is-drag');
  const desliga = () => raiz.classList.remove('is-drag');
  range.addEventListener('pointerdown', liga);
  range.addEventListener('pointerup', desliga);
  range.addEventListener('pointercancel', desliga);
  // Teclado também merece a camada: setas seguradas repetem rápido.
  range.addEventListener('focus', liga);
  range.addEventListener('blur', desliga);

  pintar();
}

export function setupComparadores() {
  document.querySelectorAll<HTMLElement>('[data-comparador]').forEach(setupComparador);
}
