#!/usr/bin/env python
"""
Transforma o acervo bruto de `imagens/` nos arquivos que o site consome.

    python scripts/processar-midias.py

Lê `imagens/` (recortes do Instagram público deles + um story em vídeo) e
escreve `src/assets/images/` e `public/video/`. É reprodutível: apaga a saída
e roda de novo.

O QUE O ACERVO TEM DE ERRADO, E QUE ISTO CONSERTA
-------------------------------------------------
1. **Setas de carrossel e disquinho de perfil.** Vários arquivos são print de
   post com carrossel: sobra o ‹ ou o › (disco de ~44px na meia-altura) e, em
   alguns, o disquinho do perfil no rodapé. Cada arquivo tem seu próprio caso
   — a coluna `bordas` abaixo é (esq, topo, dir, baixo) em pixels.

   ⚠️ NÃO tente detectar as setas por brilho. Foi tentado no acervo da Joyce:
   parede clara vira falso positivo e foto noturna vira negativo. O jeito que
   funciona é montar uma tira com as bordas laterais, olhar UMA vez e anotar.

2. **Marca d'água de fotógrafo.** Três arquivos trazem crédito visível
   (`paulo silva` no canto de baixo do 07, `@paulosilva_fotografias` no topo
   do 04, uma assinatura no rodapé do 09). Aqui elas saem no corte — mas isso
   é decisão de ENQUADRAMENTO, não permissão: as fotos continuam sendo dos
   fotógrafos dos casais. Ver CREDITOS-IMAGENS.md.

3. **Story com faixa.** O 09.jpg é print de story 1080x1920 com a foto no
   meio e faixa borrada em cima e embaixo. A faixa útil (y 599..1320) foi
   medida com desvio-padrão por linha, não chutada.

4. **Story em vídeo com adesivo.** O 10.mp4 é 720x1280 e traz o adesivo de
   localização "📍 Recanto Paraíso" mais um @ manuscrito nos últimos ~116px.
   Cortados. O áudio é jogado fora: o vídeo entra `muted` no site e a trilha
   só pesaria bytes.

TETO DE RESOLUÇÃO
-----------------
Os originais têm de 480 a 857px de largura. Depois do corte sobram ~450 a
850. Por isso o `widths` do <Image> em cada componente para no que existe:
pedir mais que o original faz o Astro devolver um arquivo menor em silêncio,
sem avisar. Se a Rosane mandar os originais em alta, é trocar `imagens/` e
subir os `widths`.
"""

from pathlib import Path
import subprocess
import sys

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / 'imagens'
SAIDA_FOTO = RAIZ / 'src' / 'assets' / 'images'
SAIDA_VIDEO = RAIZ / 'public' / 'video'

# Proporções pedidas pelos componentes.
LARGO = 16 / 10   # blocos largos da galeria, cartões de evento, "o lugar"
RETRATO = 4 / 5   # tiles verticais da galeria
NATIVO = None     # o hero é fundo de `object-cover`: a proporção não importa

# (esquerda, topo, direita, baixo) em pixels, ANTES de acertar a proporção.
NADA = (0, 0, 0, 0)

PLANO = {
    # arquivo:      (bordas,             proporção, nome de saída,        viés)
    # marca d'água do fotógrafo nos últimos ~40px (medido, não chutado)
    '07.png':       ((0, 0, 0, 45),      NATIVO,    'hero-salao-vidro',   'centro'),
    '02.png':       (NADA,               LARGO,     'salao-festa-noite',  'centro'),
    '03.png':       (NADA,               LARGO,     'jardim-poente',      'centro'),
    # disquinho de perfil no rodapé: o corte da proporção já vem de baixo
    '06.png':       (NADA,               LARGO,     'salao-mesas-verde',  'topo'),
    '01.png':       (NADA,               RETRATO,   'noiva-jardim-noite', 'centro'),
    # marca d'água no canto superior esquerdo
    '04.png':       ((0, 26, 0, 0),      RETRATO,   'ponte-lago',         'centro'),
    # seta › à direita, disquinho à esquerda, bolinhas de carrossel embaixo
    '05.png':       ((46, 0, 46, 0),     RETRATO,   'making-of-jardim',   'topo'),
    '11.png':       ((0, 0, 46, 0),      RETRATO,   'arco-noiva-noite',   'topo'),
    '12.png':       ((46, 0, 46, 0),     RETRATO,   'arco-casal-noite',   'topo'),
}

# O story: faixa útil medida, não estimada.
STORY = {
    'arquivo': '09.jpg',
    'faixa': (0, 599, 1080, 1274),   # (esq, topo, dir, baixo) — o resto é borrão
    'proporcao': LARGO,
    'nome': 'mesa-do-bolo',
}

VIDEO = {
    'arquivo': '10.mp4',
    'nome': 'salao-montado',
    'corte_baixo': 116,   # adesivo de localização + @ manuscrito
}

QUALIDADE = 88


