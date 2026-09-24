#!/usr/bin/env python
"""
Transforma o acervo bruto de `imagens-claus/` no que o site consome.

    python scripts/processar-midias.py

Lê `imagens-claus/` (recortes do Instagram público deles) e escreve
`src/assets/fotos/` e `public/video/`. Reprodutível: apague a saída e rode
de novo.

O QUE ESTE ACERVO TEM DE DIFERENTE
----------------------------------
É o melhor acervo que chegou até agora, e por um motivo específico: **os
antes/depois são pares de verdade**. Mesma cliente, mesmo ângulo, mesma
roupa (o suéter vermelho num par, a blusa branca no outro). Isso permite um
comparador arrastável que afirma "mesma pessoa, mesmo dia" sem mentir — que
é exatamente o que o Stilo NÃO pôde fazer com foto de banco.

Por isso a regra número um aqui: **não misturar as fotos dos pares com o
resto**. Se um dia entrar foto nova, ela vai para o portfólio, não para o
comparador, a menos que venha com o par correspondente.

O QUE O SCRIPT CONSERTA
-----------------------
1. **Uma seta de carrossel.** Só a `antess-loiro.png` tem o disco ‹ na
   lateral esquerda, na meia-altura. Foi achada montando uma tira com as
   bordas laterais das 16 fotos e olhando UMA vez — não por heurística de
   brilho, que já falhou antes (parede clara vira falso positivo).

2. **Proporções desiguais dentro de cada par.** O comparador sobrepõe duas
   fotos e arrasta um recorte entre elas: se as duas não tiverem o MESMO
   tamanho em pixels, o corte desalinha e o rosto "pula" ao arrastar. A
   função `parear()` corta as duas em 4/5 e iguala o tamanho.

3. **Áudio nos vídeos.** O vídeo do loiro veio com trilha; o site toca mudo,
   então a faixa só pesaria bytes.

O QUE ELE NÃO CONSERTA — DE PROPÓSITO
-------------------------------------
**Nada de cor, nitidez ou pele.** É um salão: a foto é o trabalho deles.
Mexer em saturação seria falsificar o resultado que a cliente vai cobrar.

TETO DE RESOLUÇÃO
-----------------
De 572 a 1440px de largura. A `nails-08.jpg` é a única foto de verdade (não
é print) e por isso é a mais nítida do site. `larguras()` em
`src/lib/images.ts` impede o `srcset` de anunciar largura que o arquivo não
tem — o Astro não faz upscale.
"""

from pathlib import Path
import subprocess
import sys

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / 'imagens-claus'
SAIDA_FOTO = RAIZ / 'src' / 'assets' / 'fotos'
SAIDA_VIDEO = RAIZ / 'public' / 'video'

RETRATO = 4 / 5
NADA = (0, 0, 0, 0)
QUALIDADE = 88

# Fotos soltas: (arquivo, bordas (esq,topo,dir,baixo), nome de saída)
PLANO = [
    ('07.png',        NADA,          'loiro-parede-grafite'),
    ('01.png',        NADA,          'ondas-castanhas'),
    ('02.png',        NADA,          'penteado-coque-lateral'),
    ('03.png',        NADA,          'loiro-ondas-longas'),
    ('04.png',        NADA,          'bob-curto-iluminado'),
    ('06.png',        NADA,          'loiro-platinado-ondas'),
    ('10.png',        NADA,          'coque-brinco-azul'),
    ('make01.png',    NADA,          'maquiagem-batom-vermelho'),
    ('make02.png',    NADA,          'maquiagem-dourada'),
    ('make03.png',    NADA,          'maquiagem-perolas'),
    ('05-nails.png',  NADA,          'unhas-azul-claro'),
    ('nails-08.jpg',  NADA,          'unhas-vermelhas'),
]

# Pares do comparador: (antes, bordas, depois, bordas, prefixo)
PARES = [
    ('antess-loiro.png', (46, 0, 0, 0), 'depois-loiro.png', NADA, 'loiro'),
    ('antes-ruivo.png',  NADA,          'depois-ruivo.png', NADA, 'ruivo'),
]

VIDEOS = [
    ('antes-depois-loiro-video.mp4', 'video-loiro'),
    ('antes-depois-video-ruivo.mp4', 'video-ruivo'),
]


def cortar(im: Image.Image, bordas) -> Image.Image:
    if not any(bordas):
        return im
    e, t, d, b = bordas
    w, h = im.size
    return im.crop((e, t, w - d, h - b))


