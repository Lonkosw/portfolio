"""
Prepara as 16 fotos da Joyce para o site.

O que entra em `originais/` são RECORTES DE TELA do Instagram, e por isso
carregam duas sujeiras que não existem na foto original dela:

  · as SETAS do carrossel (‹ ›) — um disco branco semitransparente colado na
    borda, na altura média da imagem, com ~44px de diâmetro;
  · o DISQUINHO DE PERFIL no canto inferior esquerdo, em alguns posts.

Quais fotos têm o quê foi conferido A OLHO, montando uma tira só com as
bordas laterais de todas elas (scratchpad/joyce-bordas.png). Detector
automático não serviu: ele confunde parede clara com seta, e num acervo de
16 fotos olhar uma vez custa menos que depurar heurística.

⚠️ TETO DE RESOLUÇÃO. As originais têm ~640x850. Depois de tirar 46px de
cada lado sobra ~548 de largura — e não há como recuperar o que o recorte
de tela já jogou fora. Por isso o site NÃO usa foto sangrando a tela
inteira: num celular de 390px com DPR 3 isso pediria 1170px e a foto sairia
borrada. Toda foto aqui aparece dentro de um bloco menor que a largura da
tela. Se um dia ela mandar os arquivos originais, é só trocar a pasta e
subir os `LARGURAS` do Astro.

uso: python sites/joyce-adeline/scripts/processar-fotos.py
"""

from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / 'originais'
DESTINO = RAIZ / 'src' / 'assets' / 'fotos'

# (esquerda, topo, direita, baixo) — quanto cortar de cada lado.
SETA = 46      # some com o disco da seta ‹ ou ›
DISCO = 42     # some com o disquinho de perfil no rodapé

NADA = (0, 0, 0, 0)
SETA_D = (0, 0, SETA, 0)
SETAS = (SETA, 0, SETA, 0)
SETA_D_DISCO = (0, 0, SETA, DISCO)

# nome de origem -> (corte, nome final)
#
# Os nomes finais dizem o que a foto É, não a ordem em que ela chegou: quem
# for mexer nisso daqui a seis meses precisa achar a foto certa sem abrir
# uma por uma.
PLANO = {
    '01.png':        (SETA_D_DISCO, 'familia-casal-crianca'),
    '01pt2.png':     (SETAS,        'familia-mae-crianca'),
    '01pt3.png':     (SETAS,        'gestante-casal-chao'),
    '02.png':        (SETA_D_DISCO, 'newborn-recem-nascido'),
    '03.png':        (SETA_D_DISCO, 'familia-pb'),
    '03pt2.png':     (SETAS,        'familia-tres-sentados'),
    '03pt3.png':     (SETAS,        'familia-pai-ombros'),
    '05.png':        (NADA,         'joyce-fotografando'),
    '06corp.png':    (SETAS,        'retrato-casal-branco'),
    '07corp.png':    (SETA_D,       'corporativo-camisa-azul'),
    '08.png':        (SETAS,        'gestante-contraluz'),
    '09.png':        (SETA_D,       'gestante-caramelo'),
    'corp01.png':    (NADA,         'corporativo-retrato-escuro'),
    'corp02.png':    (NADA,         'corporativo-luz-quente'),
    'corp03.png':    (NADA,         'corporativo-blazer-branco'),
    'corp04.png':    (NADA,         'corporativo-notebook'),
}

# 4:5 é o formato nativo do acervo (todas as originais são retrato) e o que
# o grid do portfólio usa. Padronizar aqui, e não no CSS, evita que o
# navegador tenha de recortar 16 proporções diferentes a cada carregamento.
ALVO = (4, 5)


def recortar_45(im: Image.Image) -> Image.Image:
    """Recorte central para 4:5, tirando só do lado que sobra."""
    w, h = im.size
    alvo = ALVO[0] / ALVO[1]
    if w / h > alvo:                      # larga demais: corta os lados
        nova_w = round(h * alvo)
        x = (w - nova_w) // 2
        return im.crop((x, 0, x + nova_w, h))
    nova_h = round(w / alvo)              # alta demais: corta em cima e embaixo
    # Enviesado para CIMA (1/3 em vez de 1/2): em retrato o assunto é rosto e
    # barriga, e um corte centrado come a cabeça para sobrar chão.
    y = (h - nova_h) // 3
    return im.crop((0, y, w, y + nova_h))


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    faltando = [n for n in PLANO if not (ORIGEM / n).exists()]
    if faltando:
        raise SystemExit(f'não achei em {ORIGEM}: {", ".join(faltando)}')

    sobrando = [p.name for p in ORIGEM.iterdir() if p.name not in PLANO]
    if sobrando:
        print(f'aviso: {len(sobrando)} arquivo(s) fora do plano: {", ".join(sobrando)}')

    for origem, (corte, nome) in sorted(PLANO.items()):
        im = Image.open(ORIGEM / origem).convert('RGB')
        w, h = im.size
        e, t, d, b = corte
        im = im.crop((e, t, w - d, h - b))
        im = recortar_45(im)
        saida = DESTINO / f'{nome}.jpg'
        # 88 é o joelho da curva neste acervo: acima disso o arquivo cresce
        # sem diferença visível, abaixo aparece blocagem na pele.
        im.save(saida, 'JPEG', quality=88, optimize=True, progressive=True)
        print(f'{origem:16} -> {saida.name:34} {im.size[0]}x{im.size[1]}  '
              f'{saida.stat().st_size // 1024}KB')


if __name__ == '__main__':
    main()
