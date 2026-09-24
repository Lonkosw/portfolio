"""Baixa do Pexels as fotos usadas pelo site, para `.fotos-banco/`.

⚠️ Fotos de banco, NÃO do Stilo. Licença Pexels: uso comercial permitido, sem
atribuição obrigatória, modificação permitida. Proibido sugerir que a pessoa
retratada endossa algo — por isso o site avisa, na faixa do topo, que as
imagens não são do salão.

Roda antes de `processar-fotos.py`. Só baixa o que estiver faltando.

Uso:
    python scripts/baixar-fotos.py
"""

import urllib.request
from pathlib import Path

DESTINO = Path(__file__).resolve().parent.parent / '.fotos-banco'
DESTINO.mkdir(exist_ok=True)

# Largura pedida ao CDN do Pexels. 1800 dá folga para recortar 4:5 em 1080
# de largura sem reamostrar para cima.
LARGURA = 1800

# Só os ids que o site usa de fato — a lista espelha o MAPA de
# processar-fotos.py. Se acrescentar foto lá, acrescente aqui.
IDS = [
    '7195805', '7750144', '12467832', '8468143', '6391646',
    '14153837', '20781288', '8030666', '20046793', '28994563',
    '2520446', '17328861', '23384617',
    '23349912', '12831449', '20092122', '18189268', '15659494', '9788227',
    '7440128',
    '35129507', '15507425', '29495750', '29858712', '9941096',
    '5149734', '7021586', '35538643',
]


def baixar(pid):
    destino = DESTINO / f'{pid}.jpg'
    if destino.exists():
        return False
    url = (
        f'https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg'
        f'?auto=compress&cs=tinysrgb&w={LARGURA}'
    )
    # O CDN recusa requisição sem User-Agent de navegador.
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as r, open(destino, 'wb') as f:
        f.write(r.read())
    return True


if __name__ == '__main__':
    novas = sum(baixar(p) for p in IDS)
    print(f'{novas} baixada(s), {len(IDS) - novas} já estavam em {DESTINO.name}/')
    print(f'Total no site: {len(IDS)} fotos.')
