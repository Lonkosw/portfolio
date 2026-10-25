import { calcularTotal, pecaPadrao, formatFaixa, formatM2, type Peca } from '../src/lib/calc.ts';

function mostra(titulo: string, pecas: Peca[], inst = true) {
  const r = calcularTotal(pecas, inst);
  console.log(`\n== ${titulo}`);
  r.pecas.forEach((p, i) =>
    console.log(`  peça ${i + 1}: ${formatM2(p.areaTotal)} (c/ perda ${formatM2(p.areaComPerda.min)}–${formatM2(p.areaComPerda.max)}) material ${formatFaixa(p.material)} | acab. ${formatFaixa(p.acabamentos)}`),
  );
  console.log(`  total ${formatM2(r.areaTotal)} | material ${formatFaixa(r.material)} | acab. ${formatFaixa(r.acabamentos)} | instalação ${formatFaixa(r.instalacao)}`);
  console.log(`  >>> TOTAL ${formatFaixa(r.total)}`);
}

// (a) bancada simples de banheiro 80x50 em granito
mostra('(a) Banheiro 80×50 granito Cinza Andorinha', [
  { ...pecaPadrao('bancada-banheiro', 'cinza-andorinha'), comprimento: 80, largura: 50, cuba: 'sobrepor' },
]);

// (b) cozinha em L 300x60 + 180x60 em quartzo, cooktop + cuba embutida
mostra('(b) Cozinha em L quartzo, cooktop + cuba embutida', [
  { ...pecaPadrao('bancada', 'quartzo-branco'), comprimento: 300, largura: 60, cooktop: true, cuba: 'embutida', borda: 'meia-esquadria', saia: 4, rodabanca: true },
  { ...pecaPadrao('bancada', 'quartzo-branco'), comprimento: 180, largura: 60, borda: 'meia-esquadria', saia: 4, rodabanca: true },
]);

// (c) escada de 15 degraus de 100 cm em mármore
mostra('(c) Escada 15 degraus × 100 cm, mármore Carrara', [
  { ...pecaPadrao('escada', 'carrara'), comprimento: 100, degraus: 15, borda: 'boleada' },
]);
