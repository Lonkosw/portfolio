# Publicar

## 🚨 NÃO mande um link de túnel para o cliente

O `cloudflared tunnel --url` (quick tunnel) serve para **você conferir de outro
aparelho**, e só. Ele morre quando o seu PC dorme, quando o processo cai, ou
sozinho depois de um tempo — e a URL muda a cada vez que sobe.

O cliente abre o link quando quiser: no fim do expediente, no dia seguinte, ao
mostrar para a sócia. Se estiver morto, a primeira impressão é uma página de
erro — pior do que não ter mandado nada.

**Antes de mandar, publique de verdade.** As duas opções, da mais rápida à mais
completa:

### Netlify Drop — sem conta, ~2 minutos

1. `npm run build` dentro da pasta do site
2. Abra <https://app.netlify.com/drop>
3. Arraste a pasta `dist/` inteira para a página
4. Copie a URL que aparece (algo como `random-name-123.netlify.app`)
5. **Volte ao `astro.config.mjs`, troque o `site:` por essa URL, e rode
   `npm run build` de novo.** Sem isso a prévia do WhatsApp aponta para um
   endereço que não existe e o link sai sem imagem
6. Arraste a `dist/` de novo (agora com a URL certa)

### Vercel — precisa de conta, dá URL mais apresentável

```bash
npm i -g vercel      # só na primeira vez
vercel login
vercel --cwd sites/studio-priorize --prod
```

> A publicação exige o **seu login**. Não dá para automatizar daqui.

## Antes de tudo: as fotos

✅ **Feito.** As 31 fotos reais estão no lugar, zero placeholder.

## ⚠️ A URL está fixada no astro.config.mjs

O `og:image` precisa de URL **absoluta** — o WhatsApp não resolve caminho
relativo ao montar a prévia do link, e é por WhatsApp que este site vai ser
mandado. O `astro.config.mjs` tem:

```js
site: 'https://demo-studio-priorize.vercel.app',
```

**Se a Vercel der outro domínio, troque ali e rode o build de novo**, senão a
prévia aponta para um endereço que não existe e a mensagem sai sem imagem.

## Checklist antes de mandar o link

Verificado em 31/07/2026 (marcado ✅ o que já está feito):

- [x] ✅ As 31 fotos reais no lugar, zero placeholder
- [x] ✅ `npm run build` passa
- [x] ✅ Contraste: 45 pares, 0 reprovados
- [x] ✅ WhatsApp: 59 checagens, todos os caminhos funcionam
- [x] ✅ Ferramentas: 64/64
- [x] ✅ Antes/depois e carrossel: 26 checagens
- [x] ✅ Toque real (dedo): arrasto, rótulos, menu — todos passam
- [x] ✅ Celular: LCP 624 ms, CLS 0, 0 quadros longos no scroll
- [x] ✅ `site.demo === true`
- [ ] ⬜ **Publicado numa URL permanente** (Netlify Drop ou Vercel) — ver o topo
- [ ] ⬜ **`site` no `astro.config.mjs` batendo com a URL real**, e build refeito
- [ ] ⬜ Colar a URL numa conversa **sua** no WhatsApp e ver se a prévia aparece
      com imagem, título e descrição
- [ ] ⬜ Abrir no próprio celular e percorrer as três ferramentas até o fim

### Conteúdo a confirmar com eles (não bloqueia o envio)

Nada disto impede mandar o protótipo, mas **se eles fecharem**, confirme antes
de virar oficial:

| O quê | Onde | Por quê |
| :--- | :--- | :--- |
| As seis palavras e a ordem | `studio.valores` | Lidas de foto, em dois lugares diferentes |
| O CEP | `site.cep` | `87300-000` é o genérico de Campo Mourão |
| Autorização das fotos com rosto | 7 fotos | Estão no Instagram público deles, mas a do grupo tem 4 pessoas |

## Vercel

```bash
npm i -g vercel      # só na primeira vez
vercel login
vercel --cwd sites/studio-priorize            # preview
vercel --cwd sites/studio-priorize --prod     # publica
```

Na primeira execução a Vercel pergunta o nome do projeto. Use algo que deixe
claro que é amostra — `demo-studio-priorize`.

> A publicação exige o **seu login** na Vercel. Não dá para automatizar daqui.

## O interruptor `demo`

Um campo em [`src/data/site.ts`](src/data/site.ts) controla quatro coisas:

| | `demo: true` | `demo: false` |
| :--- | :--- | :--- |
| Faixa "Protótipo de demonstração" no topo | aparece | some |
| Nota no rodapé | aparece | some |
| `<meta name="robots" content="noindex, nofollow">` | presente | ausente |
| Aviso no `robots.txt` | presente | ausente |
| `Allow: /` no `robots.txt` | **sempre** | **sempre** |

Testado nos dois sentidos com build:

```bash
node tools/test-demo.mjs sites/studio-priorize
```

**Por que o `robots.txt` libera a varredura mesmo em modo protótipo:** bloquear
ali não tira a página da busca. Se o robô não entra, ele nunca lê o `noindex`, e
a URL ainda pode aparecer como link pelado. Quem faz o trabalho é a meta tag.

**Só vire `demo: false`** se o Studio contratar. Antes disso, o demo indexado
competiria no Google com o Instagram deles pelo próprio nome.

## Conferir o que subiu

Abra a URL **direto no navegador**. Não procure no Google: o `noindex` é
proposital, e não achar lá não significa que o deploy falhou. Confira também
`https://<sua-url>/robots.txt`.

## Tirar do ar

```bash
vercel remove demo-studio-priorize
```

Se eles pedirem para tirar, tire na hora e responda confirmando.
