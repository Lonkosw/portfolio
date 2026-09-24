# Studio Priorize — protótipo de site

Site para o **Studio Priorize**, salão de beleza e estética em **Campo Mourão — PR**.
Dois pilares: **cabelo** e **noivas**, com as outras cinco categorias de serviço
completas abaixo.

> ⚠️ **Protótipo de demonstração (spec work).** Não é o site oficial, e eles não
> sabem que ele existe. Enquanto `site.demo === true` em
> [`src/data/site.ts`](src/data/site.ts), aparecem a faixa no topo, a nota no
> rodapé, o `noindex` e o aviso no `robots.txt`.

## ✅ As 31 fotos são reais — zero placeholder

`src/assets/images/` tem **31 fotos do próprio Instagram do Studio Priorize**,
levantadas pelo Théo em 31/07/2026. Os originais estão em
`.imagens-originais/` (fora do build) e o recorte é reprodutível pelo script
`scratchpad/processar-fotos.py`.

### A regra que rege as legendas

> **O nome descreve A FOTO, não o serviço que a gente gostaria de vender.**

Isso não é preciosismo: quem está escolhendo cabelo repara na cor antes de ler
qualquer coisa, e uma foto de loiro platinado chamada "morena iluminada"
destrói a confiança na hora. Três nomes de arquivo do levantamento **não batiam
com a imagem** e foram corrigidos ao entrar no site:

| Arquivo original | O nome dizia | A foto mostra | Virou |
| :--- | :--- | :--- | :--- |
| `cacheado.png` | cacheado | preto liso ondulado em camadas, sem cacho nenhum | `cabelo-ondas-camadas` |
| `antes-depois-ruivo*.png` | ruivo | castanho acobreado (o ruivo de verdade é outro arquivo) | `*-acobreado` |
| `loira-iluminada.png` | loira iluminada | loiro platinado liso — "iluminada" é outra técnica | `cabelo-loiro-platinado` |

Ao trocar qualquer foto, **abra a imagem e confira a legenda**. Um `alt` ou uma
legenda errada aqui é pior do que não ter nenhuma.

### Onde cada uma entra

| Seção | Fotos |
| :--- | :--- |
| Hero | `hero-fachada` (16/9) |
| O studio | `studio-salao` + `fachada-esquina`, `fachada-placa` |
| Pilar Cabelo | `cabelo-butterfly` |
| Carrossel de tipos | 10 fotos `cabelo-*` + `depois-liso` |
| Antes e depois | 5 pares `antes-*` / `depois-*` |
| Noivas | `noiva-corpo-inteiro`, `noiva-grupo` (destaque 16/10) + 5 de apoio |
| Serviços | `fachada-esquina` |
| Agendamento (fundo) | `studio-salao` |

**Só uma foto do acervo é nativamente horizontal** (`noiva-grupo`, 1.52) — por
isso ela, e só ela, ocupa bloco largo. Todo o resto é 4:5, o formato do
Instagram deles. Esticar uma vertical num bloco 16/10 corta cabeça.

> **Os pares antes/depois são os mais delicados.** Cada par tem de ser a mesma
> cliente, no mesmo trabalho, no **mesmo enquadramento** (4:5, 1080×1350).
> Recortes diferentes fazem a cabeça pular quando o divisor passa por cima, e
> misturar clientes diferentes é propaganda enganosa — some no primeiro
> comentário de quem reconhecer a pessoa. Os 5 pares atuais foram conferidos:
> em três deles a cliente aparece com a mesma roupa nas duas fotos.

### ⚠️ Rostos identificáveis

Sete fotos mostram rosto de cliente de forma reconhecível: as duas de
maquiagem, `noiva-retrato`, `noiva-corpo-inteiro`, `noiva-espelho`,
`noiva-grupo` (quatro pessoas) e `cabelo-butterfly-frente`.

Estão no Instagram público do salão, então o salão já as publicou. Mesmo assim,
**se o site virar oficial, a autorização de uso de imagem é responsabilidade
deles e vale a pena perguntar** — sobretudo na foto do grupo, onde há quatro
pessoas que não são a cliente que contratou.

### O `limpar-bordas.py` dá dois falsos positivos aqui

Ele acusa `cabelo-cachos-grisalhos` (130px no topo) e `maquiagem-dourada`
(5px à direita). **Não corte:** o detector procura *lisura*, e nessas duas o
trecho liso é o teto do salão e o fundo escuro do estúdio — conteúdo real da
foto, não sobra de recorte.

