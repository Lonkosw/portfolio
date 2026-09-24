# Dolce Cau — protótipo de site

Site de vitrine para a **Dolce Cau**, doceria artesanal de Maringá — PR, especializada
em doces finos para casamentos e eventos.

> ⚠️ **Isto é um protótipo de demonstração (spec work).** Não é o site oficial da doceria.
> Enquanto `site.demo === true` em [`src/data/site.ts`](src/data/site.ts), aparece uma
> faixa de aviso no topo e uma nota no rodapé deixando isso explícito para quem visitar.

## Antes de enviar para o cliente

1. A seção de **depoimentos está vazia de propósito** — um card pontilhado reservando o
   espaço. Nenhum depoimento fictício vai para o cliente. Quando a doceria mandar as
   avaliações reais, elas entram em `depoimentos` ([`src/data/site.ts`](src/data/site.ts)).
2. **Não há CTA de contato do desenvolvedor** no protótipo. A faixa do topo só identifica
   que é uma amostra; a abordagem é feita por fora (DM/WhatsApp).
3. Os **textos de apresentação** (hero, "O ateliê") foram escritos por mim a partir do
   posicionamento deles. Cardápio, preços, prazos, formas de pagamento e endereço são
   reais, extraídos do menu oficial.

## O que é real e o que não é

| Real (fonte oficial) | Inventado por mim |
| :------------------- | :---------------- |
| 52 sabores com preço de cento e unitário | Textos do hero e da seção "O ateliê" |
| Descrição de cada doce | — |
| Prazos, sinal, formas de pagamento | — |
| Endereço, WhatsApp, horário | — |
| Todas as fotos | — |

## Simulador de orçamento

O visitante monta o pedido no próprio cardápio (botão **Adicionar**, depois
`−`/`+` ou digitando a quantidade), acompanha o total num botão flutuante e
termina no WhatsApp da doceria com o pedido já escrito.

- **Sem conta e sem servidor.** A seleção fica no `localStorage` do navegador
  (`dolcecau:orcamento:v1`) e sobrevive a fechar a aba. Se o storage estiver
  bloqueado (aba anônima), o orçamento simplesmente vale só para aquela visita.
- **Como o preço é calculado** — leitura das regras do menu oficial: a partir de
  **100 doces no total** vale o preço de cento (os sabores se misturam para
  fechar o cento, com o mínimo de 25 por sabor); abaixo disso vale o preço
  unitário, com mínimo de 10 por sabor. O painel avisa quando algum sabor está
  abaixo do mínimo, e o valor é sempre rotulado como **estimativa**.
- Os CTAs de WhatsApp do hero e da seção Orçamento passam a levar o pedido junto
  quando há algo selecionado.

| Arquivo | Papel |
| :------ | :---- |
| [`src/scripts/orcamento.ts`](src/scripts/orcamento.ts) | Estado, cálculo, persistência e mensagem |
| [`src/components/Orcamentador.astro`](src/components/Orcamentador.astro) | Botão flutuante e painel lateral |
| [`src/components/Cardapio.astro`](src/components/Cardapio.astro) | Os controles dentro de cada card |
| [`src/data/cardapio.ts`](src/data/cardapio.ts) | `regras` — os mínimos e o tamanho do cento |

Sem JavaScript os controles não aparecem (não teriam o que fazer) e o site
continua funcionando como vitrine, com o CTA normal de WhatsApp.

## Stack

- **Astro 7** com saída estática (HTML/CSS/JS puro, sem servidor)
- **Tailwind CSS 4** com tokens no `@theme` de [`src/styles/global.css`](src/styles/global.css)
- **GSAP** (ScrollTrigger + SplitText) e **Lenis** para o scroll suave
- Fontes auto-hospedadas via `@fontsource` (Playfair Display + Inter) — sem chamada ao Google

## Comandos

| Comando           | Ação                              |
| :---------------- | :-------------------------------- |
| `npm install`     | Instala as dependências           |
| `npm run dev`     | Servidor local em `localhost:4321`|
| `npm run build`   | Gera o site estático em `./dist/` |
| `npm run preview` | Pré-visualiza o build de produção |

## Onde mexer

