# Junção dos nichos

Branch `juncao-nichos`, criada a partir de `ccr-6948ffec-62l8yv` (marmorarias). Nada foi apagado; as três branches de origem continuam intactas.

| Nicho | Origem | Pasta | Rotas |
|---|---|---|---|
| Marmorarias | `ccr-6948ffec-62l8yv` (base) | `sites/marmorarias` | `/modelo-1..3` |
| Odontologia | `claude/new-session-h4hhyi` | `sites/odontologia` | `/modelo-1..3` (+ `/modelo-N/tratamentos/<slug>`) |
| Solar | `claude/new-session-hiumm1` | `sites/solar` | `/modelo-1..3` (+ `/estudio`, `/`) |

## 1. O que foi decidido na junção

- **As duas branches trabalharam na raiz do repositório**, transformando o projeto-base (`src/`, `public/`, `package.json`, `astro.config.mjs`, `README.md`) em outro projeto. Para cada uma extraí da branch só o projeto: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `README.md`, `DECISOES.md`, `src/`, `public/` e as ferramentas novas de `tools/` (`odonto-*` e `README-template-clientes.md` na odontologia; `baixar-imagens.mjs` no solar). A raiz do repositório continua como no commit inicial (`55a22d4`) + marmorarias.
- **Não copiei** o que já existe na raiz e não pertence ao nicho (`tools/` genéricas, `mockups`, PNGs, `AGENTS.md`, `CLAUDE.md` etc.).
- **Conflitos de nome:** nenhum, porque cada projeto ficou na própria pasta. Os `README.md` e `DECISOES.md` de cada um foram mantidos sem alteração.
- **`.gitignore`** de cada projeto: cópia do da raiz sem as linhas de leads de prospecção.
- **`tsconfig.json`:** cada projeto leva o seu (extende `astro/tsconfigs/strict`, que existe depois do `npm install` local). Marmorarias já usava o próprio.
- **`public/_headers`** (novo nos três): `X-Robots-Tag: noindex, nofollow` para o Cloudflare Pages. Não altera conteúdo nem visual.
- Os `package-lock.json` dos outros sites e o da raiz aparecem como modificados no working tree por causa do `npm install` (remoção do campo `libc`); **não foram commitados**.

## 2. Build

`npm install` e `npm run build` rodaram sem erro nas três pastas (marmorarias 4 páginas, odontologia 26, solar 5).

## 3. O que se repete nos 3 DECISOES.md (proposta, nada foi refatorado)

| Tema | Marmorarias | Odontologia | Solar | Pode ser compartilhado? |
|---|---|---|---|---|
| Calculadora / simulador | Calculadora por m² em etapas (`lib/calc.ts`, `Calculator.astro`) | Quiz, clareamento, parcelamento, comparador | Simulador de economia com 3 variantes (`lib/simulador.ts`) | **Só o padrão**, não a lógica: um componente com lógica pura sem DOM + variantes de apresentação + faixa mín–máx + aviso. Fórmulas e dados são de domínio. Candidato real: helpers de formato (moeda BRL, faixa), montagem da mensagem do WhatsApp com resumo e controle de passos. |
| Personalização `?empresa=` | `scripts/site.ts` (texto via `textContent`, sanitiza, esconde endereço ao trocar cidade) | `lib/personalizar.ts` (nome, cidade, whats, dr; JSON-LD, meta, mantém query nos links) | Não tem | **Sim, o maior ganho.** Um módulo único (sanitização, validação de WhatsApp 10–13 dígitos, troca em texto/atributos/meta/JSON-LD, propagação nos links) com os campos configurados por nicho. |
| WhatsApp | `wa.me` + mensagem formatada | `lib/whatsapp.ts` (`waLink`) | Mensagem montada no cliente | **Sim:** `waLink`, normalização do número e flutuante (`WhatsFloat` / `Flutuantes`). |
| Imagens | Unsplash, `scripts/fetch-images.mjs`, sem repetir entre modelos | Unsplash, `tools/odonto-imagens.mjs` (AVIF/WebP/JPG + `<picture>`) | Unsplash, `tools/baixar-imagens.mjs` (WebP 640/1280/1920) | **Sim:** um script de curadoria/conversão (lista de IDs em JSON) e um componente de imagem (`Img`/`Picture`/`Foto`) com `srcset`, `width/height`, `lazy` e hero com `fetchpriority`. Hoje são três versões do mesmo. Também `CREDITOS.md`. |
| Componentes | `Icon`, `Img`, `WhatsFloat` | `Icon`, `Picture`, `Flutuantes`, `Faq`, `Rodape` | `Icone`, `Foto` | **Sim:** ícones, imagem, flutuante, FAQ, schema JSON-LD `LocalBusiness`. Hero, navegação e animações de assinatura continuam por modelo. |
| Estrutura de dados | `modelo-N.ts` + `types.ts` + config | `clinics/modelo-N.ts` + `odonto-types.ts` | `empresa-N.ts` + `empresa-types.ts` | Padrão igual (dados fora dos componentes, tema por variáveis CSS). Só o tipo base (nome, cidade, whatsapp, cores, fontes, SEO) pode ser comum. |
| Reveal, contadores, parallax, menu | `site.ts` | `fx.ts` | `base.ts` | **Sim**, com respeito a `prefers-reduced-motion` e sem JS. |
| SEO / Lighthouse | `inlineStylesheets` não; fontes latin | `inlineStylesheets: 'always'` | sem inline | Padronizar `astro.config.mjs` e `_headers`. |
| Pendências iguais | WhatsApp, avaliações, fotos reais, `site`, noindex | idem | idem | Um único checklist de “virar cliente real”. |

