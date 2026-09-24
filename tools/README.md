# tools/

Ferramentas de verificação que valem para **qualquer** site desta pasta. Foram
escritas durante o protótipo da DolceCau; ficam aqui para os próximos não
começarem do zero.

Rode sempre da raiz do repositório, com o servidor do site no ar.

## Verificação no navegador

Usam o Chrome DevTools Protocol direto no Edge, sem dependência nenhuma
(nem Playwright, nem Puppeteer). Emulação de aparelho de verdade — importante:
o Edge headless **ignora `--window-size`**, então captura por linha de comando
sem CDP mente sobre a largura.

| Script | O que faz |
| :--- | :--- |
| `shot.mjs <url> <larg> <alt> <saida.png>` | Captura a página inteira e mede overflow horizontal, listando os elementos culpados |
| `qa-mobile.mjs <url> [larg] [alt]` | Varredura de qualidade mobile: overflow, alvos de toque < 44px, texto < 13px, simetria dos blocos centralizados, menu, e fatias da página |
| `qa-secoes.mjs <url>` | Captura seção por seção pela âncora, mais o resumo de alvos de toque |
| `test-reduced.mjs <url>` | Confere que o site funciona com `prefers-reduced-motion` ligado |
| `audit.mjs <url>` | Âncoras quebradas, links de WhatsApp, `rel="noopener"` faltando |
| `contraste.mjs <url> [larg] [alt]` | Contraste WCAG de todos os pares texto/fundo; sai com código 1 se algum reprovar |
| `contraste-foto.mjs <url> [larg] [seletor]` | Contraste de texto sobre **foto** — o ponto cego do de cima. Padrão: `[data-hero]` |
| `test-whatsapp.mjs <url> <numero>` | **Todo** caminho até o WhatsApp, inclusive os links reescritos por JS: número, mensagem sem mojibake, `noopener`, e que "limpar" não deixa lixo |
| `test-comparador.mjs <url>` | Antes/depois arrastável e carrossel de scroll-snap: que o recorte acompanha o controle, que as setas andam, e que os dois funcionam sem JS |
| `perf-scroll.mjs <url> [--cpu N] [--mobile]` | Fluidez do scroll com CPU desacelerada. Reporta o **pior quadro**, não a média |
| `perf-trace.mjs <url> [--cpu N] [--mobile]` | **Onde** o tempo é gasto: script, estilo, layout, pintura, composição |
| `perf-mobile.mjs <url> [--rede 4g\|3g] [--cpu N]` | LCP, FCP, CLS e peso baixado na **primeira visita** (rede + CPU lentas, sem cache) |
| `test-toque.mjs <url>` | O site com **dedo**, não com mouse: arrasto disputando o scroll, rótulos tocáveis, menu, hover preso |

## Prospecção

| Script | O que faz |
| :--- | :--- |
| `enriquecer-leads.mjs <csv> [--saida X] [--limite N] [--de N]` | Conserta um CSV do Apex Leads Extractor abrindo a **ficha** de cada lead: preenche site, telefone, endereço e avaliações, e classifica o lead em site próprio / rede social / sem site |
| `verificar-sites.mjs <csv> [--saida X] [--limite N]` | Abre o site de cada lead **no celular** e diz se ele presta: site real, site fraco, plataforma de agendamento, bio-link, construtor grátis ou morto |
| `priorizar-leads.mjs <csv> [--min-avaliacoes N]` | Monta a **fila de disparo**: faixa A–D, score por reputação e o gancho de abordagem de cada lead |
| `medir-termos.mjs [--cidade X] [--centro @lat,lng,Nz]` | Mede quantos negócios **novos** cada termo de busca traz, para não gastar varredura com termo redundante |
| `filtrar-leads.mjs <csv> [filtros]` | Recorta a fila (`--com-zap`, `--faixa`, `--cidade`, `--nicho`, `--min-avaliacoes`) e escreve a **mensagem de WhatsApp** de cada lead |
| `gerar-site-lead.mjs <csv> --lead "Nome"` | Gera um mockup **personalizado** do lead: nome, cidade, endereço, nota real do Google e paleta por nicho |
| `processar-leads.mjs <csv> [filtros]` | Roda a cadeia inteira (enriquecer → verificar → priorizar → filtrar) num comando só |

