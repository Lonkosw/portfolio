/**
 * Simulador de orçamento — "carrinho" que termina no WhatsApp.
 *
 * A pessoa escolhe sabores e quantidades no cardápio, a seleção fica salva
 * no navegador dela (localStorage, sem conta e sem servidor) e o botão final
 * abre a conversa da doceria com o pedido já escrito.
 *
 * Regra de preço, tirada do menu oficial: os sabores se misturam para fechar
 * o cento, desde que cada sabor entre com pelo menos 25 unidades. Abaixo de
 * 100 doces no total, vale o preço unitário (mínimo de 10 por sabor).
 */
import { paraReal } from '../lib/preco';

interface DoceJS {
  slug: string;
  nome: string;
  cento: number;
  unitario: number;
  variavel: boolean;
}

interface Config {
  doces: DoceJS[];
  unidadesPorCento: number;
  minimoCento: number;
  minimoUnitario: number;
  whatsapp: string;
  observacao: string;
}

const CHAVE = 'dolcecau:orcamento:v1';

/** slug → quantidade. Só entram quantidades > 0. */
type Selecao = Map<string, number>;

export function setupOrcamento(): void {
  const dados = document.querySelector<HTMLScriptElement>('[data-orc-config]');
  const painel = document.querySelector<HTMLDialogElement>('[data-orc-painel]');
  if (!dados?.textContent || !painel) return;

  const cfg: Config = JSON.parse(dados.textContent);
  const catalogo = new Map(cfg.doces.map((d) => [d.slug, d]));

  const abrir = document.querySelector<HTMLButtonElement>('[data-orc-abrir]');
  const lista = painel.querySelector<HTMLElement>('[data-orc-lista]');
  const vazio = painel.querySelector<HTMLElement>('[data-orc-vazio]');
  const resumo = painel.querySelector<HTMLElement>('[data-orc-resumo]');
  const avisos = painel.querySelector<HTMLElement>('[data-orc-avisos]');
  const enviar = painel.querySelector<HTMLAnchorElement>('[data-orc-enviar]');
  const ctas = document.querySelectorAll<HTMLAnchorElement>('[data-orc-cta]');

  let selecao: Selecao = carregar();

  // ── Persistência ────────────────────────────────────────────────────────

  function carregar(): Selecao {
    try {
      const cru = localStorage.getItem(CHAVE);
      if (!cru) return new Map();
      const obj = JSON.parse(cru) as { itens?: Record<string, number> };
      const m: Selecao = new Map();
      for (const [slug, qtd] of Object.entries(obj.itens ?? {})) {
        // Sabor que saiu do cardápio some do orçamento em vez de quebrar a conta.
        if (catalogo.has(slug) && Number.isFinite(qtd) && qtd > 0) {
          m.set(slug, Math.floor(qtd));
        }
      }
      return m;
    } catch {
      // Storage bloqueado (aba anônima, cookies desligados): segue sem salvar.
      return new Map();
    }
  }

  function salvar(): void {
    try {
      localStorage.setItem(
        CHAVE,
        JSON.stringify({
          v: 1,
          atualizado: new Date().toISOString(),
          itens: Object.fromEntries(selecao),
        }),
      );
    } catch {
      /* sem storage: o orçamento vale só para esta visita */
    }
  }

  // ── Cálculo ─────────────────────────────────────────────────────────────

  interface Linha {
    doce: DoceJS;
    qtd: number;
    subtotal: number;
  }

  interface Conta {
    linhas: Linha[];
    unidades: number;
    total: number;
    porCento: boolean;
    abaixoDoMinimo: string[];
    temVariavel: boolean;
  }

  function calcular(): Conta {
    const linhas: Linha[] = [];
    let unidades = 0;

    for (const [slug, qtd] of selecao) {
      const doce = catalogo.get(slug);
      if (!doce) continue;
      unidades += qtd;
      linhas.push({ doce, qtd, subtotal: 0 });
    }

    const porCento = unidades >= cfg.unidadesPorCento;
    const minimo = porCento ? cfg.minimoCento : cfg.minimoUnitario;

    let total = 0;
    for (const l of linhas) {
      const preco = porCento ? l.doce.cento / cfg.unidadesPorCento : l.doce.unitario;
      l.subtotal = preco * l.qtd;
      total += l.subtotal;
    }

    return {
      linhas,
      unidades,
      total,
      porCento,
      abaixoDoMinimo: linhas.filter((l) => l.qtd < minimo).map((l) => l.doce.nome),
      temVariavel: linhas.some((l) => l.doce.variavel),
    };
  }

  // ── Mensagem do WhatsApp ────────────────────────────────────────────────

  function mensagem(c: Conta): string {
    const itens = c.linhas
      .map((l) => `• ${l.qtd} x ${l.doce.nome}`)
      .join('\n');

    return [
      'Olá, DolceCau! Montei este orçamento pelo site:',
      '',
      itens,
      '',
      `Total: ${c.unidades} doces`,
      `Estimativa pelo cardápio: R$ ${paraReal(c.total)} (${
        c.porCento ? 'preço de cento' : 'preço unitário'
      })`,
      '',
      'Podem confirmar disponibilidade, prazo e valor final?',
    ].join('\n');
  }

  function linkWhatsApp(c: Conta): string {
    return `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(mensagem(c))}`;
  }

  // ── Interface ───────────────────────────────────────────────────────────

  function definir(slug: string, qtd: number): void {
    const n = Math.max(0, Math.min(9999, Math.floor(qtd) || 0));
    if (n === 0) selecao.delete(slug);
    else selecao.set(slug, n);
    salvar();
    render();
  }

  /** Atualiza o controle de um card do cardápio. */
  function renderControle(el: HTMLElement): void {
    const slug = el.dataset.orcControle!;
    const qtd = selecao.get(slug) ?? 0;
    const botaoAdd = el.querySelector<HTMLElement>('[data-orc-add]');
    const stepper = el.querySelector<HTMLElement>('[data-orc-stepper]');
    const campo = el.querySelector<HTMLInputElement>('[data-orc-qtd]');

    if (botaoAdd) botaoAdd.hidden = qtd > 0;
    if (stepper) stepper.hidden = qtd === 0;
    // Não sobrescreve enquanto a pessoa digita no próprio campo.
    if (campo && document.activeElement !== campo) campo.value = String(qtd);

    el.closest<HTMLElement>('[data-doce]')?.toggleAttribute('data-ativo', qtd > 0);
  }

  /**
   * Reconstrói a lista do painel só quando a composição muda. Se são os
   * mesmos sabores, apenas os números são reescritos — senão o campo que a
   * pessoa está digitando seria destruído a cada tecla.
   */
  function renderLista(c: Conta): void {
    if (!lista) return;

    const assinatura = c.linhas.map((l) => l.doce.slug).join('|');
    if (lista.dataset.assinatura !== assinatura) {
      lista.dataset.assinatura = assinatura;
      lista.innerHTML = c.linhas
        .map(
          (l) => `
        <li class="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-cream">${escapar(l.doce.nome)}</p>
            <p class="mt-0.5 text-xs tabular-nums text-cream-dim">
              R$ <span data-orc-subtotal="${l.doce.slug}"></span>
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-1" data-orc-controle="${l.doce.slug}">
            <button type="button" data-orc-acao="menos" data-orc-slug="${l.doce.slug}"
              class="grid h-8 w-8 place-items-center rounded-lg border border-line text-lg leading-none text-cream-dim transition-colors hover:border-gold hover:text-gold"
              aria-label="Diminuir ${escapar(l.doce.nome)}">&minus;</button>
            <input type="number" inputmode="numeric" min="0" step="1"
              data-orc-qtd data-orc-slug="${l.doce.slug}"
              class="h-8 w-14 rounded-lg border border-line bg-noir text-center text-sm tabular-nums text-cream [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Quantidade de ${escapar(l.doce.nome)}" />
            <button type="button" data-orc-acao="mais" data-orc-slug="${l.doce.slug}"
              class="grid h-8 w-8 place-items-center rounded-lg border border-line text-lg leading-none text-cream-dim transition-colors hover:border-gold hover:text-gold"
              aria-label="Aumentar ${escapar(l.doce.nome)}">+</button>
            <button type="button" data-orc-acao="remover" data-orc-slug="${l.doce.slug}"
              class="ml-1 grid h-8 w-8 place-items-center rounded-lg text-cream-dim transition-colors hover:text-gold"
              aria-label="Remover ${escapar(l.doce.nome)} do orçamento">&times;</button>
          </div>
        </li>`,
        )
        .join('');
    }

    for (const l of c.linhas) {
      const sub = lista.querySelector(`[data-orc-subtotal="${l.doce.slug}"]`);
      if (sub) sub.textContent = paraReal(l.subtotal);
    }
  }

  function render(): void {
    const c = calcular();

    // A lista vem antes: os controles que ela cria também precisam receber
    // as quantidades no mesmo passo.
    renderLista(c);

    document
      .querySelectorAll<HTMLElement>('[data-orc-controle]')
      .forEach(renderControle);

    // Botão flutuante
    if (abrir) {
      abrir.hidden = c.unidades === 0;
      const nDoces = abrir.querySelector('[data-orc-contador]');
      const nTotal = abrir.querySelector('[data-orc-total]');
      if (nDoces) nDoces.textContent = String(c.unidades);
      if (nTotal) nTotal.textContent = paraReal(c.total);
      abrir.setAttribute(
        'aria-label',
        `Ver orçamento: ${c.unidades} doces, estimativa de R$ ${paraReal(c.total)}`,
      );
    }

    if (vazio) vazio.hidden = c.unidades > 0;
    if (resumo) resumo.hidden = c.unidades === 0;

    // Resumo
    const elUnidades = painel!.querySelector('[data-orc-unidades]');
    const elTotal = painel!.querySelector('[data-orc-valor]');
    const elBase = painel!.querySelector('[data-orc-base]');
    if (elUnidades) elUnidades.textContent = String(c.unidades);
    if (elTotal) elTotal.textContent = paraReal(c.total);
    if (elBase) {
      elBase.textContent = c.porCento
        ? 'calculado no preço de cento'
        : `calculado no preço unitário — a partir de ${cfg.unidadesPorCento} doces vale o preço de cento, que sai mais barato`;
    }

    // Avisos
    if (avisos) {
      const msgs: string[] = [];
      if (c.abaixoDoMinimo.length) {
        const minimo = c.porCento ? cfg.minimoCento : cfg.minimoUnitario;
        msgs.push(
          `Mínimo de ${minimo} unidades por sabor: ${c.abaixoDoMinimo.join(', ')}.`,
        );
      }
      if (c.temVariavel) msgs.push(cfg.observacao);
      avisos.innerHTML = msgs
        .map(
          (m) =>
            `<li class="flex gap-2"><span aria-hidden="true" class="text-gold">!</span><span>${escapar(
              m,
            )}</span></li>`,
        )
        .join('');
      avisos.hidden = msgs.length === 0;
    }

    // Links de envio
    const href = c.unidades > 0 ? linkWhatsApp(c) : '';
    if (enviar) {
      // Com o carrinho vazio o botão volta para o link que veio do BUILD
      // (WhatsApp com mensagem genérica), e não para '#'.
      //
      // Ele continua desabilitado visualmente e por `aria-disabled` — mas
      // `pointer-events: none` não é um estado de verdade: basta o CSS não
      // carregar, ou alguém chegar pelo teclado, para o clique passar. E aí
      // '#' só recarrega a página no topo, que a pessoa lê como "quebrado".
      // Assim o pior caso vira "abriu a conversa sem o pedido escrito".
      if (!enviar.dataset.orcHrefBase) enviar.dataset.orcHrefBase = enviar.href;
      enviar.href = href || enviar.dataset.orcHrefBase;
      enviar.setAttribute('aria-disabled', String(c.unidades === 0));
      enviar.classList.toggle('pointer-events-none', c.unidades === 0);
      enviar.classList.toggle('opacity-40', c.unidades === 0);
    }
    // O CTA grande da seção "Orçamento" leva a seleção junto, se houver.
    ctas.forEach((a) => {
      if (!a.dataset.orcHrefBase) a.dataset.orcHrefBase = a.href;
      a.href = href || a.dataset.orcHrefBase;
    });
  }

  function escapar(s: string): string {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ── Eventos ─────────────────────────────────────────────────────────────

  // Delegação única: vale para os cards do cardápio e para a lista do painel,
  // que é recriada a cada render.
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-orc-acao]');
    if (!btn) return;
    const slug = btn.dataset.orcSlug;
    if (!slug || !catalogo.has(slug)) return;

    const atual = selecao.get(slug) ?? 0;
    const acao = btn.dataset.orcAcao;

    if (acao === 'add') definir(slug, cfg.minimoCento);
    else if (acao === 'mais') definir(slug, atual + 5);
    else if (acao === 'menos') definir(slug, atual <= 5 ? 0 : atual - 5);
    else if (acao === 'remover') definir(slug, 0);
  });

  document.addEventListener('input', (e) => {
    const campo = (e.target as HTMLElement).closest<HTMLInputElement>('[data-orc-qtd]');
    if (!campo?.dataset.orcSlug) return;
    definir(campo.dataset.orcSlug, Number(campo.value));
  });

  // Abrir / fechar o painel
  abrir?.addEventListener('click', () => painel.showModal());
  painel.querySelectorAll('[data-orc-fechar]').forEach((b) =>
    b.addEventListener('click', () => painel.close()),
  );
  // Clique no fundo escuro fecha (o <dialog> em si ocupa toda a tela).
  painel.addEventListener('click', (e) => {
    if (e.target === painel) painel.close();
  });

  painel.querySelector('[data-orc-limpar]')?.addEventListener('click', () => {
    selecao = new Map();
    salvar();
    render();
  });

  // Lenis continua rolando o fundo enquanto o painel está aberto se ninguém
  // avisar; motion.ts escuta estes eventos e pausa o scroll suave.
  painel.addEventListener('close', () =>
    window.dispatchEvent(new CustomEvent('orcamento:fechado')),
  );
  abrir?.addEventListener('click', () =>
    window.dispatchEvent(new CustomEvent('orcamento:aberto')),
  );

  // Outra aba mexeu no orçamento: reflete aqui também.
  window.addEventListener('storage', (e) => {
    if (e.key !== CHAVE) return;
    selecao = carregar();
    render();
  });

  render();
}
