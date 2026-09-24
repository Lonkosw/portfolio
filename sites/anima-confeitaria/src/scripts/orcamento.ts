/**
 * Montador de orçamento.
 *
 * ══════════════════════════════════════════════════════════════════════
 * POR QUE ESTA FERRAMENTA É O CORAÇÃO DESTE SITE
 * ══════════════════════════════════════════════════════════════════════
 * A Ânima não publica preço — e não é descuido: bolo de casamento e
 * docinho de festa se orçam por evento. O efeito colateral é que hoje toda
 * conversa começa com "oi, quanto custa?", e aí vem uma sequência de
 * perguntas: para quando, quantas pessoas, que tipo de festa, o que você
 * quer.
 *
 * Este montador faz essas perguntas ANTES, na tela, e entrega a mensagem
 * pronta. Do lado da cliente, tira o constrangimento de não saber o que
 * informar. Do lado da confeitaria, a primeira mensagem já chega com tudo
 * o que é preciso para responder um valor.
 *
 * Nada é enviado daqui: a mensagem é montada no próprio aparelho e só sai
 * quando a pessoa toca em enviar.
 */

const CHAVE = 'anima:orcamento:v1';

type Estado = {
  ocasiao: string;
  itens: string[];
  convidados: string;
  mes: string;
  ano: string;
  tocado: boolean;
};

/* ── Persistência ────────────────────────────────────────────────────────
   Em aba anônima o localStorage lança ao ser lido ou escrito. O site não
   pode quebrar por isso: a seleção simplesmente vale só para a visita.   */

function carregar(padrao: Estado): Estado {
  try {
    const cru = localStorage.getItem(CHAVE);
    if (!cru) return { ...padrao };
    const lido = { ...padrao, ...(JSON.parse(cru) as Partial<Estado>) };
    // `itens` vem de JSON: se o storage foi adulterado ou veio de uma
    // versão antiga, um valor não-array quebraria todo o resto.
    if (!Array.isArray(lido.itens)) lido.itens = [];
    return lido;
  } catch {
    return { ...padrao };
  }
}

function salvar(valor: Estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(valor));
  } catch {
    /* storage bloqueado — segue sem persistir */
  }
}

function apagar() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* idem */
  }
}

