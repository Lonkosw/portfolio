/**
 * As três ferramentas interativas do site.
 *
 *   1. Diagnóstico capilar   — dentro do pilar Cabelo
 *   2. Monte seu dia da noiva — dentro do pilar Noivas
 *   3. Agendamento guiado     — no CTA final
 *
 * Ficam em contextos diferentes de propósito: empilhar três formulários no
 * fim da página faria as três parecerem burocracia. Cada uma aparece onde a
 * dúvida nasce.
 *
 * Nenhuma delas calcula preço: o Studio não publica tabela, e inventar valor
 * seria mentir para a cliente deles.
 *
 * Este módulo NÃO depende de GSAP nem de Lenis. É chamado antes do motor de
 * animação e continua valendo com prefers-reduced-motion ligado.
 */

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

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

/* ── Formatação ──────────────────────────────────────────────────────── */

/**
 * ("10", "2026") → "outubro de 2026". Aceita só um dos dois preenchido.
 *
 * Conversão na mão, sem `new Date()`: `new Date('2026-10')` é lido como UTC
 * e, em fuso negativo como o nosso, volta para setembro.
 */
function dataPorExtenso(mes: string, ano: string): string {
  const i = Number(mes) - 1;
  const nome = i >= 0 && i <= 11 ? MESES[i] : '';
  if (nome && ano) return `${nome} de ${ano}`;
  return nome || ano || '';
}

