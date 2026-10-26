# Portfólio (hub)

Página-índice dos projetos, agrupados por nicho. Dados em `src/data/portfolio.mjs`.

- `/` — todos os grupos, com seletor. `?g=solar,odontologia` mostra só os grupos escolhidos (o botão "Copiar link desta seleção" gera isso).
- `/<nicho>/` — página só de um nicho (é o link para mandar ao cliente; não mostra os outros nichos).

## Novo nicho
1. Publique o site do nicho (Cloudflare Pages).
2. Adicione um objeto em `niches` em `src/data/portfolio.mjs` (slug, nome, descrição, cor, URL base, projetos).
3. `npm run thumbs` (gera as miniaturas dos sites publicados; precisa do Playwright) e `./deploy.sh`.

Foto: coloque `public/avatar.jpg` (quadrada) e troque `avatar` em `profile`. Nome/descrição também em `profile`.
Fontes: Newsreader (serifa editorial, parente da usada pela Anthropic) e IBM Plex Mono (clima de terminal), self-hosted.
Animação: só `transform`/`opacity`; flutuação pausa fora da tela; respeita `prefers-reduced-motion`.
