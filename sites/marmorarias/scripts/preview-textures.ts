import { MATERIAIS } from '../src/data/marmoraria-config.ts';
import { stoneSvg } from '../src/lib/stoneTextures.ts';
import { writeFileSync } from 'node:fs';
const out = process.argv[2];
const cells = MATERIAIS.map((m) => `<figure style="margin:6px;width:300px"><div style="width:300px;height:300px;overflow:hidden">${stoneSvg(m.textura).replace('width="900" height="900"', 'width="300" height="300"')}</div><figcaption style="font:12px sans-serif">${m.nome}</figcaption></figure>`).join('');
writeFileSync(out, `<body style="display:flex;flex-wrap:wrap;background:#fff">${cells}</body>`);
