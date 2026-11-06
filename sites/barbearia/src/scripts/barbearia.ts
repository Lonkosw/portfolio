const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
type Servico = { id: string; nome: string; preco: number | null; principal?: boolean };
const D = JSON.parse($('#dados').textContent || '{}') as {
  nome: string;
  whatsapp: string | null;
  barbeiros: { nome: string; foto?: string }[];
  horarios: { dias: string; weekdays: number[]; abre: string; fecha: string }[];
  servicos: { grupo: string; itens: Servico[] }[];
};
const brl = (n: number) => `R$ ${n.toLocaleString('pt-BR')}`;
const preco = (n: number | null) => (n == null ? 'a confirmar' : brl(n));
const todos = D.servicos.flatMap((g) => g.itens);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const temHorarios = D.horarios.length > 0;

/* revelar ao rolar */
const rv = $$('[data-rv]');
if (reduce || !('IntersectionObserver' in window)) rv.forEach((e) => e.classList.add('in'));
else {
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  rv.forEach((e) => io.observe(e));
}

/* cabeçalho sólido depois do topo */
const topo = $('[data-topo]');
const tick = () => topo.classList.toggle('solido', scrollY > 40);
addEventListener('scroll', tick, { passive: true });
requestAnimationFrame(tick);

/* agendamento numa tela só: o cliente monta o pedido e envia pelo WhatsApp; a barbearia confirma o horário */
const sel = new Set<string>();
let barbeiro = 'Qualquer barbeiro';
let dia = '';
let hora = '';
const raiz = $('[data-agenda]');
const abertos = new Set(D.horarios.flatMap((h) => h.weekdays));
const horarioDo = (d: Date) => D.horarios.find((h) => h.weekdays.includes(d.getDay()));
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dias: Date[] = [];
if (temHorarios) {
  for (let i = 0; dias.length < 7 && i < 14; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    if (abertos.has(d.getDay())) dias.push(d);
  }
}
const nomeDia = (d: Date) => (iso(d) === iso(new Date()) ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''));
const chip = (s: Servico) =>
  `<label class="chip"><input type="checkbox" value="${s.id}" ${sel.has(s.id) ? 'checked' : ''}><span>${esc(s.nome)} <b${s.preco == null ? ' class="nulo"' : ''}>${preco(s.preco)}</b></span></label>`;

function desenharServicos() {
  let principais = todos.filter((s) => s.principal);
  if (!principais.length) principais = todos.slice(0, 6);
  const idsP = new Set(principais.map((s) => s.id));
  $('[data-lista-principais]', raiz).innerHTML = principais.map(chip).join('');
  const outros = D.servicos
    .map((g) => ({ g: g.grupo, itens: g.itens.filter((s) => !idsP.has(s.id)) }))
    .filter((x) => x.itens.length);
  const mais = $('details.mais', raiz) as HTMLDetailsElement;
  mais.hidden = outros.length === 0;
  $('[data-lista-outros]', raiz).innerHTML = outros
    .map((x) => `<fieldset class="g-srv"><legend>${esc(x.g)}</legend><div class="chips">${x.itens.map(chip).join('')}</div></fieldset>`)
    .join('');
  if ([...sel].some((id) => !idsP.has(id))) mais.open = true;
}
function desenharBarbeiros() {
  const lista = $('[data-lista-barbeiros]', raiz);
  const opts = [{ nome: 'Qualquer barbeiro' } as { nome: string; foto?: string }, ...D.barbeiros];
  lista.innerHTML = opts
    .map((b) => {
      const foto = b.foto ? `<img src="${esc(b.foto)}" alt="" width="44" height="44" loading="lazy" decoding="async">` : '';
      return `<label class="opc"><input type="radio" name="barbeiro" value="${esc(b.nome)}" ${b.nome === barbeiro ? 'checked' : ''}><span>${foto}<em>${esc(b.nome)}</em></span></label>`;
    })
    .join('');
}
function desenharDias() {
  const el = $('[data-lista-dias]', raiz);
  if (!el) return;
  el.innerHTML = dias
    .map((d) => `<label class="opc dia"><input type="radio" name="dia" value="${iso(d)}" ${iso(d) === dia ? 'checked' : ''}><span><small>${nomeDia(d)}</small><b>${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}</b></span></label>`)
    .join('');
}
function desenharHoras() {
  const lista = $('[data-lista-horas]', raiz);
  if (!lista) return;
  const nota = $('[data-nota-hora]', raiz);
  const alvo = dias.find((d) => iso(d) === dia);
  if (!alvo) {
    lista.innerHTML = '';
    nota.textContent = 'Escolha o dia para ver os horários.';
    return;
  }
  const h = horarioDo(alvo)!;
  const [ha, ma] = h.abre.split(':').map(Number);
  const [hf, mf] = h.fecha.split(':').map(Number);
  const limite = Date.now() + 30 * 60000;
  const slots: string[] = [];
  for (let m = ha * 60 + ma; m <= hf * 60 + mf - 30; m += 30) {
    const t = new Date(alvo);
    t.setHours(Math.floor(m / 60), m % 60, 0, 0);
    if (t.getTime() > limite) slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  lista.innerHTML = slots.map((t) => `<label class="opc hr"><input type="radio" name="hora" value="${t}" ${t === hora ? 'checked' : ''}><span>${t}</span></label>`).join('');
  nota.textContent = slots.length ? 'A barbearia confirma o horário pelo WhatsApp.' : 'Sem horários restantes neste dia. Escolha outro dia.';
}
const diaTxt = () => {
  const d = dias.find((x) => iso(x) === dia);
  return d ? d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }) : '';
};
const escolhidos = () => [...sel].map((id) => todos.find((t) => t.id === id)!);
const total = () => escolhidos().reduce((s, t) => s + (t.preco ?? 0), 0);
const temSemPreco = () => escolhidos().some((t) => t.preco == null);
const totalTxt = () => {
  const itens = escolhidos();
  if (!itens.length) return 'R$ 0';
  if (itens.every((t) => t.preco == null)) return 'a confirmar';
  return temSemPreco() ? `${brl(total())} + a confirmar` : brl(total());
};

