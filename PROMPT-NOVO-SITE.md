# Prompt para o próximo protótipo

Copie tudo abaixo da linha e cole no chat do outro agente. Ajuste o nome da
empresa e o @ do Instagram no primeiro parágrafo.

---

## Contexto

Você vai construir um protótipo de site para um **espaço de eventos em Maringá — PR**
(`@recantoparaisomaringa`, ~14,6 mil seguidores). É **spec work não solicitado**: a
empresa não sabe que o site existe. Ele será apresentado à dona como proposta
comercial, por WhatsApp.

Trabalhe na pasta `sites/<slug-da-empresa>/`, ao lado de `sites/dolce-cau/`.

**`sites/dolce-cau/` é a referência.** Leia esses arquivos antes de começar a
escrever qualquer coisa — não copie cegamente, mas siga as mesmas decisões:

| Arquivo | Por que ler |
| :--- | :--- |
| `sites/dolce-cau/README.md` | Decisões de design e o que foi verificado |
| `sites/dolce-cau/src/styles/global.css` | Tokens no `@theme` e a regra de centralização mobile |
| `sites/dolce-cau/src/scripts/motion.ts` | Motor de animação inteiro |
| `sites/dolce-cau/src/components/Header.astro` | Menu mobile em leque |
| `sites/dolce-cau/src/data/site.ts` | Todo o conteúdo num arquivo só |
| `sites/dolce-cau/DEPLOY.md` | Interruptor `demo` e o `noindex` |
| `tools/README.md` | Ferramentas de verificação já prontas |

O visual do novo site deve ser **do mesmo calibre**, mas **não a mesma cara**. A
paleta dark-chocolate é da doceria. Escolha uma paleta própria a partir da
identidade visual do Instagram deles (sem copiar logo).

---

## Stack — obrigatória, sem substituições

- **Astro 7**, saída estática (`output: 'static'`). Zero framework de UI. Sem React, sem Vue.
- **Tailwind CSS 4** via `@tailwindcss/vite`, com os tokens num bloco `@theme` dentro
  de `src/styles/global.css`. **Não existe `tailwind.config.js` no Tailwind 4** — não
  tente criar um.
- **GSAP 3** (`ScrollTrigger`, `SplitText`) + **Lenis** para scroll suave.
- **`@fontsource`** para as fontes, auto-hospedadas. Nenhuma chamada ao Google Fonts.
- **`astro:assets`** (`<Image>`) para toda imagem. Nunca `<img>` cru com arquivo de `public/`.

---

## Arquitetura

**Todo o conteúdo em `src/data/site.ts`.** Textos, contato, endereço, seções,
números. Trocar o site inteiro deve ser editar esse arquivo. Nenhum texto de
conteúdo hard-coded dentro de componente.

**Imagens por nome, não por caminho.** Crie `src/lib/images.ts` com
`import.meta.glob('../assets/images/*.jpg', { eager: true })` e uma função
`img('nome-do-arquivo')`. O `site.ts` referencia só o nome; o glob resolve.

**Um interruptor de protótipo.** `site.demo: true` em `src/data/site.ts` deve
controlar, de uma vez só:
1. a faixa "Protótipo de demonstração" no topo,
2. a nota no rodapé,
3. `<meta name="robots" content="noindex, nofollow">` no `<head>`,
4. um `src/pages/robots.txt.ts` que gera o `robots.txt`.

> **Atenção ao `robots.txt`:** ele deve **liberar** a varredura mesmo em modo
> protótipo. Bloquear ali não tira a página da busca — se o robô não entra, ele
> nunca lê o `noindex`, e a URL ainda pode aparecer como link pelado. Quem faz o
> trabalho é a meta tag.
>
> Isso importa: sem `noindex`, o demo pode ranquear para o nome da empresa e
> competir com o Instagram dela — atrapalhar o negócio da pessoa antes da
> primeira conversa.

Não coloque o nome ou o contato do desenvolvedor em lugar nenhum do site. A
abordagem é feita por fora.

---

## Seções

Espaço de eventos vende **imagem** e **capacidade**. A noiva quer saber, nesta
ordem: como é o lugar, cabe quanta gente, o que já está incluso, e se a data
dela está livre.

1. **Hero** — a foto mais impressionante do acervo, headline curta, dois CTAs
   (orçamento no WhatsApp + ver o espaço), cidade/estado.
2. **Sobre o espaço** — o que é, para quem, o diferencial. Dois parágrafos.
   Números reais ao lado (capacidade, anos de casa, eventos por ano) — **só se
   forem verificáveis no Instagram**.
