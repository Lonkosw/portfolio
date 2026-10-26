#!/usr/bin/env bash
# Publica o hub no Cloudflare Pages (projeto portfolio-hub; o domínio real é portfolio-hub-er7.pages.dev).
set -euo pipefail
cd "$(dirname "$0")"
npm install --no-audit --no-fund && npm run build
npx wrangler pages deploy dist --project-name portfolio-hub --branch main
