# Publicar

## As fotos são de banco

O site está preenchido com 28 fotos do **Pexels**, não do salão. Ele avisa isso
na faixa do topo e no selo do antes/depois. Ver
[`CREDITOS-IMAGENS.md`](CREDITOS-IMAGENS.md).

**Enquanto for assim, `site.demo` TEM de continuar `true`** — é o que mantém os
dois avisos na tela. Virar `false` com foto de banco transformaria um protótipo
honesto num site que mente sobre o próprio trabalho.

## No ar: https://demo-stilo-cabeleireiro.netlify.app

Publicado em 05/08/2026 na **Netlify**, não no Cloudflare — o login do
Cloudflare exige navegador na mesma máquina e o Théo estava no celular. O
`astro.config.mjs` aponta para a URL da Netlify.

E sim, **nasceu 401 de novo**, mesmo depois de o `account_sso_login` ter sido
zerado no deploy do Priorize. Trate como passo obrigatório:

```bash
netlify api updateSite --data '{"site_id":"66f280f9-eb1c-48b5-be42-b4d1778e7179","body":{"sso_login":false}}'
curl -s -o /dev/null -w "%{http_code}\n" https://demo-stilo-cabeleireiro.netlify.app/
```

Republicar depois de mudar algo:

```bash
cd sites/stilo-cabeleireiro && npm run build && netlify deploy --dir=dist --prod
```

## Migrar para o Cloudflare Pages

O `wrangler` já está instalado (4.119). Falta só o token — e **trocar o `site`
do `astro.config.mjs` para `.pages.dev` e refazer o build**, senão a prévia do
WhatsApp continua apontando para a Netlify.

```bash
cd sites/stilo-cabeleireiro
npm run build
wrangler pages project create demo-stilo-cabeleireiro --production-branch main
wrangler pages deploy dist --project-name demo-stilo-cabeleireiro
```

### ⚠️ O login do Cloudflare não funciona do celular

`wrangler login` abre o navegador e espera o retorno em `http://localhost:8976`.
Abrir o link num telefone não resolve: o retorno tem de cair na mesma máquina.
Isso é diferente da Netlify, cujo login é por ticket e funciona de qualquer
aparelho.

Do celular, o caminho é **API token**:

1. `dash.cloudflare.com` → ícone de perfil → **API Tokens**
2. **Create Token** → **Create Custom Token**
3. Permissão: **Account · Cloudflare Pages · Edit** (só essa)
4. Account Resources: a conta dele

```bash
export CLOUDFLARE_API_TOKEN=<token>
export CLOUDFLARE_ACCOUNT_ID=<id da conta>
```

O Account ID fica em **Workers & Pages → Overview**, na barra lateral.

### Confira com curl, não com a mensagem de sucesso

Vale para qualquer plataforma. Na Netlify os DOIS protótipos nasceram 401
mesmo dizendo "Deploy is live!".

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://demo-stilo-cabeleireiro.pages.dev/
```

Tem de responder **200**.

## A URL está fixada no astro.config.mjs

O `og:image` precisa de URL **absoluta**: o WhatsApp não resolve caminho
relativo ao montar a prévia do link, e é por WhatsApp que este site vai ser
mandado. Hoje o `astro.config.mjs` tem:

```js
site: 'https://demo-stilo-cabeleireiro.netlify.app',
```

**Ao migrar para o Cloudflare, troque para `.pages.dev` e rode o build de
novo** — senão a prévia continua apontando para a Netlify. O domínio de um
projeto no Pages é sempre `<nome-do-projeto>.pages.dev`.

## Checklist antes de mandar o link

Verificado em 05/08/2026:

- [x] `npm run build` passa
- [x] Contraste: 48 pares no desktop e 47 no celular, **0 reprovados**
- [x] Âncoras: 22 links, **0 quebradas**
- [x] WhatsApp: 15 links, todos os caminhos, **0 malformados**
- [x] As três ferramentas: **32/32**
- [x] Antes/depois e carrossel, inclusive sem JS
- [x] Toque real (dedo): arrasto, rótulos, menu
- [x] Mobile: overflow horizontal **0**; alvos de toque ok
- [x] `site.demo === true` liga os 4 efeitos, e `false` remove os 4
- [x] 28 fotos de banco no lugar, recortadas para os slots
- [x] `tiposCabelo` reescrito **olhando cada foto** que entrou
- [x] Antes/depois com selo de "imagens ilustrativas"
- [ ] ⬜ Conferir o contraste do texto **sobre foto** (o medidor não lê isso)
- [ ] ⬜ **Trocar pelas fotos reais do Stilo** antes de qualquer conversa séria
- [ ] ⬜ Resolver os `CONFERIR` do `src/data/site.ts` (ver abaixo)
- [x] Publicado numa URL permanente, com `curl` devolvendo **200**
- [x] `site` no `astro.config.mjs` batendo com a URL real, e build refeito
- [ ] ⬜ Colar a URL numa conversa **sua** no WhatsApp e ver a prévia
- [ ] ⬜ Abrir no próprio celular e percorrer as três ferramentas até o fim

### Os `CONFERIR` pendentes

Este protótipo nasceu de **uma fonte só** — o print da bio do Instagram. O
Priorize teve entrevista; este não teve. O que está deduzido e precisa passar
pelo olho deles:

| O quê | Onde | Por quê |
| :--- | :--- | :--- |
| Bairro e CEP | `site.bairro`, `site.cep` | A Av. São Paulo corta várias zonas; o CEP é o genérico de Maringá |
| Link de avaliações | `site.avaliacoesGoogle` | É busca no Maps, não o perfil real deles |
| A lista de serviços | `servicos.itens` | Deduzida dos 4 destaques + padrão de salão — é o que tem mais chance de conter erro |
| As respostas de mega hair | `megaHair.duvidas` | Corretas para o serviço em geral, **não** apuradas como a prática da casa |
| A história de 1978 | `casa.paragrafos` | Está curta de propósito: quem fundou, quantas gerações e se mudou de endereço eu não sei |

## O interruptor `demo`

Um campo em [`src/data/site.ts`](src/data/site.ts) controla quatro coisas:

| | `demo: true` | `demo: false` |
| :--- | :--- | :--- |
| Faixa "Protótipo de demonstração" no topo | aparece | some |
| Nota no rodapé | aparece | some |
| `<meta name="robots" content="noindex, nofollow">` | presente | ausente |
| Aviso no `robots.txt` | presente | ausente |
| `Allow: /` no `robots.txt` | **sempre** | **sempre** |

Testado nos dois sentidos:

```bash
node tools/test-demo.mjs sites/stilo-cabeleireiro
```

**Por que o `robots.txt` libera a varredura mesmo em modo protótipo:** bloquear
ali não tira a página da busca. Se o robô não entra, ele nunca lê o `noindex`, e
a URL ainda pode aparecer como link pelado. Quem faz o trabalho é a meta tag.

**Só vire `demo: false`** se o Stilo contratar. Antes disso, o demo indexado
competiria no Google com o Instagram deles pelo próprio nome.

## Tirar do ar

```bash
netlify sites:delete demo-stilo-cabeleireiro       # onde está hoje
wrangler pages project delete demo-stilo-cabeleireiro  # se migrar
```

Se eles pedirem para tirar, tire na hora e responda confirmando.
