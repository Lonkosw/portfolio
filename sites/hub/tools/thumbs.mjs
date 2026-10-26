// Gera public/thumbs/<nicho>-<modelo>.webp a partir dos sites publicados.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { niches, projectUrl, thumbFile } from '../src/data/portfolio.mjs';

const only = process.argv[2]; // opcional: slug do nicho
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, reducedMotion: 'reduce' });
for (const n of niches.filter((x) => !only || x.slug === only)) {
  for (const p of n.projects) {
    await page.goto(projectUrl(n, p), { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const png = await page.screenshot();
    const out = `public/thumbs/${thumbFile(n, p)}.webp`;
    await sharp(png).resize(1000).webp({ quality: 72 }).toFile(out);
    console.log(out);
  }
}
await browser.close();
