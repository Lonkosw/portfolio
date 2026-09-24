# Ânima Confeitaria — protótipo

Protótipo **não solicitado** para a Ânima Confeitaria Artesanal, do Jardim
Alvorada, em Maringá — PR ([@animaconfeitaria](https://www.instagram.com/animaconfeitaria)).
A casa não tem site: tem Instagram e um link que leva direto ao WhatsApp.

## A decisão que define este site: não há preço

A Ânima **não publica valores** — e isso não é descuido. Bolo de casamento e
docinho de festa se orçam por evento: quantidade, data, sabor, montagem.

Isso muda o site inteiro. Não existe cardápio com tabela, e o lugar dele é
ocupado por duas coisas:

1. **"O que fazemos"** — seis categorias, cada uma um link para o WhatsApp
   com o assunto já escrito.
2. **"Como encomendar"** — três passos. Quando não há preço, a dúvida que
   trava a cliente deixa de ser *quanto custa* e passa a ser *como funciona
   e será que ainda dá tempo*.

> ⚠️ **Nunca invente preço aqui.** Um valor errado num orçamento de casamento
> é pior do que valor nenhum.

## As fotos são deles, do Instagram

`src/assets/images/` tem **11 fotos do próprio perfil**, recortadas para os
slots do site. Os originais estão em `.imagens-originais/` (fora do build) e
o recorte é reprodutível:

```bash
python scripts/processar-fotos.py .imagens-originais src/assets/images
```

O mapa de origem→destino, o corte de interface e o viés de enquadramento
estão todos em [`scripts/processar-fotos.py`](scripts/processar-fotos.py).

### ⚠️ As bolinhas do carrossel

Três fotos vieram de posts em carrossel e traziam **os pontinhos de paginação
do Instagram** no rodapé. Elas não são faixa lisa, então o `limpar-bordas.py`
não as encontra, e a olho passam por sujeira da imagem.

O script já corta 36px do rodapé dessas três (`10.png`, `11.png`, `04.png`).
**Ao trocar qualquer foto, confira o rodapé ampliado** — deixar a interface
de outro aplicativo aparecendo denuncia de onde a imagem veio.

### A foto de lembrancinha é de Natal

É a única disponível para a categoria: pães de mel com Papai Noel e boneco de
neve. Mostra bem o acabamento, mas é sazonal. Se o site for ao ar fora de
dezembro, vale pedir uma lembrancinha de casamento ou aniversário.

## ⚠️ O que é real e o que não é

| Real (fonte pública deles) | Escrito por mim |
| :--- | :--- |
| Nome, endereço, CEP, Instagram | Todos os textos de seção |
| **WhatsApp (44) 99951-0811** — está na legenda dos posts | A redação sobre "artesanal" |
| Os produtos citados (pão de mel, pirulito, palha italiana, cupcake, brigadeiro) | Os três passos de "Como encomendar" |
| As 11 fotos | — |

### Confirmar antes de enviar

| O quê | Onde | Situação |
| :--- | :--- | :--- |
| **Horário de funcionamento** | `site.horarios` | **VAZIO de propósito.** Não confirmado — e é melhor não dizer do que a cliente chegar na porta fechada. Preenchendo o array, a seção aparece sozinha |
| **O prazo de encomenda** | `como.nota` | Escrito vago ("com antecedência") porque o prazo real deles não é conhecido. Prometer "15 dias" sem saber queima a primeira encomenda |
| Se atendem só encomenda ou têm balcão | `visite.texto` | Assumido "encomendas por WhatsApp" pelo link-in-bio |

## Design

**Este site é CLARO, e isso é uma decisão.** O DolceCau é escuro porque doce
fino sobre preto lê como joalheria. A Ânima faz o oposto: bolo de casamento
branco, docinho em forminha perolizada, flor branca, renda. Sobre fundo
escuro esse trabalho perde justamente a delicadeza. Aqui o fundo é creme,
como a toalha de uma mesa posta, e as fotos é que trazem a cor.

| Cor | De onde veio |
| :--- | :--- |
| Rosa queimado `#a64b52` | As rosas vermelhas do bolo semi-naked |
| Verde `#6b7f63` | A folhagem dos arranjos, presente em quase toda mesa |
| Cacau `#3d2b21` | O texto — marrom, nunca preto |
| Creme `#faf6f0` | A massa e a renda das forminhas |

**Tipografia: Fraunces + Figtree.** A Fraunces é uma soft-serif variável com
*wonk* — as serifas têm um desvio proposital que dá aspecto de letra
desenhada à mão. Para uma casa que vende exatamente isso, é mais honesta que
uma didone de revista, que seria fria demais.

Nenhuma outra casa do portfólio usa Fraunces (DolceCau usa Playfair, Priorize
usa Prata, Ana Bistrô usa Bodoni, Recanto usa Cormorant).

## Arquitetura

- **Astro 7** estático, zero framework de UI
- **Tailwind CSS 4** com tokens no `@theme` de [`global.css`](src/styles/global.css)
- **5 KB de JavaScript**, sem uma única dependência

### Animação sem biblioteca

Toda a coreografia está no CSS. O JavaScript faz uma coisa: pôr `.is-pronto`
no hero e `.is-visivel` no que entra na tela. Não há GSAP nem Lenis — são
transições de `opacity` e `transform` disparadas uma vez, exatamente o que o
CSS faz nativamente, no compositor.

### ⚠️ O texto do hero entra sem `opacity` — e o motivo é o LCP

No celular a foto do hero fica abaixo da dobra, então quem conta como "maior
elemento pintado" é o **parágrafo**. E o navegador só considera pintado o que
está visível: com `opacity: 0`, o cronômetro do LCP corre até a animação
terminar.

Medimos **2564 ms**. O site não estava lento — o texto é que esperava a vez
de entrar.

`transform`, ao contrário de `opacity`, **não adia o LCP**. Trocando o fade
por um deslocamento um pouco maior, o movimento continua (a olho quase não se
nota) e a métrica caiu para **412 ms**.

**Não reintroduza `opacity` no `[data-hero-fade]` sem medir o LCP depois.**

## Verificações

Rodadas de verdade, com o site servido:

- **56/56** em [`scripts/test-orcamento.mjs`](scripts/test-orcamento.mjs) —
  28 checagens rodadas duas vezes, com animação normal **e** com
  `prefers-reduced-motion` forçado, usando **eventos de toque reais**. Cobre
  marcar por toque, múltipla escolha, desmarcar, data por extenso sem erro de
  fuso, prévia idêntica ao link, os 4 CTAs em sincronia, limpar de verdade e
  persistência após recarregar
- **QA "usuário chato"** limpo em 390px e 1440px
  ([`tools/qa-chato.mjs`](../../tools/qa-chato.mjs))
- **Contraste WCAG: 24 pares, 0 reprovados**
- **Celular** (4G, CPU 4× lenta, sem cache): **LCP 412 ms · CLS 0 · 346 KB**
- **Scroll**: pior quadro 40 ms, **zero** quadros acima de 50 ms em 3 execuções
- 0 âncoras quebradas, 10 links de WhatsApp bem-formados, 0 externos sem `noopener`

### O que **não** foi verificado

- **Aparelho real.** A emulação é do Chrome DevTools Protocol no Edge.
- **Texto sobre foto.** O medidor de contraste pula esses pares de propósito.
  Nas legendas da galeria há `bg-cacau/70` sólido por baixo do gradiente
  justamente porque as fotos são claras — bolo branco sob texto creme não
  perdoa.

## Comandos

| Comando | Ação |
| :--- | :--- |
| `npm install` | Instala as dependências |
| `npm run dev` | Servidor local |
| `npm run build` | Gera o site estático em `./dist/` |
| `node scripts/test-orcamento.mjs <url>` | 56 checagens do montador |
| `python scripts/processar-fotos.py .imagens-originais src/assets/images` | Refaz os recortes |

## Onde mexer

| Quero mudar... | Arquivo |
| :--- | :--- |
| Textos, contato, endereço | [`src/data/site.ts`](src/data/site.ts) |
| As categorias de "O que fazemos" | `fazemos` em `site.ts` |
| As opções do orçamento | `orcamento` em `site.ts` |
| Os horários (hoje vazios) | `site.horarios` |
| Cores, fontes, tokens de movimento | [`src/styles/global.css`](src/styles/global.css) |
| Coreografia das animações | bloco "ANIMAÇÕES DE ENTRADA" no `global.css` |
| Lógica do montador | [`src/scripts/orcamento.ts`](src/scripts/orcamento.ts) |
| Recorte das fotos | [`scripts/processar-fotos.py`](scripts/processar-fotos.py) |
