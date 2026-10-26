# Landing pages de energia solar (Astro + Tailwind)

Três landing pages completas, com visuais diferentes, que compartilham um simulador de economia na conta de luz.

| Rota | Empresa | Direção visual | Simulador |
|---|---|---|---|
| `/modelo-1` | Aurora Engenharia Solar (São Paulo/SP) | escuro, tecnológico, âmbar | painel de controle |
| `/modelo-2` | Lume Energia Solar (Belo Horizonte/MG) | claro, residencial, verde e amarelo | questionário em 3 etapas |
| `/modelo-3` | Vale Verde Solar (Goiânia/GO) | industrial e agro, laranja e preto | ficha técnica |

`/` é só um índice neutro para navegar. O site do template anterior (estúdio) foi movido para `/estudio`.

## Como rodar

```bash
npm install
npm run dev      # servidor local em http://localhost:4321
npm run build    # gera o site estático em ./dist
```

## Onde trocar os dados

- **Dados de cada empresa** (nome, telefone, WhatsApp, endereço, cores, fontes, textos, números, passos, depoimentos, garantias, FAQ, imagens): `src/data/empresa-1.ts`, `empresa-2.ts` e `empresa-3.ts`. O formato está em `src/data/empresa-types.ts`. Nenhum dado de cliente fica dentro dos componentes.
- **Perguntas frequentes comuns**: `src/data/faq-base.ts`.
- **Constantes do simulador** (irradiação e tarifa por UF, custo por kWp, % de economia, reajuste tarifário, degradação, fator de CO₂, troca de inversor): `src/data/solar-config.ts`. Cada valor tem a fonte aproximada comentada. **Revise antes de publicar para um cliente real.**
- **Fórmulas**: `src/lib/simulador.ts` (comentadas passo a passo). A interface está em `src/components/shared/Simulador.astro` e `src/scripts/simulador-client.ts`.
- **Imagens**: `public/img/modelo-X/` (WebP em 640, 1280 e 1920 px). Para refazer o download, `node tools/baixar-imagens.mjs`. Créditos em `public/img/CREDITOS.md`.

Veja `DECISOES.md` para as decisões tomadas e os testes do simulador.
