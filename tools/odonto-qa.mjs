// QA funcional do agendamento/quiz/personalização. Uso: node tools/odonto-qa.mjs <base-url>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.argv[2] ?? 'http://localhost:4399';
const b = await chromium.launch();
const log = [];
const ok = (nome, cond, extra = '') => { log.push(`${cond ? 'PASS' : 'FAIL'}  ${nome}${extra ? ' — ' + extra : ''}`); };

async function agendar(modelo, { urgencia = false, query = '' } = {}) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  await p.goto(`${base}/${modelo}/${query}`, { waitUntil: 'networkidle' });
  const ag = p.locator('[data-ag]');
  await ag.scrollIntoViewIfNeeded();
  await ag.locator(urgencia ? 'label:has(input[value="urgencia"])' : 'label:has(input[value="implante"])').click();
  await ag.locator('[data-next]').click();
  if (urgencia) {
    const href = await ag.locator('[data-urg-wa]').getAttribute('href');
    ok(`${modelo} urgência: painel direto e WhatsApp`, (await ag.locator('[data-panel="urg"]').isVisible()) && href.includes('wa.me/') && !(await ag.locator('[data-panel="3"]').isVisible()), href.slice(0, 60));
    ok(`${modelo} urgência: sem erros JS`, erros.length === 0, erros.join('|'));
    await ctx.close();
    return;
  }
  await ag.locator('[data-panel="2"] label[data-prof-card]:not([hidden])').nth(1).click();
  await ag.locator('[data-next]').click();
  // calendário
  const dias = ag.locator('.ag-day[data-iso]:not(.is-off)');
  ok(`${modelo} calendário tem dias disponíveis`, (await dias.count()) > 3, `${await dias.count()} dias`);
  const off = await ag.locator('.ag-day.is-off').count();
  ok(`${modelo} dias passados/fechados desabilitados`, off > 0, `${off} desabilitados`);
  // teclado: foco no dia com tabindex 0, seta para baixo move o foco, Enter seleciona
  const rov = ag.locator('.ag-day[tabindex="0"]');
  await rov.focus();
  const antes = await p.evaluate(() => document.activeElement?.dataset?.iso);
  await p.keyboard.press('ArrowDown');
  const depois = await p.evaluate(() => document.activeElement?.dataset?.iso);
  ok(`${modelo} calendário: setas movem o foco`, !!antes && !!depois && antes !== depois, `${antes} → ${depois}`);
  await p.keyboard.press('ArrowUp');
  await p.keyboard.press('Enter');
  ok(`${modelo} calendário: Enter seleciona o dia pelo teclado`, (await ag.locator('.ag-day.is-sel').count()) === 1);
  await dias.nth(2).click();
  await ag.locator('.ag-slot:not(.is-off)').first().click();
  await ag.locator('[data-next]').click();
  // validação
  await ag.locator('[data-next]').click();
  ok(`${modelo} validação bloqueia campos vazios`, (await ag.locator('[data-err="nome"]').textContent()).length > 0 && (await ag.locator('[data-err="tel"]').textContent()).length > 0);
  await ag.locator('input[name="nome"]').fill('Maria da Silva');
  await ag.locator('input[name="tel"]').fill('41999887766');
  ok(`${modelo} máscara de telefone`, (await ag.locator('input[name="tel"]').inputValue()) === '(41) 99988-7766');
  await ag.locator('[data-next]').click();
  const resumo = await ag.locator('[data-sum]').innerText();
  ok(`${modelo} resumo completo`, /Implantes/.test(resumo) && /Maria da Silva/.test(resumo) && /Horário/.test(resumo), resumo.replace(/\n+/g, ' | ').slice(0, 90));
  const wa = await ag.locator('[data-confirm]').getAttribute('href');
  const txt = decodeURIComponent(wa.split('text=')[1] ?? '');
  ok(`${modelo} wa.me com mensagem formatada`, wa.startsWith('https://wa.me/55') && /\*Motivo:\* Implantes/.test(txt) && /\*Horário:\*/.test(txt) && /\*Nome:\* Maria da Silva/.test(txt));
  const [dl] = await Promise.all([p.waitForEvent('download'), ag.locator('[data-ics]').click()]);
  const path = await dl.path();
  const ics = (await import('node:fs')).readFileSync(path, 'utf8');
  ok(`${modelo} .ics válido`, /BEGIN:VCALENDAR/.test(ics) && /DTSTART:\d{8}T\d{6}Z/.test(ics) && /END:VEVENT/.test(ics), dl.suggestedFilename());
  // voltar funciona
  await ag.locator('[data-reset]').click();
  ok(`${modelo} reinício volta à etapa 1`, await ag.locator('[data-panel="1"]').isVisible());
  ok(`${modelo} agendamento sem erros JS`, erros.length === 0, erros.join('|'));
  await ctx.close();
}

