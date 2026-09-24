# Abertura cinematográfica

Sequência controlada por rolagem que abre o site: um bombom gira, se abre em
vista explodida, a casca vira diafragma e a câmera atravessa até o hero real.

## Estado atual: **desligada**

A abertura **não está na página**. O site abre direto no hero, com as fotos
reais da doceria — decisão de venda: numa demo, duas telas de rolagem de um
bombom abstrato adiam justamente o que convence o cliente.

O código continua todo aqui, intacto. Para religar, três linhas:

| Arquivo | O que descomentar |
| :------ | :---------------- |
| [`src/pages/index.astro`](src/pages/index.astro) | o `import HeroCinema` e o `<HeroCinema />` |
| [`src/scripts/motion.ts`](src/scripts/motion.ts) | o `import { setupCinema }` e a chamada `await setupCinema(...)` |
| [`src/components/Hero.astro`](src/components/Hero.astro) | tirar o `id="topo"` daqui — ele volta para o `HeroCinema`, que passa a ser a primeira seção |

O motor está pronto: o que roda é o **render procedural** (o bombom é desenhado
no canvas em tempo real, com a paleta do site). Ele é um **substituto** do vídeo
fotorrealista do briefing — o vídeo nunca foi gerado porque não há nenhuma
ferramenta de geração de imagem ou vídeo neste ambiente. Ver "Trocar pelo vídeo
real" abaixo.

## Como funciona

| Arquivo | Papel |
| :------ | :---- |
| [`src/components/HeroCinema.astro`](src/components/HeroCinema.astro) | A seção `#topo`: palco, canvas e a dica "role para revelar" |
| [`src/scripts/cinema.ts`](src/scripts/cinema.ts) | Renderizador + pin/scrub do ScrollTrigger |
| [`src/scripts/motion.ts`](src/scripts/motion.ts) | Chama `setupCinema()` e dispara o texto do hero no fim |

### Coreografia

O progresso da rolagem (0 → 1) mapeia direto nas fases:

```
0.00 ─ 0.28   o bombom gira lentamente (especular varre a superfície)
0.28 ─ 0.62   vista explodida: a casca abre em 8 gomos simétricos,
              a camada crocante se separa, o recheio fica suspenso
0.62 ─ 0.85   a casca se reabre como diafragma (pás giram tangencialmente)
0.85 ─ 1.00   a câmera atravessa o recheio e o quadro escurece
```

Como é `scrub`, **rolar de volta desfaz a animação** — não há estado "já tocou".

### Integração com o resto do site

- **Pin/scrub** via `ScrollTrigger.create({ pin, scrub })`, consumindo
  3,2 alturas de tela no desktop e 2,2 no toque (dedo cansa mais rápido).
- **Lenis** é a mesma instância criada em `motion.ts`; `cinema.ts` não cria
  outra. Como o `motion.ts` já faz `lenis.on('scroll', ScrollTrigger.update)`,
  o scrub acompanha o scroll suave sem configuração extra.
- **Texto do hero**: `setupHero()` agora devolve uma timeline **pausada**,
  disparada por um `ScrollTrigger` no próprio hero — que entra exatamente
  quando o pin solta. Mesma animação de antes, só que no tempo certo.
- **Mobile**: sem Lenis (scroll nativo, como no resto do site), DPR limitado
  a 1,5 e sequência mais curta.
- **`prefers-reduced-motion`**: `motion.ts` sai antes de chamar `setupCinema()`,
  então o palco continua com `hidden` e a seção ocupa **altura zero** — o
  visitante cai direto no hero. Mesmo comportamento se o JS falhar.

## Trocar pelo vídeo real

O canvas já sabe usar quadros reais. Quando você tiver o vídeo:

```bash
node scripts/frames-from-video.mjs caminho/do/video.mp4 120
```

Isso gera `public/hero-frames/frame-0001.webp …` e um `manifest.json`. Na
próxima carga, `cinema.ts` encontra o manifesto e **troca sozinho** do render
procedural para os quadros — nenhuma linha de código muda.

Sem o manifesto, o procedural continua rodando. Os dois caminhos convivem.

### Prompts para gerar o vídeo

Se você rodar o Higgsfield (ou outro gerador) pela interface web, use:

**Imagem hero** — modelo fotorrealista, 16:9:

> Single premium artisanal chocolate bonbon cut in half, floating centered in a
> dark sophisticated studio. Glossy dark couverture shell, visible creamy
> caramel ganache filling, thin crunchy praline layer. Dramatic amber rim
> lighting from behind, soft key light upper left. Fine cocoa powder particles
> suspended in the air. Deep near-black graphite background. Macro product
> photography, shallow depth of field, no text, no branding, no packaging.

**Vídeo** — Cinema Studio 3.0, 4K, 16:9, 5–10 s, sem áudio:

> The chocolate bonbon rotates slowly and perfectly smoothly, then separates
> into a full technical exploded view, Apple product-reveal style: the shell
> opens into symmetric segments, the crunchy layer detaches, the creamy filling
> stays suspended in the centre, caramel droplets and cocoa powder float in
> aligned layers. Nothing shatters, nothing is thrown, nothing disappears —
> an elegant dissection, not a destructive explosion. Then the shell reopens
> like a camera diaphragm and the virtual camera travels through the interior,
> ending on a dark empty frame. Preserve the exact same bonbon design and all
> layers throughout. Locked-off camera, no text, no branding.

Restrições que valem manter: **não enviar as fotos reais da Dolce Cau** (nem de
`src/assets/doces/`, nem de `src/assets/images/`) para o gerador — ver
[`CREDITOS-IMAGENS.md`](CREDITOS-IMAGENS.md).

## Ajustes rápidos

| Quero... | Onde |
| :------- | :--- |
| Abertura mais curta/longa | `distancia` na chamada de `setupCinema()` em `motion.ts` |
| Mudar quando cada fase começa | as constantes `pGiro/pExp/pIris/pThru` em `cinema.ts` |
| Mais/menos gomos | `GOMOS` em `cinema.ts` |
| Desligar a abertura | comentar a chamada `setupCinema()` — o site volta ao hero direto |
