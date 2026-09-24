/**
 * Converte o vídeo da abertura numa sequência de quadros + manifesto,
 * no formato que `src/scripts/cinema.ts` consome.
 *
 *   node scripts/frames-from-video.mjs caminho/do/video.mp4 [qtdQuadros]
 *
 * Requer ffmpeg no PATH. Gera:
 *   public/hero-frames/frame-0001.webp ...
 *   public/hero-frames/manifest.json
 *
 * Assim que o manifesto existir, o canvas troca sozinho do render procedural
 * para os quadros reais — não é preciso mexer em código.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const [video, qtdRaw] = process.argv.slice(2);
if (!video) {
  console.error('uso: node scripts/frames-from-video.mjs <video.mp4> [qtdQuadros]');
  process.exit(1);
}

const QTD = Number(qtdRaw) || 120; // 120 quadros dá scrub suave sem pesar
const OUT = join('public', 'hero-frames');

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Duração do vídeo, para distribuir os quadros por igual
const dur = Number(
  execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    video,
  ])
    .toString()
    .trim(),
);

const fps = (QTD / dur).toFixed(4);
console.log(`vídeo: ${dur.toFixed(2)}s → ${QTD} quadros (${fps} fps)`);

execFileSync(
  'ffmpeg',
  [
    '-y',
    '-i', video,
    '-vf', `fps=${fps},scale=1600:-2`,
    '-frames:v', String(QTD),
    '-q:v', '72',
    join(OUT, 'frame-%04d.webp'),
  ],
  { stdio: 'inherit' },
);

const frames = readdirSync(OUT)
  .filter((f) => f.endsWith('.webp'))
  .sort()
  .map((f) => `/hero-frames/${f}`);

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ frames }, null, 1));
console.log(`manifest.json com ${frames.length} quadros — recarregue o site.`);
