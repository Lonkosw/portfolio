/**
 * Testa o montador de orçamento com o navegador de verdade, e com DEDO —
 * eventos de toque reais, não clique de mouse.
 *
 * Roda a bateria DUAS VEZES: com animação normal e com
 * `prefers-reduced-motion` forçado. Usar não é animar — quem pede menos
 * movimento continua precisando pedir um bolo.
 *
 * uso: node scripts/test-orcamento.mjs <url>
 */
import { spawn } from 'node:child_process';

const url = process.argv[2] || 'http://127.0.0.1:4540/';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const NUMERO = '5544999510811';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let falhas = 0;
let total = 0;

async function rodar(reduzido) {
  const PORT = 9750 + Math.floor(Math.random() * 200);
  const args = [
    '--headless=new',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-anima-${PORT}`,
    'about:blank',
  ];
  if (reduzido) args.unshift('--force-prefers-reduced-motion');
  const edge = spawn(EDGE, args, { stdio: 'ignore' });

  let wsUrl;
  for (let i = 0; i < 60; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      if (j.webSocketDebuggerUrl) { wsUrl = j.webSocketDebuggerUrl; break; }
    } catch { /* subindo */ }
    await sleep(250);
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pend = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result ?? {}); pend.delete(m.id); }
  };
  const send = (me, pa = {}, s) =>
    new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: pa, sessionId: s })); });

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const cdp = (m, pa = {}) => send(m, pa, sessionId);

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 3, mobile: true,
  });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cdp('Page.navigate', { url });
  await sleep(3500);

  const js0 = async (e) =>
    (await cdp('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }))
      .result.value;

  // LIMPA O ESTADO ANTES DE COMEÇAR.
  //
  // A bateria roda duas vezes e a última coisa que ela faz é justamente
  // gravar no localStorage (o teste de persistência). Sem esta limpeza a
  // segunda rodada abre com a escolha da primeira ainda marcada, e as
  // checagens de estado inicial falham sem que o site tenha erro nenhum.
  await js0(`localStorage.removeItem('anima:orcamento:v1')`);
  await cdp('Page.navigate', { url });
  await sleep(2500);

  const js = async (e) => {
    const r = await cdp('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'erro');
    return r.result.value;
  };

  const checar = (cond, rotulo, detalhe = '') => {
    total++;
    if (!cond) falhas++;
    console.log(`  ${cond ? 'PASS' : 'FALHA'}  ${rotulo}${!cond && detalhe ? ' — ' + detalhe : ''}`);
  };

  async function tocar(x, y) {
    await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await sleep(60);
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(240);
  }

  /** Rola até o elemento e devolve o centro dele na tela. */
  async function centroDe(seletor) {
    await js(`document.querySelector('${seletor}').scrollIntoView({block:'center',behavior:'instant'})`);
    // content-visibility reassenta as alturas depois do salto: medir junto
    // capturaria a posição obsoleta.
    await sleep(700);
    return JSON.parse(await js(`(() => {
      const r = document.querySelector('${seletor}').getBoundingClientRect();
      return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) });
    })()`));
  }

  console.log(`\n${'═'.repeat(64)}`);
  console.log(`  ${reduzido ? 'COM prefers-reduced-motion' : 'Animação normal'}`);
  console.log('═'.repeat(64));

  /* ── Estado inicial ───────────────────────────────────────────── */
  console.log('\n── Estado inicial ' + '─'.repeat(44));
  const ini = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-orcamento]');
    if (!raiz) return JSON.stringify({ erro: 'seção não encontrada' });
    const cta = raiz.querySelector('[data-orc-cta]');
    return JSON.stringify({
      existe: true,
      href: cta.href,
      previa: raiz.querySelector('[data-orc-previa]').textContent.trim(),
      resumo: raiz.querySelector('[data-orc-resumo]').textContent.trim(),
      // Todo CTA da página aponta para o mesmo lugar antes de qualquer escolha.
      ctas: document.querySelectorAll('[data-orc-cta]').length,
      marcados: raiz.querySelectorAll('input:checked').length,
    });
  })()`));
  checar(ini.existe, 'a seção de orçamento existe', ini.erro);
  checar(ini.href.includes('wa.me'), 'o CTA já nasce apontando para o WhatsApp');
  checar(
    new URL(ini.href).pathname.replace(/\//g, '') === NUMERO,
    `o número é o do perfil (${NUMERO})`,
    new URL(ini.href).pathname,
  );
  checar(ini.previa === '', 'a prévia começa vazia');
  checar(ini.resumo === '', 'o resumo começa vazio');
  checar(ini.marcados === 0, 'nada vem pré-marcado', String(ini.marcados));
  checar(ini.ctas >= 3, `há ${ini.ctas} CTAs de orçamento na página`);

  /* ── Preencher tocando ────────────────────────────────────────── */
  console.log('\n── Preenchendo com o dedo ' + '─'.repeat(36));

  const posOcasiao = await centroDe('[data-orc-ocasiao]:first-of-type');
  await tocar(posOcasiao.x, posOcasiao.y);
  const apOcasiao = JSON.parse(await js(`JSON.stringify({
    marcado: !!document.querySelector('[data-orc-ocasiao]:checked'),
    previa: document.querySelector('[data-orc-previa]').textContent.trim(),
  })`));
  checar(apOcasiao.marcado, 'tocar no rótulo marca a ocasião');
  checar(apOcasiao.previa.length > 0, 'a prévia aparece na primeira escolha');

  // O resto por evento: são pílulas espalhadas, e o que importa aqui é a
  // lógica, não repetir o teste de toque que já passou acima.
  const cheio = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-orcamento]');
    const its = [...raiz.querySelectorAll('[data-orc-item]')];
    its[0].checked = true; its[0].dispatchEvent(new Event('change', { bubbles: true }));
    its[1].checked = true; its[1].dispatchEvent(new Event('change', { bubbles: true }));
    const cv = raiz.querySelector('[data-orc-convidados]');
    cv.checked = true; cv.dispatchEvent(new Event('change', { bubbles: true }));
    const m = raiz.querySelector('[data-orc-mes]'); m.value = '10';
    m.dispatchEvent(new Event('change', { bubbles: true }));
    const a = raiz.querySelector('[data-orc-ano]'); a.value = a.options[1].value;
    a.dispatchEvent(new Event('change', { bubbles: true }));

    const cta = raiz.querySelector('[data-orc-cta]');
    const todos = [...document.querySelectorAll('[data-orc-cta]')];
    return JSON.stringify({
      msg: decodeURIComponent(new URL(cta.href).searchParams.get('text') || ''),
      previa: raiz.querySelector('[data-orc-previa]').textContent.trim(),
      resumo: raiz.querySelector('[data-orc-resumo]').textContent.trim(),
      item0: its[0].value, item1: its[1].value,
      convidados: cv.value,
      ctasIguais: todos.every(x => x.href === cta.href),
      qtdCtas: todos.length,
    });
  })()`));

  checar(cheio.msg.toLowerCase().includes(cheio.item0.toLowerCase()), 'a mensagem traz o 1º item');
  checar(cheio.msg.toLowerCase().includes(cheio.item1.toLowerCase()), 'a mensagem traz o 2º item');
  checar(cheio.msg.toLowerCase().includes(cheio.convidados.toLowerCase()), 'a mensagem traz os convidados');
  checar(/outubro de \d{4}/.test(cheio.msg), 'a data sai por extenso', cheio.msg.split('\n').find((l) => l.startsWith('Data')));
  checar(!cheio.msg.includes('setembro'), 'a data NÃO regride um mês (erro de fuso)');
  checar(
    cheio.previa.replace(/\s+/g, ' ') === cheio.msg.replace(/\s+/g, ' '),
    'a prévia na tela é IGUAL ao que vai no link',
  );
  checar(cheio.resumo.length > 0, `o resumo curto aparece: "${cheio.resumo}"`);
  checar(cheio.ctasIguais, `os ${cheio.qtdCtas} CTAs levam a MESMA mensagem`);
  // O range importa: `Â` seguido de QUALQUER coisa daria falso positivo em
  // "Ânima", que é o nome da casa. Mojibake de UTF-8 lido como Latin-1
  // sempre põe um caractere do bloco Latin-1 Supplement (U+0080–U+00BF)
  // logo depois do Ã ou do Â — nunca uma letra comum.
  checar(
    !/Ã[-¿]|â€|Â[-¿]/.test(cheio.msg),
    'a mensagem não tem acentuação corrompida',
  );

  /* ── Desmarcar ────────────────────────────────────────────────── */
  console.log('\n── Desmarcar um item ' + '─'.repeat(41));
  const desmarcou = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-orcamento]');
    const its = [...raiz.querySelectorAll('[data-orc-item]')];
    its[0].checked = false; its[0].dispatchEvent(new Event('change', { bubbles: true }));
    const cta = raiz.querySelector('[data-orc-cta]');
    return JSON.stringify({
      msg: decodeURIComponent(new URL(cta.href).searchParams.get('text') || ''),
      removido: its[0].value, mantido: its[1].value,
    });
  })()`));
  checar(!desmarcou.msg.toLowerCase().includes(desmarcou.removido.toLowerCase()),
    'o item desmarcado SAI da mensagem');
  checar(desmarcou.msg.toLowerCase().includes(desmarcou.mantido.toLowerCase()),
    'o outro item continua lá');

  /* ── Limpar ───────────────────────────────────────────────────── */
  console.log('\n── Limpar ' + '─'.repeat(52));
  const limpo = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-orcamento]');
    raiz.querySelector('[data-orc-limpar]').click();
    const cta = raiz.querySelector('[data-orc-cta]');
    return JSON.stringify({
      marcados: raiz.querySelectorAll('input:checked').length,
      previa: raiz.querySelector('[data-orc-previa]').textContent.trim(),
      resumo: raiz.querySelector('[data-orc-resumo]').textContent.trim(),
      mes: raiz.querySelector('[data-orc-mes]').value,
      msg: decodeURIComponent(new URL(cta.href).searchParams.get('text') || ''),
      guardado: localStorage.getItem('anima:orcamento:v1'),
    });
  })()`));
  checar(limpo.marcados === 0, 'limpar desmarca tudo', String(limpo.marcados));
  checar(limpo.previa === '', 'limpar esvazia a prévia');
  checar(limpo.resumo === '', 'limpar esvazia o resumo');
  checar(limpo.mes === '', 'limpar zera o mês');
  checar(!limpo.msg.includes('Preciso de'), 'o link volta à mensagem genérica');
  checar(limpo.guardado === null, 'limpar apaga o localStorage de verdade', String(limpo.guardado));

  /* ── Persistência ─────────────────────────────────────────────── */
  console.log('\n── Persistência ' + '─'.repeat(46));
  await js(`(() => {
    const raiz = document.querySelector('[data-orcamento]');
    const i = raiz.querySelector('[data-orc-item]');
    i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await cdp('Page.navigate', { url });
  await sleep(2800);
  const apos = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-orcamento]');
    return JSON.stringify({
      marcados: raiz.querySelectorAll('[data-orc-item]:checked').length,
      previa: raiz.querySelector('[data-orc-previa]').textContent.trim().length,
    });
  })()`));
  checar(apos.marcados === 1, 'a escolha sobrevive ao recarregar', String(apos.marcados));
  checar(apos.previa > 0, 'a prévia é remontada com o estado salvo');

  ws.close();
  edge.kill();
}

await rodar(false);
await rodar(true);

console.log('\n' + '═'.repeat(64));
console.log(falhas ? `  ${falhas} de ${total} FALHARAM` : `  ${total}/${total} ok`);
console.log('═'.repeat(64) + '\n');
process.exit(falhas ? 1 : 0);
