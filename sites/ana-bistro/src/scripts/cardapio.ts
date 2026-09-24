/**
 * O cardápio em abas.
 *
 * A carta tem quatro seções e, empilhadas, ocupariam três telas de rolagem
 * no celular — que é onde este site vai ser visto. As abas resolvem isso
 * sem esconder nada: tudo continua no HTML, e sem JavaScript as quatro
 * seções aparecem uma embaixo da outra, o que também funciona.
 *
 * Segue o padrão ARIA de tabs, inclusive as setas do teclado. Um cardápio
 * é conteúdo, e conteúdo tem de ser navegável.
 */

export function setupCardapio() {
  const raiz = document.querySelector<HTMLElement>('[data-cardapio]');
  if (!raiz) return;

  const abas = Array.from(raiz.querySelectorAll<HTMLButtonElement>('[data-carta-aba]'));
  const paineis = Array.from(raiz.querySelectorAll<HTMLElement>('[data-carta-painel]'));
  if (!abas.length || abas.length !== paineis.length) return;

  const mostrar = (indice: number, moverFoco = false) => {
    abas.forEach((aba, i) => {
      const ativa = i === indice;
      aba.setAttribute('aria-selected', String(ativa));
      // roving tabindex: só a aba ativa fica na ordem do Tab, e as setas
      // percorrem as outras. É o que o padrão ARIA pede.
      aba.tabIndex = ativa ? 0 : -1;
      aba.classList.toggle('is-ativa', ativa);
    });
    paineis.forEach((p, i) => {
      p.hidden = i !== indice;
    });
    if (moverFoco) abas[indice].focus();
  };

  abas.forEach((aba, i) => {
    aba.addEventListener('click', () => mostrar(i));
    aba.addEventListener('keydown', (e) => {
      let alvo: number | null = null;
      if (e.key === 'ArrowRight') alvo = (i + 1) % abas.length;
      else if (e.key === 'ArrowLeft') alvo = (i - 1 + abas.length) % abas.length;
      else if (e.key === 'Home') alvo = 0;
      else if (e.key === 'End') alvo = abas.length - 1;
      if (alvo === null) return;
      e.preventDefault();
      mostrar(alvo, true);
    });
  });

  // O HTML nasce com tudo visível (para funcionar sem JS). Só aqui, com o
  // script confirmado, é que viramos abas de verdade.
  raiz.classList.add('is-abas');
  mostrar(0);
}
