/**
 * Montador de reserva.
 *
 * A pessoa escolhe ocasião, quantas pessoas, dia, período e horário; o
 * script monta a mensagem e reescreve o `href` do botão do WhatsApp. Nada
 * é enviado daqui: a mensagem é montada no próprio aparelho e só sai
 * quando a pessoa toca em enviar.
 *
 * Não depende de biblioteca nenhuma, e continua valendo com
 * `prefers-reduced-motion` ligado — usar não é animar.
 */

const CHAVE = 'ana:reserva:v1';

type Estado = {
  ocasiao: string;
  pessoas: number;
  data: string;
  periodo: string;
  horario: string;
  tocado: boolean;
};

/* ── Persistência ────────────────────────────────────────────────────────
   Em aba anônima o localStorage lança ao ser lido ou escrito. O site não
   pode quebrar por isso: a seleção simplesmente vale só para a visita.   */

function carregar(padrao: Estado): Estado {
  try {
    const cru = localStorage.getItem(CHAVE);
    if (!cru) return { ...padrao };
    return { ...padrao, ...(JSON.parse(cru) as Partial<Estado>) };
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

/**
 * "2026-08-15" → "15 de agosto".
 *
 * Conversão na mão, sem `new Date()`: `new Date('2026-08-15')` é lido como
 * UTC e, em fuso negativo como o nosso, volta um dia — a reserva sairia
 * marcada para 14.
 */
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function dataPorExtenso(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return '';
  const mes = MESES[Number(m[2]) - 1];
  if (!mes) return '';
  return `${Number(m[3])} de ${mes}`;
}

function linkWa(numero: string, mensagem: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function setupReserva() {
  const raiz = document.querySelector<HTMLElement>('[data-reserva]');
  if (!raiz) return;

  const numero = raiz.dataset.reservaWhatsapp ?? '';
  const padraoMsg = raiz.dataset.reservaPadrao ?? '';
  const maxPessoas = Number(raiz.dataset.reservaMax) || 12;

  const vazio: Estado = {
    ocasiao: '',
    pessoas: 2,
    data: '',
    periodo: '',
    horario: '',
    tocado: false,
  };
  let estado = carregar(vazio);

  const radiosOcasiao = raiz.querySelectorAll<HTMLInputElement>('[data-res-ocasiao]');
  const radiosPeriodo = raiz.querySelectorAll<HTMLInputElement>('[data-res-periodo]');
  const radiosHorario = raiz.querySelectorAll<HTMLInputElement>('[data-res-horario]');
  const inputData = raiz.querySelector<HTMLInputElement>('[data-res-data]');
  const grupoPessoas = raiz.querySelector<HTMLElement>('[data-res-pessoas]');
  const saidaPessoas = raiz.querySelector<HTMLElement>('[data-res-pessoas-valor]');
  const btnMenos = raiz.querySelector<HTMLButtonElement>('[data-res-menos]');
  const btnMais = raiz.querySelector<HTMLButtonElement>('[data-res-mais]');
  const previa = raiz.querySelector<HTMLElement>('[data-res-previa]');
  const btnLimpar = raiz.querySelector<HTMLButtonElement>('[data-res-limpar]');
  const ctas = document.querySelectorAll<HTMLAnchorElement>('[data-res-cta]');

  function montarMensagem(): string {
    if (!estado.tocado) return padraoMsg;

    const linhas: string[] = [];
    linhas.push(`Pessoas: ${estado.pessoas}`);
    if (estado.data) {
      const quando = dataPorExtenso(estado.data);
      if (quando) linhas.push(`Dia: ${quando}`);
    }
    if (estado.periodo) linhas.push(`Período: ${estado.periodo.toLowerCase()}`);
    if (estado.horario) linhas.push(`Horário: por volta de ${estado.horario}`);
    if (estado.ocasiao) linhas.push(`Ocasião: ${estado.ocasiao.toLowerCase()}`);

    return [
      'Olá! Vim pelo site e gostaria de reservar uma mesa:',
      '',
      ...linhas,
      '',
      'Vocês têm disponibilidade?',
    ].join('\n');
  }

  function pintar() {
    radiosOcasiao.forEach((r) => {
      r.checked = r.value === estado.ocasiao;
    });
    radiosPeriodo.forEach((r) => {
      r.checked = r.value === estado.periodo;
    });
    radiosHorario.forEach((r) => {
      r.checked = r.value === estado.horario;
    });
    if (inputData) inputData.value = estado.data;
    if (saidaPessoas) saidaPessoas.textContent = String(estado.pessoas);
  }

  function atualizar({ marcarTocado = true, persistir = true } = {}) {
    if (marcarTocado) estado.tocado = true;
    if (persistir) salvar(estado);

    if (saidaPessoas) saidaPessoas.textContent = String(estado.pessoas);
    // Os botões −/+ desabilitam nas pontas: um controle que não faz nada
    // ao ser tocado é pior do que um controle visivelmente indisponível.
    if (btnMenos) btnMenos.disabled = estado.pessoas <= 1;
    if (btnMais) btnMais.disabled = estado.pessoas >= maxPessoas;

    const msg = montarMensagem();
    if (previa) previa.textContent = estado.tocado ? msg : '';

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
  radiosPeriodo.forEach((r) =>
    r.addEventListener('change', () => {
      if (!r.checked) return;
      estado.periodo = r.value;
      atualizar();
    }),
  );
  radiosHorario.forEach((r) =>
    r.addEventListener('change', () => {
      if (!r.checked) return;
      estado.horario = r.value;
      atualizar();
    }),
  );

  inputData?.addEventListener('change', () => {
    estado.data = inputData.value;
    atualizar();
  });

  const setPessoas = (n: number) => {
    estado.pessoas = Math.min(maxPessoas, Math.max(1, n));
    atualizar();
  };
  btnMenos?.addEventListener('click', () => setPessoas(estado.pessoas - 1));
  btnMais?.addEventListener('click', () => setPessoas(estado.pessoas + 1));

  // Teclado no contador: setas mudam o valor, como num spinner nativo.
  grupoPessoas?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      setPessoas(estado.pessoas + 1);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setPessoas(estado.pessoas - 1);
    }
  });

  btnLimpar?.addEventListener('click', () => {
    estado = { ...vazio };
    apagar();
    pintar();
    // `persistir: false` importa: sem isso o próprio atualizar() gravaria
    // o estado vazio de volta logo depois do remove.
    atualizar({ marcarTocado: false, persistir: false });
  });

  pintar();
  atualizar({ marcarTocado: false, persistir: false });
}
