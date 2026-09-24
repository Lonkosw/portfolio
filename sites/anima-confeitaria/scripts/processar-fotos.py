"""Prepara as fotos do Instagram da Ânima para o site.

Faz três coisas, nesta ordem:

  1. corta a interface do Instagram (seta de carrossel, ícone de perfil).
     O limpar-bordas.py não pega: ele procura faixa LISA, e isto é
     sobreposição em cima da foto;
  2. recorta para a proporção do slot, com viés de enquadramento por foto —
     em bolo o assunto está no meio-alto, e recorte centralizado corta o
     topo do último andar;
  3. redimensiona e salva como JPG.

O MAPA abaixo é o coração do arquivo. Cada linha diz de onde vem, para onde
vai, quanto cortar de interface e onde ancorar o recorte.

uso: python scripts/processar-fotos.py .imagens-originais src/assets/images
"""

import sys
from pathlib import Path

from PIL import Image

ORIGEM = Path(sys.argv[1])
DESTINO = Path(sys.argv[2])
DESTINO.mkdir(parents=True, exist_ok=True)

# Proporções dos slots do site.
V45 = (1080, 1350)    # 4:5 — cards e galeria
H169 = (1920, 1080)   # 16:9 — hero
H1610 = (1600, 1000)  # 16:10 — foto larga de "A confeitaria"

# (arquivo, destino, (esq, topo, dir, baixo) em px, alvo, viés vertical 0..1)
#
# O viés é a fração descartada em CIMA quando a foto é mais alta que o alvo.
# 0.0 mantém o topo; 0.5 centraliza; 1.0 mantém a base.
MAPA = [
    # ── Destaques ─────────────────────────────────────────────────────
    # Bolo de casamento com a vista da mata ao fundo. Vira o hero: é a foto
    # que melhor resume o que a casa faz de mais caro.
    #
    # Sai em 4:5, e NÃO em 16:9. O hero deste site põe a foto numa coluna
    # ao lado do texto (`aspect-[4/5]` no desktop), não atrás dele — um
    # recorte panorâmico espremeria um bolo de cinco andares, que é alto
    # por natureza. O og:image de 1200x630 é gerado à parte pelo Astro.
    # O `36` no rodapé tira as BOLINHAS DE PAGINAÇÃO do carrossel do
    # Instagram — dois pontinhos brancos no centro-baixo. Elas não são
    # faixa lisa, então o limpar-bordas.py não as encontra, e a olho nu
    # passam por sujeira da foto. Numa proposta comercial, deixar a
    # interface de outro aplicativo aparecendo é o detalhe que denuncia de
    # onde a imagem veio.
    ("10.png", "destaque-bolo-casamento", (0, 0, 44, 36), V45, 0.05),
    # Mesa montada com arranjos — a foto de "A confeitaria".
    ("03.png", "destaque-mesa-flores", (0, 0, 0, 0), H1610, 0.35),

    # ── Categorias de "O que fazemos" ─────────────────────────────────
    # Viés baixo (0.02–0.10) em bolo alto: o assunto começa no topo do
    # quadro, e centralizar decapitaria o último andar.
    ("02.png", "bolo-casamento-alto", (0, 0, 0, 0), V45, 0.02),
    ("05.png", "bolo-tematico", (0, 0, 44, 0), V45, 0.05),
    ("06.png", "docinhos-sortidos", (0, 0, 0, 0), V45, 0.20),
    ("9.png", "mesa-montada", (0, 0, 0, 0), V45, 0.15),
    ("11.png", "lembrancinhas", (0, 0, 44, 36), V45, 0.10),
    ("7.png", "bombons", (0, 0, 0, 0), V45, 0.15),

    # ── Galeria de trabalhos ──────────────────────────────────────────
    ("4.png", "trabalho-bolo-rosas", (0, 0, 0, 0), V45, 0.05),
    ("04.png", "trabalho-festa-infantil", (0, 0, 44, 36), V45, 0.05),
    ("8.png", "trabalho-docinhos-finos", (0, 0, 0, 0), V45, 0.20),
]


def processar(arquivo, destino, corte, alvo, vies):
    src = ORIGEM / arquivo
    if not src.exists():
        print(f"  FALTA  {arquivo}")
        return False

    im = Image.open(src).convert("RGB")
    L, A = im.size

    e, t, d, b = corte
    im = im.crop((e, t, L - d, A - b))
    l, a = im.size

    alvo_ratio = alvo[0] / alvo[1]
    if l / a > alvo_ratio:
        # Mais larga que o alvo: corta pelos lados, sempre pelo centro.
        novo_l = int(a * alvo_ratio)
        x = (l - novo_l) // 2
        im = im.crop((x, 0, x + novo_l, a))
    else:
        # Mais alta que o alvo: corta em cima e embaixo, respeitando o viés.
        nova_a = int(l / alvo_ratio)
        y = int((a - nova_a) * vies)
        im = im.crop((0, y, l, y + nova_a))

    im = im.resize(alvo, Image.LANCZOS)
    saida = DESTINO / f"{destino}.jpg"
    im.save(saida, quality=86, optimize=True)
    kb = saida.stat().st_size // 1024
    print(f"  ok  {destino:26} {alvo[0]}x{alvo[1]}  {kb:4} KB   <- {arquivo}")
    return True


print(f"\nProcessando {len(MAPA)} fotos de {ORIGEM} para {DESTINO}\n")
feitos = sum(processar(*linha) for linha in MAPA)
print(f"\n{feitos}/{len(MAPA)} prontas\n")