/* ── Formatação ──────────────────────────────────────────────────────── */

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/**
 * ("10", "2026") → "outubro de 2026". Aceita só um dos dois preenchido.
 *
 * Conversão na mão, sem `new Date()`: `new Date('2026-10')` é lido como UTC
 * e, em fuso negativo como o nosso, volta para setembro — a festa sairia
 * marcada para o mês errado.
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

export function setupOrcamento() {
  const raiz = document.querySelector<HTMLElement>('[data-orcamento]');
  if (!raiz) return;

  const numero = raiz.dataset.orcWhatsapp ?? '';
  const padraoMsg = raiz.dataset.orcPadrao ?? '';

  const vazio: Estado = {
    ocasiao: '',
    itens: [],
    convidados: '',
    mes: '',
    ano: '',
    tocado: false,
  };
  let estado = carregar(vazio);

  const radiosOcasiao = raiz.querySelectorAll<HTMLInputElement>('[data-orc-ocasiao]');
  const checksItem = raiz.querySelectorAll<HTMLInputElement>('[data-orc-item]');
  const radiosConvidados = raiz.querySelectorAll<HTMLInputElement>('[data-orc-convidados]');
  const selMes = raiz.querySelector<HTMLSelectElement>('[data-orc-mes]');
  const selAno = raiz.querySelector<HTMLSelectElement>('[data-orc-ano]');
  const previa = raiz.querySelector<HTMLElement>('[data-orc-previa]');
  const btnLimpar = raiz.querySelector<HTMLButtonElement>('[data-orc-limpar]');
  const resumo = raiz.querySelector<HTMLElement>('[data-orc-resumo]');

  // `document`, não `raiz`: há um CTA de orçamento fora deste bloco (nas
  // categorias de "O que fazemos"), e ele também deve levar a seleção.
  const ctas = document.querySelectorAll<HTMLAnchorElement>('[data-orc-cta]');

  function montarMensagem(): string {
    if (!estado.tocado) return padraoMsg;

    const linhas: string[] = [];
    if (estado.ocasiao) linhas.push(`Ocasião: ${estado.ocasiao.toLowerCase()}`);
    if (estado.itens.length) linhas.push(`Preciso de: ${listaPorExtenso(estado.itens)}`);
    if (estado.convidados) linhas.push(`Convidados: ${estado.convidados.toLowerCase()}`);

    const quando = dataPorExtenso(estado.mes, estado.ano);
    if (quando) linhas.push(`Data: ${quando}`);

    if (!linhas.length) return padraoMsg;

    return [
      'Olá, Ânima! Vim pelo site e gostaria de um orçamento:',
      '',
      ...linhas,
      '',
      'Vocês conseguem atender?',
    ].join('\n');
  }

  /** Uma linha curta que confirma o que já foi escolhido, sem repetir tudo. */
  function montarResumo(): string {
    const partes: string[] = [];
    if (estado.ocasiao) partes.push(estado.ocasiao);
    if (estado.itens.length) {
      partes.push(estado.itens.length === 1 ? estado.itens[0] : `${estado.itens.length} itens`);
    }
    if (estado.convidados) partes.push(`${estado.convidados} convidados`);
    const quando = dataPorExtenso(estado.mes, estado.ano);
    if (quando) partes.push(quando);
    return partes.join(' · ');
  }

  function pintar() {
    radiosOcasiao.forEach((r) => {
      r.checked = r.value === estado.ocasiao;
    });
    checksItem.forEach((c) => {
      c.checked = estado.itens.includes(c.value);
    });
    radiosConvidados.forEach((r) => {
      r.checked = r.value === estado.convidados;
    });
    if (selMes) selMes.value = estado.mes;
    if (selAno) selAno.value = estado.ano;
  }

  function atualizar({ marcarTocado = true, persistir = true } = {}) {
    if (marcarTocado) estado.tocado = true;
    if (persistir) salvar(estado);

    const msg = montarMensagem();
    if (previa) previa.textContent = estado.tocado ? msg : '';
    if (resumo) resumo.textContent = montarResumo();

    const href = linkWa(numero, msg);
    ctas.forEach((a) => {
      a.href = href;
    });
  }

  radiosOcasiao.forEach((r) =>
    r.addEventListener('change', () => {
      if (!r.checked) return;
      estado.ocasiao = r.value;
      atualizar();
    }),
  );

  checksItem.forEach((c) =>
    c.addEventListener('change', () => {
      const set = new Set(estado.itens);
      if (c.checked) set.add(c.value);
      else set.delete(c.value);
      // Mantém a ordem original das opções, não a ordem de clique: numa
      // mensagem lida por outra pessoa, ordem estável é mais fácil de ler.
      estado.itens = Array.from(checksItem)
        .map((x) => x.value)
        .filter((v) => set.has(v));
      atualizar();
    }),
  );

  radiosConvidados.forEach((r) =>
    r.addEventListener('change', () => {
      if (!r.checked) return;
      estado.convidados = r.value;
      atualizar();
    }),
  );

  selMes?.addEventListener('change', () => {
    estado.mes = selMes.value;
    atualizar();
  });
  selAno?.addEventListener('change', () => {
    estado.ano = selAno.value;
    atualizar();
  });

  btnLimpar?.addEventListener('click', () => {
    estado = { ...vazio, itens: [] };
    apagar();
    pintar();
    // `persistir: false` importa: sem isso o próprio atualizar() gravaria
    // o estado vazio de volta logo depois do remove.
    atualizar({ marcarTocado: false, persistir: false });
  });

  /**
   * Atalho das categorias: cada card de "O que fazemos" pode marcar o item
   * correspondente e levar a pessoa até o formulário, já preenchido.
   */
  document.querySelectorAll<HTMLElement>('[data-orc-atalho]').forEach((el) => {
    el.addEventListener('click', () => {
      const item = el.dataset.orcAtalho;
      if (!item) return;
      const alvo = Array.from(checksItem).find((c) => c.value === item);
      if (alvo && !alvo.checked) {
        alvo.checked = true;
        alvo.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });

  pintar();
  atualizar({ marcarTocado: false, persistir: false });
}
