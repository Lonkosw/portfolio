# Publicar

## 🚨 NÃO mande um link de túnel para o cliente

O `cloudflared tunnel --url` (quick tunnel) serve para **você conferir de
outro aparelho**, e só. Ele morre quando o seu PC dorme, quando o processo
cai, ou sozinho depois de um tempo — e a URL muda a cada vez que sobe.

A chef abre o link quando puder: no fim do serviço, no dia seguinte, ao
mostrar para o sócio. Se estiver morto, a primeira impressão é uma página
de erro — pior do que não ter mandado.

### Netlify Drop — sem conta, ~2 minutos

1. `npm run build`
2. Abra <https://app.netlify.com/drop> e arraste a pasta `dist/`
3. Copie a URL, **troque no `astro.config.mjs`**, `npm run build`, arraste
   de novo

O passo 3 não é opcional: é ele que faz a prévia do WhatsApp funcionar.

## ⚠️ A URL está fixada no astro.config.mjs

O `og:image` precisa de URL **absoluta** — o WhatsApp não resolve caminho
relativo ao montar a prévia. Num restaurante isso é o que faz a pessoa
tocar no link: sem imagem, chega texto pelado.

```js
site: 'https://demo-ana-bistro.vercel.app',
```

## Antes de mandar

- [x] ✅ `npm run build` passa
- [x] ✅ 80/80 nas ferramentas, com e sem reduced-motion
- [x] ✅ QA do usuário chato limpo em 390px e 1440px
- [x] ✅ Contraste: 33 pares, 0 reprovados
- [x] ✅ Celular: LCP 512 ms, CLS 0
- [x] ✅ `site.demo === true`
- [ ] ⬜ **Telefone e endereço reais** — hoje são placeholder, e TODOS os
      botões do site apontam para eles
- [ ] ⬜ **Decidir o que fazer com a carta** — os preços são de demonstração
- [ ] ⬜ Publicado numa URL permanente, com o `site:` batendo
- [ ] ⬜ Prévia conferida numa conversa **sua** no WhatsApp

## Sobre a carta de demonstração

O site mostra uma carta com preços inventados. Isso é bom para a chef ver o
formato, e **arriscado** se ela achar que são os preços dela.

Duas saídas, ambas legítimas:

1. **Deixar como está** e dizer na mensagem que a carta é exemplo. O aviso
   já está dentro da própria seção, não escondido no rodapé.
2. **Tirar os preços** antes de mandar, deixando só os nomes dos pratos.
   Mais seguro, menos impressionante.

Se a conversa avançar, o certo é pedir a carta real — e aí o cardápio do
site vira um argumento de venda sozinho: "atualizo sempre que você mudar o
menu" é exatamente o que justifica a mensalidade.

## O interruptor `demo`

Um campo em [`src/data/site.ts`](src/data/site.ts) controla:

| | `demo: true` | `demo: false` |
| :--- | :--- | :--- |
| Faixa "Protótipo de demonstração" no topo | aparece | some |
| Nota no rodapé | aparece | some |
| `<meta name="robots" content="noindex, nofollow">` | presente | ausente |
| Aviso no `robots.txt` | presente | ausente |
| `Allow: /` no `robots.txt` | **sempre** | **sempre** |

**Por que o `robots.txt` libera a varredura mesmo em modo protótipo:**
bloquear ali não tira a página da busca. Se o robô não entra, ele nunca lê
o `noindex`, e a URL ainda pode aparecer como link pelado. Quem faz o
trabalho é a meta tag.

**Só vire `demo: false`** se o restaurante contratar.
