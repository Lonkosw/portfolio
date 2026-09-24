/**
 * A ferramenta interativa do site: o formulário de pedido no CTA final.
 *
 * O modelo-b (salão) tinha três — diagnóstico capilar, monte sua produção e
 * agendamento guiado — porque agenda horário. Hamburgueria não agenda: o
 * cliente escolhe um item do cardápio e como quer receber, e isso já é
 * mensagem suficiente para o WhatsApp.
 *
 * Não calcula preço, por decisão consistente com o resto da pasta: preço
 * muda e ninguém atualiza site.
 *
 * Este módulo NÃO depende de GSAP nem de Lenis. É chamado antes do motor de
 * animação e continua valendo com prefers-reduced-motion ligado.
 */

/* ── Persistência ────────────────────────────────────────────────────────
   Em aba anônima o localStorage lança ao ser lido ou escrito. O site não
   pode quebrar por isso: a seleção simplesmente vale só para a visita.    */

function carregar<T extends object>(chave: string, padrao: T): T {
  try {
    const cru = localStorage.getItem(chave);
    if (!cru) return { ...padrao };
    return { ...padrao, ...(JSON.parse(cru) as Partial<T>) };
  } catch {
    return { ...padrao };
  }
}

function salvar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* storage bloqueado — segue sem persistir */
  }
}

function apagar(chave: string) {
  try {
    localStorage.removeItem(chave);
  } catch {
    /* idem */
  }
}

function linkWa(numero: string, mensagem: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

/** Atualiza o href de um conjunto de CTAs. */
function aplicarCtas(nos: NodeListOf<HTMLAnchorElement>, numero: string, msg: string) {
  const href = linkWa(numero, msg);
  nos.forEach((a) => {
    a.href = href;
  });
}

/* ══════════════════════════════════════════════════════════════════════
   PEDIDO GUIADO
   ══════════════════════════════════════════════════════════════════════ */

type EstadoPedido = { item: string; modo: string; tocado: boolean };

export function setupPedido() {
  const raiz = document.querySelector<HTMLElement>('[data-pedido]');
  if (!raiz) return;

  const CHAVE = 'hamburgueria:pedido:v1';
  const numero = raiz.dataset.pedidoWhatsapp ?? '';
  const padraoMsg = raiz.dataset.pedidoPadrao ?? '';

  const vazio: EstadoPedido = { item: '', modo: '', tocado: false };
  let estado = carregar(CHAVE, vazio);

  const selItem = raiz.querySelector<HTMLSelectElement>('[data-pedido-item]');
  const radiosModo = raiz.querySelectorAll<HTMLInputElement>('[data-pedido-modo]');
  const btnLimpar = raiz.querySelector<HTMLButtonElement>('[data-pedido-limpar]');
  const previa = raiz.querySelector<HTMLElement>('[data-pedido-previa]');
  const ctas = document.querySelectorAll<HTMLAnchorElement>('[data-pedido-cta]');

  function montarMensagem(): string {
    if (!estado.tocado) return padraoMsg;
    const linhas: string[] = [];
    if (estado.item) linhas.push(`Item: ${estado.item}`);
    if (estado.modo) linhas.push(`Como prefiro receber: ${estado.modo.toLowerCase()}`);
    if (!linhas.length) return padraoMsg;
    return ['Olá! Vim pelo site e queria pedir:', '', ...linhas].join('\n');
  }

  function pintar() {
    if (selItem) selItem.value = estado.item;
    radiosModo.forEach((r) => {
      r.checked = r.value === estado.modo;
    });
  }

  function atualizar({ marcarTocado = true, persistir = true } = {}) {
    if (marcarTocado) estado.tocado = true;
    if (persistir) salvar(CHAVE, estado);

    const msg = montarMensagem();
    if (previa) previa.textContent = estado.tocado ? msg : '';
    aplicarCtas(ctas, numero, msg);
  }

  selItem?.addEventListener('change', () => {
    estado.item = selItem.value;
    atualizar();
  });
  radiosModo.forEach((r) =>
    r.addEventListener('change', () => {
      if (r.checked) {
        estado.modo = r.value;
        atualizar();
      }
    }),
  );

  btnLimpar?.addEventListener('click', () => {
    estado = { ...vazio };
    apagar(CHAVE);
    pintar();
    atualizar({ marcarTocado: false, persistir: false });
  });

  pintar();
  atualizar({ marcarTocado: false, persistir: false });
}

export function setupFerramentas() {
  setupPedido();
}
