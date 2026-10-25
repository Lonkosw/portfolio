// Baixa as fotos do Unsplash (licença Unsplash, uso comercial) e gera WebP 640/1280/1920.
// Uso: node tools/baixar-imagens.mjs
import sharp from 'sharp';
import fs from 'node:fs';

const FOTOS = {
  'modelo-1': {
    'hero-por-do-sol': '1613665813446-82a78c468a1d',
    'cobertura-comercial': '1611365892117-00ac5ef43c90',
    'residencia-noite': '1568605114967-8130f3a36994',
    'residencia-moderna': '1600585154340-be6161a56a0c',
    'campo-eolico': '1466611653911-95081537e5b7',
    'galpao-logistico': '1565793298595-6a879b1d9492',
    'instalacao-detalhe': '1559302504-64aae6ca6b6d',
  },
  'modelo-2': {
    'familia-por-do-sol': '1511895426328-dc8714191300',
    'casa-campo': '1558036117-15d82a90b9b1',
    'casa-piscina': '1564013799919-ab600027ffc6',
    'instalador-telhado': '1624397640148-949b1732bb0a',
    'casa-chaves': '1560518883-ce09059eeffa',
    'atendimento': '1522202176988-66273c2fd55f',
    'casa-vermelha': '1518780664697-55e3ad937233',
    'loja': '1441986300917-64674bd600d8',
    'cafeteria': '1514933651103-005eec06c04b',
    'sitio': '1500076656116-558758c991c1',
    'cozinha-casal': '1556909114-f6e7ad7d3136',
  },
  'modelo-3': {
    'usina-aerea': '1497440001374-f26997328c1b',
    'usina-ceu-azul': '1508514177221-188b1cf16e9d',
    'usina-nuvens': '1509391366360-2e959784a276',
    'usina-gramado': '1558449028-b53a39d100fc',
    'usina-fileiras': '1521618755572-156ae0cdd74d',
    'galpao-estoque': '1586528116311-ad8dd3c8310d',
    'obra': '1541888946425-d81bb19240f5',
    'lavoura-por-do-sol': '1500382017468-9049fed747ef',
    'pecuaria': '1500595046743-cd271d694d30',
    'milharal': '1625246333195-78d9c38ad449',
    'solda-industrial': '1504328345606-18bbc8c9d7d1',
  },
};
const LARGURAS = [640, 1280, 1920];
// Imagens de compartilhamento (Open Graph), 1200x630, uma por empresa.
const OG = { aurora: ['modelo-1', 'hero-por-do-sol'], lume: ['modelo-2', 'familia-por-do-sol'], valeverde: ['modelo-3', 'usina-aerea'] };


for (const [modelo, fotos] of Object.entries(FOTOS)) {
  fs.mkdirSync(`public/img/${modelo}`, { recursive: true });
  for (const [nome, id] of Object.entries(fotos)) {
    const res = await fetch(`https://images.unsplash.com/photo-${id}?w=2400&q=85&fm=jpg`);
    if (!res.ok) { console.error('FALHOU', modelo, nome, res.status); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    for (const w of LARGURAS) {
      await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`public/img/${modelo}/${nome}-${w}.webp`);
    }
    console.log('ok', modelo, nome);
  }
}

fs.mkdirSync('public/og', { recursive: true });
for (const [nome, [modelo, foto]] of Object.entries(OG)) {
  await sharp(`public/img/${modelo}/${foto}-1920.webp`).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 80 }).toFile(`public/og/${nome}.jpg`);
}
