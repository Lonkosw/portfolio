"""Prepara as fotos do Instagram para o site do Studio Priorize.

Faz três coisas, nesta ordem:

  1. Corta a interface do Instagram (seta de carrossel, bolinhas de paginação,
     ícone de perfil). O limpar-bordas.py não pega: ele procura faixa LISA, e
     isto é sobreposição em cima da foto.
  2. Recorta para a proporção do slot onde a foto vai entrar, com viés de
     enquadramento por foto — em cabelo o assunto fica no topo e no meio;
     recorte centralizado come a raiz.
  3. Redimensiona e salva como JPG.

O mapa abaixo é o coração do arquivo: cada linha diz de onde vem, para onde
vai, quanto cortar de UI e onde ancorar o recorte.
"""

import sys
from pathlib import Path

from PIL import Image

ORIGEM = Path(sys.argv[1])
DESTINO = Path(sys.argv[2])
DESTINO.mkdir(parents=True, exist_ok=True)

# Proporções dos slots do site.
V45 = (1080, 1350)   # 4:5 — blocos verticais (a maioria)
H169 = (1920, 1080)  # 16:9 — hero
H1610 = (1600, 1000) # 16:10 — blocos largos da galeria

# (arquivo, destino, (corte esq, topo, dir, baixo), alvo, viés vertical 0..1)
#
# O viés é a fração de cima que se descarta quando a foto é mais alta que o
# alvo. 0.0 = mantém o topo; 0.5 = centraliza; 1.0 = mantém a base.
MAPA = [
    # ── Fachada e ambiente ────────────────────────────────────────────
    # A fachada é story (0.59) e o hero é 16:9: descarta-se 2/3 da altura.
    # Testei os dois ângulos em três viéses (scratchpad/teste-heros.jpg):
    # outside02 @ 0.45 é a única que entrega letreiro legível + os dois
    # andares de vitrine + um pouco de céu para respirar. A outside03 foi
    # descartada aqui por um motivo extra: ela tem "Seja a sua Prioridade"
    # escrito na vitrine, e isso brigaria com o mesmo texto no título do hero.
    ("outside02.png", "hero-fachada", (0, 0, 0, 0), H169, 0.45),
    ("outside03.png", "fachada-esquina", (0, 0, 0, 0), V45, 0.22),
    ("outside01.png", "fachada-placa", (0, 0, 0, 0), V45, 0.12),
    ("inside01.png", "studio-salao", (0, 0, 0, 0), V45, 0.20),

    # ── Cabelo: trabalhos individuais ─────────────────────────────────
    ("loira-iluminada.png", "cabelo-loiro-platinado", (0, 0, 0, 46), V45, 0.10),
    ("ruivo.png", "cabelo-ruivo", (0, 0, 44, 46), V45, 0.08),
    ("cacheado .png", "cabelo-ondas-camadas", (0, 0, 44, 40), V45, 0.10),
    ("cachos-definidos.png", "cabelo-cachos-grisalhos", (0, 0, 0, 46), V45, 0.05),
    ("corte-camadas.png", "cabelo-corte-camadas", (0, 0, 44, 40), V45, 0.10),
    ("corte-butterfly-detras.png", "cabelo-butterfly", (44, 0, 0, 40), V45, 0.08),
    ("corte-butterfly.png", "cabelo-butterfly-frente", (0, 0, 44, 40), V45, 0.05),
    # Corte de 200px no topo: a foto foi tirada diante da vitrine e pegava
    # "dade" (o fim de "prioridade") em letras enormes, que dominavam o
    # quadro e liam como erro de enquadramento.
    ("Cor+corte.png", "cabelo-vinho", (0, 200, 0, 0), V45, 0.05),
    ("hidratation + color + escova.png", "cabelo-vermelho", (0, 0, 0, 0), V45, 0.08),
    ("hist-03.png", "cabelo-ondas-escuras", (0, 0, 44, 40), V45, 0.05),

    # ── Pares antes/depois ────────────────────────────────────────────
    # As duas fotos de um par TÊM de sair com o mesmo enquadramento, senão a
    # cabeça pula quando o divisor passa por cima.
    ("antes-impressive.png", "antes-morena", (0, 0, 0, 40), V45, 0.05),
    ("depois-impressive.png", "depois-morena", (0, 0, 44, 40), V45, 0.05),

    ("antes00.png", "antes-loiro", (44, 0, 0, 40), V45, 0.05),
    ("depois00.png", "depois-loiro", (0, 0, 44, 40), V45, 0.05),

    ("cachos-antes077.png", "antes-cachos", (44, 0, 44, 40), V45, 0.05),
    ("cachos-depois077.png", "depois-cachos", (0, 0, 44, 46), V45, 0.05),

    ("antes-depois-ruivo.png", "antes-acobreado", (44, 0, 0, 40), V45, 0.05),
    ("antes-depois-ruivo-depois.png", "depois-acobreado", (0, 0, 44, 40), V45, 0.05),

    ("liso-antes.png", "antes-liso", (44, 0, 0, 40), V45, 0.05),
    ("liso-depois-permanente.png", "depois-liso", (0, 0, 44, 46), V45, 0.05),

    # ── Noivas ────────────────────────────────────────────────────────
    ("noiva02.png", "noiva-corpo-inteiro", (44, 0, 0, 40), V45, 0.02),
    ("noiva.png", "noiva-retrato", (0, 0, 44, 40), V45, 0.02),
    ("hist-01.png", "noiva-espelho", (0, 0, 0, 46), V45, 0.02),
    ("hist-02.png", "noiva-penteado", (0, 0, 0, 46), V45, 0.02),
    # A ÚNICA foto nativamente horizontal do lote — por isso vai no bloco largo.
    ("noiva+pessoas.png", "noiva-grupo", (0, 0, 0, 0), H1610, 0.05),

    # ── Maquiagem ─────────────────────────────────────────────────────
    ("maquiagem.png", "maquiagem-dourada", (44, 0, 0, 40), V45, 0.02),
    ("maquiagem02.png", "maquiagem-rosa", (0, 0, 44, 40), V45, 0.02),
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
