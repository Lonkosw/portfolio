// Curadoria + pipeline de imagens das 3 clínicas.
// Uso: RAW_DIR=/caminho/dos/jpgs node tools/odonto-imagens.mjs
// Lê os masters (photo-<id>.jpg), gera AVIF + WebP em 640/1280/1920/2560 (limitado ao tamanho
// nativo) + JPG de fallback 1280 em public/img/<modelo>/ e escreve src/data/imagens.generated.json.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAW = process.env.RAW_DIR;
if (!RAW) throw new Error('Defina RAW_DIR');
const OUT = path.resolve('public/img');

// [chave, id Unsplash, alt (pt-BR), foco do recorte, larguras]
const W_HERO = [640, 960, 1280, 1920, 2560];
const W_MID = [640, 960, 1280, 1920];
const W_SM = [480, 960];

const manifest = {
  'modelo-1': [
    ['hero', '1489278353717-f64c6ee8a4d2', 'Mulher sorrindo em close, com cabelos ondulados e luz natural quente', '50% 62%', W_HERO],
    ['sorriso-batom', '1769559893692-c6d0623bf8e4', 'Close do sorriso de uma mulher com dentes naturais e batom vermelho', '50% 55%', W_MID],
    ['sorriso-lateral', '1677026010083-78ec7f1b84ed', 'Perfil de um sorriso feminino em close, com dentes claros e naturais', '50% 60%', W_MID],
    ['lentes', '1670250492416-570b5b7343b1', 'Close da arcada dentária com afastador, mostrando dentes anteriores alinhados', '50% 50%', W_MID],
    ['clareamento', '1654373535457-383a0a4d00f9', 'Close do sorriso de uma mulher com lábios rosados e dentes claros', '50% 45%', W_MID],
    ['avaliacao', '1664529845836-433c172142ca', 'Dentista examinando os dentes anteriores de um paciente com sonda, em close', '50% 50%', W_MID],
    ['harmonizacao', '1785861084191-3600dfc2a6d6', 'Paciente deitada recebendo procedimento estético facial com luvas pretas', '50% 50%', W_MID],
    ['retrato-pb', '1562337404-3044c84ac061', 'Retrato em preto e branco de uma mulher sorrindo com o rosto em close', '50% 40%', W_MID],
    ['sobre', '1548382131-e0ebb1f0cdea', 'Mulher rindo ao ar livre, com blusa branca de renda e luz natural', '50% 30%', W_MID],
    ['retrato-cacheada', '1617812191081-2a24e3f30e45', 'Mulher de cabelos castanhos sorrindo de olhos fechados ao ar livre', '50% 35%', W_MID],
    ['tour-recepcao', '1762625570087-6d98fca29531', 'Sala de espera clara e minimalista com poltronas pretas e vaso de oliveira', '50% 55%', W_MID],
    ['tour-consultorio', '1643660526741-094639fbe53a', 'Consultório com cadeira odontológica azul e painel artístico na parede', '50% 50%', W_MID],
    ['tour-sala', '1704455306251-b4634215d98f', 'Sala de atendimento clara com mesa e cadeiras ao lado do consultório', '50% 50%', W_MID],
    ['tour-janelas', '1616391182219-e080b4d1043a', 'Consultório amplo com janelas, cadeira odontológica vinho e bancada branca', '50% 50%', W_MID],
    ['instrumentos', '1606811856475-5e6fcdc6e509', 'Espelho clínico e sonda sobre superfície clara', '50% 45%', W_SM],
    ['exame', '1606811971618-4486d14f3f99', 'Exame odontológico com espelho clínico e sonda em close', '50% 50%', W_MID],
    ['equipe-1', '1765005204058-10418f5123c5', 'Retrato de dentista mulher sorrindo, de camisa branca, sobre fundo claro', '50% 22%', W_SM],
    ['equipe-2', '1612349317150-e413f6a5b16d', 'Retrato de dentista de óculos e jaleco branco, de braços cruzados', '50% 35%', W_SM],
    ['equipe-3', '1784652952101-5a10c5202270', 'Retrato de dentista mulher de óculos e blazer escuro, de braços cruzados', '50% 25%', W_SM],
  ],
  'modelo-2': [
    ['hero', '1600170311833-c2cf5280ce49', 'Mão enluvada apontando para uma tomografia odontológica em um tablet', '55% 50%', W_HERO],
    ['scanner', '1667133295311-e6911e6e22db', 'Dois profissionais usando uma tela de planejamento digital em uma clínica', '50% 40%', W_MID],
    ['monitor-raio-x', '1755526739866-c73f65b82f8e', 'Radiografia panorâmica exibida em monitor no consultório', '50% 50%', W_MID],
    ['quadro-exames', '1777444969135-caf869407707', 'Dentista analisando exames de imagem em um negatoscópio iluminado', '50% 50%', W_MID],
    ['panoramica', '1777445374290-eedda5be8e5b', 'Radiografia panorâmica mostrando dentes e arcada', '50% 50%', W_MID],
    ['tablet-exame', '1758691461957-13aff0c37c6f', 'Profissional apontando para exame de imagem em um tablet', '50% 50%', W_MID],
    ['dentista-exames', '1588776814546-1ffcf47267a5', 'Dentista examinando radiografias em um negatoscópio', '50% 50%', W_MID],
    ['implante-modelo', '1593022356769-11f762e25ed9', 'Réplica didática de implante dentário ao lado de réplicas de arcadas', '50% 50%', W_MID],
    ['implante-coroa', '1771442873035-474765b40ac6', 'Mão enluvada segurando um implante com coroa dentária', '50% 40%', W_MID],
    ['implante-demo', '1777445826358-f95518f49b44', 'Dentista explicando um implante em uma réplica de arcada', '50% 50%', W_MID],
    ['instrumentos', '1771442873038-dda05b6ca447', 'Mão enluvada segurando instrumentos de exame odontológico', '50% 35%', W_SM],
    ['canetas', '1642844744022-d76a9af3711a', 'Conjunto de canetas de alta rotação no equipo odontológico', '50% 50%', W_MID],
    ['tour-sala', '1643660527098-559f89e45a92', 'Consultório com cadeira odontológica, monitor e iluminação clara', '50% 50%', W_MID],
    ['tour-clinica', '1629909613654-28e377c37b09', 'Consultório moderno com cadeira, equipo e bancada branca', '50% 50%', W_MID],
    ['procedimento', '1588776814546-daab30f310ce', 'Dois dentistas com paramentação completa realizando procedimento', '50% 40%', W_MID],
    ['consulta', '1777331903190-341a3dd0441b', 'Dentista conversando com paciente em consultório moderno', '50% 50%', W_MID],
    ['alinhador-estojo', '1694675236489-d73651370688', 'Mão com luva azul segurando estojo com alinhadores transparentes', '50% 50%', W_MID],
    ['alinhador-azul', '1695275857301-19e5a9995108', 'Mão com luva azul segurando um alinhador transparente', '50% 50%', W_MID],
    ['alinhadora', '1777793636393-a0fec488f3fb', 'Mulher ajustando alinhadores transparentes sobre os dentes', '50% 55%', W_MID],
    ['paciente', '1757744705465-ea08b0ddc38a', 'Homem jovem sorrindo com camiseta azul-marinho sobre fundo claro', '50% 30%', W_MID],
    ['equipe-1', '1758691463582-11aea602cd4a', 'Dentista de óculos e estetoscópio, de braços cruzados, sorrindo', '50% 30%', W_MID],
    ['equipe-2', '1594824476967-48c8b964273f', 'Dentista de cabelos cacheados com uniforme verde-água, de braços cruzados', '50% 25%', W_SM],
    ['equipe-3', '1622253692010-333f2da6031d', 'Dentista sorrindo com uniforme azul e estetoscópio no pescoço', '50% 25%', W_SM],
  ],
  'modelo-3': [
    ['hero', '1761839258657-457dda39b5cc', 'Família com crianças posando em um jardim ao fim da tarde', '50% 45%', W_HERO],
    ['familia-correndo', '1770871821382-60ea99b0a941', 'Pais e filhas correndo juntos em um jardim ensolarado', '50% 40%', W_MID],
    ['pai-filha', '1624272864537-8ecc72b67958', 'Pai abraçando a filha que ri, em um momento de carinho', '50% 35%', W_MID],
    ['pai-carrega', '1603367563698-67012943fd67', 'Pai carregando a filha de vestido rosa ao ar livre', '50% 40%', W_MID],
    ['cozinha', '1761839258568-fd466a93f68b', 'Família cozinhando junta em uma cozinha clara e acolhedora', '50% 45%', W_MID],
    ['crianca-rindo', '1593183230686-69876b0cb240', 'Menino de camisa xadrez dando uma gargalhada ao ar livre', '50% 35%', W_MID],
    ['mae-filha', '1619236200199-2c138e4a5fae', 'Mãe sentada ao lado da filha na cadeira de um consultório infantil colorido', '50% 50%', W_MID],
    ['dentista-crianca', '1708687045000-9dbb586ad1e2', 'Dentista sentado ao lado de um menino em um consultório claro', '50% 45%', W_MID],
    ['dentista-menino', '1565090568947-7293970ba471', 'Dentista examinando a boca de um menino durante a consulta', '50% 40%', W_MID],
    ['cadeira-laranja', '1598256989800-fe5f95da9787', 'Consultório claro com cadeira odontológica laranja e janela ao fundo', '50% 50%', W_MID],
    ['sala-rosa-1', '1681939278218-a755fb2bf2d3', 'Auxiliar de jaleco azul-claro atendendo paciente em consultório de paredes rosadas', '50% 50%', W_MID],
    ['sala-rosa-2', '1681939282741-9ace0a227977', 'Profissional mostrando uma réplica de dente à paciente no consultório', '50% 50%', W_MID],
    ['sala-rosa-3', '1681939282781-341ac4f61996', 'Profissional ajustando a luz do consultório sobre a paciente', '50% 50%', W_MID],
    ['menina-alinhador', '1609840113929-b130355987e1', 'Adolescente sorrindo colocando um alinhador transparente, fundo amarelo', '50% 35%', W_MID],
    ['sorriso-menina', '1663182234283-28941e7612da', 'Sorriso largo de uma criança em close', '50% 55%', W_MID],
    ['rindo-azul', '1611695434369-a8f5d76ceb7b', 'Pessoa de cabelos castanhos rindo com camisa azul texturizada', '50% 35%', W_MID],
    ['mulher-espelho', '1785860817740-c95735ba03b1', 'Jovem sorrindo e segurando um espelho no consultório', '50% 40%', W_MID],
    ['paciente', '1684607633251-8a4a8d94ddd2', 'Homem sendo atendido por dentista em consulta de rotina', '50% 45%', W_MID],
    ['equipe-1', '1673865641073-4479f93a7776', 'Dentista de jaleco branco apontando para o lado, sobre fundo claro', '50% 35%', W_MID],
    ['equipe-2', '1712215544003-af10130f8eb3', 'Dentista de jaleco branco com as mãos nos bolsos em corredor iluminado', '50% 30%', W_SM],
    ['equipe-3', '1770134223774-13b735e29201', 'Dentista de óculos e uniforme azul sorrindo', '50% 28%', W_SM],
  ],
};

