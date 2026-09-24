# Publicar

## 🚨 NÃO mande um link de túnel para o cliente

O `cloudflared tunnel --url` (quick tunnel) serve para **você conferir de outro
aparelho**, e só. Ele morre quando o seu PC dorme, quando o processo cai, ou
sozinho depois de um tempo — e a URL muda a cada vez que sobe.

A Cau abre o link quando quiser: no fim do dia, no dia seguinte, ao mostrar
para alguém. Se estiver morto, a primeira impressão é uma página de erro.

**Antes de mandar, publique de verdade.**

## ⚠️ A URL está fixada no astro.config.mjs

O `og:image` precisa de URL **absoluta**: o WhatsApp não resolve caminho
relativo ao montar a prévia. Numa doceria isso não é detalhe — a foto da mesa
de doces é o que faz a pessoa tocar no link. O `astro.config.mjs` tem:

```js
site: 'https://demo-dolce-cau.vercel.app',
```

**Se o deploy der outro domínio, troque ali e rode `npm run build` de novo**,
senão a prévia aponta para um endereço que não existe e o link sai pelado.

## Checklist antes de mandar

Verificado em 31/07/2026:

- [x] ✅ 66 fotos reais, zero placeholder
- [x] ✅ `npm run build` passa
- [x] ✅ Contraste: 29 pares, 0 reprovados
- [x] ✅ 8 links de WhatsApp, todos com mensagem pronta
- [x] ✅ 0 âncoras quebradas, 0 externos sem `noopener`
- [x] ✅ Celular: LCP 684 ms, CLS 0, 0 quadros longos no scroll
- [x] ✅ `og:image` gerado (foi adicionado em 31/07 — antes o link ia sem foto)
- [x] ✅ `site.demo === true`
- [ ] ⬜ **Publicado numa URL permanente**
- [ ] ⬜ **`site` no `astro.config.mjs` batendo com a URL real**, e build refeito
- [ ] ⬜ Colar a URL numa conversa **sua** no WhatsApp e ver a prévia com foto
- [ ] ⬜ Abrir no celular e fazer um orçamento inteiro

## Netlify Drop — sem conta, ~2 minutos

1. `npm run build`
2. Abra <https://app.netlify.com/drop> e arraste a pasta `dist/`
3. Copie a URL, troque no `astro.config.mjs`, `npm run build`, arraste de novo

## Vercel — precisa de conta

O projeto não está em repositório git, então o caminho mais curto é o CLI da
Vercel, que envia a pasta direto. Rode **de dentro de `sites/dolce-cau/`**.

```bash
npx vercel login      # só na primeira vez, abre o navegador
npx vercel --prod
```

Na primeira execução ele pergunta:

| Pergunta | Responda |
| :--- | :--- |
| Set up and deploy? | `y` |
| Which scope? | sua conta |
| Link to existing project? | `n` |
| Project name? | **`demo-dolcecau`** |
| In which directory is your code? | `./` (Enter) |
| Modify settings? | `n` — o [`vercel.json`](vercel.json) já define tudo |

Sai `https://demo-dolcecau.vercel.app`. Os deploys seguintes são só
`npx vercel --prod`, sem perguntas.

## O interruptor de protótipo

Tudo que separa "amostra" de "site oficial" está numa linha só, em
[`src/data/site.ts`](src/data/site.ts):

```ts
demo: true,
```

Com `true` (agora):

- faixa "Protótipo de demonstração" no topo
- nota no rodapé
- `<meta name="robots" content="noindex, nofollow">` no `<head>`
- `robots.txt` explicando que é protótipo

Com `false`, os quatro somem juntos e o site passa a ser indexável. Conferido
nos dois sentidos com build de produção.

### Por que o robots.txt libera a varredura

Parece contraditório, mas bloquear no `robots.txt` **não** tira a página da
busca. Se o robô não pode entrar, ele nunca lê o `noindex` do `<head>` — e a
URL ainda pode aparecer nos resultados como um link pelado, sem descrição.
Quem faz o trabalho é a meta tag; por isso a varredura fica liberada de
propósito. Ver [`src/pages/robots.txt.ts`](src/pages/robots.txt.ts).

Isso importa aqui: sem o `noindex`, o demo poderia ranquear para
"dolce cau maringá" e competir com os canais da própria doceria — atrapalhar o
negócio dela antes da primeira conversa.

## Antes de mandar o link

- [ ] Abrir `demo-dolcecau.vercel.app` **no celular**, não só no desktop
- [ ] Testar o simulador: adicionar 2 sabores, abrir o painel, clicar em
      "Enviar pelo WhatsApp" e conferir se a mensagem chega escrita
- [ ] Conferir `demo-dolcecau.vercel.app/robots.txt`
- [ ] Ver o código-fonte e confirmar o `noindex`

## Se a doceria fechar

1. `demo: false` em `src/data/site.ts`
2. Domínio próprio (`dolcecau.com.br`) apontado na Vercel — muda a percepção
   muito mais que qualquer animação
3. `npx vercel --prod`

## Se pedirem para tirar do ar

```bash
npx vercel remove demo-dolcecau --yes
```

Vale prometer isso na primeira mensagem. Quem oferece remover primeiro quase
nunca precisa remover — e as fotos são delas, não suas
(ver [`CREDITOS-IMAGENS.md`](CREDITOS-IMAGENS.md)).