3. **Estrutura** — a seção que mais converte e a que ninguém faz direito. Lista
   concreta: capacidade sentada/em pé, área climatizada, estacionamento, cozinha
   industrial, camarim/suíte dos noivos, gerador, área externa, piscina,
   playground, se aceita buffet próprio. Extraia isso dos posts e dos destaques
   do Instagram. **Se não achar a informação, deixe o campo fora — não invente.**
4. **Galeria** — o coração do site. Ver a seção de imagens abaixo.
5. **Tipos de evento** — casamento, 15 anos, formatura, corporativo, aniversário.
   Cada um com uma foto e uma frase.
6. **Como funciona** — 4 passos: visita agendada, reserva de data, o que está
   incluso, dia do evento.
7. **Depoimentos** — **vazio de propósito.** Um card com borda pontilhada
   dizendo "Os depoimentos ficarão aqui" e uma linha explicando que é espaço
   reservado para as avaliações reais. **Nunca invente depoimento.**
8. **Orçamento** — CTA grande de WhatsApp com fundo de foto e escurecimento.
9. **Rodapé** — contato, endereço com link para o Maps, Instagram, horário.

---

## Simulador de orçamento

O Dolce Cau tem um simulador que monta o pedido e manda pronto no WhatsApp. É o
que mais impressiona na demo. Faça o equivalente aqui.

**"Monte seu evento":** tipo de evento, número de convidados, mês/data
pretendida, período (diurno/noturno), e o que a pessoa já tem definido (buffet,
decoração, DJ). Ao final, um botão que abre o WhatsApp com a mensagem escrita:

```
Olá! Vim pelo site e queria um orçamento:

Evento: Casamento
Convidados: 180
Data pretendida: outubro de 2026
Período: noturno
Já tenho: buffet e decoração

Podem confirmar disponibilidade e valores?
```

Regras: **sem conta, sem servidor**. A seleção fica no `localStorage`
(`<slug>:orcamento:v1`), sobrevive a fechar a aba, e há um botão de limpar.
Envolva o acesso ao `localStorage` em `try/catch` — em aba anônima ele lança, e
o site não pode quebrar por causa disso.

Se o site tiver valores públicos, mostre uma **estimativa** claramente rotulada
como tal, com a ressalva de que o valor final é confirmado pela empresa. Se não
houver valor público, **não invente preço** — o simulador só monta o pedido.

Os CTAs de WhatsApp do hero e da seção de orçamento devem carregar o pedido
junto quando houver algo montado.

---

## Imagens — a parte mais importante

O acervo do Instagram é o produto. Foto mal enquadrada mata o site inteiro.

### Antes de usar qualquer imagem

O repositório já tem as ferramentas prontas. **Use.**

```bash
python tools/limpar-bordas.py sites/<slug>/src/assets/images            # simula
python tools/limpar-bordas.py sites/<slug>/src/assets/images --aplicar
python tools/folha-contato.py sites/<slug>/src/assets/images conferir.png
```

`limpar-bordas.py` acha sobra de recorte por **lisura**, não por cor: uma linha
inteira com desvio padrão quase zero não existe em foto de verdade — é sempre
fundo da página de onde a imagem foi recortada. Pega branco, cinza e preto.

`folha-contato.py` monta uma folha sobre fundo **magenta**. Qualquer borda
sobrando salta aos olhos. **Abra e olhe a folha** — no Dolce Cau foi ela que
revelou 8 imagens com letterbox preto que o detector inicial (que só procurava
branco) deixava passar.

Repita a limpeza até dar zero. Faixa nova pode aparecer depois do primeiro corte.

### Regras de enquadramento

- **Nunca ampliar além da resolução nativa.** Se a foto tem 800px, ela não pode
  ocupar um bloco de 1600px. Prefira usá-la menor.
- Toda foto em container com proporção fixa + `object-cover`. Nunca deixe a
  imagem definir a altura da linha.
- Confira o **assunto** depois do corte: `object-cover` centraliza, e em foto de
  casal isso às vezes corta cabeça. Use `object-position` quando precisar.
- Foto do Instagram vem em 1:1 ou 4:5. Para faixas largas (hero, fundo de
  seção), escolha as **poucas** que são realmente horizontais em vez de esticar
  uma vertical.
- **Descarte prints com interface do Instagram** — barra de usuário, curtidas,
  ícones. Se a única cópia disponível tem isso, corte fora ou não use.
