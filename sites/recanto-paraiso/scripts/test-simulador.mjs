/**
 * Teste ponta a ponta do simulador "Monte seu evento".
 *
 * Roda DUAS vezes o mesmo roteiro: uma com animação normal e outra com
 * --force-prefers-reduced-motion. O simulador é chamado fora do init() do
 * motion.ts justamente para continuar valendo no segundo caso — se alguém
 * mover essa chamada para dentro, este teste quebra.
 *
 *   node sites/recanto-paraiso/scripts/test-simulador.mjs http://127.0.0.1:4321/
 */
import { spawn } from 'node:child_process';

const url = process.argv[2] ?? 'http://127.0.0.1:4321/';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sessao({ reducedMotion }) {
  const PORT = 9600 + Math.floor(Math.random() * 300);
  const flags = [
    '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-sim-${PORT}`, 'about:blank',
  ];
  if (reducedMotion) flags.splice(4, 0, '--force-prefers-reduced-motion');
  const edge = spawn(EDGE, flags, { stdio: 'ignore' });

  let wsUrl;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      wsUrl = j.webSocketDebuggerUrl;
    } catch { /* ainda subindo */ }
    if (!wsUrl) await sleep(250);
  }
  if (!wsUrl) throw new Error('Edge não subiu');

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => ((ws.onopen = res), (ws.onerror = rej)));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? {}); pending.delete(m.id); }
  };
  const send = (method, params = {}, sessionId) => new Promise((res) => {
    const n = ++id; pending.set(n, res);
    ws.send(JSON.stringify({ id: n, method, params, sessionId }));
  });

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Emulation.setDeviceMetricsOverride',
    { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, sessionId);

  const ev = async (expression) =>
    (await send('Runtime.evaluate', { expression, returnByValue: true }, sessionId)).result?.value;

  const ir = async () => { await send('Page.navigate', { url }, sessionId); await sleep(2200); };

  return { ev, ir, fim: () => { ws.close(); edge.kill(); } };
}

/** Dispara o evento que os listeners escutam, como faria um toque real. */
const disparar = (sel, tipo = 'change') =>
  `document.querySelector('${sel}').dispatchEvent(new Event('${tipo}', { bubbles: true }))`;

