const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
type Servico = { id: string; nome: string; preco: number; principal?: boolean };
const D = JSON.parse($('#dados').textContent || '{}') as {
  nome: string; whatsapp: string; barbeiros: string[];
  horarios: { dias: string; weekdays: number[]; abre: string; fecha: string }[];
  servicos: { grupo: string; itens: Servico[] }[];
};
const brl = (n: number) => `R$ ${n.toLocaleString('pt-BR')}`;
const todos = D.servicos.flatMap((g) => g.itens);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

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
for (let i = 0; dias.length < 7 && i < 14; i++) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + i);
  if (abertos.has(d.getDay())) dias.push(d);
}
const nomeDia = (d: Date) => (iso(d) === iso(new Date()) ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''));
const chip = (s: Servico) =>
  `<label class="chip"><input type="checkbox" value="${s.id}" ${sel.has(s.id) ? 'checked' : ''}><span>${esc(s.nome)} <b>${brl(s.preco)}</b></span></label>`;

function desenharServicos() {
  const principais = todos.filter((s) => s.principal);
  const idsP = new Set(principais.map((s) => s.id));
  $('[data-lista-principais]', raiz).innerHTML = principais.map(chip).join('');
  $('[data-lista-outros]', raiz).innerHTML = D.servicos
    .map((g) => ({ g: g.grupo, itens: g.itens.filter((s) => !idsP.has(s.id)) }))
    .filter((x) => x.itens.length)
    .map((x) => `<fieldset class="g-srv"><legend>${esc(x.g)}</legend><div class="chips">${x.itens.map(chip).join('')}</div></fieldset>`)
    .join('');
  if ([...sel].some((id) => !idsP.has(id))) ($('details.mais', raiz) as HTMLDetailsElement).open = true;
}
function desenharBarbeiros() {
  $('[data-lista-barbeiros]', raiz).innerHTML = ['Qualquer barbeiro', ...D.barbeiros]
    .map((b) => `<label class="opc"><input type="radio" name="barbeiro" value="${esc(b)}" ${b === barbeiro ? 'checked' : ''}><span>${esc(b)}</span></label>`)
    .join('');
}
function desenharDias() {
  $('[data-lista-dias]', raiz).innerHTML = dias
    .map((d) => `<label class="opc dia"><input type="radio" name="dia" value="${iso(d)}" ${iso(d) === dia ? 'checked' : ''}><span><small>${nomeDia(d)}</small><b>${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}</b></span></label>`)
    .join('');
}
function desenharHoras() {
  const alvo = dias.find((d) => iso(d) === dia);
  const lista = $('[data-lista-horas]', raiz);
  const nota = $('[data-nota-hora]', raiz);
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
const total = () => escolhidos().reduce((s, t) => s + t.preco, 0);

function mensagem() {
  const nome = ($('#nome-cliente') as HTMLInputElement).value.trim();
  const linhas = [`Olá, ${D.nome}! Quero agendar:`, '', ...escolhidos().map((s) => `• ${s.nome} (${brl(s.preco)})`), '', `Total: ${brl(total())}`, `Barbeiro: ${barbeiro}`, `Dia: ${diaTxt()}`, `Horário: ${hora}`];
  if (nome) linhas.push(`Meu nome: ${nome}`);
  return linhas.join('\n');
}

function atualizar() {
  const n = sel.size;
  const falta = [!n && 'um serviço', !dia && 'o dia', dia && !hora && 'o horário'].filter(Boolean) as string[];
  const pronto = falta.length === 0;
  $('[data-res]', raiz).textContent = n ? `${n} ${n > 1 ? 'serviços' : 'serviço'}${dia ? ` · ${diaTxt()}` : ''}${hora ? ` às ${hora}` : ''}` : 'Escolha ao menos um serviço';
  $('[data-total]', raiz).textContent = brl(total());
  const enviar = $('[data-enviar]', raiz) as HTMLAnchorElement;
  enviar.setAttribute('aria-disabled', String(!pronto));
  enviar.href = pronto ? `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(mensagem())}` : '#';
  $('[data-falta]', raiz).textContent = pronto ? 'Você vai para o WhatsApp da barbearia com o pedido pronto. Eles confirmam o horário.' : `Falta escolher: ${falta.join(' e ')}.`;
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

/* tabela de preços: tocar num serviço adiciona ao pedido e leva à agenda */
$$('[data-add]').forEach((b) =>
  b.addEventListener('click', () => {
    garantir();
    sel.add(b.dataset.add!);
    desenharServicos();
    atualizar();
    b.classList.add('add');
    setTimeout(() => b.classList.remove('add'), 900);
    document.getElementById('agendar')!.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
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
