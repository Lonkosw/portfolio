# Publicar

## 🚨 NÃO mande um link de túnel para o cliente

O `cloudflared tunnel --url` (quick tunnel) serve para **você conferir de
outro aparelho**, e só. Ele morre quando o seu PC dorme ou o processo cai — e
a URL muda a cada vez que sobe.

### Netlify Drop — sem conta, ~3 minutos

1. `npm run build`
2. Abra <https://app.netlify.com/drop> e arraste a pasta `dist/`
3. Em **Site settings → Change site name**, use algo como `animaconfeitaria-demo`
4. **Troque a URL no `astro.config.mjs`**, rode `npm run build` de novo e
   arraste outra vez

O passo 4 não é opcional: é ele que faz a prévia do WhatsApp funcionar. Numa
confeitaria, a foto do bolo é o que faz a pessoa tocar no link.

## Antes de mandar

- [x] ✅ 11 fotos reais, zero placeholder
- [x] ✅ Bolinhas do carrossel do Instagram removidas de 3 fotos
- [x] ✅ `npm run build` passa
- [x] ✅ 56/56 no montador, com e sem reduced-motion
- [x] ✅ QA do usuário chato limpo em 390px e 1440px
- [x] ✅ Contraste: 24 pares, 0 reprovados
- [x] ✅ Celular: LCP 412 ms, CLS 0, zero quadros longos no scroll
- [x] ✅ `site.demo === true`
- [ ] ⬜ Publicado numa URL permanente, com o `site:` batendo
- [ ] ⬜ Prévia conferida numa conversa **sua** no WhatsApp

## O interruptor `demo`

Um campo em [`src/data/site.ts`](src/data/site.ts) controla quatro coisas de
uma vez: faixa no topo, nota no rodapé, `<meta name="robots" content="noindex">`
e o aviso no `robots.txt`.

**Por que o `robots.txt` libera a varredura mesmo em modo protótipo:**
bloquear ali não tira a página da busca. Se o robô não entra, ele nunca lê o
`noindex`, e a URL ainda pode aparecer como link pelado. Quem faz o trabalho
é a meta tag.

**Só vire `demo: false`** se a confeitaria contratar.