### O gerador de site não usa IA

`gerar-site-lead.mjs` é substituição de texto em dois arquivos — `src/data/site.ts`
e `src/styles/global.css` — porque o modelo já centraliza tudo neles. Custo por
site: um `npm run build`, e nada mais. Ele **não inventa texto** (serviços e
depoimentos continuam os do modelo), **não usa fotos do lead** (o acervo de banco
fica, e `demo: true` continua ligado) e **não publica sozinho**.

Quatro paletas fixas por nicho: salão (verde/caramelo), barbearia (grafite/cobre),
unhas (ameixa/rosé), estética (petróleo/verde-água). Todas passaram no
`contraste.mjs` e no `contraste-foto.mjs` depois do build.

> ⚠️ **`WHATSAPP_THEO`**. O site gerado leva o WhatsApp do Théo, não o do lead —
> o mockup existe para o lead conversar com ele. Sem a variável de ambiente, sai
> o placeholder `5544000000000` e os botões não caem em lugar nenhum. O script
> avisa em vermelho quando isso acontece.

### Três coisas que só apareceram testando

- **A marca não vem do `site.ts`.** "Studio" + "Aurora" estão escritos à mão no
  `Header.astro` e no `Footer.astro`, porque são duas palavras com estilos
  diferentes. O site saía com o nome do lead em todo lugar **e** "Studio Aurora"
  no topo. Só foi notado porque o `contraste.mjs` imprime cada texto que mede, e
  "Aurora" apareceu na lista — grep no `site.ts` nunca acharia.
- **Existe uma segunda paleta completa.** O bloco `[data-tema='realce']` pinta
  carrossel, depoimentos e rodapé. Trocar só o `@theme` deixava essas três
  seções verdes dentro de uma barbearia grafite.
- **O OneDrive segura a pasta.** Regerar por cima de um site que tem um
  `astro preview` rodando dá `EPERM` na hora de apagar — e o script seguia
  adiante mexendo na pasta velha. Mate o preview antes de regerar.


### A cadeia completa

```
Apex (CSV cru)
  → enriquecer-leads.mjs   preenche o que o card não traz
  → verificar-sites.mjs    abre cada site e julga
  → priorizar-leads.mjs    ordena e escreve o gancho
  = fila de disparo
```

Cada etapa acrescenta colunas e preserva as anteriores, então dá para parar no
meio e usar o que já saiu.

### O lead bom não é o de campo vazio

Medido nos 347 salões do Paraná:

| | leads | |
| :--- | ---: | :--- |
| sem site nenhum | 144 | |
| só Instagram/Facebook | 119 | |
| "site próprio" | 84 | **dos quais só 30 tinham site que presta** |

Os outros 54 eram bio-link, construtor grátis, plataforma de agendamento ou
domínio parqueado — e vários são lead **melhor** que o de campo vazio. Quem
paga Trinks ou monta um Linktree já decidiu que presença online importa e já
gasta com isso; só não tem site. Quem tem campo vazio muitas vezes não liga
para internet, e é o mais difícil de converter.

Por isso o `priorizar-leads.mjs` ordena por **quanto o lead já demonstrou que
se importa**, não por quão carente ele é:

- **A** — já paga por presença online e não tem site (agendamento, construtor, bio-link, domínio morto)
- **B** — cuida do Instagram e não tem site
- **C** — tem site, mas o site é ruim (o argumento muda, não desaparece)
- **D** — sem presença nenhuma: volume, não qualidade

O desempate é reputação (√avaliações × peso da nota): um salão com 150
avaliações tem movimento, tem com que pagar e tem o que mostrar numa página.
Um com 3 avaliações não tem nem conteúdo para preencher o site.

### Duas armadilhas destas ferramentas

- **`verificar-sites.mjs` emula celular de propósito.** Um site velho passa
  num teste de desktop e quebra no telefone, que é onde o cliente do salão
  abre o link. Sem a emulação, "não é responsivo" nunca apareceria.