**Diferenças a manter por nicho:** regras do CFO/CRO no odontológico (sem preço, depoimentos só de atendimento, legenda do antes/depois), tabela de preços das marmorarias, constantes de irradiação e tarifa do solar.

**Como compartilhar (opções, para você confirmar):**
1. **Pasta `packages/shared` com npm workspaces** (recomendada): `@portfolio/personalizar`, `@portfolio/whatsapp`, `@portfolio/imagens` (script + componente), `@portfolio/ui` (Icon, Flutuante). Cada nicho continua construindo sozinho (`npm install` na raiz do workspace ou dependência por `file:`).
2. Copiar e sincronizar com script: mais simples, mas os arquivos divergem.
3. Manter como está: só aceitável se os nichos não forem evoluir juntos.

Ordem sugerida se confirmar: (a) `personalizar` + `whatsapp`; (b) pipeline e componente de imagem; (c) ícones/flutuante/FAQ/JSON-LD; (d) config do Astro. Cada passo com build e comparação visual por captura antes de seguir. Risco: o odontológico tem regras de conformidade, então qualquer extração precisa de revisão com o checklist do CFO.

## 4. Lighthouse mobile (9 páginas)

Local, `npm run build` servido com brotli (como a hospedagem), Lighthouse 13, emulação mobile padrão, throttling simulado. Sem o `noindex` aplicado (os cabeçalhos só valem no Cloudflare; com ele a categoria SEO cairia por design).

| Página | Perf | A11y | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| marmorarias/modelo-1 | 98 | 100 | 100 | 100 | 2,1 s | 0 | 0 ms |
| marmorarias/modelo-2 | 99 | 100 | 100 | 100 | 1,9 s | 0 | 0 ms |
| marmorarias/modelo-3 | 95 | 100 | 100 | 100 | 2,8 s | 0,002 | 0 ms |
| odontologia/modelo-1 | 98 | 100 | 100 | 100 | 2,3 s | 0 | 0 ms |
| odontologia/modelo-2 | 99 | 100 | 100 | 100 | 2,0 s | 0 | 0 ms |
| odontologia/modelo-3 | 97 | 100 | 100 | 100 | 2,6 s | 0 | 0 ms |
| solar/modelo-1 | 90 | 100 | 100 | 100 | 2,7 s | 0 | 0 ms |
| solar/modelo-2 | 90 | 100 | 100 | 100 | 2,7 s | 0 | 0 ms |
| solar/modelo-3 | 81 | 100 | 100 | 100 | 4,2 s | 0 | 0 ms |

O solar nunca tinha sido medido (o DECISOES dele diz que o Lighthouse não rodou). O `solar/modelo-3` é o ponto fraco (LCP 4,2 s); não alterei nada porque a regra é não mexer no visual. Primeiro candidato de correção: hero do modelo 3 (tamanho do `srcset`/`preload`). Aguardo sua confirmação.

## 5. Publicação no Cloudflare Pages — NÃO publicado

O ambiente não tem credenciais do Cloudflare (`wrangler whoami`: não autenticado; sem `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`). Não há como publicar daqui, e não contornei isso. Portanto **não há links**.

Está tudo pronto: `sites/deploy-cloudflare.sh` faz build de cada nicho (com `PUBLIC_NOINDEX=true`, que o odontológico já suporta), remove `/estudio` do solar (site antigo do estúdio que o DECISOES do solar manda não publicar junto) e publica 3 projetos Pages (`portfolio-marmorarias`, `portfolio-odontologia`, `portfolio-solar`). Cada um traz `_headers` com `X-Robots-Tag: noindex, nofollow`. Para rodar, exporte as duas variáveis e execute o script. Os links ficarão `https://portfolio-<nicho>.pages.dev/modelo-1`, `/modelo-2`, `/modelo-3` (se o nome do projeto estiver livre).

Observação: o `/` de marmorarias e solar já tinha `noindex`; os modelos de marmorarias e solar não tinham meta noindex, por isso o cabeçalho.
