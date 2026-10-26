// Auditoria rápida: overflow, alvos de toque <44px, texto <12px, imagens sem dimensões, JS desligado e movimento reduzido.
// Uso: node tools/odonto-audit.mjs <base-url> [paths...]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.argv[2] ?? 'http://localhost:4399';
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/modelo-1/', '/modelo-2/', '/modelo-3/', '/modelo-1/tratamentos/implantes-dentarios/', '/modelo-2/tratamentos/protocolo-all-on-4/', '/modelo-3/tratamentos/odontopediatria/'];
const b = await chromium.launch();
let falhas = 0;
for (const w of [375, 768, 1440]) {
  for (const path of paths) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 }, hasTouch: w < 800 });
    const p = await ctx.newPage();
    const erros = [];
    p.on('pageerror', (e) => erros.push(e.message));
    p.on('console', (m) => m.type() === 'error' && !/tile|ERR_|net::|Failed to load resource/.test(m.text()) && erros.push(m.text()));
    await p.goto(base + path, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => {
      const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
      const alvos = [...document.querySelectorAll('a[href], button, input:not([type=hidden]):not(.ag-input), select, textarea, summary, [role=tab]')].filter(vis)
        .filter((e) => !e.closest('.sr-only-od, .leaflet-container, [aria-hidden="true"]'))
        .map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.getAttribute('aria-label') || e.className).toString().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height), inline: getComputedStyle(e).display === 'inline' }; })
        .filter((a) => !a.inline && (a.h < 43.5 || a.w < 43.5));
      let pequeno = 0; const ex = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = walker.nextNode())) {
        if (!n.nodeValue.trim() || !n.parentElement || !vis(n.parentElement) || ['SCRIPT', 'STYLE'].includes(n.parentElement.tagName)) continue;
        const fs = parseFloat(getComputedStyle(n.parentElement).fontSize);
        if (fs < 11.95) { pequeno++; if (ex.length < 3) ex.push(`${fs}px "${n.nodeValue.trim().slice(0, 25)}"`); }
      }
      const semDim = [...document.images].filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).length;
      const semAlt = [...document.images].filter((i) => !i.hasAttribute('alt')).length;
      return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, alvos, pequeno, ex, semDim, semAlt, imgs: document.images.length };
    });
    const probs = [];
    if (r.sw > r.cw) probs.push(`overflow-x ${r.sw}>${r.cw}`);
    if (r.alvos.length) probs.push(`alvos<44: ${r.alvos.slice(0, 4).map((a) => `${a.t.replace(/\n/g, ' ')}(${a.w}x${a.h})`).join(', ')}${r.alvos.length > 4 ? ` +${r.alvos.length - 4}` : ''}`);
    if (r.pequeno) probs.push(`texto<12px: ${r.pequeno} (${r.ex.join('; ')})`);
    if (r.semDim || r.semAlt) probs.push(`imgs sem dim/alt: ${r.semDim}/${r.semAlt}`);
    if (erros.length) probs.push('erros: ' + erros.join(' | ').slice(0, 200));
    if (probs.length) falhas++;
    console.log(`${probs.length ? 'ATENÇÃO' : 'ok     '} ${w}px ${path} (${r.imgs} imgs)${probs.length ? ' → ' + probs.join(' ; ') : ''}`);
    await ctx.close();
  }
}
// JS desligado e movimento reduzido: conteúdo precisa aparecer
for (const [nome, opts] of [['sem JS', { javaScriptEnabled: false }], ['movimento reduzido', { reducedMotion: 'reduce' }]]) {
  for (const path of ['/modelo-1/', '/modelo-2/', '/modelo-3/']) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
    const p = await ctx.newPage();
    await p.goto(base + path, { waitUntil: 'load' });
    await p.waitForTimeout(400);
    const ocultos = await p.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity === '0').length);
    if (ocultos) falhas++;
    console.log(`${ocultos ? 'ATENÇÃO' : 'ok     '} ${nome} ${path}: ${ocultos} elementos presos em opacity:0`);
    await ctx.close();
  }
}
await b.close();
console.log(falhas ? `\n${falhas} página(s) com observações` : '\nSem observações');
