# Marmorarias — 3 landing pages com calculadora de orçamento por m²

Astro + Tailwind CSS. Três direções visuais, uma calculadora compartilhada.

| Rota | Direção | Empresa de referência |
|---|---|---|
| `/` | índice neutro só para navegar | — |
| `/modelo-1` | Luxo / alto padrão (grafite + bronze, serifada) | Maison Pietra |
| `/modelo-2` | Clean e acolhedor (off-white + tons de pedra, sans arredondada) | Casa de Pedra |
| `/modelo-3` | Industrial / obra (concreto + laranja, condensada) | Forte Granitos e Mármores |

## Como rodar

```bash
cd sites/marmorarias
npm install
npm run dev        # http://localhost:4321
npm run build      # gera ./dist (também regenera public/tex/*.svg)
npm run preview
npm run test:calc  # imprime os 3 cenários de teste da calculadora
```

Node 22.12 ou superior.

## Personalizar por URL (para mostrar ao cliente)

Adicione parâmetros à rota. Valem para nome, cidade e WhatsApp em toda a página, no `<title>`,
nas metas, no JSON-LD e nas mensagens do WhatsApp:

```
/modelo-1?empresa=Marmoraria+Silva&cidade=Londrina&whats=43999998888
```

- `empresa`: nome (só texto; tags e símbolos são removidos; máximo de 60 caracteres)
- `cidade`: cidade (ao trocar, o estado, o endereço e o CEP de referência saem da página)
- `whats`: número com DDD (com ou sem 55); precisa ter de 10 a 15 dígitos
- Sem parâmetros, valem os dados do arquivo de cada modelo.

## Onde trocar dados e preços

| O quê | Arquivo |
|---|---|
| Nome, telefone, WhatsApp, cidade, endereço, textos, depoimentos, FAQ, galeria, números | `src/data/modelo-1.ts`, `modelo-2.ts`, `modelo-3.ts` |
| **Preços por m², perda de material, bordas, cubas, recortes, instalação, lista de pedras** | `src/data/marmoraria-config.ts` |
| Fórmulas do cálculo (comentadas) | `src/lib/calc.ts` |
| Texturas das pedras (SVG gerado) | receitas em `marmoraria-config.ts`, gerador em `src/lib/stoneTextures.ts` |
| Fotos | `public/img/modelo-X/` (lista e créditos em `public/img/CREDITOS.md`; `scripts/images.json` + `scripts/fetch-images.mjs`) |

**Importante:** os preços de `marmoraria-config.ts` são médias conservadoras de mercado (referência
aproximada out/2026). Revise com a tabela real do cliente antes de apresentar.

Pendências para o cliente real: WhatsApp e telefone (hoje número genérico), endereço, nota/avaliações
do Google, números de prova, depoimentos e fotos de antes/depois. Veja `DECISOES.md`.
