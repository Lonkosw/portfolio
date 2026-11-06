const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const D = JSON.parse($('#dados').textContent || '{}') as {
  nome: string; whatsapp: string; barbeiros: string[];
  horarios: { dias: string; weekdays: number[]; abre: string; fecha: string }[];
  servicos: { grupo: string; itens: { id: string; nome: string; preco: number }[] }[];
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
tick();

/* agendamento: o cliente monta o pedido e envia pelo WhatsApp; a barbearia confirma o horário */
const sel = new Set<string>();
let barbeiro = 'Qualquer barbeiro';
let dia = '';
let hora = '';
let passo = 0;
const raiz = $('[data-agenda]');
const abertos = new Set(D.horarios.flatMap((h) => h.weekdays));
const horarioDo = (d: Date) => D.horarios.find((h) => h.weekdays.includes(d.getDay()));
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dias: Date[] = [];
for (let i = 0; dias.length < 10 && i < 21; i++) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + i);
  if (abertos.has(d.getDay())) dias.push(d);
}
const nomeDia = (d: Date) => (iso(d) === iso(new Date()) ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''));

function desenharServicos() {
  $('[data-lista-servicos]', raiz).innerHTML = D.servicos
    .map(
      (g) =>
        `<fieldset class="g-srv"><legend>${esc(g.grupo)}</legend>${g.itens
          .map(
            (s) =>
              `<label class="chk"><input type="checkbox" value="${s.id}" ${sel.has(s.id) ? 'checked' : ''}><span class="cx"></span><span class="nm">${esc(s.nome)}</span><span class="pr">${brl(s.preco)}</span></label>`,
          )
          .join('')}</fieldset>`,
    )
    .join('');
}
function desenharBarbeiros() {
  const opts = ['Qualquer barbeiro', ...D.barbeiros];
  $('[data-lista-barbeiros]', raiz).innerHTML = opts
    .map((b) => `<label class="opc"><input type="radio" name="barbeiro" value="${esc(b)}" ${b === barbeiro ? 'checked' : ''}><span>${esc(b)}</span></label>`)
    .join('');
}
function desenharDias() {
  $('[data-lista-dias]', raiz).innerHTML = dias
    .map(
      (d) =>
        `<label class="opc dia"><input type="radio" name="dia" value="${iso(d)}" ${iso(d) === dia ? 'checked' : ''}><span><small>${nomeDia(d)}</small><b>${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}</b></span></label>`,
    )
    .join('');
}
function desenharHoras() {
  const alvo = dias.find((d) => iso(d) === dia);
  const lista = $('[data-lista-horas]', raiz);
  const nota = $('[data-nota-hora]', raiz);
  if (!alvo) {
    lista.innerHTML = '';
    nota.textContent = 'Escolha o dia primeiro.';
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
  lista.innerHTML = slots
    .map((t) => `<label class="opc hr"><input type="radio" name="hora" value="${t}" ${t === hora ? 'checked' : ''}><span>${t}</span></label>`)
    .join('');
  nota.textContent = slots.length ? 'O horário é confirmado pela barbearia pelo WhatsApp.' : 'Sem horários restantes neste dia. Escolha outro dia.';
}
const diaTxt = () => {
  const d = dias.find((x) => iso(x) === dia);
  return d ? d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }) : '';
};
const total = () => [...sel].reduce((s, id) => s + (todos.find((t) => t.id === id)?.preco || 0), 0);

function mensagem() {
  const nome = ($('#nome-cliente') as HTMLInputElement).value.trim();
  const itens = [...sel].map((id) => todos.find((t) => t.id === id)!).map((s) => `• ${s.nome} (${brl(s.preco)})`);
  const linhas = [`Olá, ${D.nome}! Quero agendar:`, '', ...itens, '', `Total: ${brl(total())}`, `Barbeiro: ${barbeiro}`, `Dia: ${diaTxt()}`, `Horário: ${hora}`];
  if (nome) linhas.push(`Meu nome: ${nome}`);
  return linhas.join('\n');
}

function resumo() {
  const ul = $('[data-resumo-itens]', raiz);
  const itens = [...sel].map((id) => todos.find((t) => t.id === id)!);
  let html = itens.length ? itens.map((s) => `<li><span>${esc(s.nome)}</span><b>${brl(s.preco)}</b></li>`).join('') : '<li class="vazio">Escolha ao menos um serviço.</li>';
  if (itens.length && passo >= 1) html += `<li class="det"><span>Barbeiro</span><b>${esc(barbeiro)}</b></li>`;
  if (dia) html += `<li class="det"><span>Dia</span><b>${esc(diaTxt())}</b></li>`;
  if (hora) html += `<li class="det"><span>Horário</span><b>${hora}</b></li>`;
  ul.innerHTML = html;
  $('[data-total]', raiz).textContent = brl(total());
}

const validar = () => (passo === 0 ? sel.size > 0 : passo === 1 ? !!barbeiro : passo === 2 ? !!dia : passo === 3 ? !!hora : true);

function mostrar() {
  $$('[data-painel]', raiz).forEach((p) => (p.hidden = Number(p.dataset.painel) !== passo));
  $$('[data-passos] li', raiz).forEach((li) => {
    const n = Number(li.dataset.p);
    li.classList.toggle('on', n === passo);
    li.classList.toggle('ok', n < passo);
  });
  const ultimo = passo === 4;
  ($('[data-voltar]', raiz) as HTMLElement).hidden = passo === 0;
  const seguir = $('[data-seguir]', raiz) as HTMLButtonElement;
  seguir.hidden = ultimo;
  seguir.disabled = !validar();
  const enviar = $('[data-enviar]', raiz) as HTMLAnchorElement;
  enviar.hidden = !ultimo;
  if (ultimo) enviar.href = `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(mensagem())}`;
  if (passo === 3) desenharHoras();
  resumo();
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
  } else if (t.name === 'hora') hora = t.value;
  mostrar();
});
raiz.addEventListener('input', (e) => {
  if ((e.target as HTMLElement).id === 'nome-cliente') mostrar();
});
$('[data-seguir]', raiz).addEventListener('click', () => {
  if (validar()) {
    passo++;
    mostrar();
  }
});
$('[data-voltar]', raiz).addEventListener('click', () => {
  passo--;
  mostrar();
});

/* tabela de preços: tocar num serviço adiciona ao pedido e leva à agenda */
$$('[data-add]').forEach((b) =>
  b.addEventListener('click', () => {
    sel.add(b.dataset.add!);
    desenharServicos();
    passo = 0;
    mostrar();
    b.classList.add('add');
    setTimeout(() => b.classList.remove('add'), 900);
    document.getElementById('agendar')!.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }),
);

desenharServicos();
desenharBarbeiros();
desenharDias();
mostrar();