- **Página vazia não é o mesmo que SPA lenta.** Os primeiros vereditos de
  "morto por falta de conteúdo" pareciam precipitados; medindo o texto aos 3s,
  8s e 15s, ele não crescia — eram domínios parqueados mesmo. O sinal
  confiável acabou sendo o `<title>` **igual ao domínio**, não a contagem de
  caracteres.


### Por que o CSV do Apex vem pela metade

O Apex lê o card da **lista** do Google Maps. O Google mudou esse card: hoje ele
traz só nome, nota, categoria e horário. Sumiram dali o telefone, a contagem de
avaliações, o site e — o mais traiçoeiro — o endereço, que passa a chegar como o
caractere do ícone de acessibilidade (`U+E934`) ou como o horário de fechamento.

Medido no CSV de 347 salões do Paraná: **Telefone 0%, Site 0%, Avaliações 0%, e
Endereço útil em apenas 19%**. Não é bug de um seletor — o dado saiu de baixo da
extensão. O seletor que ela procura no card, `a[data-value="Website"]`, não
existe mais em idioma nenhum.

A **ficha** individual (`/maps/place/...`) continua trazendo tudo, e com
seletores que não dependem do idioma da interface:

```
a[data-item-id="authority"]      → site
button[data-item-id^="phone"]    → telefone (no aria-label)
button[data-item-id="address"]   → endereço (no aria-label)
```

Como o Apex já grava `LinkMaps` em 100% das linhas, dá para consertar o arquivo
que já existe sem reextrair nada. Para as próximas rodadas, ligar o **Modo
profundo** nas Opções da extensão resolve na origem — ele abre a ficha de quem
está sem telefone, e hoje isso é todo mundo.

### O campo "site" do Maps quase nunca é um site

Numa amostra de 6 salões: 1 site próprio, 1 Facebook, 3 Instagram, 1 nada.

Isso inverte o filtro óbvio. O lead que interessa **não** é o de campo vazio — é
o que tem `instagram.com` ali: já cuida de presença online, já gasta tempo com
isso, e não tem site. Campo vazio costuma ser quem não liga para internet, e
esse é o mais difícil de converter. Por isso a coluna `Classificacao` separa os
três casos, e a `SiteDominio` guarda o domínio cru — quando aparecer algo que
não é nem rede social nem site de verdade (uma plataforma de agendamento, por
exemplo), dá para ver e decidir sem rodar tudo de novo.

> ⚠️ O script salva um parcial a cada 10 fichas. Dá para matar no meio e
> retomar com `--de N` sem perder o que já leu.

### Testar com o dedo é diferente de testar com o mouse

O `test-toque.mjs` usa `Input.dispatchTouchEvent` e `setTouchEmulationEnabled`,
então o navegador passa a se comportar como celular de verdade (`pointer:
coarse`, `hover: none`). Ele pega uma classe de defeito que nenhum outro pega:

- um bloco arrastável na horizontal que **rouba ou perde** o gesto para o
  scroll da página (falta de `touch-action`);
- `<input>` `sr-only` cujo rótulo não é tocável — o formulário parece inteiro e
  não responde ao dedo;
- `:hover` que **cola** depois do toque e não sai mais, deixando o elemento com
  aparência de "sob o mouse" para sempre.

> ⚠️ **Meça a posição DEPOIS de rolar, não junto.** Com `content-visibility:
> auto` as seções só ganham altura real ao chegar perto da tela, e o navegador
> reajusta o scroll logo após o salto. Medir na mesma tacada captura esse
> reajuste e o atribui ao gesto — deu um falso "o arrasto rola a página" que
> custou uma investigação inteira.

### Os dois de contraste medem coisas diferentes

O `contraste.mjs` lê `background-color`. Numa abertura com foto de fundo o
`background-color` é `transparent` — ele **pula** o texto mais arriscado da
página e ainda assim imprime "zero reprovados". No Recanto isso quase deixou
passar um eyebrow em 2,2:1 sobre a foto do salão.