A `hero-fachada.jpg` faz dobradinha: além da abertura, é ela que vira a **prévia
do link no WhatsApp**, recortada em 1200×630. Escolha uma com o assunto ao centro.

> **A conta das colunas ainda importa** onde há grade fixa: os serviços são 7
> numa grade de 3 (o último ocupa a linha inteira) e as noivas são 5 numa de 5.
> O carrossel e o antes/depois estão livres disso — o primeiro rola, e o
> segundo centraliza o item órfão quando a contagem é ímpar.

Depois de trocar fotos:

```bash
python tools/limpar-bordas.py sites/studio-priorize/src/assets/images            # simula
python tools/folha-contato.py sites/studio-priorize/src/assets/images conferir.png
```

**Olhe a folha de contato antes de aplicar qualquer corte.** O detector procura
faixa *lisa*, e teto de salão ou fundo de estúdio são lisos — ver os dois falsos
positivos conhecidos acima.

## O que é real e o que não é

| Real (fonte pública deles) | Escrito por mim |
| :--- | :--- |
| Nome, endereço (Av. Comendador Norberto Marcondes, 767 — Campo Mourão/PR) | Textos do hero, "O studio" e dos dois pilares |
| WhatsApp (44) 99175-6021 e o segundo número (44) 99906-6288, ambos na placa | Descrições curtas de cada serviço |
| Instagram @studiopriorize_cabelos | Encaminhamentos do diagnóstico capilar |
| A tagline **"Seja a sua prioridade."**, escrita na vitrine | Legendas da galeria |
| Horários: seg–sex e sáb, 8h30 às 18h | — |
| As 7 categorias de serviço, listadas por eles no link-in-bio atual | — |
| O perfil no Google com avaliações | — |
| Todas as fotos | — |

**Nada de preço no site.** Eles não publicam tabela em canal nenhum, e nenhuma
das três ferramentas calcula valor — todas só montam o pedido.

### ⚠️ Confirmar antes de enviar

- **As seis palavras da parede** (Saúde, Coragem, Sabedoria, Respeito, Honra,
  Amor) foram lidas na foto da recepção. Confirme a grafia e a ordem com a
  equipe antes de mandar — estão em `studio.valores`.
- **O CEP `87300-000`** é o genérico de Campo Mourão. Só aparece no JSON-LD;
  troque pelo real quando souber.
- **Não há depoimento no site.** Eles têm avaliações no Google e o card aponta
  para lá; trazer os textos para cá exige autorização.

## As três ferramentas

Ficam em contextos diferentes de propósito — três formulários empilhados no fim
da página pareceriam burocracia. Cada uma aparece onde a dúvida nasce.

| Ferramenta | Onde | O que faz |
| :--- | :--- | :--- |
| **Diagnóstico capilar** | dentro do pilar Cabelo | 3 perguntas (tipo, química anterior, objetivo) → indica por onde começar e abre o WhatsApp com as respostas |
| **Monte seu dia da noiva** | dentro do pilar Noivas | serviços, quantas madrinhas/mães/convidadas, mês, ano e horário da cerimônia → mensagem pronta com o total de pessoas |
| **Agendamento guiado** | no CTA final | serviço, dia da semana, período → mostra a prévia do que será enviado |

Todas compartilham [`src/scripts/ferramentas.ts`](src/scripts/ferramentas.ts):
mesmo mecanismo de persistência, mesma montagem de mensagem.

- **Sem conta e sem servidor.** Cada uma guarda seu estado no `localStorage`
  (`priorize:diagnostico:v1`, `priorize:noiva:v1`, `priorize:agenda:v1`) e
  sobrevive a fechar a aba. Em aba anônima o storage lança ao ser lido — todo
  acesso está em `try/catch`.
- **O diagnóstico não promete resultado.** O texto de cada encaminhamento diz
  explicitamente que é ponto de partida e depende de avaliação presencial.
  Prometer "você vai ficar loira" por um formulário seria irresponsável e
  colocaria o salão numa situação ruim.
- Sem JavaScript, os botões −/+ e os "limpar" somem, os selects e rádios
  continuam funcionando e os CTAs levam ao WhatsApp com a mensagem genérica.

## Os dois blocos visuais

Além das ferramentas, duas seções existem para **mostrar** em vez de descrever.

### Antes e depois arrastável — [`AntesDepois.astro`](src/components/AntesDepois.astro)

