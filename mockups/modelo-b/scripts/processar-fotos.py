"""Prepara as fotos do Instagram do Concetto di Bellezza para o site.

Faz três coisas, nesta ordem:

  1. corta a INTERFACE DO INSTAGRAM sobreposta à foto — a seta de carrossel
     (‹ ›) nas laterais, as bolinhas de paginação no rodapé e o disquinho de
     perfil no canto inferior esquerdo. Nada disso é faixa lisa: é overlay em
     cima da imagem, então nenhum detector de borda encontra;
  2. recorta para a proporção do slot, com viés de enquadramento POR FOTO —
     em foto de cabelo o assunto começa no topo do quadro e recorte
     centralizado decapita a cabeça;
  3. redimensiona e salva como JPG.

O MAPA abaixo é o coração do arquivo. Cada linha diz de onde vem, para onde
vai, quanto cortar de interface e onde ancorar o recorte.

⚠️ AO TROCAR QUALQUER FOTO, confira as quatro bordas ampliadas. Deixar a
interface de outro aplicativo aparecendo numa proposta comercial é o detalhe
que denuncia de onde a imagem veio.

uso: python scripts/processar-fotos.py .imagens-originais src/assets/images
"""

import sys
from pathlib import Path

from PIL import Image

ORIGEM = Path(sys.argv[1])
DESTINO = Path(sys.argv[2])
DESTINO.mkdir(parents=True, exist_ok=True)

# Proporções dos slots do site.
V45 = (1080, 1350)    # 4:5 — o formato nativo do Instagram deles. Quase tudo.
H1610 = (1600, 1000)  # 16:10 — a foto larga do salão
H169 = (1920, 1080)   # 16:9 — pôster do vídeo e og:image

# Cortes de interface, reutilizados. (esquerda, topo, direita, baixo) em px.
NADA = (0, 0, 0, 0)
SETA_E = (44, 0, 0, 0)        # seta ‹ à esquerda
SETA_D = (0, 0, 44, 0)        # seta › à direita
SETAS = (44, 0, 44, 0)        # as duas
RODAPE = (0, 0, 0, 40)        # bolinhas de paginação / disquinho de perfil
SETA_E_RODAPE = (44, 0, 0, 40)
SETA_D_RODAPE = (0, 0, 44, 40)
SETAS_RODAPE = (44, 0, 44, 40)

