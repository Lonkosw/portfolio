/**
 * As três ferramentas interativas do site.
 *
 *   1. Diagnóstico capilar   — dentro do pilar Cabelo
 *   2. Monte sua produção     — dentro do pilar Produção
 *   3. Agendamento guiado     — no CTA final
 *
 * Ficam em contextos diferentes de propósito: empilhar três formulários no
 * fim da página faria as três parecerem burocracia. Cada uma aparece onde a
 * dúvida nasce.
 *
 * Nenhuma delas calcula preço: o salão não publica tabela, os valores mudam
 * por profissional e a promoção do mês vence. Inventar valor aqui seria mentir
 * para a cliente deles.
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

  const CHAVE = 'concetto:diagnostico:v1';
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
   2. MONTE SUA PRODUÇÃO  (maquiagem e penteado)
   ══════════════════════════════════════════════════════════════════════

   Substitui o "monte seu dia da noiva" do Studio Priorize. A mecânica é a
   mesma — escolhas na tela viram uma mensagem pronta — mas as perguntas são
   outras: aqui não existe noiva com madrinhas, existe formanda com amigas,
   convidada de casamento, aniversariante.

   O QUE ELE NÃO FAZ: calcular preço. O salão não publica tabela, os valores
   mudam por profissional e a promoção do mês vence. O que este quadro
   garante é que a PRIMEIRA mensagem já chegue com tudo o que eles precisam
   para responder um valor — que é onde o atendimento por WhatsApp trava.  */

type EstadoProd = {
  ocasiao: string;
  servicos: string[];
  amigas: number;
  familia: number;
  mes: string;
  ano: string;
  hora: string;
  tocado: boolean;
};

