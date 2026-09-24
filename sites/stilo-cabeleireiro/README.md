# Stilo Cabeleireiro — protótipo

Salão de beleza em **Maringá — PR**, na Av. São Paulo, 1260.
[@stilocabeleireirosoficial](https://www.instagram.com/stilocabeleireirosoficial)
· 554 posts · 5.945 seguidores · **desde 1978**.

**Spec work não solicitado**: eles não sabem que este site existe. Será
apresentado como proposta comercial, por WhatsApp.

## Estado

| | |
| :--- | :--- |
| Código | pronto e verificado |
| Fotos | 28 do **Pexels** — nenhuma é do salão |
| Publicado | Cloudflare Pages — ver [`DEPLOY.md`](DEPLOY.md) |
| `site.demo` | `true` (faixa, nota no rodapé, `noindex`, aviso de banco) |

```bash
npm install
npm run dev          # http://localhost:4321
npm run build

python scripts/baixar-fotos.py         # baixa o pool do Pexels
python scripts/processar-fotos.py      # recorta para os slots
python scripts/gerar-placeholders.py   # magenta, se faltar alguma
```

## ⚠️ As fotos não são do Stilo

São de banco de imagens. O site declara isso em dois lugares — a faixa do topo
e um selo dentro do antes/depois — e ambos somem junto com `demo: false`. Por
isso **`demo` não pode virar `false` enquanto as fotos forem de banco**: seria
transformar um protótipo honesto num site que mente sobre o próprio trabalho.

Detalhes, licença e o que fazer quando as fotos reais chegarem:
[`CREDITOS-IMAGENS.md`](CREDITOS-IMAGENS.md).

## De onde veio

É um **clone do `sites/studio-priorize/`** com o conteúdo trocado — decisão do
Théo, pelo tempo. Herda a stack, o motor de animação, as três ferramentas e a
bateria de QA. As 31 fotos do Priorize foram removidas antes de tudo: são
clientes de outro salão, em outra cidade.

**Consequência aceita:** os dois sites são escuros com acento metálico e têm a
mesma diagramação. Lado a lado, dá para ver que saíram do mesmo molde. O que os
separa é a paleta, a narrativa e a estrutura de pilares.

## O que é real e o que não é

Este protótipo nasceu de **uma fonte só**: o print da bio do Instagram. O
Priorize teve entrevista; este não teve.

**Confirmado:** "Desde 1978 entregando excelência" · Seg à Sab, 8h às 19h ·
Av. São Paulo, 1260 · `wa.me/5544991527386` · destaques Noivas, Produção,
Mechas, Mega Hair · 554 posts · 5.945 seguidores.

**Deduzido — marcado `CONFERIR` no `src/data/site.ts`:** bairro, CEP, link de
avaliações, a lista completa de serviços, as respostas de mega hair e a
história de 1978. A tabela com o porquê de cada um está no
[`DEPLOY.md`](DEPLOY.md#os-conferir-pendentes).

Nada de preço, prêmio, depoimento, nome de profissional ou número de clientes
inventado.

## Decisões

### 1978 é o eixo, não um detalhe de rodapé

É o único ativo do Stilo que nenhum salão novo de Maringá consegue comprar,
copiar ou anunciar. Por isso a seção `Casa` vem **antes** dos quatro pilares, e
o `<h1>` usa as palavras deles: "Desde 1978, entregando excelência."

O site nunca escreve "48 anos". A conta vira no aniversário, cuja data eu não
sei — "desde 1978" e "quase meio século" continuam certos no ano que vem
sozinhos.

### Quatro pilares, seis itens no menu

O Priorize tinha dois pilares (cabelo, noivas). Aqui são quatro: **Mechas**,
**Mega hair**, **Noivas**, **Produção**. Os quatro não cabem no menu junto com
casa/serviços/agendar — seis é o teto antes de a barra quebrar no notebook.

**Produção fica fora do menu**, logo depois de Noivas: é a mesma cliente, no
mesmo estado de espírito, sem casamento. Quem rolou o dia da noiva sem ser
noiva cai exatamente ali.

### Mega hair explica, não exibe

É o serviço de decisão mais lenta do salão: ticket alto e muito medo — de
estragar o cabelo, de ficar aparente, de não conseguir manter. A seção responde
as quatro perguntas que travam a decisão, em `<details>` nativo: abre sem JS, o
teclado navega, o leitor de tela anuncia o estado e o Ctrl+F acha texto dentro
dos fechados.

### A paleta é cobre, não vinho

Veio do monograma "S" deles — degradê de cobre sobre preto — e das capas dos
destaques. O bordô `#8E1B3C` era do Priorize; mantê-lo faria os dois sites
parecerem o mesmo.

O botão usa cobre **escurecido** (`#9a5923`), não o cobre da marca: com creme
por cima, o cobre puro dá 3.6:1 e reprova. O escurecido mede 4.85:1.

### O antes/depois mudou de promessa por causa das fotos

A versão original dizia "duas fotos da **mesma cliente**, no **mesmo dia**".
Banco de imagens não tem par real — não existe o mesmo rosto fotografado antes
e depois de um trabalho. Manter aquele texto não seria licença poética: seria
afirmar um fato falso sobre um trabalho que não aconteceu.

Agora a seção afirma **processo → resultado**, com pessoas diferentes, e um
selo diz isso na tela, colado no título — antes de a pessoa arrastar a linha,
não depois. São 3 pares em vez de 4: três coerentes valem mais que quatro
forçados.

Quando as fotos do Stilo chegarem, a regra antiga volta e o selo sai.

### Ordem das seções

`Casa → Mechas → tipos → antes/depois → Mega hair → Noivas → Produção →
Serviços → Depoimentos → Agendar`

Mechas promete, o carrossel deixa escolher, o antes/depois mostra. Mostrar
antes de prometer não funciona; depois da galeria já seria tarde. Mega hair vem
logo após, quando o olho já está acostumado a comparar dois estados do mesmo
cabelo — que é exatamente a conta que quem pensa em mega hair está fazendo.

## As três ferramentas

Cada uma no contexto onde a dúvida nasce. Todas montam a mensagem do WhatsApp
pronta, guardam no `localStorage` e têm botão de limpar.

| Ferramenta | Onde | O que faz |
| :--- | :--- | :--- |
| Diagnóstico capilar | em `Mechas` | 3 perguntas → por onde começar |
| Monte seu dia da noiva | em `Noivas` | serviços + acompanhantes + data + horário |
| Agendamento guiado | em `Agendar` | serviço + dia + período |

O diagnóstico ganhou o objetivo **"Dar volume ou comprimento"**, que encaminha
para mega hair — é a ponte para o Pilar 2, porque quem quer isso normalmente
está falando de mega hair sem saber o nome do serviço.

## Verificação

Com `npm run preview` no ar (o preview atende em `localhost`, **não** em
`127.0.0.1`):

⚠️ O medidor de contraste **não lê texto sobre foto**. Com as fotos no lugar,
isso passou a valer para o hero e para as legendas das galerias — confira à mão.

```bash
node tools/contraste.mjs        http://localhost:4321/          # 48 pares, 0 reprovados
node tools/contraste.mjs        http://localhost:4321/ 375 812  # 47 pares, 0 reprovados
node tools/audit.mjs            http://localhost:4321/          # 0 âncoras quebradas
node tools/test-whatsapp.mjs    http://localhost:4321/ 5544991527386
node tools/test-comparador.mjs  http://localhost:4321/
node tools/test-toque.mjs       http://localhost:4321/
node tools/qa-mobile.mjs        http://localhost:4321/ 375 812  # overflow 0
node tools/test-demo.mjs        sites/stilo-cabeleireiro
node scripts/test-ferramentas.mjs http://localhost:4321/        # 32/32
```

⚠️ **`tools/test-reduced.mjs` não se aplica a este site.** Ele procura
`data-orc-*`, a ferramenta de orçamento do Recanto Paraíso e do DolceCau. As
duas checagens genéricas dele passam; as outras quatro falham por mirar
seletores que aqui não existem.

## Correções feitas durante o clone

Coisas que o Priorize também tem, e que só apareceram porque o conteúdo mudou:

- **`Agendar.astro` lia `site.horarios[0]` e `[1]` fixos.** O Priorize tinha
  exatamente duas faixas; o Stilo divulga uma só e o build morria com
  "Cannot read properties of undefined". Agora a frase se monta do array.
- **A quebra de linha do `<h1>` dependia de JavaScript.** O `display: block` das
  linhas morava só sob `html.js-anim`; sem JS os spans viravam inline e o texto
  colava — "Desde 1978,entregando excelência.". Passa despercebido quando a
  linha termina em palavra solta; aqui termina em vírgula.
- **O nome do salão estava hard-coded em 6 lugares** (mensagens de WhatsApp,
  logo do header e do rodapé), contra a regra do próprio projeto de não ter
  texto de conteúdo em componente. Agora saem de `site.nome` e `site.logo`.
- **O logo reprovava alvo de toque** (39px < 44px) depois de eu reduzir a fonte
  para "Cabeleireiro" caber no celular.
