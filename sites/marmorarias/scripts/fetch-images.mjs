// Baixa as fotos do Unsplash (licença Unsplash, uso comercial liberado), converte para WebP
// em 640/1280/1920 px e gera public/img/CREDITOS.md. Uso: node scripts/fetch-images.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const manifest = JSON.parse(readFileSync(new URL('./images.json', import.meta.url)));
const out = new URL('../public/img/', import.meta.url).pathname;
const tmp = join(tmpdir(), 'marm-img');
mkdirSync(tmp, { recursive: true });
const tamanhos = [640, 1280, 1920];
const linhas = [];
const falhas = [];

async function baixar(id, destino) {
  const url = `https://images.unsplash.com/photo-${id}?w=1920&q=82&fm=jpg&fit=max`;
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch(url);
      if (r.ok) { writeFileSync(destino, Buffer.from(await r.arrayBuffer())); return true; }
    } catch {}
  }
  return false;
}

for (const [modelo, imgs] of Object.entries(manifest)) {
  mkdirSync(join(out, modelo), { recursive: true });
  linhas.push(`\n## ${modelo}\n\n| Arquivo | Autor | Fonte |\n|---|---|---|`);
  await Promise.all(Object.entries(imgs).map(async ([nome, [id, autor, pagina]]) => {
    if (existsSync(join(out, modelo, `${nome}-1280.webp`))) return;
    const bruto = join(tmp, `${modelo}-${nome}.jpg`);
    if (!(await baixar(id, bruto))) { falhas.push(`${modelo}/${nome}`); return; }
    for (const w of tamanhos) {
      execFileSync('convert', [bruto, '-resize', `${w}x>`, '-strip', '-quality', '76', join(out, modelo, `${nome}-${w}.webp`)]);
    }
    rmSync(bruto);
  }));
  for (const [nome, [id, autor, pagina]] of Object.entries(imgs)) {
    linhas.push(`| ${modelo}/${nome}-{640,1280,1920}.webp | ${autor} | https://unsplash.com/photos/${pagina} |`);
  }
}
writeFileSync(join(out, 'CREDITOS.md'),
`# Créditos das imagens

Todas as fotos vêm do **Unsplash** e seguem a [Unsplash License](https://unsplash.com/license):
uso comercial permitido, sem obrigação de atribuição (os créditos abaixo são cortesia).
Nenhuma foto se repete entre os três modelos. As amostras de pedra do catálogo e da calculadora
não são fotos: são texturas geradas em SVG (\`src/lib/stoneTextures.ts\`).

Arquivos convertidos para WebP em 640, 1280 e 1920 px de largura (\`node scripts/fetch-images.mjs\`).
${linhas.join('\n')}
`);
if (falhas.length) { console.error('FALHAS:', falhas.join(', ')); process.exit(1); }
console.log('ok');
