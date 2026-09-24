/**
 * Liga e desliga `site.demo`, faz build de verdade e confere os quatro
 * efeitos que ele controla. Vale para qualquer site desta pasta.
 *
 *   node tools/test-demo.mjs sites/studio-priorize
 *
 * Restaura o arquivo original mesmo se algo falhar no meio, e confirma que a
 * acentuação sobreviveu — um round-trip de PowerShell já corrompeu um
 * `site.ts` inteiro neste repositório.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const raiz = resolve(process.argv[2] ?? '.');
const arquivoSite = resolve(raiz, 'src/data/site.ts');
const original = readFileSync(arquivoSite, 'utf8');

function build() {
  // Node 24 no Windows recusa .cmd sem shell (EINVAL).
  execFileSync('npm', ['run', 'build', '--prefix', raiz], { stdio: 'pipe', shell: true });
  return {
    html: readFileSync(resolve(raiz, 'dist/index.html'), 'utf8'),
    robots: readFileSync(resolve(raiz, 'dist/robots.txt'), 'utf8'),
  };
}

function conferir(rotulo, { html, robots }) {
  const r = {
    'meta noindex': /name="robots"\s+content="noindex, nofollow"/.test(html),
    'faixa no topo': html.includes('Protótipo de demonstração'),
    'nota no rodapé': html.includes('não é o site oficial'),
    'robots.txt avisa': robots.includes('Protótipo'),
    'robots.txt libera varredura': /Allow: \//.test(robots),
  };
  console.log(`\n--- ${rotulo} ---`);
  for (const [k, v] of Object.entries(r)) console.log(`  ${v ? 'SIM ' : 'não '} ${k}`);
  return r;
}

try {
  const ligado = conferir('demo: true', build());

  writeFileSync(arquivoSite, original.replace('demo: true,', 'demo: false,'), 'utf8');
  const desligado = conferir('demo: false', build());

  const okLigado =
    ligado['meta noindex'] && ligado['faixa no topo'] && ligado['nota no rodapé'] &&
    ligado['robots.txt avisa'] && ligado['robots.txt libera varredura'];
  const okDesligado =
    !desligado['meta noindex'] && !desligado['faixa no topo'] && !desligado['nota no rodapé'] &&
    !desligado['robots.txt avisa'] && desligado['robots.txt libera varredura'];

  console.log(`\ndemo:true  liga os 4 efeitos e mantém Allow: ${okLigado ? 'OK' : 'FALHOU'}`);
  console.log(`demo:false remove os 4 e mantém Allow:       ${okDesligado ? 'OK' : 'FALHOU'}`);
  process.exitCode = okLigado && okDesligado ? 0 : 1;
} finally {
  writeFileSync(arquivoSite, original, 'utf8');
  const volta = readFileSync(arquivoSite, 'utf8');
  const intacto = volta === original && !/Ã[-¿]/.test(volta);
  console.log(`\nsite.ts restaurado byte a byte e sem mojibake: ${intacto}`);
  if (!intacto) process.exitCode = 1;
  execFileSync('npm', ['run', 'build', '--prefix', raiz], { stdio: 'pipe', shell: true });
}
