# Ana Empório Bistrô — protótipo

Protótipo **não solicitado** para o Ana Empório Bistrô, de Campo Mourão — PR.
Cozinha da chef Ana Paula Daleffe ([@chefanadaleffe](https://www.instagram.com/chefanadaleffe),
120 mil seguidores). A casa não tem site: tem Instagram e nada mais.

## 🚨 As fotos são GERADAS, não são do restaurante

`src/assets/images/` tem **5 imagens criadas por IA**, feitas para dar a
sensação certa enquanto as fotos reais não chegam. Elas não são o salão, os
pratos nem a louça deles.

| Arquivo | O que é | Substituir por |
| :--- | :--- | :--- |
| `casa-salao.jpg` | Salão à noite, luminárias âmbar, parede de pratos | Foto real do salão (16:9) |
| `casa-mesa.jpg` | Mesa posta, toalha xadrez, selo de cera | Mesa posta real (16:9) |
| `prato-risoto.jpg` | Risoto de açafrão com trufa | Um prato real (4:5) |
| `prato-mignon.jpg` | Mignon com redução | Um prato real (4:5) |
| `prato-massa.jpg` | Tagliatelle fresco | Um prato real (4:5) |

> A imagem do salão saiu **assustadoramente parecida** com o interior real
> deles (parede escura com pratos antigos pendurados, luminárias âmbar,
> madeira). Isso é sorte, não intenção — e não muda o fato de que é preciso
> trocar. Mostrar a alguém uma foto do "seu" restaurante que não é o
> restaurante dele é o pior jeito de começar uma conversa.

**Nunca dizer que as fotos são deles.** Ao mostrar, abra dizendo que as
imagens são de referência e que o site já está pronto para receber as reais.

### Não há foto da chef, de propósito

A seção "A chef" é resolvida em tipografia — assinatura em Bodoni itálico,
três marcos, sem retrato. Duas razões:

1. As fotos dela são o ativo mais forte da casa, e são **dela**.
2. Gerar um rosto por IA inventaria uma pessoa que fingiria ser ela. Isso
   não se faz.

Quando o retrato real chegar, ele entra à esquerda e o texto vira coluna —
a estrutura já comporta.

## ⚠️ O que é real e o que não é

| Real (fonte pública deles) | Escrito por mim |
| :--- | :--- |
| Nome, cidade, os dois perfis de Instagram | Todos os textos de seção |
| Que a chef estudou fora e voltou | A redação sobre isso |
| Festival do Mignon (sexta), Feijoada (sábado) | A descrição de cada um |
| O preço da feijoada (R$ 89 / R$ 98) | **Toda a carta e seus preços** |
| Que existe um "Menu Experiência" | O que ele é |
| A frase da matéria de turismo | — |

### 🚨 Confirmar ANTES de qualquer envio

| O quê | Onde | Situação |
| :--- | :--- | :--- |
| **Telefone / WhatsApp** | `site.whatsapp` | **PLACEHOLDER `5544000000000`** — todos os botões do site apontam para ele |
| **Endereço** | `site.endereco` | **PLACEHOLDER** |
| **Horários** | `site.horarios` | Genéricos, não confirmados |
| **A carta inteira** | `cardapio.secoes` | **DEMONSTRAÇÃO** — pratos e preços inventados para mostrar o formato |
| Dias dos festivais | `agenda.itens` | Lidos de post; podem ter mudado |
| Preço da feijoada | `agenda.itens` | Lido de post; pode ter mudado |
| Formação da chef | `chef.marcos` | Deixada genérica de propósito — os destaques citam Paris, Genebra e Suíça, mas nome de escola e datas **não** foram confirmados |

> **Errar a escola de um chef queima a conversa.** É por isso que a seção
> diz "cozinha clássica na Europa" e nada mais específico.

## Design

**Paleta tirada das fotos deles**, não de um gerador. O motor de design
sugeriu azul e verde de fintech; foi descartado. Cada cor tem origem:

| Cor | De onde veio |
| :--- | :--- |
| Vinho `#7a1f26` | O selo de cera que fecha o Menu Experiência, e o xadrez da toalha |
| Dourado `#c9a227` | As luminárias âmbar do salão |
| Verde `#1f3329` | A parede do bar, onde ficam os pratos antigos |
| Creme `#f0e6d6` | O papel texturizado dos convites |
| Fundo `#14100d` | Marrom-carvão **quente** — não preto puro |

**Tipografia: Bodoni Moda + Karla.** A Bodoni é uma didone italiana de
contraste altíssimo — a letra de revista de gastronomia e carta de vinhos.
O itálico dela faz o papel de assinatura, **no lugar de uma fonte script**:
script de convite é o clichê que todo restaurante usa.

Nenhuma das outras casas do portfólio usa Bodoni (Priorize usa Prata,
DolceCau usa Playfair, Recanto usa Cormorant) — cada cliente tem letra
própria.

## Arquitetura

- **Astro 7** estático, zero framework de UI
- **Tailwind CSS 4** com tokens no `@theme` de [`global.css`](src/styles/global.css)
- **6 KB de JavaScript**, sem uma única dependência

### Animação sem biblioteca

Toda a coreografia está no CSS. O JavaScript faz uma coisa: pôr
`.is-pronto` no hero e `.is-visivel` no que entra na tela.

Não há GSAP, ScrollTrigger nem Lenis. São transições de `opacity` e
`transform` disparadas uma vez — exatamente o que o CSS faz nativamente, no
compositor. Num site que vai ser aberto por link de WhatsApp, no celular,
130 KB de biblioteca para fazer um fade é o pior negócio possível.

Dois detalhes que custaram medição em protótipos anteriores e já vieram
prontos aqui:

- **A foto do hero entra só com escala, sem fade.** Ela é o elemento LCP:
  com `opacity: 0` o navegador só conta o LCP quando ela termina de
  aparecer, e a métrica triplica sem o site ter ficado mais lento.
- **O conteúdo do hero nasce invisível** e só é revelado com `.is-pronto`.
  Sem isso o título pinta na posição final, fica parado, e depois salta
  para fora da tela para animar de volta — o "corte seco" que lê como
  travada.

### As duas ferramentas

| Ferramenta | O que faz |
| :--- | :--- |
| **Cardápio em abas** | Quatro seções da carta sem três telas de rolagem. **Funciona sem JavaScript**: o HTML nasce com tudo visível e só vira abas quando o script confirma |
| **Montador de reserva** | Pessoas, dia, período, horário e ocasião → mensagem pronta no WhatsApp, com prévia na tela |

Ambas guardam estado no `localStorage` (`ana:reserva:v1`), com todo acesso
em `try/catch` — em aba anônima o storage lança ao ser lido.

## Verificações

Rodadas de verdade, com o site servido:

- **80/80** em [`scripts/test-site.mjs`](scripts/test-site.mjs) — 40 checagens
  rodadas duas vezes, com animação normal **e** com `prefers-reduced-motion`
  forçado, usando **eventos de toque reais**. Cobre troca de aba, teclado nas
  abas, contador com teto e piso, data por extenso sem erro de fuso, prévia
  idêntica ao link, limpar de verdade e persistência após recarregar
- **QA "usuário chato"** limpo em 390px e 1440px
  ([`tools/qa-chato.mjs`](../../tools/qa-chato.mjs)): âncoras que não param
  atrás do cabeçalho, todo botão com destino, alvos ≥44px, imagens com alt,
  nada vazando, nada abaixo de 12px, um só `<h1>`, sem id duplicado
- **Contraste WCAG: 33 pares, 0 reprovados**
- **Celular** (4G, CPU 4× lenta, sem cache): **LCP 512 ms · CLS 0 · 292 KB**
- **Scroll**: pior quadro 30 ms, **zero** quadros acima de 50 ms
- 0 âncoras quebradas, 0 links de WhatsApp malformados, 0 externos sem `noopener`

### O que **não** foi verificado

- **Aparelho real.** A emulação é do Chrome DevTools Protocol no Edge.
- **Texto sobre foto.** O medidor de contraste pula esses pares de propósito
  (o valor depende do trecho da imagem). Conferido a olho.
- **A aparência com as fotos reais.** Todo o QA rodou sobre imagens geradas.

## Comandos

| Comando | Ação |
| :--- | :--- |
| `npm install` | Instala as dependências |
| `npm run dev` | Servidor local |
| `npm run build` | Gera o site estático em `./dist/` |
| `node scripts/test-site.mjs <url>` | 80 checagens das duas ferramentas |

Da raiz do repositório, com o site servido:

```bash
node tools/qa-chato.mjs <url> 390 844      # o QA do usuário chato
node tools/contraste.mjs <url>             # contraste de todos os pares
node tools/perf-mobile.mjs <url> --rede 4g --cpu 4
```

## Onde mexer

| Quero mudar... | Arquivo |
| :--- | :--- |
| Textos, contato, horários | [`src/data/site.ts`](src/data/site.ts) |
| A carta | `cardapio` em `site.ts` |
| Os festivais da semana | `agenda` em `site.ts` |
| Cores, fontes, tokens de movimento | [`src/styles/global.css`](src/styles/global.css) |
| Coreografia das animações | bloco "ANIMAÇÕES DE ENTRADA" no `global.css` |
| Quem dispara as animações | [`src/scripts/base.ts`](src/scripts/base.ts) |
| Lógica da reserva | [`src/scripts/reserva.ts`](src/scripts/reserva.ts) |
| Abas do cardápio | [`src/scripts/cardapio.ts`](src/scripts/cardapio.ts) |