function mensagem() {
  const nome = ($('#nome-cliente') as HTMLInputElement).value.trim();
  const linhas = [`Olá, ${D.nome}! Quero agendar:`, ''];
  escolhidos().forEach((s) => linhas.push(`• ${s.nome}${s.preco == null ? '' : ` (${brl(s.preco)})`}`));
  linhas.push('', `Total: ${totalTxt()}`, `Barbeiro: ${barbeiro}`);
  if (temHorarios) linhas.push(`Dia: ${diaTxt()}`, `Horário: ${hora}`);
  else linhas.push('Horário: a combinar pelo WhatsApp');
  if (nome) linhas.push(`Meu nome: ${nome}`);
  return linhas.join('\n');
}

function atualizar() {
  const n = sel.size;
  const falta = [!n && 'um serviço', temHorarios && !dia && 'o dia', temHorarios && dia && !hora && 'o horário'].filter(Boolean) as string[];
  const semZap = !D.whatsapp;
  const pronto = falta.length === 0 && !semZap;
  const quando = temHorarios ? `${dia ? ` · ${diaTxt()}` : ''}${hora ? ` às ${hora}` : ''}` : '';
  $('[data-res]', raiz).textContent = n ? `${n} ${n > 1 ? 'serviços' : 'serviço'}${barbeiro !== 'Qualquer barbeiro' ? ` · ${barbeiro.split(' ')[0]}` : ''}${quando}` : 'Escolha ao menos um serviço';
  $('[data-total]', raiz).textContent = totalTxt();
  const enviar = $('[data-enviar]', raiz) as HTMLAnchorElement;
  enviar.setAttribute('aria-disabled', String(!pronto));
  enviar.textContent = semZap ? 'WhatsApp a definir' : 'Enviar pelo WhatsApp';
  enviar.href = pronto ? `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(mensagem())}` : '#';
  $('[data-falta]', raiz).textContent = semZap
    ? 'O número do WhatsApp da barbearia ainda será definido.'
    : pronto
      ? 'Você vai para o WhatsApp da barbearia com o pedido pronto. Eles confirmam o horário.'
      : `Falta escolher: ${falta.join(' e ')}.`;
}

raiz.addEventListener('change', (e) => {
  const t = e.target as HTMLInputElement;
  if (t.type === 'checkbox') {
    if (t.checked) sel.add(t.value);
    else sel.delete(t.value);
  } else if (t.name === 'barbeiro') barbeiro = t.value;
  else if (t.name === 'dia') {
    dia = t.value;
    hora = '';
    desenharHoras();
  } else if (t.name === 'hora') hora = t.value;
  atualizar();
});
raiz.addEventListener('input', (e) => {
  if ((e.target as HTMLElement).id === 'nome-cliente') atualizar();
});
$('[data-enviar]', raiz).addEventListener('click', (e) => {
  if ((e.currentTarget as HTMLElement).getAttribute('aria-disabled') === 'true') e.preventDefault();
});

const irParaAgenda = () => document.getElementById('agendar')!.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });

/* tabela de preços: tocar num serviço adiciona ao pedido e leva à agenda */
$$('[data-add]').forEach((b) =>
  b.addEventListener('click', () => {
    garantir();
    sel.add(b.dataset.add!);
    desenharServicos();
    atualizar();
    b.classList.add('add');
    setTimeout(() => b.classList.remove('add'), 900);
    irParaAgenda();
  }),
);

/* cartão da equipe: "Agendar com ele" escolhe o barbeiro e leva à agenda */
$$('[data-barbeiro]').forEach((b) =>
  b.addEventListener('click', () => {
    garantir();
    barbeiro = b.dataset.barbeiro!;
    desenharBarbeiros();
    atualizar();
    irParaAgenda();
  }),
);

/* monta o agendamento fora do caminho crítico: quando o navegador estiver ocioso ou a seção se aproximar */
let montado = false;
function garantir() {
  if (montado) return;
  montado = true;
  desenharServicos();
  desenharBarbeiros();
  desenharDias();
  desenharHoras();
  atualizar();
}
const ocioso = (window as any).requestIdleCallback as undefined | ((f: () => void, o?: object) => void);
if (ocioso) ocioso(garantir, { timeout: 2500 });
else setTimeout(garantir, 1200);
if ('IntersectionObserver' in window) {
  const ioA = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { garantir(); ioA.disconnect(); } }, { rootMargin: '800px 0px' });
  ioA.observe(raiz);
}
