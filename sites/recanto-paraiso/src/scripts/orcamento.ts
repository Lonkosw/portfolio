/**
 * Simulador "Monte seu evento".
 *
 * Sem conta e sem servidor: o visitante escolhe tipo, tamanho, data e período,
 * a seleção fica no localStorage e o botão abre o WhatsApp com a mensagem já
 * escrita. Não calcula preço — o Recanto não publica tabela, e inventar valor
 * seria mentir para o cliente dele.
 *
 * Este módulo NÃO depende do GSAP nem do Lenis: ele é chamado antes do motor
 * de animação e continua funcionando com prefers-reduced-motion ligado.
 */

const CHAVE = 'recanto:orcamento:v1';

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

type Estado = {
  tipo: string;
  convidados: number;
  /** "01".."12", vindo do <select>. Vazio = não escolheu. */
  mes: string;
  /** "2026". Vazio = não escolheu. */
  ano: string;
  periodo: string;
  jaTenho: string[];
  /** Só mostramos o botão flutuante depois que a pessoa mexeu em algo. */
  tocado: boolean;
};

const vazio = (padrao: number): Estado => ({
  tipo: '',
  convidados: padrao,
  mes: '',
  ano: '',
  periodo: '',
  jaTenho: [],
  tocado: false,
});

/* ── Persistência ───────────────────────────────────────────────────────
   Em aba anônima o localStorage lança ao ser lido/escrito. O site não pode
   quebrar por causa disso: o orçamento simplesmente vale só para a visita. */

function carregar(padrao: number): Estado {
  try {
    const cru = localStorage.getItem(CHAVE);
    if (!cru) return vazio(padrao);
    const dados = JSON.parse(cru) as Partial<Estado>;
    return {
      ...vazio(padrao),
      ...dados,
      jaTenho: Array.isArray(dados.jaTenho) ? dados.jaTenho : [],
    };
  } catch {
    return vazio(padrao);
  }
}

function salvar(estado: Estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* storage bloqueado — segue sem persistir */
  }
}

function limparStorage() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* idem */
  }
}

/* ── Formatação ─────────────────────────────────────────────────────── */

/**
 * ("10", "2026") → "outubro de 2026". Aceita só um dos dois preenchido.
 *
 * A conversão é feita na mão, sem `new Date()`: `new Date('2026-10')` é lido
 * como UTC e, em fuso negativo como o nosso, volta para setembro.
 */
function dataPorExtenso(mes: string, ano: string): string {
  const indice = Number(mes) - 1;
  const nome = indice >= 0 && indice <= 11 ? MESES[indice] : '';
  if (nome && ano) return `${nome} de ${ano}`;
  if (nome) return nome;
  return ano || '';
}

/** "Buffet, Decoração" → "buffet e decoração" */
function listaPorExtenso(itens: string[]): string {
  const minusculas = itens.map((i) => i.toLowerCase());
  if (minusculas.length <= 1) return minusculas.join('');
  return `${minusculas.slice(0, -1).join(', ')} e ${minusculas[minusculas.length - 1]}`;
}

function montarMensagem(estado: Estado, padraoSemNada: string): string {
  const linhas: string[] = [];
  if (estado.tipo) linhas.push(`Evento: ${estado.tipo}`);
  if (estado.convidados) linhas.push(`Convidados: ${estado.convidados}`);
  const quando = dataPorExtenso(estado.mes, estado.ano);
  if (quando) linhas.push(`Data pretendida: ${quando}`);
  if (estado.periodo) linhas.push(`Período: ${estado.periodo.toLowerCase()}`);
  if (estado.jaTenho.length) linhas.push(`Já tenho: ${listaPorExtenso(estado.jaTenho)}`);

  if (!linhas.length) return padraoSemNada;

  return [
    'Olá! Vim pelo site e queria um orçamento:',
    '',
    ...linhas,
    '',
    'Podem confirmar disponibilidade e valores?',
  ].join('\n');
}

/** Resumo curto para o botão flutuante. */
function montarResumo(estado: Estado): string {
  const partes: string[] = [];
  if (estado.tipo) partes.push(estado.tipo);
  if (estado.convidados) partes.push(`${estado.convidados} convidados`);
  const quando = dataPorExtenso(estado.mes, estado.ano);
  if (quando) partes.push(quando);
  return partes.join(' · ') || 'Seu evento';
}

/* ── Ligação com o DOM ──────────────────────────────────────────────── */