export function setupProducao() {
  const raiz = document.querySelector<HTMLElement>('[data-prod]');
  if (!raiz) return;

  const CHAVE = 'concetto:producao:v1';
  const numero = raiz.dataset.prodWhatsapp ?? '';
  const padraoMsg = raiz.dataset.prodPadrao ?? '';

  const vazio: EstadoProd = {
    ocasiao: '',
    servicos: [],
    amigas: 0,
    familia: 0,
    mes: '',
    ano: '',
    hora: '',
    tocado: false,
  };
  let estado = carregar(CHAVE, vazio);
  if (!Array.isArray(estado.servicos)) estado.servicos = [];

  const radiosOcasiao = raiz.querySelectorAll<HTMLInputElement>('[data-prod-ocasiao]');
  const checksServico = raiz.querySelectorAll<HTMLInputElement>('[data-prod-servico]');
  const selMes = raiz.querySelector<HTMLSelectElement>('[data-prod-mes]');
  const selAno = raiz.querySelector<HTMLSelectElement>('[data-prod-ano]');
  const radiosHora = raiz.querySelectorAll<HTMLInputElement>('[data-prod-hora]');
  const grupos = raiz.querySelectorAll<HTMLElement>('[data-prod-grupo]');
  const btnLimpar = raiz.querySelector<HTMLButtonElement>('[data-prod-limpar]');
  const totalEl = raiz.querySelector<HTMLElement>('[data-prod-total]');
  const previaEl = raiz.querySelector<HTMLElement>('[data-prod-previa]');
  const ctas = raiz.querySelectorAll<HTMLAnchorElement>('[data-prod-cta]');

  // A própria pessoa sempre conta. Por isso começa em 1, e não em 0.
  const totalPessoas = () => 1 + Number(estado.amigas) + Number(estado.familia);

  function montarMensagem(): string {
    if (!estado.tocado) return padraoMsg;
    const linhas: string[] = [];

    if (estado.ocasiao) linhas.push(`Ocasião: ${estado.ocasiao.toLowerCase()}`);
    if (estado.servicos.length) linhas.push(`Para mim: ${listaPorExtenso(estado.servicos)}`);

    const acomp: string[] = [];
    if (estado.amigas) acomp.push(`${estado.amigas} amiga${estado.amigas > 1 ? 's' : ''}`);
    if (estado.familia)
      acomp.push(`${estado.familia} da família`);
    if (acomp.length) linhas.push(`Comigo vão: ${acomp.join(', ')}`);

    linhas.push(`Total de pessoas: ${totalPessoas()}`);

    const quando = dataPorExtenso(estado.mes, estado.ano);
    if (quando) linhas.push(`Evento em: ${quando}`);
    if (estado.hora) linhas.push(`Horário: ${estado.hora.toLowerCase()}`);

    return [
      'Olá! Montei minha produção no site:',
      '',
      ...linhas,
      '',
      'Vocês têm essa data disponível?',
    ].join('\n');
  }

  /** Resumo curto para o contador do topo. */
  function montarResumo(): string {
    const n = totalPessoas();
    const partes = [`${n} pessoa${n > 1 ? 's' : ''}`];
    const quando = dataPorExtenso(estado.mes, estado.ano);
    if (quando) partes.push(quando);
    return partes.join(' · ');
  }

  function pintar() {
    radiosOcasiao.forEach((r) => {
      r.checked = r.value === estado.ocasiao;
    });
    checksServico.forEach((c) => {
      c.checked = estado.servicos.includes(c.value);
    });
    if (selMes) selMes.value = estado.mes;
    if (selAno) selAno.value = estado.ano;
    radiosHora.forEach((r) => {
      r.checked = r.value === estado.hora;
    });
    grupos.forEach((g) => {
      const id = g.dataset.prodGrupo as 'amigas' | 'familia';
      const saida = g.querySelector<HTMLElement>('[data-prod-valor]');
      if (saida) saida.textContent = String(estado[id]);
    });
  }

  function atualizar({ marcarTocado = true, persistir = true } = {}) {
    if (marcarTocado) estado.tocado = true;
    if (persistir) salvar(CHAVE, estado);

    if (totalEl) totalEl.textContent = montarResumo();
    // A prévia fica VAZIA enquanto ninguém tocou em nada: `empty:hidden` no
    // CSS a esconde, e mostrar a mensagem padrão antes da primeira escolha
    // faria parecer que o formulário já foi preenchido.
    if (previaEl) previaEl.textContent = estado.tocado ? montarMensagem() : '';
    aplicarCtas(ctas, numero, montarMensagem());
  }

  radiosOcasiao.forEach((r) =>
    r.addEventListener('change', () => {
      if (r.checked) {
        estado.ocasiao = r.value;
        atualizar();
      }
    }),
  );

  checksServico.forEach((c) =>
    c.addEventListener('change', () => {
      const set = new Set(estado.servicos);
      if (c.checked) set.add(c.value);
      else set.delete(c.value);
      // Mantém a ordem original das opções, não a ordem de clique.
      estado.servicos = Array.from(checksServico)
        .map((x) => x.value)
        .filter((v) => set.has(v));
      atualizar();
    }),
  );

  grupos.forEach((g) => {
    const id = g.dataset.prodGrupo as 'amigas' | 'familia';
    const max = Number(g.dataset.prodMax) || 12;
    const saida = g.querySelector<HTMLElement>('[data-prod-valor]');

    const set = (n: number) => {
      estado[id] = Math.min(max, Math.max(0, n));
      if (saida) saida.textContent = String(estado[id]);
      atualizar();
    };

    g.querySelector<HTMLButtonElement>('[data-prod-menos]')?.addEventListener('click', () =>
      set(Number(estado[id]) - 1),
    );
    g.querySelector<HTMLButtonElement>('[data-prod-mais]')?.addEventListener('click', () =>
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
  radiosHora.forEach((r) =>
    r.addEventListener('change', () => {
      if (r.checked) {
        estado.hora = r.value;
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

  const CHAVE = 'concetto:agenda:v1';
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
  setupProducao();
  setupAgenda();
}