const out = {};
const jobs = [];
for (const [modelo, list] of Object.entries(manifest)) {
  const dir = path.join(OUT, modelo);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, id, alt, pos, widths] of list) {
    jobs.push({ modelo, dir, name, id, alt, pos, widths });
  }
}

let i = 0;
async function worker() {
  while (i < jobs.length) {
    const j = jobs[i++];
    const src = path.join(RAW, `${j.id}.jpg`);
    const meta = await sharp(src).metadata();
    const ws = j.widths.filter((w) => w <= meta.width);
    const top = ws[ws.length - 1];
    for (const w of ws) {
      const base = sharp(src).resize({ width: w });
      await base.clone().avif({ quality: 52, effort: 3 }).toFile(path.join(j.dir, `${j.name}-${w}.avif`));
      await base.clone().webp({ quality: 74 }).toFile(path.join(j.dir, `${j.name}-${w}.webp`));
    }
    const fb = ws.includes(1280) ? 1280 : top;
    await sharp(src).resize({ width: fb }).jpeg({ quality: 76, mozjpeg: true }).toFile(path.join(j.dir, `${j.name}-${fb}.jpg`));
    const h = Math.round((meta.height / meta.width) * fb);
    const st = await sharp(src).resize(8, 8, { fit: 'cover' }).stats();
    const [r, g, b] = st.channels.map((c) => Math.round(c.mean));
    out[`${j.modelo}/${j.name}`] = {
      w: fb, h, widths: ws, fallback: fb, alt: j.alt, pos: j.pos,
      cor: `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`,
      origem: j.id,
    };
    process.stdout.write('.');
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
fs.writeFileSync('src/data/imagens.generated.json', JSON.stringify(Object.fromEntries(Object.entries(out).sort()), null, 1));
console.log(`\n${jobs.length} imagens`);
