#!/usr/bin/env bash
# Publica os 3 nichos no Cloudflare Pages (um projeto por nicho), com noindex.
# Requer: CLOUDFLARE_API_TOKEN (permissão Pages:Edit) e CLOUDFLARE_ACCOUNT_ID no ambiente.
set -euo pipefail
cd "$(dirname "$0")"
for p in marmorarias odontologia solar; do
  (cd "$p" && npm install --no-audit --no-fund && PUBLIC_NOINDEX=true npm run build)
  rm -rf "/tmp/deploy-$p" && cp -r "$p/dist" "/tmp/deploy-$p"
done
rm -rf /tmp/deploy-solar/estudio   # site antigo do estúdio, não deve ir junto (ver sites/solar/DECISOES.md)
# Sem 404.html o Pages responde 200 com o index em qualquer caminho (fallback SPA); com ele, caminho inexistente dá 404.
for p in marmorarias odontologia solar; do
  printf '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="robots" content="noindex"><title>404</title><h1>404</h1>' > "/tmp/deploy-$p/404.html"
  npx wrangler pages deploy "/tmp/deploy-$p" --project-name "portfolio-$p" --branch main
done
