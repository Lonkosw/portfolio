/**
 * Testa TODOS os caminhos que levam ao WhatsApp, no navegador de verdade.
 *
 * Não basta conferir o href no HTML: três dos links são reescritos por
 * JavaScript conforme a pessoa preenche as ferramentas. O teste interage com
 * os controles e verifica o link que realmente sairia dali.
 *
 * O que é verificado em cada link:
 *   - aponta para wa.me com o número certo (só dígitos, com DDI);
 *   - a mensagem decodifica de volta sem mojibake (acentuação intacta);
 *   - abre em aba nova com rel=noopener (target=_blank sem isso é brecha).
 *
 * uso: node test-whatsapp.mjs <url> <numero-esperado>
 */
import { spawn } from 'node:child_process';

const url = process.argv[2];
/**
 * Números aceitos, separados por vírgula.
 *
 * ⚠️ SÃO VÁRIOS DE PROPÓSITO. O primeiro é o do WhatsApp e é o único que
 * vale para os links `wa.me`. Os demais entram porque um negócio pode ter
 * telefone FIXO além do WhatsApp — o Claus Cabeleireiros tem os dois, e o
 * fixo é o que a cliente mais velha usa. Antes disto, um `tel:` legítimo
 * apontando para o fixo era acusado como erro.
 *
 *   node tools/test-whatsapp.mjs <url> 5544999216309,554432254416
 */
const numeros = (process.argv[3] ?? '').split(',').map((n) => n.replace(/[^0-9]/g, '')).filter(Boolean);
const numeroEsperado = numeros[0];

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9600 + Math.floor(Math.random() * 300);

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\edge-wa-${PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {
      /* subindo */
    }
    await sleep(250);
  }
  throw new Error('Edge não respondeu');
}