async function quiz(modelo, nome, respostas, esperado) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/${modelo}/`, { waitUntil: 'networkidle' });
  const q = p.locator('[data-quiz]');
  await q.scrollIntoViewIfNeeded();
  for (let i = 0; i < respostas.length; i++) {
    await q.locator(`[data-q="${i}"] label`).nth(respostas[i]).click();
    await p.waitForTimeout(450);
  }
  const res = (await q.locator('[data-qres]').innerText()).replace(/\n+/g, ' | ');
  const primeiro = await q.locator('.qz-card h4').first().innerText();
  ok(`${modelo} quiz ${nome}`, esperado.test(primeiro), `1º: ${primeiro}`);
  if (/criança/.test(nome)) {
    const nota = await q.locator('.ag-note').count();
    ok(`${modelo} quiz criança: ${modelo === 'modelo-3' ? 'sem aviso (oferece odontopediatria)' : 'avisa que não atende crianças'}`, modelo === 'modelo-3' ? nota === 0 : nota === 1);
  }
  await ctx.close();
  return res;
}

async function personalizacao(modelo, path = '') {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/${modelo}/${path}?empresa=Clinica+Sorriso+Teste&dr=Ana+Souza&cidade=Maring%C3%A1&whats=5544988887777`, { waitUntil: 'networkidle' });
  const html = await p.content();
  const corpo = await p.locator('body').innerText();
  const title = await p.title();
  ok(`${modelo}${path} título e nome`, /Clinica Sorriso Teste/.test(title) && /Maringá/.test(title), title);
  ok(`${modelo}${path} dentista principal`, /Ana Souza/.test(corpo));
  ok(`${modelo}${path} cidade`, /Maringá/.test(corpo) && !/Curitiba/.test(corpo.replace(/Av\.|Rua/g, '')) , (corpo.match(/Curitiba/g) ?? []).length + ' restos de Curitiba');
  const hrefs = await p.$$eval('a[href*="wa.me"]', (as) => as.map((a) => a.href));
  ok(`${modelo}${path} WhatsApp trocado`, hrefs.length > 0 && hrefs.every((h) => h.includes('5544988887777')), hrefs[0]?.slice(0, 40));
  ok(`${modelo}${path} nome original removido`, !/Lumière|Vértice|Clínica Ninho|Instituto Vértice/.test(corpo), '');
  const ld = await p.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent).join(''));
  ok(`${modelo}${path} JSON-LD personalizado`, /Clinica Sorriso Teste/.test(ld) && /Maringá/.test(ld));
  const interno = await p.$$eval('a[href^="/modelo-"]', (as) => as.filter((a) => a.getAttribute('href').includes('empresa=')).length);
  ok(`${modelo}${path} links internos mantêm parâmetros`, interno > 0, `${interno} links`);
  await ctx.close();
  void html;
}

const modelos = (process.env.MODELOS ?? 'modelo-1,modelo-2,modelo-3').split(',');
for (const m of modelos) { await agendar(m); await agendar(m, { urgencia: true }); }
// Quiz: ordem das opções por pergunta definida em odonto-config
for (const m of modelos) {
  await quiz(m, 'perfil estética (cor+formato, sem pressa)', [0, 0, 0, 1, 0, 0, 0], m === 'modelo-1' ? /clareamento|Lentes|lentes/i : /clareamento|lentes|Planejamento/i);
  await quiz(m, 'perfil implante (dentes ausentes)', [3, 2, 0, 2, 1, 0, 0], /Implantes|All-on-4/i);
  await quiz(m, 'perfil família/criança', [5, 0, 0, 2, 1, 1, 0], m === 'modelo-3' ? /Odontopediatria/i : /Limpeza|Planejamento|Alinhadores|Implantes/i);
}
for (const m of modelos) await personalizacao(m);
const tr = { 'modelo-1': 'clareamento-dental', 'modelo-2': 'implantes-dentarios', 'modelo-3': 'odontopediatria' };
for (const m of modelos) await personalizacao(m, `tratamentos/${tr[m]}/`);
await b.close();
console.log(log.join('\n'));
console.log(log.some((l) => l.startsWith('FAIL')) ? '\nHÁ FALHAS' : '\nTUDO OK');