O `contraste-foto.mjs` esconde o texto, fotografa o que sobrou e mede a
luminância dentro da caixa de cada trecho, reportando o **pior pixel**. Ele
pula de propósito quem tem fundo próprio (botão preenchido), porque aí o
outro já mede certo. Rode os dois; nenhum substitui o outro.

> ⚠️ Ele rola até a seção antes de medir. Sem rolar, as caixas caem fora do
> quadro, o recorte sai vazio e o resultado é um "nenhum reprovado" que não
> mediu nada — o pior tipo de verde.

### Sobre os dois de performance

O `perf-scroll` diz **que** trava; o `perf-trace` diz **por quê**. Rode os dois:
no Studio Priorize, cortar 70 KB de JavaScript não mexeu no pior quadro — o
culpado era um `backdrop-filter` no header, e só o trace mostrou isso.

O `perf-scroll` reporta o pior quadro de propósito. Uma média de 55fps com um
pico de 300ms ainda é uma travada visível, e a média esconde exatamente aquilo
de que o usuário reclama.

> ⚠️ **O número oscila entre execuções da mesma build** (headless com CPU
> desacelerada é ruidoso). Use para comparar antes/depois de uma mudança, não
> como nota absoluta. Para conclusão firme, olhe os totais do trace.

> ⚠️ **`content-visibility: auto` quebra a captura com `captureBeyondViewport`:**
> seção fora da tela não renderiza e sai preta. Role até ela de verdade antes de
> fotografar.

> **`test-reduced.mjs` só serve para a DolceCau.** Ele procura os seletores do
> orçamento daquele site (`[data-orc-add]`, `[data-orc-painel]`…). Num site novo
> ele acusa falha sem que haja nada quebrado — as duas primeiras checagens
> (reduced-motion ativo, `js-anim` removido) são as únicas genéricas. Escreva um
> teste próprio no `scripts/` do site; ver
> `sites/recanto-paraiso/scripts/test-simulador.mjs` como modelo.

O `contraste.mjs` resolve a cor **pintando num canvas**, não com regex. Isso
importa porque o Tailwind 4 emite `oklab(...)` sempre que há modificador de
opacidade (`text-cream-dim/70`): um `match(/\d+/g)` nesse formato devolve lixo e
o resultado sai na casa dos bilhões — o que parece aprovação folgada e esconde
reprovação real. Texto sobre foto é pulado de propósito; confira à mão.

```bash
node tools/qa-mobile.mjs http://127.0.0.1:4321/ 375 812
```

> **Não canalize a saída para `head` ou `Select-Object`.** Fechar o cano mata o
> processo no meio (SIGPIPE) e o script para sem terminar as capturas — já
> aconteceu duas vezes. Redirecione para arquivo: `> qa.log 2>&1`.

## Imagens

Para fotos recortadas de prints (Canva, Instagram, PDF). Precisam de Pillow:
`pip install pillow`.

| Script | O que faz |
| :--- | :--- |
| `limpar-bordas.py <pasta> [--aplicar] [--quadrado]` | Remove faixas lisas nas bordas — branca, cinza ou preta |
| `folha-contato.py <pasta> [saida.png]` | Folha de contato sobre fundo magenta, para conferir o lote de uma vez |

O detector não procura uma cor: procura **lisura**. Uma linha inteira com
desvio padrão quase zero não existe em foto de verdade — é sempre sobra do
fundo da página de onde a imagem foi recortada. Foi assim que apareceram 46
imagens com tira branca à direita e mais 8 com letterbox preto que ninguém
tinha notado.

```bash
python tools/limpar-bordas.py sites/dolce-cau/src/assets/doces            # simula
python tools/limpar-bordas.py sites/dolce-cau/src/assets/doces --aplicar --quadrado
python tools/folha-contato.py sites/dolce-cau/src/assets/doces conferir.png
```

Sempre rode a simulação antes, e confira o resultado na folha de contato —
foi ela que revelou as barras pretas que a primeira versão do detector (que
só procurava branco) deixava passar.