# (arquivo, destino, corte, alvo, viés vertical 0..1)
#
# O viés é a fração descartada em CIMA quando a foto é mais alta que o alvo.
# 0.0 mantém o topo; 0.5 centraliza; 1.0 mantém a base.
MAPA = [
    # ── HERO ──────────────────────────────────────────────────────────
    # Loiro iluminado contra a parede verde, com as cordas e as letras
    # CONCETTO DI BELLEZZA atrás. É a única foto do acervo que mostra o
    # TRABALHO e a MARCA no mesmo quadro — por isso abre o site.
    ("01.png", "hero-loiro-letreiro", SETA_D, V45, 0.05),

    # ── O ESPAÇO ──────────────────────────────────────────────────────
    # A vista ampla: parede verde, sofá verde-musgo, espelhos ondulados,
    # plantas. É o que as avaliações do Google chamam de "ambiente
    # acolhedor" — e é nativamente horizontal, o que é raro aqui.
    ("interior02.png", "espaco-salao", SETAS, H1610, 0.5),
    ("interior.png", "espaco-bancadas", SETAS, V45, 0.5),
    ("interior04.png", "espaco-lavatorios", NADA, V45, 0.5),
    ("interior03.png", "espaco-recepcao", NADA, V45, 0.5),
    # Pôster do bloco de vídeo (16:9) — mesma foto do salão, outro recorte.
    ("interior02.png", "video-poster", SETAS, H169, 0.5),

    # ── CABELO · foto grande ──────────────────────────────────────────
    # Ruivo laranja vibrante. A foto mais forte do acervo inteiro.
    ("fire.png", "cabelo-ruivo-fogo", NADA, V45, 0.02),

    # ── CABELO · carrossel de tipos ───────────────────────────────────
    # Viés baixo (0.00–0.08): em foto de cabelo de costas o topo da cabeça
    # está encostado na borda de cima. Centralizar corta a raiz — que é
    # justamente o que quem procura coloração quer ver.
    ("loira.png", "tipo-loiro-iluminado", RODAPE, V45, 0.02),
    ("02.png", "tipo-loiro-mel", SETA_D_RODAPE, V45, 0.02),
    ("ruivo.png", "tipo-ruivo-claro", NADA, V45, 0.05),
    ("hair-ruivo.png", "tipo-acaju", NADA, V45, 0.02),
    ("vermelho-escuro.png", "tipo-borgonha", RODAPE, V45, 0.02),
    ("cabelo04.png", "tipo-chocolate", NADA, V45, 0.02),
    ("cabelo03.png", "tipo-preto-brilho", NADA, V45, 0.05),
    ("antes-depois-0008-pt2.png", "tipo-castanho-camadas", SETA_D_RODAPE, V45, 0.02),
    ("cachos-0000.png", "tipo-cachos-definidos", RODAPE, V45, 0.05),
    ("iluminado-cachos.png", "tipo-cachos-luzes", SETA_D, V45, 0.05),
    ("iluminado-sutil.png", "tipo-morena-iluminada", RODAPE, V45, 0.02),
    ("iluminado-sutil-no-recolor.png", "tipo-bob-castanho", RODAPE, V45, 0.05),

    # ── ANTES E DEPOIS ────────────────────────────────────────────────
    # ⚠️ Cada par é a MESMA cliente no MESMO dia — conferido pela roupa,
    # pelo comprimento e pelo cenário. Ver a tabela no README.
    ("antes-depois-ruivo.png", "ad-ruivo-antes", SETA_E_RODAPE, V45, 0.02),
    ("depois-ruivo.png", "ad-ruivo-depois", SETAS_RODAPE, V45, 0.02),
    ("antes-loiro.png", "ad-loiro-antes", SETA_E_RODAPE, V45, 0.02),
    ("depois-loiro.png", "ad-loiro-depois", SETA_D_RODAPE, V45, 0.02),
    ("luzes-antes.png", "ad-luzes-antes", SETA_E_RODAPE, V45, 0.05),
    ("luzes-depois.png", "ad-luzes-depois", SETA_D_RODAPE, V45, 0.05),

    # ── PRODUÇÃO · make e penteado ────────────────────────────────────
    # Viés mais alto (0.10–0.25): aqui o assunto é o ROSTO, que fica no
    # terço superior. Mas não em 0 — sobrar ar acima da cabeça é o que
    # separa retrato de foto de documento.
    ("ensaio-formanda.png", "producao-formanda", SETA_D_RODAPE, V45, 0.10),
    ("penteado-festa.png", "producao-semipreso", SETA_E_RODAPE, V45, 0.05),
    ("producao-evento.png", "producao-coque-baixo", SETA_D_RODAPE, V45, 0.05),
    ("producao.png", "producao-rabo-alto", RODAPE, V45, 0.05),
    ("make03.png", "producao-make-neutra", NADA, V45, 0.10),
    ("make07.png", "producao-make-coque", NADA, V45, 0.10),
    ("make10.png", "producao-make-cachos", NADA, V45, 0.10),
    ("make01.png", "producao-make-esfumada", NADA, V45, 0.10),

    # ── UNHAS ─────────────────────────────────────────────────────────
    ("unhas-01.png", "unhas-francesinha-vermelha", RODAPE, V45, 0.15),
    ("unhas-02.png", "unhas-glitter-flores", RODAPE, V45, 0.15),
    ("unhas-03.png", "unhas-marrom-dourado", RODAPE, V45, 0.15),

    # ── APOIO ─────────────────────────────────────────────────────────
    # Ruivo mel longo no letreiro — fundo da seção de serviços.
    ("cabelo.png", "servicos-ruivo-mel", NADA, V45, 0.02),
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
    print(f"  ok  {destino:28} {alvo[0]}x{alvo[1]}  {kb:4} KB   <- {arquivo}")
    return True


print(f"\nProcessando {len(MAPA)} fotos de {ORIGEM} para {DESTINO}\n")
feitos = sum(processar(*linha) for linha in MAPA)
print(f"\n{feitos}/{len(MAPA)} prontas\n")
