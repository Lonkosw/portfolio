"""Recorta as fotos de banco (Pexels) para os slots do site do Stilo.

⚠️ ESTAS FOTOS NÃO SÃO DO STILO. São de banco de imagens, livres para uso
comercial pela licença do Pexels. Ver CREDITOS-IMAGENS.md — o site avisa isso
na faixa do topo enquanto `site.demo` for `true`.

O que o script faz, por foto:

  1. Recorta para a proporção do slot, com viés de enquadramento POR FOTO —
     recorte centralizado come a raiz do cabelo, que é justamente o assunto
     num site de salão.
  2. Redimensiona e salva como JPG.

O viés vertical é a fração de cima que se descarta quando a foto é mais alta
que o alvo. 0.0 = mantém o topo; 0.5 = centraliza; 1.0 = mantém a base.

Uso:
    python scripts/baixar-fotos.py      # baixa o pool para .fotos-banco/
    python scripts/processar-fotos.py   # recorta para src/assets/images/
"""

import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / '.fotos-banco'
DESTINO = RAIZ / 'src' / 'assets' / 'images'
DESTINO.mkdir(parents=True, exist_ok=True)

V45 = (1080, 1350)    # 4:5 — a maioria dos blocos
H169 = (1920, 1080)   # 16:9 — hero
H1610 = (1600, 1000)  # 16:10 — blocos largos

# (id no Pexels, nome do arquivo final, alvo, viés vertical)
#
# A escolha de cada foto foi feita OLHANDO a folha de contato, não pelo texto
# da busca. É a regra de ouro do site.ts: o nome descreve a foto, nunca o
# serviço que se gostaria de vender.
MAPA = [
    # ── Abertura e ambiente ───────────────────────────────────────────
    ('7195805',  'hero-salao',       H169,  0.35),  # salão moderno, cadeiras e luz
    ('7750144',  'casa-salao',       V45,   0.30),  # bancada com espelho de aro
    ('12467832', 'casa-fachada',     V45,   0.35),  # vitrine com letreiro "COIFFURE"
    ('8468143',  'casa-detalhe',     V45,   0.30),  # tesouras, pentes e escova

    # ── Pilar 1 · Mechas ──────────────────────────────────────────────
    ('6391646',  'mechas-principal', V45,   0.20),  # ombré/balayage, comprimento

    # ── Carrossel de tipos ────────────────────────────────────────────
    ('14153837', 'tipo-loiro-ondas',      V45, 0.15),
    ('20781288', 'tipo-loiro-acinzentado', V45, 0.15),
    ('8030666',  'tipo-morena-iluminada', V45, 0.20),
    ('20046793', 'tipo-castanho-ondas',   V45, 0.15),
    ('28994563', 'tipo-ruivo',            V45, 0.25),
    ('2520446',  'tipo-cachos',           V45, 0.15),
    ('17328861', 'tipo-cachos-luzes',     V45, 0.20),
    ('23384617', 'tipo-comprimento',      V45, 0.25),

    # ── Antes e depois ────────────────────────────────────────────────
    # ⚠️ NÃO são a mesma pessoa. São processo → resultado, e a seção diz isso
    # na tela. Com foto de banco não existe par real da mesma cliente.
    ('23349912', 'antes-ondas',   V45, 0.25),
    ('12831449', 'depois-ondas',  V45, 0.20),
    ('20092122', 'antes-cor',     V45, 0.20),
    ('18189268', 'depois-cor',    V45, 0.15),
    ('15659494', 'antes-corte',   V45, 0.25),
    ('9788227',  'depois-corte',  V45, 0.20),

    # ── Pilar 2 · Mega hair ───────────────────────────────────────────
    ('7440128',  'mega-hair-principal', V45, 0.25),  # comprimento longo, pente

    # ── Pilar 3 · Noivas ──────────────────────────────────────────────
    ('35129507', 'noiva-principal', V45,   0.20),
    ('15507425', 'noiva-fazendo',   H1610, 0.25),  # penteado SENDO feito
    ('29495750', 'noiva-espelho',   V45,   0.25),
    ('29858712', 'noiva-penteado',  V45,   0.20),
    ('9941096',  'noiva-arranjo',   V45,   0.20),

    # ── Pilar 4 · Produção ────────────────────────────────────────────
    ('5149734',  'producao-maquiagem', H1610, 0.30),
    ('7021586',  'producao-penteado',  V45,   0.25),
    ('35538643', 'producao-make',      V45,   0.20),
]


def recortar(im, alvo, vies):
    """Recorta para a proporção do alvo sem distorcer, e redimensiona."""
    lg_alvo, at_alvo = alvo
    prop_alvo = lg_alvo / at_alvo
    lg, at = im.size
    prop = lg / at

    if prop > prop_alvo:
        # Foto mais larga que o alvo: corta dos lados, sempre centralizado.
        nova_lg = int(at * prop_alvo)
        esq = (lg - nova_lg) // 2
        im = im.crop((esq, 0, esq + nova_lg, at))
    else:
        # Foto mais alta: corta em cima/embaixo conforme o viés.
        nova_at = int(lg / prop_alvo)
        topo = int((at - nova_at) * vies)
        im = im.crop((0, topo, lg, topo + nova_at))

    return im.resize(alvo, Image.LANCZOS)


if __name__ == '__main__':
    if not ORIGEM.exists():
        sys.exit(f'Pasta {ORIGEM} não existe. Rode scripts/baixar-fotos.py antes.')

    feitas = 0
    faltando = []
    for pid, nome, alvo, vies in MAPA:
        origem = ORIGEM / f'{pid}.jpg'
        if not origem.exists():
            faltando.append(pid)
            continue
        im = Image.open(origem).convert('RGB')
        recortar(im, alvo, vies).save(DESTINO / f'{nome}.jpg', 'JPEG', quality=86, optimize=True)
        feitas += 1

    print(f'{feitas} foto(s) recortada(s) para {DESTINO.relative_to(RAIZ)}')
    if faltando:
        print(f'FALTANDO no pool: {", ".join(faltando)}')
