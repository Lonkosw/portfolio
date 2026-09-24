/**
 * Setas do carrossel de tipos de cabelo.
 *
 * O carrossel FUNCIONA SEM ISTO: a fila é scroll-snap nativo, arrastável com
 * o dedo e navegável por teclado. Este script só acrescenta as duas setas do
 * desktop e as desabilita nas pontas — e por isso elas nascem escondidas
 * (`data-so-com-js`), em vez de aparecerem quebradas se o script falhar.
 */

function setupCarrossel(secao: HTMLElement) {
  const fila = secao.querySelector<HTMLElement>('[data-carrossel]');
  const anterior = secao.querySelector<HTMLButtonElement>('[data-carrossel-anterior]');
  const proximo = secao.querySelector<HTMLButtonElement>('[data-carrossel-proximo]');
  if (!fila || !anterior || !proximo) return;

  /** Anda uma "página" de cada vez, não um cartão: é o gesto que o botão imita. */
  const passo = () => {
    const item = fila.querySelector<HTMLElement>('[data-carrossel-item]');
    const largura = item ? item.getBoundingClientRect().width + 16 : fila.clientWidth * 0.8;
    // Nunca ultrapassa a largura visível: em telas largas, pular 4 cartões de
    // uma vez faz a pessoa perder o fio de onde estava.
    return Math.min(largura * 2, fila.clientWidth);
  };

  const atualizarBotoes = () => {
    // A margem de 2px absorve o arredondamento subpixel: sem ela a seta da
    // ponta fica habilitada para sempre em algumas larguras de tela.
    const fim = fila.scrollWidth - fila.clientWidth - 2;
    anterior.disabled = fila.scrollLeft <= 2;
    proximo.disabled = fila.scrollLeft >= fim;
  };

  anterior.addEventListener('click', () => fila.scrollBy({ left: -passo() }));
  proximo.addEventListener('click', () => fila.scrollBy({ left: passo() }));

  // O scroll de uma fila horizontal dispara muito durante o arrasto: um rAF
  // por quadro em vez de uma leitura de layout por evento.
  let agendado = false;
  fila.addEventListener(
    'scroll',
    () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(() => {
        agendado = false;
        atualizarBotoes();
      });
    },
    { passive: true },
  );

  window.addEventListener('resize', atualizarBotoes, { passive: true });
  atualizarBotoes();
}

export function setupCarrosseis() {
  document
    .querySelectorAll<HTMLElement>('[data-carrossel-setas]')
    .forEach((setas) => {
      const secao = setas.closest('section');
      if (secao) setupCarrossel(secao);
    });
}
