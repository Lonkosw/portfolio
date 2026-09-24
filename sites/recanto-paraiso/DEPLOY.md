# Publicar

## Está no ar

**https://recantoparaiso-demo.netlify.app** — publicado em 06/08/2026, com as
fotos e o vídeo reais, `demo: true` e `noindex`.

## ⚠️ A URL está fixada no astro.config.mjs

O `og:image` precisa de URL **absoluta** — o WhatsApp não resolve caminho
relativo ao montar a prévia do link. Por isso o `astro.config.mjs` tem:

```js
site: 'https://recantoparaiso-demo.netlify.app',
```

**Se a Netlify te der outro domínio, troque ali e rode o build de novo**, senão a
prévia do link aponta para um endereço que não existe e o WhatsApp mostra a
mensagem sem imagem.

## Checklist antes de mandar o link

- [ ] `site` no `astro.config.mjs` batendo com a URL real do deploy
- [ ] Colar a URL numa conversa de teste no WhatsApp e conferir se a prévia
      aparece com imagem, título e descrição
- [ ] `python scripts/processar-midias.py` rodado depois de qualquer troca em `imagens/`
- [ ] Folha de contato conferida **a olho** (`tools/folha-contato.py`)
- [ ] `site.demo === true` em `src/data/site.ts`
- [ ] Capacidade de 160 confirmada, ou corrigida nos três lugares (ver README)
- [ ] `npm run build` passa
- [ ] `node scripts/test-simulador.mjs <url>` dá 44/44 e `test-video.mjs` dá 22/22
- [ ] Abrir o site no próprio celular e rolar de cima a baixo

## Netlify

```bash
npm run build
netlify deploy --dir=dist --prod
```

> ⚠️ **Projeto novo na Netlify nasce protegido por senha.** O deploy diz
> "Deploy is live" e a URL responde **401**. É o `sso_login`, ligado por padrão:
>
> ```bash
> netlify api updateSite --data '{"site_id":"<PROJECT ID>","body":{"sso_login":false}}'
> ```
>
> O `site_id` é o **Project ID** que aparece no `sites:create` (aqui:
> `e6bd319a-8e17-42d0-b348-64c45221c91e`), não o nome do projeto. Depois
> confirme com `curl -o /dev/null -w "%{http_code}" <url>`.

## O interruptor `demo`

Um único campo em [`src/data/site.ts`](src/data/site.ts) controla quatro coisas:

```ts
demo: true,
```

| | `demo: true` | `demo: false` |
| :--- | :--- | :--- |
| Faixa "Protótipo de demonstração" no topo | aparece | some |
| Nota no rodapé | aparece | some |
| `<meta name="robots" content="noindex, nofollow">` | presente | ausente |
| Aviso no `robots.txt` | presente | ausente |
| `Allow: /` no `robots.txt` | **sempre** | **sempre** |

Testado nos dois sentidos com build de produção.

**Por que o `robots.txt` libera a varredura mesmo em modo protótipo:** bloquear ali
não tira a página da busca. Se o robô não entra, ele nunca lê o `noindex`, e a URL
ainda pode aparecer nos resultados como link pelado. Quem faz o trabalho é a meta
tag — o robô precisa **entrar** para obedecer.

**Só vire `demo: false`** se o Recanto contratar e este passar a ser o site oficial
deles. Antes disso, o demo indexado competiria no Google com o Instagram dela.

## Conferir o que subiu

Abra a URL **direto no navegador**. Não procure no Google: o `noindex` é
proposital, e não achar lá não significa que o deploy falhou.

Confira também `https://<sua-url>/robots.txt`.

## Tirar do ar

```bash
netlify sites:delete --site recantoparaiso-demo
```

Se ela pedir para tirar, tire na hora e responda confirmando.
