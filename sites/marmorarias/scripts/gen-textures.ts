// Gera public/tex/<id>.svg a partir das receitas em marmoraria-config.ts (roda antes do build).
import { mkdirSync, writeFileSync } from 'node:fs';
import { MATERIAIS } from '../src/data/marmoraria-config.ts';
import { stoneSvg } from '../src/lib/stoneTextures.ts';

const dir = new URL('../public/tex/', import.meta.url);
mkdirSync(dir, { recursive: true });
for (const m of MATERIAIS) writeFileSync(new URL(`${m.id}.svg`, dir), stoneSvg(m.textura));
console.log(`texturas: ${MATERIAIS.length}`);
