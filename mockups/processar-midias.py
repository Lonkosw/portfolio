#!/usr/bin/env python
"""
Gera o acervo dos DOIS mockups a partir do pool de banco em `.fotos-banco/`.

    python mockups/processar-midias.py

Os dois modelos usam AS MESMAS imagens de propósito. Eles existem para
testar qual LAYOUT converte melhor no primeiro contato frio — se as fotos
mudassem junto, não daria para saber se a diferença de resposta veio do
layout ou das imagens. Mantendo o acervo constante, a única variável é a
estrutura da página.

══════════════════════════════════════════════════════════════════════
O ANTES/DEPOIS É REAL, E ISSO CUSTOU TRABALHO
══════════════════════════════════════════════════════════════════════
Banco de imagem NÃO tem par antes/depois. Foi verificado em três frentes
(Pexels "hair transformation", "hair extensions before after" e Unsplash):
o que existe são fotos avulsas de pessoas diferentes. Foi exatamente nesse
muro que o Stilo Cabeleireiro bateu, e lá a seção teve de baixar a promessa
para "processo → resultado, cada lado é uma pessoa diferente".

A saída aqui foi outra: **séries do mesmo ensaio**. No Pexels, fotos do
mesmo upload recebem ids vizinhos. Varrendo os vizinhos de alguns ids e
olhando a folha de contato (não por heurística — olhando mesmo), apareceu
uma série em que a MESMA modelo tem o cabelo em dois estados:

    28994386 (liso, sendo penteado)  →  28994564 (ondulado, finalizado)

Mesma pessoa, mesma sessão, mesmo fundo, as duas de costas. É antes/depois
de verdade, e o comparador pode afirmar isso sem mentir.

Um segundo candidato (7440131 → 7440128) foi testado e REPROVADO: em
tamanho real, o suposto "antes" já está com o cabelo ondulado. Eram dois
ângulos do mesmo resultado. Ficou de fora — ver a nota em `PARES`.

⚠️ SE TROCAR O PAR, TROQUE OS DOIS LADOS JUNTOS. Um par montado com duas
pessoas diferentes destrói a única coisa que a seção tem de valioso — ver
a memória `comparador-so-com-pares-de-verdade`.

LICENÇA
-------
Tudo é Pexels: uso comercial permitido, sem atribuição obrigatória,
modificação permitida. As duas proibições que importam:
  1. não sugerir que a pessoa retratada endossa o negócio — por isso a
     faixa do topo diz que é um modelo demonstrativo;
  2. não revender a foto sem alteração — não é o caso, elas são recortadas
     e entram como parte de uma página.
"""

from pathlib import Path
import subprocess
import sys

from PIL import Image

RAIZ = Path(__file__).resolve().parent
POOL = RAIZ / '.fotos-banco'

# Cada modelo guarda as fotos com o nome de pasta que o projeto dele espera.
DESTINOS = [
    RAIZ / 'modelo-a' / 'src' / 'assets' / 'fotos',
    RAIZ / 'modelo-b' / 'src' / 'assets' / 'images',
]
DESTINOS_VIDEO = [
    RAIZ / 'modelo-a' / 'public' / 'video',
    RAIZ / 'modelo-b' / 'public' / 'video',
]

RETRATO = 4 / 5
QUALIDADE = 88
# Teto de largura do arquivo-fonte.
#
# ⚠️ Começou em 1400 e FOI MEDIDO PARA BAIXO. Com 1400, o `larguras()` dos
# componentes passava a oferecer 1400w no `srcset`, o navegador escolhia
# esse degrau e a primeira visita do modelo A baixava 834 KB só de imagem —
# mais do que a página inteira do site do Claus. Foto de banco é rica em
# textura (fio de cabelo, grão) e comprime muito pior que print de
# Instagram, então o degrau grande custa caro.
#
# 1000 cobre o pior caso que importa: a abertura ocupa 88vw, o que num
# celular de 390 com DPR 3 pede ~1030px. Quem abre isto é o dono do salão
# no telefone, não num monitor 4K.
LARGURA_MAX = 1000

