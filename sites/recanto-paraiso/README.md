# Recanto Paraíso — protótipo de site

Site de vitrine para o **Recanto Paraíso**, espaço de eventos em Maringá — PR:
cerimônia ao ar livre no jardim e recepção em salão de madeira e vidro com
lustres de cristal.

> ⚠️ **Isto é um protótipo de demonstração (spec work).** Não é o site oficial do
> espaço, e eles não sabem que ele existe. Enquanto `site.demo === true` em
> [`src/data/site.ts`](src/data/site.ts), aparecem a faixa de aviso no topo, a nota
> no rodapé, o `noindex` e o aviso no `robots.txt`.

## As mídias

**10 fotos e 1 vídeo, todos do Instagram público deles.** Os placeholders magenta
foram substituídos em 06/08/2026.

Nada em `src/assets/images/` é editado à mão. O bruto fica em `imagens/`, e
`scripts/processar-midias.py` gera a pasta inteira:

```bash
python scripts/processar-midias.py
```

O script é reprodutível — apagar a saída e rodar de novo devolve o mesmo
resultado. Ele resolve quatro defeitos do acervo, cada um documentado no
cabeçalho do arquivo: setas ‹ › de carrossel, marca d'água de fotógrafo, a
faixa borrada do print de story e o adesivo de localização no vídeo.

> ⚠️ **Detectar seta de carrossel por brilho não funciona.** Parede clara vira
> falso positivo, foto noturna vira falso negativo. O jeito certo é montar uma
> tira com as bordas laterais, olhar uma vez e anotar no `PLANO` do script.

**Teto de resolução:** os arquivos têm de 458 a 1080px de largura. `larguras()`
em [`src/lib/images.ts`](src/lib/images.ts) corta do `srcset` o que a foto não
consegue entregar — o Astro **não faz upscale**, e sem isso o `srcset` anuncia
1600w servindo um arquivo de 500px. Se a Rosane mandar os originais em alta, é
só trocar `imagens/`, rodar o script e a lista cresce sozinha.

Para conferir depois de mexer:

```bash
python ../../tools/folha-contato.py src/assets/images conferir.png
```

### O vídeo

`public/video/salao-montado.mp4` — 8s, 720×1164, **sem áudio**, 1,6 MB. Fica em
`public/` porque o Astro não otimiza vídeo. A seção está em
[`src/components/Video.astro`](src/components/Video.astro), e três coisas ali
não são estilo: `preload="none"` (o arquivo só desce quando a pessoa chega
perto), o botão de pausa (WCAG 2.2.2 — conteúdo em loop precisa parar) e o
`prefers-reduced-motion`, que deixa tudo no pôster.

## O que é real e o que não é

| Real (fonte pública deles) | Escrito por mim |
| :--- | :--- |
| Nome, endereço (Av. Morangueira, 5705 — Jd. Novo Alvorada) | Textos do hero, "O lugar" e "Como funciona" |
| WhatsApp (44) 99814-4914 e o Instagram @recantoparaisomaringa | Legendas da galeria |
| Cerimônia ao ar livre no jardim + recepção no salão | Descrições curtas de cada item de estrutura |
| Cozinha completa, cozinha de frios climatizada, sala de apoio climatizada | — |
| Aluguel também para ensaios fotográficos (está na bio do Instagram) | — |
| Todas as fotos | — |

**Nada de preço no site.** A ficha do casamentos.com.br cita R$ 4.500–7.900, mas
aquela página respondeu 403 na verificação e o número veio de resumo de busca, não
de leitura direta. Preço errado numa proposta comercial é constrangimento na
certa — o simulador monta o pedido e deixa o valor com eles.

### ⚠️ Confirmar antes de enviar

- **O acervo é 100% casamento.** A seção "Eventos" fala de 15 anos, corporativo e
  ensaio, e para esses três cartões só existem as duas fotos SEM noiva à vista
  (o salão montado e vazio, e o espaço visto de fora). Está anotado no `site.ts`.
  Foto de 15 anos ou de confraternização entra trocando um nome.
- **Capacidade de 160 convidados** — também é de fonte secundária. Aparece em três
  lugares: `sobre.numeros`, o primeiro item de `estrutura.itens` e o teto do
  simulador (`simulador.convidadosMax`). Se a Rosane confirmar outro número, mude
  nos três.
- **Estacionamento, gerador, camarim/suíte dos noivos e playground ficaram de
  fora** de propósito: não foram confirmados em fonte nenhuma. Se existirem, é só
  acrescentar em `estrutura.itens`.

Depoimentos, prêmios, ano de fundação e número de eventos **não existem no site** —
nenhum deles foi confirmado, e nenhum foi inventado.

## Simulador "Monte seu evento"

O visitante escolhe tipo de evento, número de convidados, mês, período e o que já
tem fechado. O botão abre o WhatsApp com a mensagem pronta:

```
Olá! Vim pelo site e queria um orçamento:

Evento: Casamento
Convidados: 130
Data pretendida: outubro de 2026
Período: noturno
Já tenho: buffet e decoração

Podem confirmar disponibilidade e valores?
```