- **Mosaico/carrossel salvo como uma imagem só precisa ser separado.** Uma foto
  com emenda visível no meio é pior que não ter foto.
- `<Image>` do `astro:assets` com `widths={[...]}` e `sizes` corretos, para gerar
  WebP e injetar `width`/`height` — zero layout shift.
- Nenhuma foto de banco de imagens. Nenhuma foto gerada por IA. Se falta imagem
  para uma seção, mude a seção.

### Uso das fotos

As fotos **pertencem à empresa**, não a você. Crie um `CREDITOS-IMAGENS.md`
registrando a origem e deixando claro: aceitável como proposta apresentada à
própria empresa; não republicar em vitrine pública indexada; não usar o logo
deles. Isso é o que justifica o `noindex`.

---

## Animação

- **Só `transform` e `opacity`.** Nunca anime `width`, `height`, `top`, `left` —
  forçam reflow e engasgam no celular.
- Entrada por `ScrollTrigger` com `once: true`. Nada que re-dispare ao subir.
- **Lenis só no desktop** (`matchMedia('(pointer: fine)')`). No toque o scroll
  nativo é mais previsível e não briga com o gesto de voltar do sistema.
- Cursor customizado e botões magnéticos **só** em `pointer: fine`.
- Um `ease` e três durações, definidos como tokens no `@theme`. Ritmo único no
  site inteiro.
- Marquee/faixa deslizante em CSS puro, não em JS.

### `prefers-reduced-motion` — não é opcional

Script inline no `<head>`, rodando **antes da primeira pintura**, que remove a
classe `js-anim` do `<html>`. O CSS só esconde os elementos de entrada quando
`.js-anim` está presente. Resultado: com a preferência ligada, **ou se o JS
falhar**, o conteúdo nunca fica preso invisível.

O simulador de orçamento **não** pode depender do motor de animação: ele tem que
funcionar com `prefers-reduced-motion` ligado. No Dolce Cau isso significou
chamá-lo fora da função que as animações inicializam.

---

## Mobile

O celular é onde a dona vai abrir o link. É o caso principal, não o secundário.

- **Marca centralizada no topo.** Grade de 3 colunas abaixo de `lg` para a marca
  cair no centro exato; a partir de `lg` volta à barra alinhada à esquerda.
- **Blocos de cabeçalho centralizados no celular.** Use um atributo
  (`data-centro-mobile`) e **uma regra só** no `global.css`, dentro de
  `@media (max-width: 1023px)`. Não espalhe `text-center lg:text-left` por vinte
  componentes.
  - A regra precisa aplicar `margin-inline: auto` **no próprio bloco também**,
    não só nos filhos — senão um bloco com `max-w-*` continua encostado à
    esquerda com o conteúdo centralizado por dentro.
  - Esconda o filete decorativo do `eyebrow` no celular: numa linha estreita ele
    força quebras feias.
- **Menu mobile é um leque**, não uma tela cheia: ancorado abaixo do botão,
  ~25% da tela. **Um botão só** — as barrinhas viram X no mesmo lugar. Fecha no
  próprio botão, no toque fora e no `Esc`.
- **Todo alvo de toque com no mínimo 44px de altura.** Inclui links de rodapé.
- **Nenhum texto abaixo de 12px.**
- **Zero overflow horizontal** em 375 / 768 / 1440.
- Listas longas: mostre 5 e um botão "Mostrar mais" que revela em lotes, com
  contador do que falta. Mantenha os itens escondidos **no HTML** (`hidden`),
  não fora dele — busca do navegador e indexação precisam enxergar.

---

## Armadilhas já conhecidas — leia antes de gastar tempo

Cada uma destas custou horas no primeiro site.

1. **O Astro colapsa espaço antes de expressão.** `Texto {variavel}` sai como
   `Textovariavel`. Use template literal ou `{' '}` explícito. Aconteceu duas
   vezes.
2. **`querySelector` pega só o primeiro.** Se houver dois botões com o mesmo
   atributo (abrir/fechar menu), o segundo fica sem listener e simplesmente não
   funciona. Use `querySelectorAll` — ou, melhor, um botão só.
3. **Item com `display:none` mede altura zero no ScrollTrigger.** Item que nasce
   escondido (dentro de "mostrar mais") **não pode ter** o atributo de reveal, ou
   aparece travado em `opacity: 0`.
4. **A página crescer invalida os gatilhos.** Depois de revelar itens, dispare um
   evento que chame `ScrollTrigger.refresh()`.
5. **`position: fixed` dentro de elemento com `backdrop-filter` não é fixo.**
   O filtro cria bloco de contenção. Painel fixo dentro de header com blur fica
   preso no header.