Duas fotos empilhadas; a de cima é recortada por `clip-path: inset()` lendo a
custom property `--p`. O controle é um **`<input type="range">` transparente**
por cima de tudo, não uma `<div>` com `mousedown`: assim ganha teclado, leitor
de tela e o gesto de arrastar de graça, do próprio navegador.

- `clip-path` e não `width`: mudar largura relayoutaria a imagem a cada pixel
  de arrasto. O `clip-path` roda no compositor e a foto de baixo nunca se move,
  então as duas ficam alinhadas o tempo todo.
- `will-change` só durante o arrasto (classe `is-drag`). Permanente, ele
  seguraria uma camada de GPU por comparador para sempre.
- As etiquetas ANTES/DEPOIS somem quando o divisor cobre o canto delas —
  senão "ANTES" fica boiando sobre a foto do depois e mente.

### A seção "Galeria de transformações" foi removida

Ela existia quando o site não tinha nem carrossel nem antes/depois. Com os dois
no ar virava a **terceira seção seguida de fotos de cabelo em grade** — e a mais
fraca das três, porque só olhava, não fazia nada. O carrossel já é o portfólio
(e cada foto abre o WhatsApp); o antes/depois já é a prova. As fotos foram
redistribuídas, nenhuma se perdeu.

### Legendas são opcionais

Em `studio.galeria` e `noivas.galeria` o campo `legenda` pode simplesmente não
existir — o componente checa antes de renderizar a `<figcaption>`. Isso é
intencional: escrever "noiva sorrindo" embaixo da foto de uma noiva sorrindo, ou
"placa da fachada" embaixo da placa, não acrescenta nada e polui. **Legenda que
só repete a imagem é ruído; onde a foto se explica, deixe sem.**

### Carrossel de tipos — [`TiposCabelo.astro`](src/components/TiposCabelo.astro)

Seis tipos de cabelo lado a lado. Cada cartão é um **link de WhatsApp com o
tipo já escrito na mensagem**: a cliente não precisa saber dizer "morena
iluminada", ela aponta a foto.

- **`scroll-snap` nativo, sem biblioteca.** Sem JavaScript a fila continua
  arrastável e navegável por Tab; o script só acrescenta as setas do desktop.
- ⚠️ **`scroll-pl-*` TEM de casar com o `px-*` da fila.** Sem isso, `snap-start`
  alinha o cartão ignorando o padding e o navegador desloca a fila sozinho pelo
  tamanho exato do padding logo depois da carga — a seção abria com o primeiro
  cartão cortado e a seta "voltar" habilitada sem ninguém ter avançado.
- A seta "voltar" nasce `disabled` **no HTML**, não só pelo script: senão
  aparece clicável até o JS rodar.

## Stack

- **Astro 7** estático, zero framework de UI
- **Tailwind CSS 4** com tokens no `@theme` de [`src/styles/global.css`](src/styles/global.css)
- **Animação de entrada em CSS puro.** GSAP + ScrollTrigger + Lenis existem, mas
  só no desktop e por import dinâmico
- Fontes auto-hospedadas via `@fontsource`: **Prata** (display) + **Manrope** (corpo)

## Arquitetura do JavaScript

O site é dividido em dois pedaços, e a divisão é a decisão de performance mais
importante do projeto:

| Arquivo | Peso | Quem baixa |
| :--- | :--- | :--- |
| [`base.ts`](src/scripts/base.ts) | ~11 KB | **todo mundo** — inclui as ferramentas, o comparador e o carrossel |
| [`desktop.ts`](src/scripts/desktop.ts) | ~130 KB | só telas ≥1024px **com mouse** |

O `base.ts` não tem uma dependência. Ele cobre o site inteiro: abertura do hero,
revelações, header, menu, âncoras, as três ferramentas, o antes/depois e o
carrossel. O `desktop.ts` carrega GSAP para as três coisas que o CSS não faz
bem: **parallax com `scrub`** (valor contínuo amarrado ao scroll), **cursor e
botões magnéticos** (alvo muda a cada `mousemove`, com inércia) e **Lenis**.

**No celular, os 130 KB não são sequer pedidos.**

### A animação de entrada é CSS

Toda a coreografia — hero e revelações — está em `global.css`. O JavaScript faz
uma coisa: adicionar `.is-pronto` no hero e `.is-visivel` no que entra na tela.
O stagger dos grupos vem de uma variável `--i` que o CSS multiplica.

Isso derrubou 78 KB. O GSAP estava fazendo, no celular, apenas transições de
`opacity` e `transform` disparadas uma vez — exatamente o que o CSS faz
nativamente, no compositor, sem baixar nada.