# (id do Pexels, nome de saída, viés vertical do corte[, proporção])
# A proporção é opcional e vale 4/5 quando não vem. Os interiores de salão
# entram em 16/10: são fotos horizontais, e cortá-las em retrato jogaria
# fora justamente o que elas mostram — a extensão do espaço.
# O viés é 'topo' quando o assunto está na parte de cima do quadro,
# 'centro' quando está no meio. Em foto de cabelo o que importa é a raiz e
# o comprimento — cortar centrado come a nuca e sobra chão.
PLANO = [
    # ── Abertura ────────────────────────────────────────────────────
    ('12831449', 'hero-ondas-luz',        'centro'),

    # ── Portfólio ───────────────────────────────────────────────────
    ('20046792', 'cachos-castanhos',      'topo'),
    ('17164078', 'ondas-volumosas',       'topo'),
    ('15530661', 'maquiagem-batom',       'centro'),
    ('34835304', 'unhas-onca',            'centro'),
    ('30661047', 'liso-franja',           'topo'),
    ('36784935', 'loira-espelho',         'topo'),
    ('17163788', 'ondas-medias',          'topo'),
    ('3557600',  'unhas-nude',            'centro'),
    ('16317568', 'castanho-costas',       'centro'),
    ('9219006',  'paleta-sombras',        'centro'),
    ('34885844', 'unhas-rosa',            'centro'),
    ('28994645', 'ruivo-finalizado',      'centro'),

    # ── Serviços e "o salão" ────────────────────────────────────────
    ('8468038',  'coloracao-mecha',       'topo'),
    ('35225425', 'salao-atendimento',     'centro'),
    ('28994561', 'babyliss-ondas',        'centro'),

    # ── Interiores (só o modelo B tem seção de espaço) ──────────────
    ('7750124',  'salao-recepcao',        'centro', 16 / 10),
    ('7195805',  'salao-estacoes',        'centro', 16 / 10),
    ('7195799',  'salao-bancada',         'centro', 16 / 10),
    ('7750144',  'salao-lavatorio',       'centro'),

    # ── Penteados (o modelo B tem seção de produção) ────────────────
    ('16976882', 'penteado-coque-baixo',  'centro'),
    ('15507425', 'penteado-coque-loiro',  'centro'),
    ('29858712', 'penteado-brilho',       'topo'),
    ('9941096',  'penteado-noiva',        'topo'),
    ('11813961', 'penteado-tranca',       'topo'),
]

# Par do comparador: (id antes, centro-x do antes, id depois, centro-x do
# depois, sufixo). O centro-x é a fração da largura onde está a cabeça —
# é ele que ALINHA os dois lados.
#
# ⚠️ É UM PAR SÓ, e isso foi decidido olhando, não por preguiça. O candidato
# a segundo par (7440131 → 7440128) foi descartado depois de ver os
# originais em tamanho real: no suposto "antes" o cabelo JÁ ESTÁ ondulado.
# São dois ângulos do mesmo resultado, não uma transformação — exatamente o
# par forçado que esta seção existe para não ter. Um par verdadeiro vale
# mais que dois, e o componente centraliza o órfão sozinho.
#
# Se aparecer um segundo par, ele precisa passar no mesmo teste: mesma
# pessoa, mesma sessão, e os dois lados em estados VISIVELMENTE diferentes.
PARES = [
    ('28994386', 0.40, '28994564', 0.62, 'ruivo'),
]

# (arquivo de vídeo no pool, nome de saída)
VIDEOS = [
    ('video-8467531.mp4', 'video-cuidado'),
    ('video-7575564.mp4', 'video-finalizacao'),
]


def proporcao(im: Image.Image, alvo: float, vies: str) -> Image.Image:
    """Corta o mínimo necessário para chegar em `alvo` (largura/altura)."""
    w, h = im.size
    atual = w / h
    if abs(atual - alvo) < 0.005:
        return im
    if atual > alvo:
        nova_w = round(h * alvo)
        x = (w - nova_w) // 2
        return im.crop((x, 0, x + nova_w, h))
    nova_h = round(w / alvo)
    y = 0 if vies == 'topo' else (h - nova_h) // 3
    return im.crop((0, y, w, y + nova_h))


def abrir(pid: str) -> Image.Image:
    origem = POOL / f'{pid}.jpg'
    if not origem.exists():
        print(f'FALTA {origem.name}', file=sys.stderr)
        raise SystemExit(1)
    im = Image.open(origem)
    return im if im.mode == 'RGB' else im.convert('RGB')


def gravar(im: Image.Image, nome: str) -> str:
    if im.size[0] > LARGURA_MAX:
        prop = im.size[0] / im.size[1]
        im = im.resize((LARGURA_MAX, round(LARGURA_MAX / prop)), Image.LANCZOS)
    for d in DESTINOS:
        im.save(d / f'{nome}.jpg', 'JPEG', quality=QUALIDADE,
                optimize=True, progressive=True)
    kb = (DESTINOS[0] / f'{nome}.jpg').stat().st_size // 1024
    return f'{nome + ".jpg":<26} {im.size[0]}x{im.size[1]}  {kb} KB'