6. **GSAP escreve `transform` inline.** Se o mesmo elemento também tem zoom no
   hover via CSS, um mata o outro. Separe em dois elementos aninhados: GSAP no
   de fora, CSS no de dentro.
7. **Contador animado zera o conteúdo.** Deixe o valor real no HTML e zere pelo
   JS antes de contar — senão, sem JS, o visitante vê "0".
8. **Edge headless ignora `--window-size`.** Captura de tela por linha de comando
   sem CDP mente sobre a largura. Use os scripts de `tools/`.
9. **Não canalize saída de script para `head` / `Select-Object`.** Fechar o cano
   mata o processo no meio (SIGPIPE) e o script para sem terminar. Redirecione
   para arquivo: `> saida.log 2>&1`.
10. **PATH do Node não persiste entre chamadas no PowerShell.** Prefixe com
    `$env:PATH += ";C:\Program Files\nodejs"`.

---

## Conteúdo — o que é real e o que não é

**Só use informação verificável** no Instagram, no Linktree ou no Google Maps:
endereço, telefone, capacidade, estrutura, horário.

Pode escrever textos de apresentação (hero, "sobre") a partir do posicionamento
deles — isso é redação, não invenção de fato.

**Nunca invente:** depoimento, preço, prêmio, número de eventos, ano de fundação,
nome de cliente.

No `README.md` do site, faça uma tabela **"o que é real e o que não é"**,
separando conteúdo oficial de texto escrito por você. Isso protege você numa
conversa e mostra seriedade.

---

## Verificação — antes de dizer que está pronto

Rode de verdade. Não afirme que funciona sem ter olhado.

```bash
npm run build                                              # tem que passar limpo
npx astro dev --background --host 0.0.0.0 --port 4321      # servidor na rede

node tools/qa-mobile.mjs   http://127.0.0.1:4321/ 375 812 > qa.log 2>&1
node tools/qa-secoes.mjs   http://127.0.0.1:4321/          > sec.log 2>&1
node tools/test-reduced.mjs http://127.0.0.1:4321/         > rm.log  2>&1
node tools/audit.mjs       http://127.0.0.1:4321/          > audit.log 2>&1
node tools/shot.mjs        http://127.0.0.1:4321/ 1440 900 desk.png
```

**Abra as capturas e olhe.** Medida passando não garante que está bonito.

Checklist de aceite:

- [ ] Build de produção passa
- [ ] Overflow horizontal **zero** em 375 / 768 / 1440
- [ ] Nenhum alvo de toque abaixo de 44px (o link "pular para o conteúdo" é exceção)
- [ ] Nenhum texto abaixo de 12px
- [ ] Blocos centralizados **simétricos ao pixel** em 375 e 768
- [ ] Menu abre, fecha pelo mesmo botão, fecha no toque fora e no Esc
- [ ] **Todo** link e botão testado — âncoras existem, WhatsApp abre com a
      mensagem escrita, links externos com `rel="noopener noreferrer"`
- [ ] Simulador: adicionar, editar, recarregar a página (tem que persistir),
      limpar, e enviar
- [ ] Layout conferido com `prefers-reduced-motion` **ligado** e com o JS
      desligado
- [ ] Contraste WCAG AA (mínimo 4.5:1) em todos os pares de texto/fundo
- [ ] Nenhuma imagem com borda sobrando — confirmado na folha de contato magenta
- [ ] `demo: true` produz faixa + nota no rodapé + `noindex` + `robots.txt`;
      `demo: false` remove os quatro. **Teste os dois sentidos com build.**
- [ ] Nenhuma menção ao desenvolvedor no site

## Entregáveis

Além do site:

- `README.md` — stack, decisões de design, tabela do que é real, comandos
- `DEPLOY.md` — passo a passo da Vercel, o interruptor `demo`, como tirar do ar
- `CREDITOS-IMAGENS.md` — origem das fotos e as restrições de uso
- `vercel.json` — `framework: astro`, `outputDirectory: dist`

## Como trabalhar

Faça perguntas de esclarecimento **antes** de começar a construir, não depois.

Quando encontrar um problema real com o que foi pedido, diga em uma ou duas
frases e siga construindo sob a suposição declarada. Não pare o trabalho
inteiro por causa de uma dúvida que dá para contornar.

Ao terminar, relate o que foi verificado e o que **não** foi. Se algo ficou
quebrado ou pela metade, diga qual e por quê. Não afirme que testou o que não
testou.
