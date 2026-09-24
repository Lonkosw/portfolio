import sharp from 'sharp';
const a = sharp('C:/Users/luxst/AppData/Local/Temp/hero-antes.png');
const b = sharp('C:/Users/luxst/AppData/Local/Temp/hero-depois.png');
const ma = await a.metadata();
console.log('dims', ma.width, ma.height);
// recorta a faixa da foto do hero (abaixo do texto) nas duas e cola lado a lado
const top = 900, alt = 620, larg = 390;
const ca = await sharp('C:/Users/luxst/AppData/Local/Temp/hero-antes.png').extract({left:0, top, width:larg, height:alt}).toBuffer();
const cb = await sharp('C:/Users/luxst/AppData/Local/Temp/hero-depois.png').extract({left:0, top, width:larg, height:alt}).toBuffer();
await sharp({create:{width:larg*2+12, height:alt, channels:3, background:'#000'}})
  .composite([{input:ca, left:0, top:0},{input:cb, left:larg+12, top:0}])
  .png().toFile('C:/Users/luxst/AppData/Local/Temp/hero-lado-a-lado.png');
console.log('ok');