async function roteiro({ reducedMotion }) {
  const { ev, ir, fim } = await sessao({ reducedMotion });
  const r = [];
  const ok = (n, c, extra = '') => r.push([Boolean(c), `${n}${extra ? '  → ' + extra : ''}`]);

  await ir();

  ok('prefers-reduced-motion no estado esperado',
    (await ev(`matchMedia('(prefers-reduced-motion: reduce)').matches`)) === reducedMotion);
  ok('conteúdo nunca fica invisível',
    (await ev(`document.documentElement.classList.contains('js-anim')`)) !== reducedMotion);

  // Estado limpo antes de começar
  await ev(`localStorage.removeItem('recanto:orcamento:v1'); true`);
  await ir();

  ok('barra flutuante começa escondida',
    !(await ev(`document.querySelector('[data-orc-pill]').classList.contains('is-visivel')`)));

  // 1. tipo de evento
  await ev(`document.querySelector('[data-orc-tipo]').value = 'Casamento'`);
  await ev(disparar('[data-orc-tipo]'));
  await sleep(150);
  ok('barra aparece após a primeira escolha',
    await ev(`document.querySelector('[data-orc-pill]').classList.contains('is-visivel')`));

  // 2. convidados pelo botão +
  const antes = Number(await ev(`document.querySelector('[data-orc-convidados]').value`));
  await ev(`document.querySelector('[data-orc-mais]').click()`);
  await sleep(120);
  const depois = Number(await ev(`document.querySelector('[data-orc-convidados]').value`));
  ok('botão + soma 10 convidados', depois === antes + 10, `${antes} → ${depois}`);

  // teto respeitado (o salão comporta 160)
  await ev(`for (let i=0;i<40;i++) document.querySelector('[data-orc-mais]').click()`);
  await sleep(200);
  const teto = Number(await ev(`document.querySelector('[data-orc-convidados]').value`));
  ok('não passa do teto de 160', teto === 160, String(teto));

  // volta para um número realista
  await ev(`for (let i=0;i<4;i++) document.querySelector('[data-orc-menos]').click()`);
  await sleep(150);

  // 3. mês e ano (dois <select>, porque o iOS não implementa type=month)
  ok('seletor de mês é <select>, não input[type=month]',
    (await ev(`document.querySelector('[data-orc-mes]').tagName`)) === 'SELECT');

  await ev(`document.querySelector('[data-orc-mes]').value = '10'`);
  await ev(disparar('[data-orc-mes]'));
  await sleep(120);

  // só o mês preenchido já tem de aparecer na mensagem
  const soMes = decodeURIComponent(
    String(await ev(`document.querySelector('[data-orc] [data-wa-cta]').href`)).split('text=')[1] ?? '');
  ok('mês sozinho já entra na mensagem', soMes.includes('Data pretendida: outubro'),
    soMes.match(/Data pretendida: .*/)?.[0] ?? '(ausente)');

  // Pega a primeira opção real de ano (a lista é gerada no build).
  const anoEscolhido = await ev(`(() => {
    const s = document.querySelector('[data-orc-ano]');
    s.value = s.options[1].value;
    return s.value;
  })()`);
  await ev(disparar('[data-orc-ano]'));
  await sleep(120);
  ok('lista de anos começa no ano corrente',
    Number(anoEscolhido) === new Date().getFullYear(), String(anoEscolhido));

  // 4. período
  await ev(`document.querySelectorAll('[data-orc-periodo]')[1].checked = true`);
  await ev(`document.querySelectorAll('[data-orc-periodo]')[1].dispatchEvent(new Event('change',{bubbles:true}))`);
  await sleep(120);

  // 5. itens já fechados
  await ev(`document.querySelectorAll('[data-orc-tenho]')[0].checked = true`);
  await ev(`document.querySelectorAll('[data-orc-tenho]')[0].dispatchEvent(new Event('change',{bubbles:true}))`);
  await ev(`document.querySelectorAll('[data-orc-tenho]')[1].checked = true`);
  await ev(`document.querySelectorAll('[data-orc-tenho]')[1].dispatchEvent(new Event('change',{bubbles:true}))`);
  await sleep(200);

  const href = String(await ev(`document.querySelector('[data-orc] [data-wa-cta]').href`));
  const msg = decodeURIComponent(href.split('text=')[1] ?? '');

  ok('link aponta para o WhatsApp certo', href.includes('wa.me/5544998144914'));
  ok('mensagem traz o tipo de evento', msg.includes('Evento: Casamento'));
  ok('mensagem traz os convidados', /Convidados: \d+/.test(msg));
  ok('mês sai por extenso e sem virar setembro (fuso)',
    msg.includes(`Data pretendida: outubro de ${anoEscolhido}`),
    msg.match(/Data pretendida: .*/)?.[0] ?? '(ausente)');
  ok('mensagem traz o período', msg.includes('Período: noturno'));
  ok('mensagem lista o que já está fechado',
    msg.includes('Já tenho: buffet e decoração'),
    msg.match(/Já tenho: .*/)?.[0] ?? '(ausente)');

  ok('todos os CTAs de WhatsApp carregam o pedido',
    await ev(`[...document.querySelectorAll('[data-wa-cta]')].every(a => a.href.includes('Evento'))`));

  ok('resumo da barra flutuante preenchido',
    (await ev(`document.querySelector('[data-orc-pill-texto]').textContent.trim().length`)) > 0,
    String(await ev(`document.querySelector('[data-orc-pill-texto]').textContent.trim()`)));

  // 6. persistência: recarregar tem de manter tudo
  await ir();
  ok('persiste após recarregar a página',
    (await ev(`document.querySelector('[data-orc-tipo]').value`)) === 'Casamento');
  ok('barra continua visível após recarregar',
    await ev(`document.querySelector('[data-orc-pill]').classList.contains('is-visivel')`));

  // 7. limpar
  await ev(`document.querySelector('[data-orc-limpar]').click()`);
  await sleep(250);
  ok('limpar zera o formulário',
    (await ev(`document.querySelector('[data-orc-tipo]').value`)) === '');
  ok('limpar esconde a barra flutuante',
    !(await ev(`document.querySelector('[data-orc-pill]').classList.contains('is-visivel')`)));
  ok('limpar apaga o localStorage',
    (await ev(`localStorage.getItem('recanto:orcamento:v1') === null`)) === true);

  fim();
  return r;
}

const blocos = [
  ['animação normal', await roteiro({ reducedMotion: false })],
  ['prefers-reduced-motion', await roteiro({ reducedMotion: true })],
];

let falhas = 0;
for (const [nome, res] of blocos) {
  console.log(`\n=== ${nome} ===`);
  for (const [passou, texto] of res) {
    if (!passou) falhas++;
    console.log(`${passou ? 'PASS ' : 'FALHA'}  ${texto}`);
  }
  console.log(`${res.filter(([p]) => p).length}/${res.length} ok`);
}

console.log(`\n${falhas === 0 ? 'TUDO OK' : falhas + ' falha(s)'}`);
process.exit(falhas ? 1 : 0);
