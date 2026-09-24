/**
 * Ponto de entrada.
 *
 * A divisão do site em dois pedaços está aqui:
 *
 *   base.ts     — sem dependências, ~6 KB. É TUDO o que um celular baixa.
 *   desktop.ts  — GSAP + ScrollTrigger + Lenis, ~130 KB. Só entra em telas
 *                 largas com mouse, e por import dinâmico.
 *
 * A conta que motivou isso: no celular o bundle era 89 KB e o GSAP fazia lá
 * só a abertura do hero e as revelações — duas transições de opacity e
 * transform, disparadas uma vez, que o CSS resolve nativamente. Trocá-las por
 * CSS derrubou a carga do celular em mais de 90%.
 */
import { setupBase, finePointer, prefersReduced } from './base';
import { setupFerramentas } from './ferramentas';

// ── Interatividade: sobe já, sem esperar por fonte nem por rede ──────────
// A ferramenta monta a mensagem do WhatsApp do pedido. Continua valendo com
// `prefers-reduced-motion` ligado, porque usar não é animar.
setupFerramentas();

setupBase();

// ── Extras de desktop ────────────────────────────────────────────────────
// A largura entra na conta junto com o ponteiro: um notebook com tela
// estreita não deve pagar por parallax que mal se vê.
if (finePointer && !prefersReduced && window.innerWidth >= 1024) {
  // `requestIdleCallback` para não disputar a linha principal com a abertura
  // do hero — o parallax só importa depois da primeira rolagem. O fallback de
  // timeout cobre o Safari, que não tem a API.
  const agendar = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200));
  agendar(() => {
    import('./desktop').then((m) => m.setupDesktop());
  });
}
