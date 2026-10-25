# Clínicas odontológicas — 3 sites com agendamento e simuladores

Astro + Tailwind CSS. Três sites completos, cada um com landing própria, 7–8 páginas de tratamento geradas dos dados, agendamento online em 5 etapas e simuladores interativos.

| Rota | Clínica | Direção visual |
|---|---|---|
| `/` | navegação neutra | — |
| `/modelo-1/` | Clínica Lumière (Batel, Curitiba) | escuro grafite + champanhe, serifada editorial |
| `/modelo-2/` | Instituto Vértice (Água Verde, Curitiba) | escuro navy + ciano, HUD, varredura e malha 3D |
| `/modelo-3/` | Clínica Ninho (Bigorrilho, Curitiba) | claro off-white + sálvia, arredondado, formas orgânicas |

Tratamentos: `/modelo-X/tratamentos/<slug>` (ex.: `/modelo-2/tratamentos/protocolo-all-on-4`).

## Rodar

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # gera ./dist
npm run preview
```

## Personalizar por URL

Qualquer página aceita `?empresa=&cidade=&whats=&dr=` e troca nome, cidade, WhatsApp e dentista principal em todo o site, no `<title>`, nos metadados, no JSON-LD e nas mensagens do WhatsApp. Os valores são sanitizados (só texto).

```
/modelo-1/?empresa=Clinica+Sorriso&dr=Ana+Souza&cidade=Maringá&whats=5544988887777
```

Sem parâmetros, valem os dados dos arquivos. Os links internos mantêm a query string.

## Trocar dados

| O quê | Onde |
|---|---|
| Nome, endereço, horários, CRO, equipe, depoimentos, convênios, FAQ, tour | `src/data/clinics/modelo-N.ts` |
| Biblioteca de tratamentos (texto, etapas, tempos, FAQ) | `src/data/tratamentos.ts` |
| Quiz, escala do clareamento, comparadores, feriados, flags | `src/data/odonto-config.ts` |
| Imagens (curadoria, alt, recortes) | `tools/odonto-imagens.mjs` → `public/img/` |

> Todos os dados (CRO, telefones, endereços, depoimentos, números) são fictícios. Troque-os e valide os textos com o CRO local antes de publicar. Veja `DECISOES.md`.

## Ligar e desligar

Em `src/data/odonto-config.ts` → `flags`:

- `mostrarValores` (padrão **false**): preços, parcelas e o simulador de parcelamento. Para testar: `PUBLIC_MOSTRAR_VALORES=true npm run build`.
- `mostrarAntesDepois` (padrão **true**): ilustração de antes/depois (desenho genérico, sem pacientes).
- `mostrarConvenios` (padrão **true**).
- `noindex`: `PUBLIC_NOINDEX=true` no build mantém as páginas fora dos buscadores.

## Agenda real

A disponibilidade vem de uma única função, `getDisponibilidade()` em `src/lib/disponibilidade.ts`. Hoje ela usa os horários de funcionamento e simula alguns horários ocupados. Para integrar um sistema real, troque o corpo da função (comentário no topo do arquivo) retornando os mesmos `Slot[]`. A confirmação continua no WhatsApp (`src/lib/whatsapp.ts`); o `.ics` é gerado no cliente (`src/lib/ics.ts`).

## Variáveis de build (opcionais)

`SITE_URL` (URL canônica/og), `PUBLIC_NOINDEX`, `PUBLIC_MOSTRAR_VALORES`, `PUBLIC_MAP_TILES` (endereço de tiles do mapa; padrão OpenStreetMap).

## Ferramentas (`tools/`)

- `odonto-imagens.mjs`: curadoria e conversão AVIF/WebP/JPG.
- `odonto-qa.mjs`: agendamento (incl. urgência e `.ics`), quiz, personalização por URL, teclado.
- `odonto-audit.mjs`: overflow, alvos de toque, texto mínimo, JS desligado, movimento reduzido.
- `odonto-palavras.py`: busca final por palavras proibidas.
- `odonto-shot.mjs`: capturas de tela.

Rode `npm run preview` e, em outro terminal, `node tools/odonto-qa.mjs http://localhost:4321`.

O template antigo de protótipos para clientes está em `README-template-clientes.md` e `src/pages/_template-original.astro`.