def recortar_proporcao(im: Image.Image, alvo: float, vies: str) -> Image.Image:
    """Corta o mínimo necessário para chegar em `alvo` (largura/altura)."""
    if alvo is None:
        return im
    w, h = im.size
    atual = w / h
    if abs(atual - alvo) < 0.005:
        return im
    if atual > alvo:
        # largo demais: corta nas laterais, sempre pelo centro (o assunto de
        # foto horizontal está no meio; enviesar lateralmente é chute)
        nova_w = round(h * alvo)
        x = (w - nova_w) // 2
        return im.crop((x, 0, x + nova_w, h))
    # alto demais: corta em cima/embaixo
    nova_h = round(w / alvo)
    if vies == 'topo':
        y = 0                      # preserva o topo, joga fora o rodapé
    elif vies == 'baixo':
        y = h - nova_h
    else:
        # Enviesado para CIMA (1/3, não 1/2): em foto de pessoa o assunto é
        # rosto e busto, e um corte centrado come cabeça para sobrar chão.
        y = (h - nova_h) // 3
    return im.crop((0, y, w, y + nova_h))


def processar_foto(origem: Path, bordas, proporcao, nome: str, vies: str) -> str:
    im = Image.open(origem)
    if im.mode != 'RGB':
        im = im.convert('RGB')
    e, t, d, b = bordas
    if any(bordas):
        w, h = im.size
        im = im.crop((e, t, w - d, h - b))
    im = recortar_proporcao(im, proporcao, vies)
    destino = SAIDA_FOTO / f'{nome}.jpg'
    im.save(destino, 'JPEG', quality=QUALIDADE, optimize=True, progressive=True)
    kb = destino.stat().st_size // 1024
    return f'{origem.name:>12} -> {nome+".jpg":<24} {im.size[0]}x{im.size[1]}  {kb} KB'


def ffmpeg() -> str:
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def processar_video() -> list[str]:
    """Corta o adesivo, tira o áudio, reencoda e tira um pôster do 1º quadro.

    O pôster existe porque o <video> entra com `preload="none"`: sem ele o
    bloco fica um retângulo vazio até a pessoa chegar ali e o arquivo baixar.
    """
    origem = ENTRADA / VIDEO['arquivo']
    saida = SAIDA_VIDEO / f'{VIDEO["nome"]}.mp4'
    poster = SAIDA_FOTO / f'{VIDEO["nome"]}-poster.jpg'
    corte = VIDEO['corte_baixo']
    ff = ffmpeg()

    subprocess.run(
        [ff, '-v', 'error', '-y', '-i', str(origem),
         '-vf', f'crop=iw:ih-{corte}:0:0',
         '-an',                       # fora o áudio: o vídeo toca mudo
         '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p',
         '-crf', '27', '-preset', 'slow',
         '-movflags', '+faststart',   # metadados na frente: começa a tocar antes
         str(saida)],
        check=True,
    )
    subprocess.run(
        [ff, '-v', 'error', '-y', '-ss', '0.2', '-i', str(saida),
         '-frames:v', '1', '-q:v', '4', str(poster)],
        check=True,
    )
    antes = origem.stat().st_size // 1024
    depois = saida.stat().st_size // 1024
    return [
        f'{origem.name:>12} -> {VIDEO["nome"]+".mp4":<24} 720x{1280-corte}  '
        f'{antes} KB -> {depois} KB (sem áudio)',
        f'{"":>12}    {VIDEO["nome"]+"-poster.jpg":<24} '
        f'{poster.stat().st_size // 1024} KB',
    ]


def main() -> int:
    if not ENTRADA.is_dir():
        print(f'não achei {ENTRADA}', file=sys.stderr)
        return 1
    SAIDA_FOTO.mkdir(parents=True, exist_ok=True)
    SAIDA_VIDEO.mkdir(parents=True, exist_ok=True)

    linhas = []
    for arquivo, (bordas, proporcao, nome, vies) in PLANO.items():
        origem = ENTRADA / arquivo
        if not origem.exists():
            print(f'FALTA {arquivo}', file=sys.stderr)
            return 1
        linhas.append(processar_foto(origem, bordas, proporcao, nome, vies))

    # O story tem faixa em vez de bordas: recorte absoluto, não relativo.
    origem = ENTRADA / STORY['arquivo']
    im = Image.open(origem).convert('RGB').crop(STORY['faixa'])
    im = recortar_proporcao(im, STORY['proporcao'], 'centro')
    destino = SAIDA_FOTO / f'{STORY["nome"]}.jpg'
    im.save(destino, 'JPEG', quality=QUALIDADE, optimize=True, progressive=True)
    linhas.append(
        f'{origem.name:>12} -> {STORY["nome"]+".jpg":<24} '
        f'{im.size[0]}x{im.size[1]}  {destino.stat().st_size // 1024} KB'
    )

    linhas += processar_video()

    print('\n'.join(linhas))
    print(f'\n{len(PLANO) + 1} fotos + 1 vídeo em {SAIDA_FOTO.relative_to(RAIZ)}'
          f' e {SAIDA_VIDEO.relative_to(RAIZ)}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
