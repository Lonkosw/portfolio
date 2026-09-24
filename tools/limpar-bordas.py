"""Remove faixas lisas nas bordas de fotos recortadas de prints.

Foto tirada de captura de tela (Canva, Instagram, PDF) quase sempre carrega
uma tira do fundo da página: branca, cinza ou preta, e **totalmente lisa**.
É essa lisura que denuncia — foto de verdade nunca tem uma linha inteira com
desvio padrão quase zero.

    python tools/limpar-bordas.py <pasta> [--aplicar] [--quadrado]

Sem --aplicar é simulação: só lista o que faria. Com --quadrado, recorta o
maior quadrado central do que sobrou (útil para miniaturas de produto).

Faz backup em <pasta>-original na primeira vez que aplica.
Requer Pillow:  pip install pillow
"""
import argparse
import glob
import os
import shutil
import sys

from PIL import Image, ImageStat

EXTS = ('*.jpg', '*.jpeg', '*.png', '*.webp')


def faixa(im, lado, i):
    w, h = im.size
    if lado == 'top':
        return im.crop((0, i, w, i + 1))
    if lado == 'bot':
        return im.crop((0, h - 1 - i, w, h - i))
    if lado == 'left':
        return im.crop((i, 0, i + 1, h))
    return im.crop((w - 1 - i, 0, w - i, h))


def medir(im, lado, fracao_max):
    """Quantos pixels tirar deste lado."""
    w, h = im.size
    teto = max(1, int((h if lado in ('top', 'bot') else w) * fracao_max))

    plano = 0
    for i in range(teto):
        if max(ImageStat.Stat(faixa(im, lado, i)).stddev) < 4.0:
            plano = i + 1
        else:
            break
    if not plano:
        return 0

    # 1-3 px de transição: o anti-aliasing do recorte original
    extra = 0
    for i in range(plano, min(plano + 4, teto)):
        if max(ImageStat.Stat(faixa(im, lado, i)).stddev) < 15.0:
            extra = i + 1 - plano
        else:
            break
    return plano + extra


def processar(pasta, aplicar, quadrado, fracao_max):
    arquivos = sorted(f for e in EXTS for f in glob.glob(os.path.join(pasta, e)))
    if not arquivos:
        print(f'nenhuma imagem em {pasta}')
        return 0

    bkp = pasta.rstrip('/\\') + '-original'
    if aplicar and not os.path.isdir(bkp):
        shutil.copytree(pasta, bkp)
        print(f'backup -> {bkp}\n')

    mexidos = 0
    for f in arquivos:
        im = Image.open(f).convert('RGB')
        c = {l: medir(im, l, fracao_max) for l in ('top', 'bot', 'left', 'right')}
        if not any(c.values()):
            continue

        w, h = im.size
        cx = im.crop((c['left'], c['top'], w - c['right'], h - c['bot']))

        if quadrado:
            cw, ch = cx.size
            lado = min(cw, ch)
            cx = cx.crop((
                (cw - lado) // 2, (ch - lado) // 2,
                (cw - lado) // 2 + lado, (ch - lado) // 2 + lado,
            ))

        corte = ' '.join(f'{k}:{v}' for k, v in c.items() if v)
        print(f'{os.path.basename(f):34} {w}x{h}  {corte:24} -> {cx.size[0]}x{cx.size[1]}')
        mexidos += 1

        if aplicar:
            # Recorte puro, sem reescalar: qualquer resize aqui só perde nitidez.
            if f.lower().endswith(('.jpg', '.jpeg')):
                cx.save(f, quality=93, subsampling=0)
            else:
                cx.save(f)

    print(f'\n{mexidos} de {len(arquivos)}' + ('  [APLICADO]' if aplicar else '  [simulação]'))
    return mexidos


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('pasta')
    p.add_argument('--aplicar', action='store_true', help='grava as mudanças')
    p.add_argument('--quadrado', action='store_true',
                   help='recorta o maior quadrado central depois de limpar')
    p.add_argument('--max', type=float, default=0.25,
                   help='fração máxima do lado que pode ser cortada (padrão 0,25)')
    a = p.parse_args()

    if not os.path.isdir(a.pasta):
        sys.exit(f'pasta não encontrada: {a.pasta}')

    # Faixa nova pode aparecer depois do primeiro corte (letterbox em camadas).
    for passada in range(1, 4):
        n = processar(a.pasta, a.aplicar, a.quadrado, a.max)
        if not a.aplicar or n == 0:
            break
        print(f'--- passada {passada} mexeu em {n}; conferindo de novo ---\n')


if __name__ == '__main__':
    main()