- **Sem conta e sem servidor.** A seleção fica no `localStorage`
  (`recanto:orcamento:v1`) e sobrevive a fechar a aba. Em aba anônima o storage
  lança ao ser lido — todo acesso está em `try/catch` e o site segue funcionando,
  só sem persistir.
- **Não calcula preço**, porque não há tabela pública. O simulador monta o pedido.
- Todos os CTAs de WhatsApp da página passam a levar o pedido junto assim que há
  algo montado.
- A barra flutuante só aparece depois da primeira escolha.

| Arquivo | Papel |
| :--- | :--- |
| [`src/scripts/orcamento.ts`](src/scripts/orcamento.ts) | Estado, persistência e montagem da mensagem |
| [`src/components/Orcamento.astro`](src/components/Orcamento.astro) | O formulário |
| [`src/components/OrcamentoPill.astro`](src/components/OrcamentoPill.astro) | Barra flutuante |
| `simulador` em [`src/data/site.ts`](src/data/site.ts) | Opções e limites |

Sem JavaScript, os botões −/+ e o "limpar" somem (não teriam o que fazer), o campo
de convidados continua digitável e o CTA leva para o WhatsApp com a mensagem
genérica.

## Stack

- **Astro 7**, saída estática. Zero framework de UI.
- **Tailwind CSS 4** com os tokens no `@theme` de [`src/styles/global.css`](src/styles/global.css)
  (não existe `tailwind.config.js` no Tailwind 4)
- **GSAP** (ScrollTrigger + SplitText) e **Lenis** para o scroll suave
- Fontes auto-hospedadas via `@fontsource` (Cormorant Garamond + Inter) — sem
  chamada ao Google

## Comandos

| Comando | Ação |
| :--- | :--- |
| `npm install` | Instala as dependências |
| `npm run dev` | Servidor local em `localhost:4321` |
| `npm run build` | Gera o site estático em `./dist/` |
| `npm run preview` | Pré-visualiza o build de produção |

## Onde mexer

| Quero mudar... | Arquivo |
| :--- | :--- |
| Textos, contato, seções, capacidade | [`src/data/site.ts`](src/data/site.ts) |
| Opções do simulador | `simulador` em [`src/data/site.ts`](src/data/site.ts) |
| Cores, fontes, ritmo das animações | [`src/styles/global.css`](src/styles/global.css) (bloco `@theme`) |
| Comportamento das animações | [`src/scripts/motion.ts`](src/scripts/motion.ts) |
| Fotos | `src/assets/images/` + o nome referenciado no `site.ts` |

As fotos são referenciadas **pelo nome do arquivo** (sem extensão nem caminho), e
[`src/lib/images.ts`](src/lib/images.ts) faz a ponte com o otimizador do Astro —
que converte para WebP e injeta `width`/`height` (zero layout shift).

## Decisões de design

**Paleta "mata e cristal".** Tirada das fotos do próprio espaço: fundo verde-mata
quente `#0F1712` (nunca preto puro, que "borra" no scroll em OLED), acento
champanhe `#D9C28C` vindo da luz dos lustres, terracota `#A55E3A` das cadeiras de
madeira. Deliberadamente diferente do dark-chocolate da DolceCau — mesmo calibre,
outra cara.

**Cormorant Garamond no display.** Serifa alta e eixo fino: lê como convite de
casamento sem apelar para cursiva. Inter no corpo, onde legibilidade importa mais
que personalidade.

**No celular tudo vai ao centro.** No desktop as seções abrem à esquerda, ao lado
de uma foto; no celular não há coluna ao lado, e texto encostado à esquerda briga
com a marca centralizada no topo. Abaixo de `lg`, o atributo `data-centro-mobile`
(uma regra só no `global.css`) centraliza o bloco e esconde o filete do `eyebrow`,
que numa linha estreita força quebras feias.

**Menu do celular é um leque**, não uma tela cheia: ancorado sob o botão, ~25% da
tela, com **um botão só** (as barrinhas viram X). Fecha no próprio botão, no toque
fora e no `Esc`.

**Galeria com `grid-auto-flow: dense`.** Tiles de 1 e de 2 colunas misturados
deixavam 3 slots vazios em 9 fotos — um tile largo que não cabe no resto da linha
pula para a próxima e abandona o vão. Com `dense`, o navegador puxa uma foto
estreita de baixo para tapar. Só vale porque são figuras, não controles.

**Animação com orçamento de desempenho.** Só `transform` e `opacity`. Lenis roda
**apenas no desktop** — no toque o scroll nativo é mais previsível e não briga com
o gesto de voltar do sistema. Cursor customizado e botões magnéticos só em
`pointer: fine`.

**Data por dois `<select>`, não por `<input type="month">`.** O Safari do iPhone
não implementa `type="month"` e degrada para campo de texto — a visitante teria
que adivinhar e digitar `2026-10`. Como quase todo mundo vai abrir isto no
celular, o campo nativo era o caminho mais curto para perder a pessoa. Os dois
seletores funcionam em qualquer navegador e aceitam ficar em branco.