const ws = new WebSocket(await getWsUrl());
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result ?? {});
    pending.delete(m.id);
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((res) => {
    const msgId = ++id;
    pending.set(msgId, res);
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (m, p = {}) => send(m, p, sessionId);

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Page.navigate', { url });
await sleep(3500);

/** Avalia JS na página e devolve o valor já convertido. */
async function js(expressao) {
  const r = await cdp('Runtime.evaluate', {
    expression: expressao,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description || 'erro na página');
  }
  return r.result.value;
}

const falhas = [];
const checar = (cond, rotulo, detalhe = '') => {
  if (cond) {
    console.log(`  ok    ${rotulo}`);
  } else {
    console.log(`  FALHA ${rotulo}${detalhe ? ' — ' + detalhe : ''}`);
    falhas.push(rotulo);
  }
};

/**
 * Valida um href de WhatsApp. Devolve a mensagem decodificada para o chamador
 * poder conferir o conteúdo.
 */
function validarHref(href, rotulo) {
  if (!href) {
    checar(false, rotulo, 'href vazio');
    return null;
  }
  let u;
  try {
    u = new URL(href);
  } catch {
    checar(false, rotulo, `href inválido: ${href}`);
    return null;
  }
  const numero = u.pathname.replace(/\//g, '');
  const msg = u.searchParams.get('text') ?? '';

  const okHost = u.host === 'wa.me';
  const okNumero = numero === numeroEsperado;
  // Mojibake típico de UTF-8 lido como Latin-1. Se aparecer, a mensagem
  // chega ilegível no celular da cliente.
  // O range importa: `Â` seguido de QUALQUER coisa daria falso positivo em
  // nomes como "Ânima". Mojibake de UTF-8 lido como Latin-1 sempre põe um
  // caractere do bloco Latin-1 Supplement (U+0080–U+00BF) logo depois.
  const okTexto = msg.length > 0 && !/Ã[-¿]|â€|Â[-¿]/.test(msg);

  checar(okHost && okNumero && okTexto, rotulo,
    !okHost ? `host ${u.host}` :
    !okNumero ? `número ${numero} != ${numeroEsperado}` :
    'mensagem vazia ou com acentuação corrompida');

  return msg;
}

console.log('\n══ 1. LINKS ESTÁTICOS (presentes no HTML) ' + '═'.repeat(24));

const estaticos = await js(`
  JSON.stringify([...document.querySelectorAll('a[href*="wa.me"]')].map(a => ({
    href: a.href,
    texto: a.textContent.trim().replace(/\\s+/g,' ').slice(0, 42),
    blank: a.target === '_blank',
    noopener: (a.rel || '').includes('noopener'),
  })))
`);
const lista = JSON.parse(estaticos);
console.log(`  ${lista.length} link(s) para wa.me na página\n`);
for (const l of lista) {
  validarHref(l.href, `link "${l.texto}"`);
  checar(l.blank && l.noopener, `  ↳ abre em aba nova com noopener`,
    `target=${l.blank} noopener=${l.noopener}`);
}

console.log('\n══ 2. LINKS tel: ' + '═'.repeat(49));
const tels = JSON.parse(await js(`
  JSON.stringify([...document.querySelectorAll('a[href^="tel:"]')].map(a => a.getAttribute('href')))
`));
console.log(`  ${tels.length} link(s) de telefone`);
for (const t of tels) {
  const so = t.replace(/[^0-9]/g, '');
  checar(numeros.includes(so), `tel ${t}`, `dígitos ${so}`);
}

console.log('\n══ 3. DIAGNÓSTICO CAPILAR (link montado por JS) ' + '═'.repeat(19));
const diag = JSON.parse(await js(`(() => {
  const raiz = document.querySelector('[data-diag]');
  if (!raiz) return JSON.stringify({ erro: 'seção não encontrada' });
  const antes = raiz.querySelector('[data-diag-cta]').href;
  // Responde as três perguntas escolhendo a primeira opção de cada uma.
  // Uma passada só por todos os radios, marcando o primeiro de cada campo:
  // evita montar seletor por concatenação de string.
  const vistos = new Set();
  raiz.querySelectorAll('input[data-diag-campo]').forEach(el => {
    const campo = el.dataset.diagCampo;
    if (vistos.has(campo)) return;
    vistos.add(campo);
    el.checked = true;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const resultado = raiz.querySelector('[data-diag-resultado]');
  return JSON.stringify({
    antes,
    depois: raiz.querySelector('[data-diag-cta]').href,
    resultadoVisivel: !resultado.hidden,
    progresso: raiz.querySelector('[data-diag-progresso]').textContent.trim(),
  });
})()`));
// AUSENTE ≠ QUEBRADO. O diagnóstico é uma ferramenta de salão; a confeitaria
// não tem nenhum. Acusar seis falhas num site que nunca prometeu isso enche a
// saída de vermelho e faz a falha de verdade passar batido — foi o que
// aconteceu na primeira rodada da Ânima.
if (diag.erro) {
  console.log('  --    nenhum diagnóstico nesta página (ok, nem todo site tem)');
} else {
  validarHref(diag.antes, 'CTA antes de responder (mensagem padrão)');
  const msgDiag = validarHref(diag.depois, 'CTA depois de responder as 3');
  checar(diag.antes !== diag.depois, 'o link MUDA depois das respostas');
  checar(diag.resultadoVisivel, 'bloco de resultado aparece');
  checar(diag.progresso === '3 de 3', 'contador diz "3 de 3"', diag.progresso);
  if (msgDiag) checar(/Cabelo:.*Química:.*Quero:/s.test(msgDiag),
    'mensagem traz as três respostas');
}

// ── 4. O MONTADOR DE EVENTO ────────────────────────────────────────────
// Dois sites têm um montador com a mesma mecânica e nomes diferentes:
//   Studio Priorize     → `data-noiva-*`, grupo "madrinhas", faixa de horário
//                         em `cerimonia`, e `total` é só o número.
//   Concetto di Bellezza → `data-prod-*`,  grupo "amigas",    faixa em `hora`,
//                         e `total` já vem como resumo ("3 pessoas · ...").
// O teste detecta qual está na página em vez de acusar falha no outro.
console.log('\n══ 4. MONTADOR DE EVENTO ' + '═'.repeat(41));
const cfg = JSON.parse(await js(`(() => {
  if (document.querySelector('[data-noiva]'))
    return JSON.stringify({ p: 'noiva', grupo: 'madrinhas', quando: 'cerimonia', rotulo: 'madrinha', nome: 'dia da noiva' });
  if (document.querySelector('[data-prod]'))
    return JSON.stringify({ p: 'prod', grupo: 'amigas', quando: 'hora', rotulo: 'amiga', nome: 'produção' });
  return JSON.stringify({ ausente: true });
})()`));

if (cfg.ausente) {
  console.log('  --    nenhum montador de evento nesta página (ok, nem todo site tem)');
} else {
  const m = JSON.parse(await js(`(() => {
    const P = '${cfg.p}';
    const q = (s) => document.querySelector('[data-' + P + s + ']');
    const raiz = q('');
    const antes = q('-cta').href;

    raiz.querySelectorAll('[data-' + P + '-servico]').forEach((c, i) => {
      if (i < 2) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    // Dois acompanhantes, pelo botão "+" — testa o caminho real do usuário.
    const g = raiz.querySelector('[data-' + P + '-grupo="${cfg.grupo}"]');
    g.querySelector('[data-' + P + '-mais]').click();
    g.querySelector('[data-' + P + '-mais]').click();

    const mes = q('-mes');
    mes.value = '10'; mes.dispatchEvent(new Event('change', { bubbles: true }));
    const ano = q('-ano');
    ano.value = ano.options[1].value; ano.dispatchEvent(new Event('change', { bubbles: true }));
    const quando = q('-${cfg.quando}');
    if (quando) { quando.checked = true; quando.dispatchEvent(new Event('change', { bubbles: true })); }

    return JSON.stringify({
      antes,
      depois: q('-cta').href,
      total: q('-total').textContent.trim(),
      contador: g.querySelector('[data-' + P + '-valor]').textContent.trim(),
    });
  })()`));

  console.log('  info  montador encontrado: ' + cfg.nome);
  validarHref(m.antes, 'CTA antes de montar');
  const msgM = validarHref(m.depois, 'CTA depois de montar');
  checar(m.contador === '2', 'botão "+" conta 2 ' + cfg.rotulo + 's', m.contador);
  // O Priorize mostra só o número; o Concetto mostra "3 pessoas · <data>".
  // Os dois têm de conter o 3: a própria pessoa mais os dois acompanhantes.
  checar(/\b3\b/.test(m.total), 'total conta 3 pessoas (você + 2)', m.total);
  if (msgM) {
    checar(new RegExp('2 ' + cfg.rotulo + 's').test(msgM),
      'mensagem cita "2 ' + cfg.rotulo + 's"');
    checar(/outubro de \d{4}/.test(msgM), 'mensagem traz o mês por extenso');
    // O bug clássico: new Date('2026-10') volta setembro em fuso negativo.
    checar(!/setembro/.test(msgM), 'mês NÃO regrediu para setembro (fuso)');
  }
}

console.log('\n══ 5. AGENDAMENTO GUIADO ' + '═'.repeat(41));
const agenda = JSON.parse(await js(`(() => {
  const raiz = document.querySelector('[data-agenda]');
  if (!raiz) return JSON.stringify({ erro: 'seção não encontrada' });
  const antes = raiz.querySelector('[data-agenda-cta]').href;

  const s = raiz.querySelector('[data-agenda-servico]');
  s.value = s.options[1].value; s.dispatchEvent(new Event('change', { bubbles: true }));
  const d = raiz.querySelector('[data-agenda-dia]');
  d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true }));
  const p = raiz.querySelector('[data-agenda-periodo]');
  p.checked = true; p.dispatchEvent(new Event('change', { bubbles: true }));

  return JSON.stringify({
    antes,
    depois: raiz.querySelector('[data-agenda-cta]').href,
    previa: raiz.querySelector('[data-agenda-previa]').textContent.trim(),
    servico: s.value, dia: d.value, periodo: p.value,
  });
})()`));
// Mesma regra do bloco 3: sem `[data-agenda]` na página não há o que testar,
// e o 6 depende inteiramente deste — por isso os dois estão sob a mesma
// condição em vez de cada um checar por conta.
if (agenda.erro) {
  console.log('  --    nenhum agendamento guiado nesta página (ok, nem todo site tem)');
  console.log('\n══ 6. BOTÃO "LIMPAR" NÃO DEIXA LIXO NO LINK ' + '═'.repeat(22));
  console.log('  --    não há o que limpar sem agendamento guiado');
} else {
  validarHref(agenda.antes, 'CTA antes de escolher');
  const msgAgenda = validarHref(agenda.depois, 'CTA depois de escolher');
  checar(agenda.antes !== agenda.depois, 'o link MUDA depois das escolhas');
  checar(agenda.previa.length > 0, 'prévia da mensagem aparece na tela');
  if (msgAgenda) {
    checar(msgAgenda.includes(agenda.servico), 'mensagem traz o serviço escolhido');
    checar(msgAgenda.toLowerCase().includes(agenda.dia.toLowerCase()), 'mensagem traz o dia');
    checar(
      agenda.previa.replace(/\s+/g, ' ') === msgAgenda.replace(/\s+/g, ' '),
      'a prévia na tela é IGUAL ao que vai no link',
    );
  }

  console.log('\n══ 6. BOTÃO "LIMPAR" NÃO DEIXA LIXO NO LINK ' + '═'.repeat(22));
  const limpo = JSON.parse(await js(`(() => {
    const raiz = document.querySelector('[data-agenda]');
    raiz.querySelector('[data-agenda-limpar]').click();
    return JSON.stringify({
      href: raiz.querySelector('[data-agenda-cta]').href,
      previa: raiz.querySelector('[data-agenda-previa]').textContent.trim(),
      // A chave do localStorage leva o nome do site. Em vez de listar todos,
      // varre o que sobrou e reporta qualquer chave de agenda ainda gravada.
      guardado: Object.keys(localStorage).filter((k) => /agenda/.test(k)).join(',') || null,
    });
  })()`));
  const msgLimpa = validarHref(limpo.href, 'CTA volta a ser válido depois de limpar');
  checar(limpo.previa === '', 'prévia fica vazia');
  checar(limpo.guardado === null, 'localStorage é apagado de verdade', String(limpo.guardado));
  if (msgLimpa) checar(!/Serviço:/.test(msgLimpa), 'mensagem não guarda a escolha antiga');
}

console.log('\n' + '═'.repeat(66));
if (falhas.length) {
  console.log(`  ${falhas.length} FALHA(S):`);
  falhas.forEach((f) => console.log(`    · ${f}`));
} else {
  console.log('  Todos os caminhos para o WhatsApp funcionam.');
}
console.log('═'.repeat(66) + '\n');

ws.close();
edge.kill();
process.exit(falhas.length ? 1 : 0);