function listaPorExtenso(itens: string[]): string {
  const m = itens.map((i) => i.toLowerCase());
  if (m.length <= 1) return m.join('');
  return `${m.slice(0, -1).join(', ')} e ${m[m.length - 1]}`;
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
   1. DIAGNÓSTICO CAPILAR
   ══════════════════════════════════════════════════════════════════════ */

type EstadoDiag = { tipo: string; quimica: string; objetivo: string };

export function setupDiagnostico() {
  const raiz = document.querySelector<HTMLElement>('[data-diag]');
  if (!raiz) return;

  const CHAVE = 'priorize:diagnostico:v1';
  const numero = raiz.dataset.diagWhatsapp ?? '';
  const padraoMsg = raiz.dataset.diagPadrao ?? '';

  let encaminhamentos: Record<string, { titulo: string; texto: string }> = {};
  try {
    encaminhamentos = JSON.parse(raiz.dataset.diagEncaminhamentos ?? '{}');
  } catch {
    encaminhamentos = {};
  }

  const vazio: EstadoDiag = { tipo: '', quimica: '', objetivo: '' };
  let estado = carregar(CHAVE, vazio);

  const resultado = raiz.querySelector<HTMLElement>('[data-diag-resultado]');
  const resTitulo = raiz.querySelector<HTMLElement>('[data-diag-res-titulo]');
  const resTexto = raiz.querySelector<HTMLElement>('[data-diag-res-texto]');
  const ctas = raiz.querySelectorAll<HTMLAnchorElement>('[data-diag-cta]');
  const btnLimpar = raiz.querySelector<HTMLButtonElement>('[data-diag-limpar]');
  const progresso = raiz.querySelector<HTMLElement>('[data-diag-progresso]');

  const inputs = raiz.querySelectorAll<HTMLInputElement>('input[data-diag-campo]');

  function montarMensagem(): string {
    const linhas: string[] = [];
    if (estado.tipo) linhas.push(`Cabelo: ${estado.tipo.toLowerCase()}`);
    if (estado.quimica) linhas.push(`Química: ${estado.quimica.toLowerCase()}`);
    if (estado.objetivo) linhas.push(`Quero: ${estado.objetivo.toLowerCase()}`);
    if (!linhas.length) return padraoMsg;
    return [
      'Olá! Fiz o diagnóstico no site e queria marcar uma avaliação:',
      '',
      ...linhas,
      '',
      'Quando vocês têm horário?',
    ].join('\n');
  }

  function pintar() {
    inputs.forEach((el) => {
      el.checked = estado[el.dataset.diagCampo as keyof EstadoDiag] === el.value;
    });
  }

  function atualizar({ persistir = true } = {}) {
    if (persistir) salvar(CHAVE, estado);

    const respondidas = [estado.tipo, estado.quimica, estado.objetivo].filter(Boolean).length;
    if (progresso) {
      progresso.textContent = `${respondidas} de 3`;
      progresso.setAttribute('aria-label', `${respondidas} de 3 perguntas respondidas`);
    }

    const enc = estado.objetivo ? encaminhamentos[estado.objetivo] : undefined;
    const completo = respondidas === 3 && Boolean(enc);

    if (resultado) {
      resultado.hidden = !completo;
      // A altura da página muda quando o resultado aparece: os gatilhos de
      // scroll precisam remedir, senão apontam para posições antigas.
      if (completo) window.dispatchEvent(new CustomEvent('layout:mudou'));
    }
    if (completo && enc) {
      if (resTitulo) resTitulo.textContent = enc.titulo;
      if (resTexto) resTexto.textContent = enc.texto;
    }

    aplicarCtas(ctas, numero, montarMensagem());
  }

  inputs.forEach((el) =>
    el.addEventListener('change', () => {
      if (!el.checked) return;
      const campo = el.dataset.diagCampo as keyof EstadoDiag;
      estado = { ...estado, [campo]: el.value };
      atualizar();
    }),
  );

  btnLimpar?.addEventListener('click', () => {
    estado = { ...vazio };
    apagar(CHAVE);
    inputs.forEach((el) => {
      el.checked = false;
    });
    atualizar({ persistir: false });
  });

  pintar();
  atualizar({ persistir: false });
}

/* ══════════════════════════════════════════════════════════════════════
   2. MONTE SEU DIA DA NOIVA
   ══════════════════════════════════════════════════════════════════════ */

type EstadoNoiva = {
  servicos: string[];
  madrinhas: number;
  maes: number;
  convidadas: number;
  mes: string;
  ano: string;
  cerimonia: string;
  tocado: boolean;
};

export function setupNoiva() {
  const raiz = document.querySelector<HTMLElement>('[data-noiva]');
  if (!raiz) return;

  const CHAVE = 'priorize:noiva:v1';
  const numero = raiz.dataset.noivaWhatsapp ?? '';
  const padraoMsg = raiz.dataset.noivaPadrao ?? '';

  const vazio: EstadoNoiva = {
    servicos: [],
    madrinhas: 0,
    maes: 0,
    convidadas: 0,
    mes: '',
    ano: '',
    cerimonia: '',
    tocado: false,
  };
  let estado = carregar(CHAVE, vazio);
  if (!Array.isArray(estado.servicos)) estado.servicos = [];

  const checksServico = raiz.querySelectorAll<HTMLInputElement>('[data-noiva-servico]');
  const selMes = raiz.querySelector<HTMLSelectElement>('[data-noiva-mes]');
  const selAno = raiz.querySelector<HTMLSelectElement>('[data-noiva-ano]');
  const radiosCerimonia = raiz.querySelectorAll<HTMLInputElement>('[data-noiva-cerimonia]');
  const grupos = raiz.querySelectorAll<HTMLElement>('[data-noiva-grupo]');
  const btnLimpar = raiz.querySelector<HTMLButtonElement>('[data-noiva-limpar]');
  const totalEl = raiz.querySelector<HTMLElement>('[data-noiva-total]');
  const resumoEl = raiz.querySelector<HTMLElement>('[data-noiva-resumo]');
  const ctas = raiz.querySelectorAll<HTMLAnchorElement>('[data-noiva-cta]');

  const totalPessoas = () =>
    1 + Number(estado.madrinhas) + Number(estado.maes) + Number(estado.convidadas);

  function montarMensagem(): string {
    if (!estado.tocado) return padraoMsg;
    const linhas: string[] = [];
    if (estado.servicos.length) linhas.push(`Para mim: ${listaPorExtenso(estado.servicos)}`);

    const acomp: string[] = [];
    if (estado.madrinhas) acomp.push(`${estado.madrinhas} madrinha${estado.madrinhas > 1 ? 's' : ''}`);
    if (estado.maes) acomp.push(`${estado.maes} mãe${estado.maes > 1 ? 's' : ''}`);
    if (estado.convidadas)
      acomp.push(`${estado.convidadas} convidada${estado.convidadas > 1 ? 's' : ''}`);
    if (acomp.length) linhas.push(`Comigo vão: ${acomp.join(', ')}`);

    linhas.push(`Total de pessoas: ${totalPessoas()}`);

    const quando = dataPorExtenso(estado.mes, estado.ano);
    if (quando) linhas.push(`Casamento em: ${quando}`);
    if (estado.cerimonia) linhas.push(`Cerimônia: ${estado.cerimonia.toLowerCase()}`);

    return [
      'Olá! Montei meu dia da noiva no site:',
      '',
      ...linhas,
      '',
      'Vocês têm essa data disponível?',
    ].join('\n');
  }

  function montarResumo(): string {
    const partes: string[] = [];
    partes.push(`${totalPessoas()} pessoa${totalPessoas() > 1 ? 's' : ''}`);
    const quando = dataPorExtenso(estado.mes, estado.ano);
    if (quando) partes.push(quando);
    if (estado.cerimonia) partes.push(estado.cerimonia.toLowerCase());
    return partes.join(' · ');
  }

  function pintar() {
    checksServico.forEach((c) => {
      c.checked = estado.servicos.includes(c.value);
    });
    if (selMes) selMes.value = estado.mes;
    if (selAno) selAno.value = estado.ano;
    radiosCerimonia.forEach((r) => {
      r.checked = r.value === estado.cerimonia;
    });
    grupos.forEach((g) => {
      const id = g.dataset.noivaGrupo as 'madrinhas' | 'maes' | 'convidadas';
      const saida = g.querySelector<HTMLElement>('[data-noiva-valor]');
      if (saida) saida.textContent = String(estado[id]);
    });
  }

  function atualizar({ marcarTocado = true, persistir = true } = {}) {
    if (marcarTocado) estado.tocado = true;
    if (persistir) salvar(CHAVE, estado);

    if (totalEl) totalEl.textContent = String(totalPessoas());
    if (resumoEl) resumoEl.textContent = montarResumo();
    aplicarCtas(ctas, numero, montarMensagem());
  }

  checksServico.forEach((c) =>
    c.addEventListener('change', () => {
      const set = new Set(estado.servicos);
      if (c.checked) set.add(c.value);
      else set.delete(c.value);
      // Mantém a ordem original das opções, não a ordem de clique
      estado.servicos = Array.from(checksServico)
        .map((x) => x.value)
        .filter((v) => set.has(v));
      atualizar();
    }),
  );

  grupos.forEach((g) => {
    const id = g.dataset.noivaGrupo as 'madrinhas' | 'maes' | 'convidadas';
    const max = Number(g.dataset.noivaMax) || 12;
    const saida = g.querySelector<HTMLElement>('[data-noiva-valor]');

    const set = (n: number) => {
      estado[id] = Math.min(max, Math.max(0, n));
      if (saida) saida.textContent = String(estado[id]);
      atualizar();
    };

    g.querySelector<HTMLButtonElement>('[data-noiva-menos]')?.addEventListener('click', () =>
      set(Number(estado[id]) - 1),
    );
    g.querySelector<HTMLButtonElement>('[data-noiva-mais]')?.addEventListener('click', () =>
      set(Number(estado[id]) + 1),
    );
  });

  selMes?.addEventListener('change', () => {
    estado.mes = selMes.value;
    atualizar();
  });
  selAno?.addEventListener('change', () => {
    estado.ano = selAno.value;
    atualizar();
  });
  radiosCerimonia.forEach((r) =>
    r.addEventListener('change', () => {
      if (r.checked) {
        estado.cerimonia = r.value;
        atualizar();
      }
    }),
  );

  btnLimpar?.addEventListener('click', () => {
    estado = { ...vazio, servicos: [] };
    apagar(CHAVE);
    pintar();
    atualizar({ marcarTocado: false, persistir: false });
  });

  pintar();
  atualizar({ marcarTocado: false, persistir: false });
}

/* ══════════════════════════════════════════════════════════════════════
   3. AGENDAMENTO GUIADO
   ══════════════════════════════════════════════════════════════════════ */

type EstadoAgenda = { servico: string; dia: string; periodo: string; tocado: boolean };

export function setupAgenda() {
  const raiz = document.querySelector<HTMLElement>('[data-agenda]');
  if (!raiz) return;

  const CHAVE = 'priorize:agenda:v1';
  const numero = raiz.dataset.agendaWhatsapp ?? '';
  const padraoMsg = raiz.dataset.agendaPadrao ?? '';

  const vazio: EstadoAgenda = { servico: '', dia: '', periodo: '', tocado: false };
  let estado = carregar(CHAVE, vazio);

  const selServico = raiz.querySelector<HTMLSelectElement>('[data-agenda-servico]');
  const radiosDia = raiz.querySelectorAll<HTMLInputElement>('[data-agenda-dia]');
  const radiosPeriodo = raiz.querySelectorAll<HTMLInputElement>('[data-agenda-periodo]');
  const btnLimpar = raiz.querySelector<HTMLButtonElement>('[data-agenda-limpar]');
  const previa = raiz.querySelector<HTMLElement>('[data-agenda-previa]');
  const ctas = document.querySelectorAll<HTMLAnchorElement>('[data-agenda-cta]');

  function montarMensagem(): string {
    if (!estado.tocado) return padraoMsg;
    const linhas: string[] = [];
    if (estado.servico) linhas.push(`Serviço: ${estado.servico}`);
    if (estado.dia) linhas.push(`Dia que prefiro: ${estado.dia.toLowerCase()}`);
    if (estado.periodo) linhas.push(`Período: ${estado.periodo.toLowerCase()}`);
    if (!linhas.length) return padraoMsg;
    return [
      'Olá! Vim pelo site e queria agendar:',
      '',
      ...linhas,
      '',
      'Qual horário vocês têm?',
    ].join('\n');
  }

  function pintar() {
    if (selServico) selServico.value = estado.servico;
    radiosDia.forEach((r) => {
      r.checked = r.value === estado.dia;
    });
    radiosPeriodo.forEach((r) => {
      r.checked = r.value === estado.periodo;
    });
  }

  function atualizar({ marcarTocado = true, persistir = true } = {}) {
    if (marcarTocado) estado.tocado = true;
    if (persistir) salvar(CHAVE, estado);

    const msg = montarMensagem();
    if (previa) previa.textContent = estado.tocado ? msg : '';
    aplicarCtas(ctas, numero, msg);
  }

  selServico?.addEventListener('change', () => {
    estado.servico = selServico.value;
    atualizar();
  });
  radiosDia.forEach((r) =>
    r.addEventListener('change', () => {
      if (r.checked) {
        estado.dia = r.value;
        atualizar();
      }
    }),
  );
  radiosPeriodo.forEach((r) =>
    r.addEventListener('change', () => {
      if (r.checked) {
        estado.periodo = r.value;
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
  setupDiagnostico();
  setupNoiva();
  setupAgenda();
}