def recortar_em(im: Image.Image, centro_x: float) -> Image.Image:
    """Corta 4/5 mantendo `centro_x` (fração da largura) no meio do quadro."""
    w, h = im.size
    nova_w = min(w, round(h * RETRATO))
    nova_h = round(nova_w / RETRATO)
    x = round(w * centro_x) - nova_w // 2
    x = max(0, min(x, w - nova_w))           # não deixa sair da foto
    y = max(0, (h - nova_h) // 2)
    return im.crop((x, y, x + nova_w, y + nova_h))


def parear(id_antes: str, cx_antes: float,
           id_depois: str, cx_depois: float, sufixo: str) -> list[str]:
    """Alinha os dois lados pelo assunto e IGUALA o tamanho em pixels.

    Duas coisas acontecem aqui, e as duas são o que faz o comparador
    funcionar:

    1. **Alinhamento.** Cada lado é cortado em torno do próprio centro do
       assunto (`cx_*`), não do centro da foto. No par ruivo o espelho
       ocupa a esquerda do "depois" e empurra a cabeça para 62% da largura;
       cortar centrado faria a cabeça pular para o lado quando a pessoa
       arrastasse o divisor.

    2. **Mesmo tamanho em pixels.** O comparador empilha as duas fotos e
       revela uma pela outra com `clip-path`. Um pixel de diferença de
       altura já faz a linha do ombro saltar — e o efeito inteiro, que é
       justamente "é a mesma pessoa", se perde.
    """
    a = recortar_em(abrir(id_antes), cx_antes)
    d = recortar_em(abrir(id_depois), cx_depois)
    largura = min(a.size[0], d.size[0])
    alvo = (largura, round(largura / RETRATO))
    a = a.resize(alvo, Image.LANCZOS)
    d = d.resize(alvo, Image.LANCZOS)
    return [gravar(a, f'antes-{sufixo}'), gravar(d, f'depois-{sufixo}')]


def ffmpeg() -> str:
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def processar_video(arquivo: str, nome: str) -> str:
    """Reencoda para o tamanho que o site usa, sem áudio.

    Os originais do Pexels vêm em 1080x1920 e até 16 MB. O bloco de vídeo
    do site tem ~320px de largura: 720 de largura já é mais do que a tela
    consegue mostrar, e o arquivo cai para cerca de um décimo.
    """
    origem = POOL / arquivo
    ff = ffmpeg()
    saidas = []
    primeiro = None
    for dest_video, dest_foto in zip(DESTINOS_VIDEO, DESTINOS):
        dest_video.mkdir(parents=True, exist_ok=True)
        saida = dest_video / f'{nome}.mp4'
        if primeiro is None:
            subprocess.run(
                [ff, '-v', 'error', '-y', '-i', str(origem),
                 '-an',                       # o site toca mudo
                 '-vf', 'scale=720:-2,fps=24',
                 '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p',
                 '-crf', '30', '-preset', 'slower',
                 '-movflags', '+faststart',
                 str(saida)],
                check=True,
            )
            primeiro = saida
        else:
            saida.write_bytes(primeiro.read_bytes())
        # Pôster do primeiro quadro, para a caixa não abrir vazia.
        poster = dest_foto / f'{nome}-poster.jpg'
        subprocess.run(
            [ff, '-v', 'error', '-y', '-ss', '0.1', '-i', str(saida),
             '-frames:v', '1', '-q:v', '4', str(poster)],
            check=True,
        )
        saidas.append(saida)
    kb_antes = origem.stat().st_size // 1024
    kb_depois = saidas[0].stat().st_size // 1024
    return f'{nome + ".mp4":<26} {kb_antes} KB -> {kb_depois} KB (sem áudio)'


def main() -> int:
    if not POOL.is_dir():
        print(f'não achei {POOL}', file=sys.stderr)
        return 1
    for d in DESTINOS:
        d.mkdir(parents=True, exist_ok=True)

    linhas = []
    for item in PLANO:
        pid, nome, vies = item[0], item[1], item[2]
        prop = item[3] if len(item) > 3 else RETRATO
        linhas.append(gravar(proporcao(abrir(pid), prop, vies), nome))

    for id_antes, cx_a, id_depois, cx_d, sufixo in PARES:
        linhas += parear(id_antes, cx_a, id_depois, cx_d, sufixo)

    for arquivo, nome in VIDEOS:
        linhas.append(processar_video(arquivo, nome))

    print('\n'.join(linhas))
    total = len(PLANO) + len(PARES) * 2
    print(f'\n{total} fotos + {len(VIDEOS)} vídeos, gravados nos 2 modelos.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