export function setupOrcamento() {
  const form = document.querySelector<HTMLElement>('[data-orc]');
  if (!form) return;

  const numero = form.dataset.orcWhatsapp ?? '';
  const padraoSemNada = form.dataset.orcPadrao ?? '';
  // Nome diferente do atributo do <input> de propósito: com os dois chamados
  // `data-orc-convidados`, um `document.querySelector` de fora casa primeiro
  // com este contêiner (que é ancestral) e devolve um elemento sem `.value`.
  const convidadosPadrao = Number(form.dataset.orcConvidadosPadrao) || 100;
  const min = Number(form.dataset.orcMin) || 10;
  const max = Number(form.dataset.orcMax) || 500;

  const selTipo = form.querySelector<HTMLSelectElement>('[data-orc-tipo]');
  const inpConvidados = form.querySelector<HTMLInputElement>('[data-orc-convidados]');
  const selMes = form.querySelector<HTMLSelectElement>('[data-orc-mes]');
  const selAno = form.querySelector<HTMLSelectElement>('[data-orc-ano]');
  const radiosPeriodo = form.querySelectorAll<HTMLInputElement>('[data-orc-periodo]');
  const checksTenho = form.querySelectorAll<HTMLInputElement>('[data-orc-tenho]');
  const btnMenos = form.querySelector<HTMLButtonElement>('[data-orc-menos]');
  const btnMais = form.querySelector<HTMLButtonElement>('[data-orc-mais]');
  const btnLimpar = form.querySelector<HTMLButtonElement>('[data-orc-limpar]');

  // Fora do formulário
  const pill = document.querySelector<HTMLElement>('[data-orc-pill]');
  const pillTexto = document.querySelector<HTMLElement>('[data-orc-pill-texto]');
  const ctas = document.querySelectorAll<HTMLAnchorElement>('[data-wa-cta]');

  let estado = carregar(convidadosPadrao);

  /** Escreve o estado nos controles (usado no carregamento). */
  function pintarControles() {
    if (selTipo) selTipo.value = estado.tipo;
    if (inpConvidados) inpConvidados.value = String(estado.convidados);
    if (selMes) selMes.value = estado.mes;
    if (selAno) selAno.value = estado.ano;
    radiosPeriodo.forEach((r) => {
      r.checked = r.value === estado.periodo;
    });
    checksTenho.forEach((c) => {
      c.checked = estado.jaTenho.includes(c.value);
    });
  }

  function atualizar({ marcarTocado = true, persistir = true } = {}) {
    if (marcarTocado) estado.tocado = true;
    // `persistir: false` existe por causa do "limpar": sem isso, o próprio
    // atualizar() gravava o estado vazio de volta logo após o remove, e a
    // chave nunca desaparecia de fato do navegador.
    if (persistir) salvar(estado);

    const mensagem = montarMensagem(estado, padraoSemNada);
    const href = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    // Todos os CTAs de WhatsApp passam a levar o pedido junto
    ctas.forEach((a) => {
      a.href = href;
    });

    if (pillTexto) pillTexto.textContent = montarResumo(estado);
    if (pill) pill.classList.toggle('is-visivel', estado.tocado);
  }

  /* Eventos */

  selTipo?.addEventListener('change', () => {
    estado.tipo = selTipo.value;
    atualizar();
  });

  function setConvidados(valor: number) {
    const limitado = Math.min(max, Math.max(min, Math.round(valor) || min));
    estado.convidados = limitado;
    if (inpConvidados) inpConvidados.value = String(limitado);
    atualizar();
  }

  inpConvidados?.addEventListener('input', () => {
    // Enquanto digita não corrigimos o valor: só ao sair do campo.
    const bruto = Number(inpConvidados.value);
    if (Number.isFinite(bruto) && bruto > 0) {
      estado.convidados = bruto;
      atualizar();
    }
  });
  inpConvidados?.addEventListener('blur', () => setConvidados(Number(inpConvidados.value)));
  btnMenos?.addEventListener('click', () => setConvidados(estado.convidados - 10));
  btnMais?.addEventListener('click', () => setConvidados(estado.convidados + 10));

  selMes?.addEventListener('change', () => {
    estado.mes = selMes.value;
    atualizar();
  });

  selAno?.addEventListener('change', () => {
    estado.ano = selAno.value;
    atualizar();
  });

  radiosPeriodo.forEach((r) =>
    r.addEventListener('change', () => {
      if (r.checked) {
        estado.periodo = r.value;
        atualizar();
      }
    }),
  );

  checksTenho.forEach((c) =>
    c.addEventListener('change', () => {
      const set = new Set(estado.jaTenho);
      if (c.checked) set.add(c.value);
      else set.delete(c.value);
      // Mantém a ordem original das opções, não a ordem de clique
      estado.jaTenho = Array.from(checksTenho)
        .map((x) => x.value)
        .filter((v) => set.has(v));
      atualizar();
    }),
  );

  btnLimpar?.addEventListener('click', () => {
    estado = vazio(convidadosPadrao);
    limparStorage();
    pintarControles();
    atualizar({ marcarTocado: false, persistir: false });
  });

  // O botão flutuante leva até o formulário
  document.querySelector('[data-orc-pill-ir]')?.addEventListener('click', () => {
    document.querySelector('#orcamento')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  pintarControles();
  // Na carga inicial também não gravamos: quem nunca mexeu em nada não deve
  // sair daqui com uma chave criada no navegador.
  atualizar({ marcarTocado: false, persistir: false });
}
