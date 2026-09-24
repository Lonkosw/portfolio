"""Monta uma folha de contato para conferir um lote de imagens de uma vez.

O fundo magenta é de propósito: qualquer sobra clara ou escura na borda de uma
foto salta aos olhos contra ele. Foi assim que apareceram as barras pretas que
o detector de faixa branca não pegava.

    python tools/folha-contato.py <pasta> [saida.png] [--cols 9]

Requer Pillow:  pip install pillow
"""
import argparse
import glob
import os
import sys

from PIL import Image

EXTS = ('*.jpg', '*.jpeg', '*.png', '*.webp')
MAGENTA = (255, 0, 170)


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('pasta')
    p.add_argument('saida', nargs='?', default='folha-contato.png')
    p.add_argument('--cols', type=int, default=9)
    p.add_argument('--cel', type=int, default=150, help='lado de cada miniatura')
    a = p.parse_args()

    arquivos = sorted(f for e in EXTS for f in glob.glob(os.path.join(a.pasta, e)))
    if not arquivos:
        sys.exit(f'nenhuma imagem em {a.pasta}')

    pad = 6
    linhas = (len(arquivos) + a.cols - 1) // a.cols
    folha = Image.new(
        'RGB',
        (a.cols * (a.cel + pad) + pad, linhas * (a.cel + pad) + pad),
        MAGENTA,
    )

    for i, f in enumerate(arquivos):
        col, lin = i % a.cols, i // a.cols
        folha.paste(
            Image.open(f).convert('RGB').resize((a.cel, a.cel), Image.LANCZOS),
            (pad + col * (a.cel + pad), pad + lin * (a.cel + pad)),
        )

    folha.save(a.saida)
    print(f'{len(arquivos)} imagens -> {a.saida}')


if __name__ == '__main__':
    main()
