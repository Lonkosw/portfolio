/**
 * Teste ponta a ponta das três ferramentas: diagnóstico capilar, monte seu
 * dia da noiva e agendamento guiado.
 *
 * Roda o roteiro inteiro DUAS vezes — animação normal e
 * --force-prefers-reduced-motion. As ferramentas são inicializadas fora do
 * init() do motion.ts justamente para continuar valendo no segundo caso; se
 * alguém mover essa chamada para dentro, este teste quebra.
 *
 *   node sites/studio-priorize/scripts/test-ferramentas.mjs http://127.0.0.1:4322/
 */
import { spawn } from 'node:child_process';

const url = process.argv[2] ?? 'http://127.0.0.1:4322/';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sessao({ reducedMotion }) {
  const PORT = 9500 + Math.floor(Math.random() * 400);
  const flags = [
    '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-sp-${PORT}`, 'about:blank',
  ];
  if (reducedMotion) flags.splice(4, 0, '--force-prefers-reduced-motion');
  const edge = spawn(EDGE, flags, { stdio: 'ignore' });

  let wsUrl;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try {
      wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl;
    } catch { /* subindo */ }
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

/** Marca um input escondido (sr-only) e dispara o evento como faria um toque. */
const marcar = (sel, i = 0) => `(() => {
  const el = document.querySelectorAll('${sel}')[${i}];
  el.checked = true;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return el.value;
})()`;

const msgDe = (sel) => `(() => {
  const a = document.querySelector('${sel}');
  return decodeURIComponent((a.href.split('text=')[1] || ''));
})()`;

async function roteiro({ reducedMotion }) {
  const { ev, ir, fim } = await sessao({ reducedMotion });
  const r = [];
  const ok = (n, c, extra = '') => r.push([Boolean(c), `${n}${extra ? '  → ' + extra : ''}`]);

  await ir();
  await ev(`localStorage.clear(); true`);
  await ir();

  ok('prefers-reduced-motion no estado esperado',
    (await ev(`matchMedia('(prefers-reduced-motion: reduce)').matches`)) === reducedMotion);
  ok('conteúdo nunca fica invisível',
    (await ev(`document.documentElement.classList.contains('js-anim')`)) !== reducedMotion);

  /* ── 1. DIAGNÓSTICO ────────────────────────────────────────────────── */
  ok('diagnóstico começa em 0 de 3',
    (await ev(`document.querySelector('[data-diag-progresso]').textContent.trim()`)) === '0 de 3');
  ok('resultado começa escondido',
    (await ev(`document.querySelector('[data-diag-resultado]').hidden`)) === true);

  await ev(marcar('[data-diag-campo="tipo"]', 2));           // Cacheado
  await sleep(120);
  ok('progresso anda com a 1ª resposta',
    (await ev(`document.querySelector('[data-diag-progresso]').textContent.trim()`)) === '1 de 3');
  ok('resultado continua escondido com respostas parciais',
    (await ev(`document.querySelector('[data-diag-resultado]').hidden`)) === true);

  await ev(marcar('[data-diag-campo="quimica"]', 2));        // Já descolori
  await ev(marcar('[data-diag-campo="objetivo"]', 0));       // Clarear ou ficar loira
  await sleep(250);

  ok('resultado aparece com as 3 respostas',
    (await ev(`document.querySelector('[data-diag-resultado]').hidden`)) === false);
  ok('encaminhamento certo para "clarear"',
    (await ev(`document.querySelector('[data-diag-res-titulo]').textContent`)) ===
      'Avaliação para clareamento',
    String(await ev(`document.querySelector('[data-diag-res-titulo]').textContent`)));

  const msgDiag = String(await ev(msgDe('[data-diag-cta]')));
  ok('mensagem do diagnóstico traz as três respostas',
    msgDiag.includes('Cabelo: cacheado') &&
    msgDiag.includes('Química: já descolori') &&
    msgDiag.includes('Quero: clarear'),
    msgDiag.split('\n').filter(Boolean).slice(1, 4).join(' | '));
  ok('diagnóstico aponta para o WhatsApp certo',
    String(await ev(`document.querySelector('[data-diag-cta]').href`)).includes('wa.me/5544991527386'));

  /* ── 2. DIA DA NOIVA ───────────────────────────────────────────────── */
  ok('total começa em 1 (a própria noiva)',
    (await ev(`document.querySelector('[data-noiva-total]').textContent.trim()`)) === '1');

  await ev(marcar('[data-noiva-servico]', 0));  // Cabelo da noiva
  await ev(marcar('[data-noiva-servico]', 1));  // Maquiagem da noiva
  await sleep(120);

  // 3 madrinhas, 2 mães
  await ev(`for (let i=0;i<3;i++) document.querySelector('[data-noiva-grupo="madrinhas"] [data-noiva-mais]').click()`);
  await ev(`for (let i=0;i<2;i++) document.querySelector('[data-noiva-grupo="maes"] [data-noiva-mais]').click()`);
  await sleep(200);
  ok('total soma noiva + acompanhantes',
    (await ev(`document.querySelector('[data-noiva-total]').textContent.trim()`)) === '6',
    String(await ev(`document.querySelector('[data-noiva-total]').textContent.trim()`)));

  // não desce de zero
  await ev(`for (let i=0;i<6;i++) document.querySelector('[data-noiva-grupo="maes"] [data-noiva-menos]').click()`);
  await sleep(200);
  ok('contador não fica negativo',
    (await ev(`document.querySelector('[data-noiva-grupo="maes"] [data-noiva-valor]').textContent.trim()`)) === '0');
  await ev(`for (let i=0;i<2;i++) document.querySelector('[data-noiva-grupo="maes"] [data-noiva-mais]').click()`);
  await sleep(150);

  // teto por grupo
  await ev(`for (let i=0;i<30;i++) document.querySelector('[data-noiva-grupo="madrinhas"] [data-noiva-mais]').click()`);
  await sleep(250);
  ok('contador respeita o teto do grupo',
    (await ev(`document.querySelector('[data-noiva-grupo="madrinhas"] [data-noiva-valor]').textContent.trim()`)) === '12');
  await ev(`for (let i=0;i<9;i++) document.querySelector('[data-noiva-grupo="madrinhas"] [data-noiva-menos]').click()`);
  await sleep(200);

  ok('seletor de mês é <select>, não input[type=month]',
    (await ev(`document.querySelector('[data-noiva-mes]').tagName`)) === 'SELECT');

  await ev(`(() => { const s = document.querySelector('[data-noiva-mes]');
    s.value = '10'; s.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  const anoNoiva = await ev(`(() => { const s = document.querySelector('[data-noiva-ano]');
    s.value = s.options[1].value; s.dispatchEvent(new Event('change',{bubbles:true})); return s.value; })()`);
  await sleep(150);
  ok('lista de anos começa no ano corrente',
    Number(anoNoiva) === new Date().getFullYear(), String(anoNoiva));

  await ev(marcar('[data-noiva-cerimonia]', 3)); // Noite
  await sleep(200);

  const msgNoiva = String(await ev(msgDe('[data-noiva-cta]')));
  ok('mensagem da noiva lista os serviços',
    msgNoiva.includes('Para mim: cabelo da noiva e maquiagem da noiva'),
    msgNoiva.match(/Para mim: .*/)?.[0] ?? '(ausente)');
  ok('mensagem da noiva lista os acompanhantes',
    msgNoiva.includes('3 madrinhas') && msgNoiva.includes('2 mães'),
    msgNoiva.match(/Comigo v.o: .*/)?.[0] ?? '(ausente)');
  ok('mensagem da noiva traz o total',
    msgNoiva.includes('Total de pessoas: 6'));
  ok('mês por extenso, sem virar setembro (fuso)',
    msgNoiva.includes(`Casamento em: outubro de ${anoNoiva}`),
    msgNoiva.match(/Casamento em: .*/)?.[0] ?? '(ausente)');
  ok('mensagem da noiva traz o horário da cerimônia',
    msgNoiva.includes('Cerimônia: noite'));

  /* ── 3. AGENDAMENTO ────────────────────────────────────────────────── */
  ok('prévia do agendamento começa vazia',
    (await ev(`document.querySelector('[data-agenda-previa]').textContent.trim().length`)) === 0);

  await ev(`(() => { const s = document.querySelector('[data-agenda-servico]');
    s.value = 'Mechas e coloração'; s.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await ev(marcar('[data-agenda-dia]', 5));      // Sábado
  await ev(marcar('[data-agenda-periodo]', 0));  // Manhã
  await sleep(250);

  const msgAgenda = String(await ev(msgDe('[data-agenda-cta]')));
  ok('mensagem de agendamento completa',
    msgAgenda.includes('Serviço: Mechas e coloração') &&
    msgAgenda.includes('Dia que prefiro: sábado') &&
    msgAgenda.includes('Período: manhã'),
    msgAgenda.split('\n').filter(Boolean).slice(1, 4).join(' | '));
  ok('prévia mostra o que será enviado',
    (await ev(`document.querySelector('[data-agenda-previa]').textContent.includes('Serviço: Mechas e coloração')`)));
  ok('CTA do cabeçalho também carrega o agendamento',
    await ev(`[...document.querySelectorAll('[data-agenda-cta]')].every(a => a.href.includes('Mechas'))`));

  /* ── PERSISTÊNCIA E LIMPEZA ────────────────────────────────────────── */
  await ir();
  ok('diagnóstico persiste após recarregar',
    (await ev(`document.querySelector('[data-diag-progresso]').textContent.trim()`)) === '3 de 3');
  ok('dia da noiva persiste após recarregar',
    (await ev(`document.querySelector('[data-noiva-total]').textContent.trim()`)) === '6');
  ok('agendamento persiste após recarregar',
    (await ev(`document.querySelector('[data-agenda-servico]').value`)) === 'Mechas e coloração');

  await ev(`document.querySelector('[data-diag-limpar]').click()`);
  await ev(`document.querySelector('[data-noiva-limpar]').click()`);
  await ev(`document.querySelector('[data-agenda-limpar]').click()`);
  await sleep(300);

  ok('limpar zera o diagnóstico',
    (await ev(`document.querySelector('[data-diag-progresso]').textContent.trim()`)) === '0 de 3' &&
    (await ev(`document.querySelector('[data-diag-resultado]').hidden`)) === true);
  ok('limpar zera o dia da noiva',
    (await ev(`document.querySelector('[data-noiva-total]').textContent.trim()`)) === '1');
  ok('limpar zera o agendamento',
    (await ev(`document.querySelector('[data-agenda-servico]').value`)) === '');
  ok('limpar apaga as três chaves do localStorage',
    await ev(`['priorize:diagnostico:v1','priorize:noiva:v1','priorize:agenda:v1']
      .every(k => localStorage.getItem(k) === null)`));

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
