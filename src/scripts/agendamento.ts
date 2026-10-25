import { aplicarPersonalizacao, getClinicaAtual } from '../lib/personalizar';
import { diaDisponivel, fromISO, getDisponibilidade, pad, toISO, type AgendaClinica, type Slot } from '../lib/disponibilidade';
import { agenda } from '../data/odonto-config';
import { gerarICS } from '../lib/ics';
import { mascaraTelefone, mensagemAgendamento, waLink } from '../lib/whatsapp';

interface Dados extends AgendaClinica {
  nome: string;
  cidade: string;
  whatsapp: string;
  endereco: string;
  convenios: string[];
  motivos: { id: string; titulo: string }[];
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const PERIODOS: Record<Slot['periodo'], string> = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

aplicarPersonalizacao();

document.querySelectorAll<HTMLElement>('[data-ag]').forEach(iniciar);

function iniciar(root: HTMLElement) {
  const dados: Dados = JSON.parse(root.querySelector('[data-ag-data]')!.textContent!);
  const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const form = $<HTMLFormElement>('[data-form]');
  const paineis = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]'));
  const btnNext = $<HTMLButtonElement>('[data-next]');
  const btnBack = $<HTMLButtonElement>('[data-back]');
  const msg = $('[data-msg]');
  const bar = $('[data-bar]');
  const nav = $('[data-nav]');

  const s = { etapa: '1', motivo: '', prof: '', dia: '', hora: '', mes: new Date(), foco: '' };
  s.mes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const atual = () => getClinicaAtual();
  const nomeClinica = () => atual()?.nome ?? dados.nome;
  const wa = () => atual()?.whatsapp ?? dados.whatsapp;
  const motivoTitulo = () => dados.motivos.find((m) => m.id === s.motivo)?.titulo ?? '';

  // ── navegação entre etapas ──
  const ordem = ['1', '2', '3', '4', '5'];
  function ir(et: string, foco = true) {
    s.etapa = et;
    paineis.forEach((p) => (p.hidden = p.dataset.panel !== et));
    const idx = et === 'urg' ? 1 : ordem.indexOf(et) + 1;
    root.querySelectorAll<HTMLElement>('[data-step-ind]').forEach((li) => {
      const n = Number(li.dataset.stepInd);
      li.classList.toggle('is-done', n < idx);
      li.classList.toggle('is-now', n === idx);
      if (n === idx) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    bar.style.transform = `scaleX(${idx / 5})`;
    btnBack.hidden = et === '1';
    nav.hidden = et === '5' || et === 'urg';
    if (et === 'urg') {
      nav.hidden = false;
      btnNext.hidden = true;
      btnBack.hidden = false;
    } else btnNext.hidden = false;
    $('[data-next-label]').textContent = et === '4' ? 'Revisar agendamento' : 'Continuar';
    msg.textContent = '';
    if (foco) root.querySelector<HTMLElement>(`[data-panel="${et}"] .ag-h`)?.focus({ preventScroll: false });
    if (et === '2') filtrarProfissionais();
    if (et === '3') desenharCalendario(true);
    if (et === '5') resumo();
    if (et === 'urg') urgencia();
  }

  const val = (name: string) => (form.elements.namedItem(name) as RadioNodeList | HTMLInputElement).value as string;

  // ── etapa 1: motivo ──
  function setMotivo(m: string) {
    s.motivo = m;
    const r = form.querySelector<HTMLInputElement>(`input[name="motivo"][value="${m}"]`);
    if (r) r.checked = true;
  }
  form.querySelectorAll<HTMLInputElement>('input[name="motivo"]').forEach((r) =>
    r.addEventListener('change', () => { s.motivo = r.value; msg.textContent = ''; }),
  );
  if (root.dataset.motivoInicial) setMotivo(root.dataset.motivoInicial);
  window.addEventListener('od:agendar', (e) => {
    const m = (e as CustomEvent<{ motivo?: string }>).detail?.motivo;
    if (m) { setMotivo(m); s.prof = ''; ir(m === 'urgencia' ? 'urg' : '2', false); }
    root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => root.querySelector<HTMLElement>(`[data-panel="${s.etapa}"] .ag-h`)?.focus({ preventScroll: true }), 450);
  });

  // ── urgência ──
  function urgencia() {
    const txt = `Olá! Estou com dor/urgência e gostaria de ser atendido na ${nomeClinica()}. Pode me ajudar?`;
    $<HTMLAnchorElement>('[data-urg-wa]').href = waLink(wa(), txt);
    $<HTMLAnchorElement>('[data-urg-tel]').href = `tel:+${wa()}`;
  }

  // ── etapa 2: profissionais ──
  function filtrarProfissionais() {
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-prof-card]')).filter((c) => c.dataset.profCard !== '');
    const aptos = cards.filter((c) => (c.dataset.profCard ?? '').split(' ').includes(s.motivo));
    const mostrar = aptos.length ? aptos : cards;
    cards.forEach((c) => (c.hidden = !mostrar.includes(c)));
    const sel = form.querySelector<HTMLInputElement>('input[name="profissional"]:checked');
    if (sel && sel.closest<HTMLElement>('[data-prof-card]')?.hidden) {
      form.querySelector<HTMLInputElement>('input[name="profissional"][value=""]')!.checked = true;
      s.prof = '';
    }
  }
  form.querySelectorAll<HTMLInputElement>('input[name="profissional"]').forEach((r) =>
    r.addEventListener('change', () => { s.prof = r.value; s.dia = ''; s.hora = ''; }),
  );

