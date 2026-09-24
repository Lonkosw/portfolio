"""Gera os placeholders de foto do site do Stilo Cabeleireiro.

O `img()` de src/lib/images.ts ESTOURA o build quando a foto não existe — de
propósito, para nenhuma imagem sumir sem ninguém perceber. Enquanto as fotos
reais não chegam, este script preenche a pasta com retângulos magenta.

POR QUE MAGENTA E COM O NOME ESCRITO EM CIMA:
o placeholder tem de ser impossível de confundir com foto. Cinza-claro
"neutro" é exatamente o erro — ele parece imagem carregando, alguém tira um
print para mostrar e ninguém repara. Magenta #FF00A8 não existe em foto de
salão; se um destes vazar para o cliente, é um acidente óbvio, não sutil.

O nome do arquivo vem escrito no meio para que, ao olhar a página, dê para
saber QUAL foto está faltando sem abrir o código.

Uso:
    python scripts/gerar-placeholders.py

Só cria o que estiver faltando. Foto real já colocada na pasta NUNCA é
sobrescrita — rodar de novo é seguro a qualquer momento.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

DESTINO = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'images'
DESTINO.mkdir(parents=True, exist_ok=True)

MAGENTA = (255, 0, 168)
TEXTO = (255, 255, 255)

# Proporções dos slots do site. Trocar a proporção de um arquivo aqui sem
# trocar no componente faz a foto real entrar recortada errada depois.
V45 = (1080, 1350)    # 4:5 — o formato nativo do Instagram; a maioria
H169 = (1920, 1080)   # 16:9 — hero
H1610 = (1600, 1000)  # 16:10 — blocos largos (destaque de noivas, produção)

# (nome do arquivo, proporção, o que a foto real precisa mostrar)
#
# A terceira coluna não é decoração: é o pedido de foto. Quando o Théo for
# pedir o acervo para o salão, é esta lista que ele manda.
MAPA = [
    # ── Abertura ──────────────────────────────────────────────────────
    ('hero-fachada', H169, 'Fachada na Av. São Paulo, com o letreiro legível'),

    # ── A casa (1978) ─────────────────────────────────────────────────
    ('casa-salao', V45, 'Salão por dentro: cadeiras, espelhos, ambiente'),
    ('casa-fachada', V45, 'Fachada vista da calçada, de corpo inteiro'),
    ('casa-detalhe', V45, 'Detalhe do interior — o que tiver cara de casa antiga'),

    # ── Pilar 1 · Mechas ──────────────────────────────────────────────
    ('mechas-principal', V45, 'Cabelo com mechas, de costas, luz boa'),

    # ── Carrossel de tipos ────────────────────────────────────────────
    # ⚠️ Um trabalho REAL de cada tipo. Se o tipo não existir no acervo,
    # apague a linha no site.ts em vez de usar foto parecida.
    ('tipo-platinado', V45, 'Loiro platinado'),
    ('tipo-morena-iluminada', V45, 'Morena iluminada'),
    ('tipo-mechas-caramelo', V45, 'Mechas caramelo'),
    ('tipo-ruivo', V45, 'Ruivo acobreado'),
    ('tipo-cachos', V45, 'Cachos definidos'),
    ('tipo-corte-camadas', V45, 'Corte em camadas'),
    ('tipo-liso', V45, 'Liso com brilho'),
    ('tipo-ondas', V45, 'Ondas longas / escova modelada'),

    # ── Antes e depois ────────────────────────────────────────────────
    # ⚠️ MESMA cliente, MESMO dia, MESMO enquadramento nos dois lados do par.
    # Par incompleto = apagar o par inteiro do site.ts.
    ('antes-morena', V45, 'ANTES — mesma cliente do par "morena"'),
    ('depois-morena', V45, 'DEPOIS — mesma cliente do par "morena"'),
    ('antes-loiro', V45, 'ANTES — mesma cliente do par "loiro"'),
    ('depois-loiro', V45, 'DEPOIS — mesma cliente do par "loiro"'),
    ('antes-mechas', V45, 'ANTES — mesma cliente do par "mechas"'),
    ('depois-mechas', V45, 'DEPOIS — mesma cliente do par "mechas"'),
    ('antes-mega', V45, 'ANTES — mesma cliente do par "mega hair"'),
    ('depois-mega', V45, 'DEPOIS — mesma cliente do par "mega hair"'),

    # ── Pilar 2 · Mega hair ───────────────────────────────────────────
    ('mega-hair-principal', V45, 'Mega hair aplicado, comprimento visível'),

    # ── Pilar 3 · Noivas ──────────────────────────────────────────────
    ('noiva-principal', V45, 'Noiva pronta, penteado e véu'),
    ('noiva-grupo', H1610, 'Noiva + madrinhas/mãe juntas — precisa ser HORIZONTAL'),
    ('noiva-espelho', V45, 'Noiva diante do espelho'),
    ('noiva-penteado', V45, 'Penteado de noiva em detalhe'),
    ('noiva-retrato', V45, 'Retrato de noiva'),

    # ── Pilar 4 · Produção ────────────────────────────────────────────
    ('producao-maquiagem', H1610, 'Maquiagem em detalhe — precisa ser HORIZONTAL'),
    ('producao-penteado', V45, 'Penteado de festa'),
    ('producao-formatura', V45, 'Produção de formatura'),
]


def fonte(tamanho):
    """Arial existe em todo Windows; o fallback evita quebrar em outro SO."""
    for nome in ('arial.ttf', 'DejaVuSans.ttf'):
        try:
            return ImageFont.truetype(nome, tamanho)
        except OSError:
            continue
    return ImageFont.load_default()


def gerar(nome, tamanho, descricao):
    destino = DESTINO / f'{nome}.jpg'
    if destino.exists():
        return False

    largura, altura = tamanho
    im = Image.new('RGB', tamanho, MAGENTA)
    d = ImageDraw.Draw(im)

    # Moldura tracejada — reforça "isto é um buraco", não uma foto escura.
    margem = 24
    for x in range(margem, largura - margem, 40):
        d.line([(x, margem), (min(x + 20, largura - margem), margem)], fill=TEXTO, width=4)
        d.line([(x, altura - margem), (min(x + 20, largura - margem), altura - margem)], fill=TEXTO, width=4)
    for y in range(margem, altura - margem, 40):
        d.line([(margem, y), (margem, min(y + 20, altura - margem))], fill=TEXTO, width=4)
        d.line([(largura - margem, y), (largura - margem, min(y + 20, altura - margem))], fill=TEXTO, width=4)

    d.text((largura / 2, altura / 2 - 60), 'FALTA A FOTO',
           font=fonte(int(largura * 0.055)), fill=TEXTO, anchor='mm')
    d.text((largura / 2, altura / 2 + 10), nome,
           font=fonte(int(largura * 0.042)), fill=TEXTO, anchor='mm')
    d.text((largura / 2, altura / 2 + 80), f'{largura}x{altura}',
           font=fonte(int(largura * 0.028)), fill=TEXTO, anchor='mm')
    d.text((largura / 2, altura - 70), descricao,
           font=fonte(int(largura * 0.026)), fill=TEXTO, anchor='mm')

    im.save(destino, 'JPEG', quality=88)
    return True


if __name__ == '__main__':
    criados = sum(gerar(n, t, desc) for n, t, desc in MAPA)
    existentes = len(MAPA) - criados
    print(f'{criados} placeholder(s) criado(s).')
    if existentes:
        print(f'{existentes} arquivo(s) já existiam e foram preservados.')
    print(f'Total esperado pelo site: {len(MAPA)} imagens.')
