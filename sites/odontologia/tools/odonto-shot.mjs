// Uso: node tools/odonto-shot.mjs <url> <saida.png> [largura=1440] [--full]
// Rola a página (para disparar os reveals), registra erros de console e overflow horizontal.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [url, out, w = '1440'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +w < 600 ? 800 : 900 }, deviceScaleFactor: 1 });
const erros = [];
p.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
p.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
await p.goto(url, { waitUntil: 'networkidle' });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 500) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(60); }
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(400);
const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
console.log(JSON.stringify({ altura: h, overflowX: ov.sw > ov.cw, ...ov, erros }));
await p.screenshot({ path: out, fullPage: true });
await b.close();
