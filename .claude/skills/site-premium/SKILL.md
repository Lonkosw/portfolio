---
name: site-premium
description: "Constrói ou revisa sites com sensação de estúdio premium: animações suaves de entrada por scroll, transições consistentes, cursor/hover sofisticados, e uma base técnica (imagens, performance, responsivo, UX/conversão) que faz o site parecer mais avançado do que o esforço que levou para construir. Use ao criar um site/protótipo novo do zero, ao dar uma "repaginada" visual em um site existente, ou ao revisar um site antes de entregar/publicar. Não é sobre motion library específica — é sobre o conjunto: motion + performance + responsivo + conversão."
---

# Site premium

Reproduz a sensação que sites como estúdios de design profissional passam:
scroll que desliza suave, texto e imagem que entram em cena em vez de aparecer
de repente, botões que reagem ao cursor, e uma primeira impressão de "isso
custou caro" — mesmo quando o site é simples por baixo. O efeito não vem de
uma técnica isolada; vem de **animação bem implementada + zero fricção
técnica** ao mesmo tempo. Um site que anima bonito mas trava no celular, ou
que carrega rápido mas aparece tudo de golpe sem hierarquia, não passa essa
sensação.

Esta skill cobre dois momentos:

- **Construir do zero** — segue as diretrizes abaixo desde o primeiro commit.
- **Revisar/"dar um upgrade"** num site que já existe — usa a seção
  [Diagnóstico rápido](#diagnóstico-rápido-para-site-existente) para achar o
  que está faltando antes de sair adicionando coisa.

Carregue `references/motion-recipes.md` quando for implementar as animações —
tem os trechos de código prontos (GSAP + ScrollTrigger + Lenis) já testados
em produção, com as armadilhas que custam horas se você não souber delas de
antemão.

---

## O que faz um site "parecer premium"

Não é uma biblioteca. É a combinação de:

1. **Movimento com propósito, nunca decorativo demais.** Cada elemento entra
   em cena quando o scroll chega nele — texto por linha (efeito cortina),
   imagem com leve zoom-out, números que contam. Sempre `transform`/`opacity`,
   nunca mais que ~1.2s de duração, sempre `once` (não repete ao subir/descer).
2. **Um ritmo só, repetido no site inteiro.** Um `ease` (`expo.out` ou
   equivalente), 2-3 durações fixas, definidas como tokens — não improvisadas
   componente a componente.
3. **Scroll suave no desktop, nativo no toque.** Lenis (ou equivalente) só
   quando `pointer: fine`. No celular o scroll nativo do sistema é mais
   previsível e não briga com gestos (voltar, puxar para atualizar).
4. **Detalhes de cursor no desktop** — ponto customizado que cresce sobre
   links, botões "magnéticos" que puxam levemente o cursor. Baixo custo,
   alto impacto percebido. **Nunca** em `pointer: coarse`.
5. **Header que reage ao scroll** (ganha fundo sólido ao sair do topo),
   âncoras suaves, parallax leve em imagens de fundo (desktop apenas).
6. **Hierarquia visual radical.** Um objetivo por seção, um CTA principal por
   dobra. O "ar" (espaço em branco/negativo) generoso é o que mais separa um
   site premium de um site amador — não anima mais, respira mais.
7. **Zero atrito técnico.** Nada disso importa se o LCP é 6s ou se o layout
   pula ao carregar a fonte. A sensação de "profissional" desmorona no
   primeiro travamento. Por isso as próximas seções (performance, imagens,
   responsivo) não são um adendo — são metade do efeito.

`prefers-reduced-motion` e "sem JavaScript" **sempre** mostram o conteúdo
final, nunca escondido. Ver `references/motion-recipes.md#reduced-motion`.

---

## Diretrizes obrigatórias

### Imagens

- Formato **WebP/AVIF com fallback**, sempre com `width`/`height` definidos
  (evita layout shift — CLS). Em Astro, use `<Image>` de `astro:assets`, que
  já resolve isso; nunca `<img>` cru apontando para `public/`.
- **Lazy loading** (`loading="lazy"`) em tudo que não é above-the-fold. A
  imagem do hero é a exceção — carrega eager/priority.
- **Compressão agressiva** (TinyPNG/Squoosh) antes de subir. `srcset` (ou
  `widths`/`sizes` do `astro:assets`) para servir o tamanho certo por
  dispositivo — celular não baixa a imagem de desktop.
- **Nunca imagem maior que o container renderizado.** Se a foto nativa tem
  800px, ela não ocupa um bloco de 1600px — isso amplia serrilhado e
  desperdiça banda. Prefira usá-la menor ou trocar de foto.

### Performance

- **CSS e JS críticos inline**; o resto carregado assíncrono/`defer`.
- **Minificação** de CSS/JS/HTML no build (Astro/Vite já fazem isso por
  padrão em produção — confirme que não há flag desligando).
- **Fontes com `font-display: swap`** e no máximo **2 famílias** (uma de
  display, uma de texto). Auto-hospedar via `@fontsource` evita a
  requisição externa ao Google Fonts.
- **Evitar bibliotecas pesadas** (jQuery, animação em JS "manual" pesada) —
  preferir CSS puro quando dá o mesmo resultado (marquee/faixa deslizante,
  por exemplo, é CSS puro, nunca JS).
- Meta de LCP < 2.5s e CLS < 0.1 — ver [Verificação](#verificação).

### Responsivo / Mobile

- **Mobile-first**: construir para o celular primeiro, depois expandir para
  desktop. É onde a maior parte do tráfego chega.
- **Unidades relativas** (`rem`, `%`, `vw`) em vez de `px` fixo, especialmente
  em tipografia e espaçamento.
- **Botões/CTAs com área de toque mínima de 44×44px.** Vale para links de
  rodapé também, não só botões visíveis.
- **Testar nos breakpoints 320px, 768px, 1024px** — e checar zero overflow
  horizontal em cada um.

### UX / Conversão

- **CTA visível sem precisar rolar** (above the fold).
- **Hierarquia visual clara — um objetivo por seção.** Se uma seção está
  tentando vender duas coisas ao mesmo tempo, ela está fazendo as duas mal.
- **Formulários curtos** — nome + contato, no máximo, a menos que o negócio
  realmente precise de mais campos para orçar.
- **Meta de carregamento:** LCP < 2.5s, CLS < 0.1 (Core Web Vitals — ver
  verificação abaixo).

---

## Diagnóstico rápido (para site existente)

Quando o pedido é "melhora esse site" em vez de construir do zero, comece
medindo, não adivinhando — o gargalo raramente é o que parece óbvio (ver
`[[perf-medir-antes-de-otimizar]]`: já aconteceu de o suspeito óbvio ser
"JS demais" e o culpado real ser um único `backdrop-filter`).

1. Rode uma auditoria de performance (Lighthouse/PageSpeed Insights, ou os
   scripts de `tools/` se estiver nesta pasta) **antes** de tocar em código.
   Anote LCP, CLS, peso da página.
2. Abra o site no celular de verdade (ou emulação real, não só redimensionar
   a janela do desktop) e veja onde ele "parece barato": tudo aparece de
   golpe sem entrada, botão sem feedback ao toque, imagem esticada, fonte de
   sistema genérica.
3. Priorize nesta ordem: **quebra > performance > motion > polimento**. Não
   adianta adicionar cursor customizado num site que ainda estoura 375px de
   largura.
4. Adicione motion **depois** que a base estiver limpa — animação em cima de
   layout quebrado só deixa o problema mais visível.

---

## Verificação — antes de dizer que está pronto

Não afirme que o site está rápido, responsivo ou acessível sem ter medido.

- [ ] Build de produção passa sem erro
- [ ] LCP < 2.5s e CLS < 0.1 (Lighthouse, PageSpeed Insights, ou
      `tools/perf-mobile.mjs` se disponível no repositório)
- [ ] Zero overflow horizontal em 320px, 768px, 1024px
- [ ] Nenhum alvo de toque abaixo de 44×44px
- [ ] Nenhum texto abaixo de 12px
- [ ] Contraste WCAG AA (mínimo 4.5:1) em todo par texto/fundo — **inclusive
      texto sobre foto**, que ferramentas de contraste baseadas em
      `background-color` costumam pular (ver `[[medir-contraste-sobre-foto]]`)
- [ ] Layout testado com `prefers-reduced-motion` **ligado** — conteúdo tem
      que aparecer normalmente, nunca preso em `opacity: 0`
- [ ] Layout testado com **JavaScript desligado** — mesma regra
- [ ] Todo link/CTA testado de verdade, não só visualmente
- [ ] Nenhuma fonte além de 2 famílias; `font-display: swap` confirmado
- [ ] Todas as imagens em WebP/AVIF, com `width`/`height`, sem nenhuma maior
      que o container onde ela renderiza

---

## Quando isto é spec work / protótipo não solicitado

Se o site é uma demonstração para conquistar um cliente que não pediu (ver
`[[dolce-cau-spec-work]]` e `[[estrategia-sites-menores]]` para o histórico
disto neste portfólio), aplique também:

- Interruptor único de modo demo (faixa no topo + nota no rodapé + `noindex`
  + `robots.txt` liberando a varredura — bloquear o robô não impede o link
  pelado de indexar, só a meta tag resolve).
- Nunca nome ou contato do desenvolvedor no site — abordagem é feita por
  fora.
- Só conteúdo verificável nas fontes públicas da empresa (Instagram, Maps,
  site antigo). Nunca invente depoimento, preço, prêmio ou número.
- Tabela "o que é real e o que não é" no README de entrega.