> **O SplitText também saiu**, e por um motivo que só apareceu ao ler o HTML: o
> título já vem do `site.ts` como **um `<span>` por linha**. O plugin estava
> dividindo em linhas um texto que o build já entregava dividido. Hoje cada
> linha tem a própria máscara de `overflow`, montada no build.

### Performance: o que descobrimos medindo

Nada aqui veio de palpite — e o palpite óbvio errou duas vezes.

| Causa | Correção | Efeito |
| :--- | :--- | :--- |
| **`backdrop-filter` no header** (barra fixa, largura toda, reprocessa o desfoque a cada quadro com a página passando por baixo) | Fundo opaco a 96% | Quadros >50ms: 3 → 0 |
| **GSAP no celular** para fazer só fade e translate | Animação de entrada em CSS | JS de 89 → **11 KB** |
| 33 ScrollTriggers para as revelações | Um `IntersectionObserver` + transições CSS | Some do custo de scroll |
| `opacity: 0` na foto do hero | Entra só com escala | **LCP de 2980 → 624 ms** |
| Abertura de 2,8s também no celular | 1,5s no celular, 2,8s no desktop | Deixa de ler como espera |
| `gsap.to()` a cada `mousemove` no cursor | `quickTo` reaproveitado + rAF | Uma tween em vez de dezenas por segundo |
| 84 listeners de hover (2 por `<a>`/`<button>`) | Delegação com `mouseover` no documento | 84 → 2 |
| Listener de scroll lendo `scrollY` no header | `IntersectionObserver` numa sentinela | 2 chamadas na vida da página |
| 25 imagens em 11 seções calculadas a cada quadro | `content-visibility: auto` | `Layout` no scroll: 194 → 85 ms |

**Onde as duas teorias falharam:**

> ⚠️ **Cortar JavaScript não resolveu a travada.** O bundle caiu de 151 para
> 82 KB e o pior quadro **não mudou**. O culpado era o `backdrop-filter`, e só
> o trace mostrou isso.

> ⚠️ **Esconder o hero para consertar o "corte seco" custou o LCP.** A correção
> funcionou visualmente, mas a foto — que é o elemento LCP — passou a só contar
> quando terminava de aparecer: **1140 → 2980 ms**. A saída foi tirar o fade da
> foto e deixar só a escala. O movimento continua, e o LCP caiu para 624 ms.

> ⚠️ **`content-visibility` vale nos dois tamanhos.** Testamos desligá-lo no
> desktop, achando que com CPU sobrando ele só concentraria trabalho num quadro.
> O pior quadro **subiu de 41 para 132 ms**.

### Números atuais no celular

Medido em 390×844, 4G, CPU 4× mais lenta, **sem cache** — a primeira visita de
quem clica no link do WhatsApp na rua.

| Métrica | Valor | Referência |
| :--- | ---: | :--- |
| FCP | 624 ms | bom < 1800 |
| LCP | 624 ms | bom < 2500 |
| CLS | 0 | bom < 0.1 |
| Total baixado | 244 KB | — |
| JavaScript | 11 KB | — |
| Pior quadro no scroll | 30–35 ms | — |
| Quadros acima de 50 ms | **0** | — |

> ⚠️ **`content-visibility` quebra `Page.captureScreenshot` com
> `captureBeyondViewport`**: seção fora da tela não renderiza e sai preta na
> foto. Para conferir visualmente, role até a seção de verdade
> (`scratchpad/shot-secao.mjs`), **e meça a posição depois de rolar** — as
> alturas mudam no caminho.

## Decisões de design

**Paleta da marca, não a genérica do nicho.** O gerador de design system sugeriu
rosa-choque `#EC4899` com fonte cursiva — o clichê "beleza = rosa". A marca deles
é outra: **vinho `#8E1B3C`** da placa e do logo, **dourado `#C39B4E`** do aro do
monograma, **marfim** e **rosé** do interior. A paleta saiu das fotos.

> O dourado só é texto sobre fundo escuro: sobre o marfim ele dá **2,34:1** e
> reprovaria em qualquer teste. Para texto dourado no claro existe
> `--color-dourado-tinta` (`#7A5C1E`), que dá 5,64:1.

**Escuro do topo ao rodapé.** A primeira versão alternava claro e escuro; ficou
descartada. O site é bordô profundo `#1F0A10` com texto em bege `#EFE3D6` e bege
escuro `#C4AC9E` no secundário — mesma família dos outros dois protótipos.

