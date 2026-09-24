/**
 * Teste do bloco de vídeo do salão.
 *
 * Roda DUAS vezes: animação normal e --force-prefers-reduced-motion. O que
 * está sendo protegido em cada modo é diferente:
 *
 *   normal   — o vídeo carrega e começa a tocar sozinho quando a seção entra
 *              na tela, e para quando sai (vídeo tocando escondido gasta
 *              bateria e dados sem entregar nada);
 *   calmo    — o vídeo NÃO começa sozinho, e mesmo assim o bloco continua
 *              inteiro: pôster na tela, botão em "tocar", nada invisível.
 *
 * Também confere o que é fácil de quebrar sem perceber: que o arquivo não é
 * baixado antes de o visitante chegar perto (`preload="none"` + play tardio),
 * que o botão troca de rótulo, e que o `<video>` reserva a própria caixa.
 *
 *   node sites/recanto-paraiso/scripts/test-video.mjs http://127.0.0.1:4321/
 */
import { spawn } from 'node:child_process';

const url = process.argv[2] ?? 'http://127.0.0.1:4321/';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sessao({ reducedMotion }) {
  const PORT = 9700 + Math.floor(Math.random() * 300);
  const flags = [
    '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
    // Sem isto o Edge headless recusa o autoplay e o teste acusa um defeito
    // que não existe no navegador de verdade.
    '--autoplay-policy=no-user-gesture-required',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-video-${PORT}`, 'about:blank',
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
  const pedidos = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? {}); pending.delete(m.id); }
    if (m.method === 'Network.requestWillBeSent') pedidos.push(m.params.request.url);
  };
  const send = (method, params = {}, sessionId) => new Promise((res) => {
    const n = ++id; pending.set(n, res);
    ws.send(JSON.stringify({ id: n, method, params, sessionId }));
  });

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Network.enable', {}, sessionId);
  await send('Emulation.setDeviceMetricsOverride',
    { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, sessionId);

  const ev = async (expression) =>
    (await send('Runtime.evaluate', { expression, returnByValue: true }, sessionId)).result?.value;

  await send('Page.navigate', { url }, sessionId);
  await sleep(2200);

  return { ev, pedidos, fim: () => { ws.close(); edge.kill(); } };
}

const baixouOVideo = (pedidos) => pedidos.some((u) => u.includes('salao-montado.mp4'));

async function roteiro({ reducedMotion }) {
  const { ev, pedidos, fim } = await sessao({ reducedMotion });
  const r = [];
  const ok = (nome, cond, extra = '') =>
    r.push({ nome, ok: !!cond, extra: extra ? ` → ${extra}` : '' });

  try {
    ok('prefers-reduced-motion no estado esperado',
      (await ev(`matchMedia('(prefers-reduced-motion: reduce)').matches`)) === reducedMotion);

    ok('o <video> existe', await ev(`!!document.querySelector('[data-video]')`));

    // Antes de rolar: o arquivo NÃO pode ter sido baixado. É o ponto inteiro
    // do preload="none" — 1,6 MB é mais que a página toda.
    ok('nada de vídeo baixado antes de rolar até lá', !baixouOVideo(pedidos));

    ok('a caixa do vídeo já reserva o espaço',
      await ev(`(() => {
        const f = document.querySelector('[data-video]').closest('figure');
        return f.getBoundingClientRect().height > 100;
      })()`));

    ok('o botão próprio assumiu o lugar do controle nativo',
      await ev(`document.querySelector('[data-video]').controls === false`));

    // Agora sim: rolar até a seção.
    await ev(`document.querySelector('#video').scrollIntoView()`);
    await sleep(2500);

    const tocando = await ev(`(() => {
      const v = document.querySelector('[data-video]');
      return !v.paused && v.currentTime > 0;
    })()`);
    const rotulo = await ev(`document.querySelector('[data-video-rotulo]').textContent.trim()`);

    if (reducedMotion) {
      ok('com movimento reduzido NÃO começa sozinho', !tocando);
      ok('e o botão convida a tocar', rotulo === 'Tocar o vídeo', rotulo);
      ok('o pôster está lá para não deixar buraco',
        await ev(`!!document.querySelector('[data-video]').poster`));
    } else {
      ok('toca sozinho ao entrar na tela', tocando);
      ok('e o botão passa a oferecer pausa', rotulo === 'Pausar o vídeo', rotulo);
      ok('o arquivo só desceu agora', baixouOVideo(pedidos));

      // O botão precisa realmente parar — WCAG 2.2.2 não é opcional para
      // conteúdo em loop.
      await ev(`document.querySelector('[data-video-toggle]').click()`);
      await sleep(400);
      ok('o botão pausa de verdade',
        await ev(`document.querySelector('[data-video]').paused`));

      // E, uma vez pausado de propósito, sair e voltar não pode ressuscitar.
      await ev(`document.querySelector('#topo').scrollIntoView()`);
      await sleep(900);
      await ev(`document.querySelector('#video').scrollIntoView()`);
      await sleep(1500);
      ok('sair e voltar não desfaz a pausa da pessoa',
        await ev(`document.querySelector('[data-video]').paused`));
    }

    ok('nada da seção ficou invisível',
      await ev(`(() => {
        const s = document.querySelector('#video');
        return [...s.querySelectorAll('[data-reveal], h2, p, figure')]
          .every((e) => getComputedStyle(e).opacity !== '0');
      })()`));

    ok('o vídeo está mudo e sem trilha no arquivo',
      await ev(`document.querySelector('[data-video]').muted === true`));
  } finally {
    fim();
  }
  return r;
}

const rodadas = [
  ['animação normal', await roteiro({ reducedMotion: false })],
  ['prefers-reduced-motion', await roteiro({ reducedMotion: true })],
];

let falhas = 0;
for (const [nome, res] of rodadas) {
  console.log(`\n══ ${nome.toUpperCase()} ${'═'.repeat(Math.max(0, 50 - nome.length))}`);
  for (const t of res) {
    console.log(`${t.ok ? 'PASS  ' : 'FALHA '} ${t.nome}${t.extra}`);
    if (!t.ok) falhas++;
  }
  console.log(`${res.filter((t) => t.ok).length}/${res.length} ok`);
}
console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO OK');
process.exit(falhas ? 1 : 0);