| Quero mudar...                     | Arquivo                                                           |
| :--------------------------------- | :---------------------------------------------------------------- |
| Textos, contato, seções            | [`src/data/site.ts`](src/data/site.ts)                             |
| Sabores, preços e descrições       | [`src/data/cardapio.ts`](src/data/cardapio.ts)                     |
| Cores, fontes, ritmo das animações | [`src/styles/global.css`](src/styles/global.css) (bloco `@theme`)  |
| Comportamento das animações        | [`src/scripts/motion.ts`](src/scripts/motion.ts)                   |
| Regras do simulador de orçamento   | `regras` em [`src/data/cardapio.ts`](src/data/cardapio.ts)          |
| A abertura cinematográfica (hoje **desligada**) | ver [`ABERTURA-CINEMATOGRAFICA.md`](ABERTURA-CINEMATOGRAFICA.md) |
| Fotos                              | `src/assets/images/` + referência em `site.ts`                     |

As fotos são referenciadas **pelo nome do arquivo** (sem extensão) no `site.ts`, e
[`src/lib/images.ts`](src/lib/images.ts) faz a ponte com o otimizador do Astro — que
converte tudo para WebP e injeta `width`/`height` (zero layout shift).

## Decisões de design

**Paleta dark chocolate.** Fundo `#141010` (preto quente, não puro — preto puro em OLED
"borra" no scroll), acento dourado `#C89457`, texto creme. Todos os pares de cor foram
verificados: o menor contraste do site é **6.67:1**, acima do mínimo AA de 4.5:1.

**No celular tudo vai ao centro.** No desktop as seções abrem à esquerda, ao lado
de uma foto. No celular não há coluna ao lado — texto encostado à esquerda briga
com a marca, que é centralizada no topo. Abaixo de `lg`, o atributo
`data-centro-mobile` (regra única em [`global.css`](src/styles/global.css))
centraliza o bloco de cabeçalho de cada seção e esconde o filete do `eyebrow`,
que numa linha estreita forçava quebras feias.

**Menu do celular é um leque, não uma tela cheia.** Abre ancorado sob o botão,
ocupa ~25% da tela, fecha no mesmo botão (as barrinhas viram X), no toque fora
ou no Esc. Antes era um overlay de tela cheia com um segundo botão de fechar que
não funcionava — `querySelector` pegava só o primeiro `[data-menu-toggle]`.

**Animação com orçamento de desempenho.** Só `transform` e `opacity` são animados —
nunca `width`/`height`/`top`, que forçam reflow. O Lenis (scroll suave) roda **apenas no
desktop**; no toque o scroll nativo é mais previsível e não briga com o gesto de voltar
do sistema. Cursor customizado e botões magnéticos só em `pointer: fine`.

**`prefers-reduced-motion` desliga tudo.** Um script inline no `<head>` roda antes da
primeira pintura e remove a classe `js-anim`, então o conteúdo nunca fica preso invisível
— nem com a preferência ligada, nem se o JS falhar ao carregar.

## Verificações feitas

- Build de produção passa; imagens otimizadas (a maior caiu de 1269 kB para 45 kB em WebP)
- Simulador de orçamento testado ponta a ponta no navegador (24 verificações):
  troca de preço unitário → cento aos 100 doces, persistência após recarregar,
  mensagem do WhatsApp, limpar, e tudo de novo com `prefers-reduced-motion`
- Sem overflow horizontal em **375 / 768 / 1440** (`scrollWidth === viewport` nos três)
- Inspeção mobile: blocos centralizados simétricos ao pixel em 375 e 768; todos
  os alvos de toque com ≥44px de altura; nenhum texto abaixo de 12px
- Layout conferido com animação ligada **e** com `prefers-reduced-motion` forçado
- Contraste WCAG AA verificado em todos os pares de texto/fundo
- Navegação por teclado com foco visível e link "pular para o conteúdo"

## Créditos das imagens

Todas as fotos são **da própria Dolce Cau**, retiradas do menu oficial e do Instagram.
Isso deixa o protótipo muito mais convincente, mas as imagens **não são suas** — leia
[`CREDITOS-IMAGENS.md`](CREDITOS-IMAGENS.md) antes de publicar em domínio público.
