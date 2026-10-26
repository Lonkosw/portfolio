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
for p in marmorarias odontologia solar; do
  npx wrangler pages deploy "/tmp/deploy-$p" --project-name "portfolio-$p" --branch main
done