  // ── etapa 3: calendário ──
  const grid = $('[data-cal-grid]');
  const tituloMes = $('[data-cal-title]');
  const prev = $<HTMLButtonElement>('[data-cal-prev]');
  const next = $<HTMLButtonElement>('[data-cal-next]');
  const hoje = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };

  function desenharCalendario(reiniciar = false) {
    if (reiniciar && !s.dia) s.mes = new Date(hoje().getFullYear(), hoje().getMonth(), 1);
    const ano = s.mes.getFullYear(), mes = s.mes.getMonth();
    tituloMes.textContent = `${MESES[mes][0].toUpperCase()}${MESES[mes].slice(1)} de ${ano}`;
    const primeiro = new Date(ano, mes, 1);
    const total = new Date(ano, mes + 1, 0).getDate();
    const limite = new Date(hoje().getFullYear(), hoje().getMonth(), hoje().getDate() + agenda.janelaDias);
    prev.disabled = s.mes <= new Date(hoje().getFullYear(), hoje().getMonth(), 1);
    next.disabled = new Date(ano, mes + 1, 1) > limite;
    grid.replaceChildren();
    const linha = document.createElement('div');
    for (let i = 0; i < primeiro.getDay(); i++) {
      const v = document.createElement('span'); v.className = 'ag-day ag-day-vazio'; v.setAttribute('role', 'presentation'); grid.appendChild(v);
    }
    let foco: HTMLButtonElement | null = null;
    for (let d = 1; d <= total; d++) {
      const dt = new Date(ano, mes, d);
      const iso = toISO(dt);
      const ok = diaDisponivel(dados, iso, s.prof || undefined);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ag-day';
      b.dataset.iso = iso;
      b.textContent = String(d);
      b.setAttribute('role', 'gridcell');
      b.tabIndex = -1;
      b.setAttribute('aria-label', `${d} de ${MESES[mes]}, ${DIAS[dt.getDay()]}, ${ok ? 'disponível' : 'indisponível'}`);
      if (!ok) { b.setAttribute('aria-disabled', 'true'); b.classList.add('is-off'); }
      if (iso === s.dia) { b.classList.add('is-sel'); b.setAttribute('aria-selected', 'true'); }
      if (iso === toISO(hoje())) b.classList.add('is-today');
      if (!foco && (iso === s.dia || (!s.dia && ok))) foco = b;
      grid.appendChild(b);
    }
    (foco ?? grid.querySelector<HTMLButtonElement>('.ag-day[data-iso]'))!.tabIndex = 0;
    void linha;
    desenharHorarios();
  }
  prev.addEventListener('click', () => { s.mes = new Date(s.mes.getFullYear(), s.mes.getMonth() - 1, 1); desenharCalendario(); });
  next.addEventListener('click', () => { s.mes = new Date(s.mes.getFullYear(), s.mes.getMonth() + 1, 1); desenharCalendario(); });

  function escolherDia(b: HTMLButtonElement) {
    if (b.getAttribute('aria-disabled') === 'true') return;
    s.dia = b.dataset.iso!; s.hora = '';
    grid.querySelectorAll('.ag-day.is-sel').forEach((x) => { x.classList.remove('is-sel'); x.removeAttribute('aria-selected'); });
    b.classList.add('is-sel'); b.setAttribute('aria-selected', 'true');
    desenharHorarios();
  }
  grid.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.ag-day[data-iso]');
    if (b) escolherDia(b);
  });
  grid.addEventListener('keydown', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.ag-day[data-iso]');
    if (!b) return;
    const passos: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in passos) {
      e.preventDefault();
      const alvo = fromISO(b.dataset.iso!);
      alvo.setDate(alvo.getDate() + passos[e.key]);
      moverFoco(alvo);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const d = fromISO(b.dataset.iso!);
      d.setDate(d.getDate() - (e.key === 'Home' ? d.getDay() : d.getDay() - 6));
      moverFoco(d);
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const d = fromISO(b.dataset.iso!);
      d.setMonth(d.getMonth() + (e.key === 'PageUp' ? -1 : 1));
      moverFoco(d);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      escolherDia(b);
    }
  });
  function moverFoco(d: Date) {
    const min = hoje(); const max = new Date(min.getFullYear(), min.getMonth(), min.getDate() + agenda.janelaDias);
    if (d < min || d > max) return;
    if (d.getMonth() !== s.mes.getMonth() || d.getFullYear() !== s.mes.getFullYear()) { s.mes = new Date(d.getFullYear(), d.getMonth(), 1); desenharCalendario(); }
    grid.querySelectorAll<HTMLButtonElement>('.ag-day[data-iso]').forEach((x) => (x.tabIndex = -1));
    const alvo = grid.querySelector<HTMLButtonElement>(`.ag-day[data-iso="${toISO(d)}"]`);
    if (alvo) { alvo.tabIndex = 0; alvo.focus(); }
  }

  // ── horários ──
  const slotsBox = $('[data-slots]');
  const slotsPh = $('[data-slots-ph]');
  function desenharHorarios() {
    slotsBox.replaceChildren();
    if (!s.dia) { slotsPh.hidden = false; return; }
    slotsPh.hidden = true;
    const dt = fromISO(s.dia);
    const h = document.createElement('p');
    h.className = 'ag-slots-day';
    h.textContent = `${DIAS[dt.getDay()][0].toUpperCase()}${DIAS[dt.getDay()].slice(1)}, ${dt.getDate()} de ${MESES[dt.getMonth()]}`;
    slotsBox.appendChild(h);
    const slots = getDisponibilidade(dados, s.dia, s.prof || undefined);
    (['manha', 'tarde', 'noite'] as const).forEach((p) => {
      const lista = slots.filter((x) => x.periodo === p);
      if (!lista.length) return;
      const g = document.createElement('div');
      g.className = 'ag-per';
      g.setAttribute('role', 'group');
      g.setAttribute('aria-label', PERIODOS[p]);
      g.innerHTML = `<p class="ag-per-t">${PERIODOS[p]}</p>`;
      const ul = document.createElement('div');
      ul.className = 'ag-slotlist';
      lista.forEach((sl) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'ag-slot'; b.textContent = sl.hora; b.dataset.hora = sl.hora;
        b.setAttribute('aria-pressed', String(sl.hora === s.hora));
        if (sl.hora === s.hora) b.classList.add('is-sel');
        if (!sl.livre) { b.setAttribute('aria-disabled', 'true'); b.classList.add('is-off'); b.title = 'Horário indisponível'; b.setAttribute('aria-label', `${sl.hora}, indisponível`); }
        ul.appendChild(b);
      });
      g.appendChild(ul);
      slotsBox.appendChild(g);
    });
    if (!slotsBox.querySelector('.ag-slot')) slotsBox.insertAdjacentHTML('beforeend', '<p class="ag-slots-ph">Sem horários neste dia.</p>');
  }
  slotsBox.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.ag-slot');
    if (!b || b.getAttribute('aria-disabled') === 'true') return;
    s.hora = b.dataset.hora!;
    slotsBox.querySelectorAll('.ag-slot').forEach((x) => { x.classList.remove('is-sel'); x.setAttribute('aria-pressed', 'false'); });
    b.classList.add('is-sel'); b.setAttribute('aria-pressed', 'true');
    msg.textContent = '';
  });

  // ── etapa 4: dados ──
  const tel = form.elements.namedItem('tel') as HTMLInputElement;
  tel.addEventListener('input', () => (tel.value = mascaraTelefone(tel.value)));
  const erro = (campo: string, texto: string) => {
    const el = root.querySelector<HTMLElement>(`[data-err="${campo}"]`)!;
    el.textContent = texto;
    const inp = form.elements.namedItem(campo) as HTMLInputElement;
    inp.setAttribute('aria-invalid', texto ? 'true' : 'false');
  };
  function validarDados() {
    const nome = val('nome').trim();
    const dig = val('tel').replace(/\D/g, '');
    let ok = true;
    let primeiro: HTMLElement | null = null;
    if (nome.length < 3 || !/[A-Za-zÀ-ÿ]{2}/.test(nome)) { erro('nome', 'Informe seu nome para que a equipe possa te identificar.'); ok = false; primeiro ??= form.elements.namedItem('nome') as HTMLElement; } else erro('nome', '');
    if (!/^[1-9][1-9]9?\d{8}$/.test(dig)) { erro('tel', 'Informe um WhatsApp com DDD, no formato (41) 99999-9999.'); ok = false; primeiro ??= tel; } else erro('tel', '');
    primeiro?.focus();
    return ok;
  }

  // ── etapa 5: resumo ──
  const infoData = () => {
    const d = fromISO(s.dia);
    return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
  };
  const dadosAgendamento = () => ({
    clinica: nomeClinica(),
    motivo: motivoTitulo(),
    profissional: s.prof || 'Sem preferência',
    data: infoData(),
    hora: s.hora,
    nome: val('nome').trim(),
    primeiraConsulta: val('primeira') === 'sim',
    convenio: dados.convenios.length ? val('convenio') : '',
    observacao: val('obs').trim(),
  });
  function resumo() {
    const d = dadosAgendamento();
    const linhas: [string, string][] = [
      ['Motivo', d.motivo], ['Profissional', d.profissional], ['Data', d.data], ['Horário', d.hora],
      ['Nome', d.nome], ['Primeira consulta', d.primeiraConsulta ? 'Sim' : 'Não'],
    ];
    if (d.convenio) linhas.push(['Convênio', d.convenio]);
    if (d.observacao) linhas.push(['Observação', d.observacao]);
    const sum = $('[data-sum]');
    sum.replaceChildren();
    linhas.forEach(([k, v]) => {
      const w = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      w.append(dt, dd); sum.appendChild(w);
    });
    $<HTMLAnchorElement>('[data-confirm]').href = waLink(wa(), mensagemAgendamento(d));
  }
  $('[data-ics]').addEventListener('click', () => {
    const [hh, mm] = s.hora.split(':').map(Number);
    const d = fromISO(s.dia);
    const inicio = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm);
    const ag = dadosAgendamento();
    const txt = gerarICS({
      titulo: `Consulta · ${ag.clinica}`,
      inicio,
      duracaoMin: dados.duracaoConsultaMin,
      local: `${ag.clinica}, ${dados.endereco}`,
      descricao: `Motivo: ${ag.motivo}\nProfissional: ${ag.profissional}\nConfirme o agendamento com a clínica pelo WhatsApp.`,
      uid: `${toISO(inicio)}-${pad(hh)}${pad(mm)}-${dados.id}@agendamento`,
    });
    const url = URL.createObjectURL(new Blob([txt], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `consulta-${toISO(inicio)}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });
  $('[data-reset]').addEventListener('click', () => {
    form.reset(); s.motivo = ''; s.prof = ''; s.dia = ''; s.hora = '';
    ir('1');
  });

  // ── botões ──
  btnNext.addEventListener('click', () => {
    msg.textContent = '';
    if (s.etapa === '1') {
      if (!s.motivo) return void (msg.textContent = 'Escolha o motivo da consulta para continuar.');
      return ir(s.motivo === 'urgencia' ? 'urg' : '2');
    }
    if (s.etapa === '2') return ir('3');
    if (s.etapa === '3') {
      if (!s.dia) return void (msg.textContent = 'Escolha um dia disponível no calendário.');
      if (!s.hora) return void (msg.textContent = 'Escolha um horário para continuar.');
      return ir('4');
    }
    if (s.etapa === '4') { if (validarDados()) ir('5'); }
  });
  btnBack.addEventListener('click', () => {
    const volta: Record<string, string> = { urg: '1', '2': '1', '3': '2', '4': '3', '5': '4' };
    ir(volta[s.etapa] ?? '1');
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && (e.target as HTMLInputElement).type !== 'radio') {
      e.preventDefault(); btnNext.click();
    }
  });

  ir('1', false);
}
