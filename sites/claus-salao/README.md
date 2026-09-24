# Claus Cabeleireiros — protótipo de site

Salão de beleza em Maringá — PR, Rua Paranaguá, 249 — Zona 7. Cor e mechas,
corte, penteado, maquiagem e unhas.

> ⚠️ **Isto é um protótipo de demonstração (spec work).** Não é o site
> oficial deles, e eles não sabem que existe. Enquanto `site.demo === true`
> em [`src/data/site.ts`](src/data/site.ts), aparecem a faixa de aviso no
> topo, a nota no rodapé, o `noindex` e o aviso no `robots.txt`.

## No ar

**https://clauscabeleireiros-demo.netlify.app** — publicado em 07/08/2026.

## O diferencial deste site

É o terceiro salão da pasta, mas o único com um acervo que permite provar a
transformação: **dois pares de antes/depois da mesma cliente, no mesmo dia**
(mesma roupa, mesmo ângulo — dá para conferir). Por isso a seção
"Antes e depois" vem logo depois da abertura, à frente do portfólio — nos
outros sites a ordem é o contrário.

Tem também **dois vídeos de transformação**, que só baixam quando a pessoa
toca (juntos pesam 3,4 MB — dez vezes o resto da página). O clique troca um
`<button>` por um `<video controls>` de verdade; antes disso não existe nem
a tag.

## Formato

Home + antes/depois + vídeos + trabalhos + serviços + sobre — o formato
pequeno da leva atual (ver `estrategia-sites-menores` na memória do Théo).
Clonado de `sites/joyce-adeline/`.

## As mídias

Bruto em `imagens-claus/`, processado por
[`scripts/processar-midias.py`](scripts/processar-midias.py) para
`src/assets/fotos/` e `public/video/`:

```bash
python scripts/processar-midias.py
```

Resolve: uma seta de carrossel (`antess-loiro.png`), o alinhamento de
tamanho entre as duas fotos de cada par (obrigatório para o comparador não
"saltar" durante o arrasto) e a compressão dos vídeos (crf 30, 24fps, sem
áudio — comparado quadro a quadro antes de escolher o valor).

⚠️ **Se entrar par novo no comparador, ele precisa vir completo** (antes +
depois da mesma pessoa). Um par com clientes diferentes destrói a única
coisa que a seção tem de valioso.

## O que é real e o que não é

| Real (fonte pública deles) | Escrito por mim |
| :--- | :--- |
| Nome, endereço, os dois telefones, Instagram | Textos do hero e do "sobre" |
| Todas as fotos e os dois vídeos | — |
| Categoria "Salão de beleza" | Os quatro serviços foram DEDUZIDOS das fotos (cabelo, penteado, maquiagem, unha) — não há lista publicada. Conferir com eles. |

**Nada de preço.** Coloração é orçada no olho, depende do histórico químico
do cabelo — publicar valor gera a pior conversa que existe.

### ⚠️ Confirmar antes de enviar

- **A lista de serviços** — deduzida das fotos, nunca publicada por eles.
- **Os dois telefones** — lidos do perfil em 06/08/2026.

## Verificações feitas (contra a URL publicada)

- `qa-chato` em 390 e 1440: nada a reclamar
- Contraste WCAG: 0/26 reprovados · contraste sobre foto (hero): 0 reprovados
- Comparador: 11/11 · WhatsApp: todos os caminhos (2 números) · Toque: ok
- Movimento reduzido: 17/17, cobrindo o comparador continuar arrastável e os
  vídeos não tocarem sozinhos
- Clique real no botão de vídeo: nada baixa antes do toque, baixa e toca
  depois
- Celular, 4G, CPU 4× lenta: LCP ~700ms, CLS 0, 381 KB na primeira visita
  (os vídeos não entram nessa conta)

## Créditos das mídias

Fotos e vídeos são **do próprio Claus Cabeleireiros**, do Instagram público.
Leia [`CREDITOS-IMAGENS.md`](CREDITOS-IMAGENS.md) antes de publicar de
verdade.