A profundidade vem de **três níveis de superfície**, não de trocar de tema:
`--color-fundo` → `--color-superficie` (cards, marquee, galeria) →
`--color-superficie-hi` (hover). O componente escreve `bg-fundo text-texto` e
nunca precisa saber onde está.

Divisão dos dois tons da marca, ditada pelo contraste:

| Cor | Uso | Por quê |
| :--- | :--- | :--- |
| **Bordô `#8E1B3C`** | só preenchimento: botão, faixa, véu sobre foto | como texto no fundo escuro dá **2,14:1** e some |
| **Dourado `#C39B4E`** | texto de acento: eyebrow, numerais, links | **7,28:1** sobre o fundo |

> **Armadilha que me pegou:** eu tinha escrito `--color-fundo: var(--c-fundo)`
> dentro do `@theme`. Propriedade customizada resolve **onde é declarada**, e o
> `@theme` do Tailwind vira `:root` — então o valor era calculado uma vez e
> herdado fixo, deixando texto claro sobre fundo claro. Os tokens semânticos
> têm de ser cores **finais**, nunca `var()` de outra variável.

**Prata no display.** Didone de eixo vertical e contraste alto entre haste e
filete: é a letra de revista de beleza. Nada a ver com a Cormorant do site do
Recanto nem com script de convite de casamento.

**Tokens de movimento.** Uma escala só (`--dur-fast/base/slow/slower`) e curvas
por direção: `--ease-out` para o que entra, `--ease-in` para o que sai (e mais
curto — as coisas devem ir embora mais rápido do que chegam). O menu do celular
sai uma faixa mais rápido do que entra.

**A abertura é a exceção deliberada.** Existe uma faixa separada,
`--dur-cena` (1,6s) e `--dur-cena-longa` (2,2s), usada **só** na entrada do
hero: a foto assenta primeiro, o título sobe em seguida, e o resto aparece por
último, com 160ms entre cada item. São ~2,8s do começo ao fim. Isso só se
justifica porque acontece **uma vez por visita** — duração longa em ação
repetida vira imposto. Nada fora do hero passa de `--dur-slower`.

A curva do hero é `power2.out`, não `expo.out`. A expo despeja quase todo o
movimento nos primeiros 20% e depois rasteja, o que lê como "apareceu de
repente e ficou parado" — exatamente a queixa que motivou a mudança.

**Legenda de foto com piso de contraste.** As legendas da galeria têm cor sólida
**por baixo** do gradiente. Só com gradiente, o contraste dependeria de quão
clara é a foto — e uma imagem estourada engoliria o texto.

## Verificações feitas

Rodadas de verdade, com o servidor no ar:

- **Build de produção** passa limpo
- **Ferramentas: 64/64** em [`scripts/test-ferramentas.mjs`](scripts/test-ferramentas.mjs)
  — 32 checagens rodadas duas vezes, com animação normal **e** com
  `prefers-reduced-motion` forçado. Cobre progresso do diagnóstico, resultado
  escondido com respostas parciais, encaminhamento correto, contadores da noiva
  (piso zero e teto por grupo), mês por extenso sem erro de fuso, prévia do
  agendamento, todos os CTAs carregando o pedido, persistência após recarregar e
  as três chaves saindo do `localStorage` ao limpar
- **Contraste WCAG: 0 reprovados em 45 pares**, pior caso **5,84:1** — resolvendo
  `oklab` por canvas
- **WhatsApp: 34/34** em [`tools/test-whatsapp.mjs`](../../tools/test-whatsapp.mjs)
  — testa **todo** caminho que leva ao WhatsApp com o navegador de verdade,
  incluindo os três links reescritos por JS. Verifica host `wa.me`, número certo,
  mensagem sem mojibake, `target=_blank` com `noopener`, que o link **muda**
  depois de preencher, que a prévia na tela é idêntica ao que vai no link, e que
  "limpar" não deixa lixo nem no href nem no `localStorage`
- **Antes/depois e carrossel: 24/24** em
  [`tools/test-comparador.mjs`](../../tools/test-comparador.mjs) — que mover o
  range move o recorte de verdade, que a camada de cima **não** muda de largura,
  que as etiquetas somem na hora certa, que as setas avançam e voltam a fila, e
  que os dois funcionam sem JavaScript
- **Scroll fluido** medido com CPU 4× desacelerada (celular) e 2× (desktop) em
  [`tools/perf-scroll.mjs`](../../tools/perf-scroll.mjs)