def proporcao(im: Image.Image, alvo: float) -> Image.Image:
    """Corta o mínimo para chegar em `alvo`, preservando o alto do quadro.

    O viés é para CIMA (1/3, não 1/2) porque em foto de cabelo o que importa
    é a raiz e o comprimento — cortar centrado come a nuca e sobra chão.
    """
    w, h = im.size
    atual = w / h
    if abs(atual - alvo) < 0.005:
        return im
    if atual > alvo:
        nova_w = round(h * alvo)
        return im.crop(((w - nova_w) // 2, 0, (w - nova_w) // 2 + nova_w, h))
    nova_h = round(w / alvo)
    y = (h - nova_h) // 3
    return im.crop((0, y, w, y + nova_h))


def salvar(im: Image.Image, nome: str) -> str:
    destino = SAIDA_FOTO / f'{nome}.jpg'
    im.save(destino, 'JPEG', quality=QUALIDADE, optimize=True, progressive=True)
    return (f'{nome + ".jpg":<30} {im.size[0]}x{im.size[1]}  '
            f'{destino.stat().st_size // 1024} KB')


def abrir(nome: str) -> Image.Image:
    p = ENTRADA / nome
    if not p.exists():
        print(f'FALTA {nome}', file=sys.stderr)
        raise SystemExit(1)
    im = Image.open(p)
    return im if im.mode == 'RGB' else im.convert('RGB')


def parear(antes: str, b_antes, depois: str, b_depois, prefixo: str) -> list[str]:
    """Corta os dois em 4/5 e IGUALA o tamanho em pixels.

    ⚠️ O tamanho igual não é capricho: o comparador desenha as duas fotos
    empilhadas e revela uma pela outra com `clip-path`. Um pixel de diferença
    de altura já faz a linha do ombro saltar enquanto a pessoa arrasta, e o
    efeito inteiro — que é justamente "é a mesma pessoa" — se perde.
    """
    a = proporcao(cortar(abrir(antes), b_antes), RETRATO)
    d = proporcao(cortar(abrir(depois), b_depois), RETRATO)
    largura = min(a.size[0], d.size[0])
    alvo = (largura, round(largura / RETRATO))
    a = a.resize(alvo, Image.LANCZOS)
    d = d.resize(alvo, Image.LANCZOS)
    return [salvar(a, f'antes-{prefixo}'), salvar(d, f'depois-{prefixo}')]


def ffmpeg() -> str:
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def processar_video(arquivo: str, nome: str) -> list[str]:
    origem = ENTRADA / arquivo
    saida = SAIDA_VIDEO / f'{nome}.mp4'
    poster = SAIDA_FOTO / f'{nome}-poster.jpg'
    ff = ffmpeg()
    subprocess.run(
        [ff, '-v', 'error', '-y', '-i', str(origem),
         '-an',                        # o site toca mudo; a trilha só pesa
         # 24 fps e crf 30: os dois arquivos caem de 6,8 MB para ~3,4 MB
         # juntos. Comparei quadro a quadro antes de escolher — em cabelo, a
         # primeira coisa que a compressão come é o fio solto, e é justamente
         # o que a cliente está avaliando. Abaixo disso (crf 32) o brilho da
         # mecha começa a chapar. Não subir sem olhar de novo.
         '-vf', 'fps=24',
         '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p',
         '-crf', '30', '-preset', 'slower',
         '-movflags', '+faststart',    # metadados na frente: começa antes
         str(saida)],
        check=True,
    )
    # Pôster do PRIMEIRO quadro, que é o "antes": o bloco tem de abrir
    # mostrando o problema, não o resultado.
    subprocess.run(
        [ff, '-v', 'error', '-y', '-ss', '0.1', '-i', str(saida),
         '-frames:v', '1', '-q:v', '4', str(poster)],
        check=True,
    )
    antes_kb = origem.stat().st_size // 1024
    return [
        f'{nome + ".mp4":<30} {antes_kb} KB -> {saida.stat().st_size // 1024} KB',
        f'{nome + "-poster.jpg":<30} {poster.stat().st_size // 1024} KB',
    ]


def main() -> int:
    if not ENTRADA.is_dir():
        print(f'não achei {ENTRADA}', file=sys.stderr)
        return 1
    SAIDA_FOTO.mkdir(parents=True, exist_ok=True)
    SAIDA_VIDEO.mkdir(parents=True, exist_ok=True)

    linhas = []
    for arquivo, bordas, nome in PLANO:
        linhas.append(salvar(proporcao(cortar(abrir(arquivo), bordas), RETRATO), nome))
    for antes, ba, depois, bd, prefixo in PARES:
        linhas += parear(antes, ba, depois, bd, prefixo)
    for arquivo, nome in VIDEOS:
        linhas += processar_video(arquivo, nome)

    print('\n'.join(linhas))
    total = len(PLANO) + len(PARES) * 2 + len(VIDEOS)
    print(f'\n{total} fotos + {len(VIDEOS)} vídeos')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