**Parallax só onde há folga.** A foto de "O lugar" é 12% mais alta que a moldura
(`.parallax-folga`) para o deslocamento de ±5% não abrir faixa vazia na borda. E
ela nunca é o mesmo nó que o reveal anima: dois `transform` no mesmo elemento se
sobrescrevem. Desligado abaixo de 1024px, onde o scrub briga com o scroll nativo.

**`prefers-reduced-motion` desliga tudo.** Script inline no `<head>` roda antes da
primeira pintura e remove a classe `js-anim`, então o conteúdo nunca fica preso
invisível — nem com a preferência ligada, nem se o JS falhar. O simulador é
inicializado **fora** do motor de animação justamente para continuar valendo.

## Verificações feitas

Rodadas de verdade, com o servidor no ar:

- **Build de produção passa** limpo
- **Simulador: 44/44** em [`scripts/test-simulador.mjs`](scripts/test-simulador.mjs) —
  o roteiro roda duas vezes, com animação normal **e** com
  `prefers-reduced-motion` forçado. Cobre: barra flutuante, botões −/+, teto de
  160, mês/ano por extenso (inclusive só o mês preenchido), período, itens já
  fechados, todos os CTAs carregando o pedido, persistência após recarregar,
  limpar e apagar o `localStorage`
- **`og:image` absoluto** no HTML final, mais `canonical` e JSON-LD `EventVenue`
  com endereço, telefone e capacidade
- **Encoding UTF-8 íntegro** nos arquivos-fonte e no HTML gerado. Um round-trip
  de PowerShell já corrompeu o `site.ts` uma vez — **nunca** use
  `Get-Content | Set-Content` nestes arquivos
- **Sem overflow horizontal** em 375 (`scrollWidth === 375`)
- **Contraste WCAG AA: zero reprovados** em 32 pares de texto/fundo; o pior caso é
  **5.53:1** contra o mínimo de 4.5:1. A medição resolve `oklab` pintando a cor num
  canvas e compõe a transparência sobre o fundo real — sem isso, todo
  `text-cream-dim/70` do Tailwind 4 sai como valor absurdo
- **Nenhum elemento com `data-reveal` fica invisível** depois do scroll
- **Nenhum texto abaixo de 12px**
- **Galeria fecha em 4 linhas completas**, sem buracos
- **Menu** abre, fecha pelo mesmo botão, ocupa 25% da tela; marca centralizada com
  desvio de 0px
- **Âncoras**: 19 links internos, nenhuma quebrada; 5 links de WhatsApp bem
  formados; nenhum link externo sem `rel="noopener noreferrer"`
- **Interruptor `demo`**: build nos dois sentidos. `true` liga faixa + nota +
  `noindex` + aviso no `robots.txt`; `false` remove os quatro. **O `Allow: /`
  permanece nos dois** — bloquear a varredura não tiraria a página da busca, só
  impediria o robô de ler o `noindex`

### Com as fotos reais (06/08/2026, contra a URL publicada)

- **`qa-chato` em 390 e 1440: nada a reclamar.** Duas correções vieram daí: as
  seções não tinham `scroll-margin-top` e paravam atrás do cabeçalho, e os links
  do menu do desktop tinham 28px de altura de alvo.
- **Contraste sobre foto: zero reprovados** em `tools/contraste-foto.mjs`, que
  é o único que enxerga texto sobre imagem. O `contraste.mjs` dava verde sem ter
  medido a abertura — ver o aviso dentro de `Hero.astro` antes de mexer no véu.
- **Vídeo: 22/22** em [`scripts/test-video.mjs`](scripts/test-video.mjs), nos dois
  modos de movimento. Cobre que o arquivo NÃO desce antes da hora, que o botão
  pausa de verdade e que a pausa da pessoa não é desfeita ao rolar.
- **Simulador: 44/44**, e **WhatsApp e toque** passam.
- **Celular, 4G, CPU 4x lenta, sem cache:** LCP ~700 ms, CLS 0, 488 KB na
  primeira visita (o vídeo NÃO entra nessa conta).
- **Scroll:** mediana de 5 ms e **um** quadro de ~70 ms, que é o decode do
  primeiro quadro do vídeo. Investigado e aceito — está explicado no cabeçalho
  do `Video.astro`.

### O que **não** foi verificado

- **Aparelho real.** A emulação é do Chrome DevTools Protocol no Edge, não um
  celular de verdade.
- **Alvos de toque:** três `<label>` de texto ("Que evento você vai fazer?" etc.)
  têm 20px de altura. É deliberado — eles são legenda, e o controle associado
  (select/input) tem 52px. Os rótulos clicáveis de verdade (período e "já tenho")
  têm 52px e 46px.

## Créditos das imagens

As fotos são **do próprio Recanto Paraíso**, retiradas do Instagram público. Isso
deixa o protótipo convincente, mas as imagens **não são suas** — leia
[`CREDITOS-IMAGENS.md`](CREDITOS-IMAGENS.md) antes de publicar.