- **Sem overflow horizontal** em 390, 375 e 768
- **Nenhum texto abaixo de 12px**; nenhum `data-reveal` preso invisível
- **Grades sem vão** em 1440: serviços 3 linhas cheias, noivas 1 de 5, e o 5º
  par do antes/depois centralizado em vez de órfão à esquerda
- 0 âncoras quebradas, 0 links de WhatsApp malformados, 0 externos sem `noopener`
- **Interruptor `demo`** testado nos dois sentidos com build, e o `site.ts`
  restaurado byte a byte
- **`og:image` absoluto**, `canonical` e JSON-LD `BeautySalon` com endereço,
  horário e os 7 serviços

### O que **não** foi verificado

- **A fluidez num aparelho de verdade.** O `perf-scroll.mjs` roda em headless com
  CPU desacelerada, e o número oscila bastante entre execuções da **mesma** build
  (de 1 a 5 quadros longos). Ele serve para comparar antes/depois de uma mudança,
  não como nota absoluta. O que é sólido é o trace: `Layout` no scroll caiu de
  194ms para 38ms. **Confirme no seu celular.**
- **Texto sobre foto.** O `contraste.mjs` pula esses pares de propósito (o valor
  depende do trecho da imagem). Os véus do hero foram refeitos à mão quando a
  foto real entrou — calibrados sobre o placeholder magenta, somavam tanto que a
  fachada virava textura irreconhecível. Conferido a olho; não medido.
- **Aparelho real.** A emulação é do Chrome DevTools Protocol no Edge.
- **Alvos de toque:** os `<input>` de rádio e checkbox são `sr-only` de propósito
  — o alvo real é o rótulo, com 46 a 52px. O link "pular para o conteúdo" é a
  exceção conhecida.

## Comandos

| Comando | Ação |
| :--- | :--- |
| `npm install` | Instala as dependências |
| `npm run dev` | Servidor local |
| `npm run build` | Gera o site estático em `./dist/` |
| `node scripts/test-ferramentas.mjs` | 64 checagens das três ferramentas |

Os testes abaixo precisam do **site servido** (`npm run build`, depois qualquer
servidor estático apontando para `dist/`). Rodam da **raiz do repositório**:

| Comando | Ação |
| :--- | :--- |
| `node tools/test-whatsapp.mjs <url> 5544991756021` | Todo caminho até o WhatsApp |
| `node tools/test-comparador.mjs <url>` | Antes/depois e carrossel |
| `node tools/contraste.mjs <url>` | Contraste WCAG de todos os pares |
| `node tools/perf-scroll.mjs <url> --cpu 4 --mobile` | Fluidez do scroll |
| `node tools/perf-trace.mjs <url> --cpu 4 --mobile` | **Onde** o tempo é gasto |
| `node tools/perf-mobile.mjs <url> --rede 4g --cpu 4` | LCP, FCP, CLS e peso na primeira visita |
| `node tools/test-toque.mjs <url>` | O site com **dedo**: arrasto, rótulos, menu, hover preso |
| `node tools/qa-mobile.mjs <url> 390 844` | Varredura mobile: overflow, alvos, texto pequeno |

## Onde mexer

| Quero mudar... | Arquivo |
| :--- | :--- |
| Textos, contato, serviços, horários | [`src/data/site.ts`](src/data/site.ts) |
| Perguntas e encaminhamentos do diagnóstico | `diagnostico` em `site.ts` |
| Opções do dia da noiva | `montagemNoiva` em `site.ts` |
| Os pares de antes/depois | `antesDepois` em `site.ts` |
| Os tipos do carrossel | `tiposCabelo` em `site.ts` |
| Cores, fontes, tokens de movimento | [`src/styles/global.css`](src/styles/global.css) |
| Coreografia das animações de entrada | `@layer` de entrada em [`global.css`](src/styles/global.css) |
| Quem dispara as animações | [`src/scripts/base.ts`](src/scripts/base.ts) |
| Parallax, cursor, scroll suave | [`src/scripts/desktop.ts`](src/scripts/desktop.ts) |
| Lógica das três ferramentas | [`src/scripts/ferramentas.ts`](src/scripts/ferramentas.ts) |
| Divisor do antes/depois | [`src/scripts/comparador.ts`](src/scripts/comparador.ts) |
| Setas do carrossel | [`src/scripts/carrossel.ts`](src/scripts/carrossel.ts) |

## Créditos das imagens

As fotos são **do próprio Studio Priorize**, retiradas do Instagram público. Leia
[`CREDITOS-IMAGENS.md`](CREDITOS-IMAGENS.md) antes de publicar.
