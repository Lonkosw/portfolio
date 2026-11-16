# Barbearia SaaS: prévia de site para qualquer barbearia

Um esqueleto único (Astro, páginas estáticas, sem backend) que gera o site de uma barbearia a partir de **um arquivo JSON + uma pasta de fotos**. Hoje traz quatro exemplos prontos, cada um com um visual diferente, para você copiar:

| Exemplo | Tema | O que mostra | Arquivo |
|---|---|---|---|
| Palhares | `ouro` (padrão, preto e dourado) | tabela de preços, combos mensais, galeria, avaliações, agendamento | `src/data/palhares.json` |
| Mustache Fratello | `vintage` (creme e preto) | equipe com foto, agendamento "barbeiro primeiro", hero em vídeo | `src/data/mustache.json` |
| Paparazzi | `moderno` (claro com cobre) | sem equipe, telefone fixo, serviços "a definir" | `src/data/paparazzi.json` |
| Saint Patricks | `verde` (verde e dourado) | duas unidades, planos de assinatura, hero em vídeo | `src/data/saintpatricks.json` |

Cada arquivo em `src/data/` vira uma página em `/<slug>/`. O agendamento monta uma mensagem pronta e envia pelo WhatsApp da barbearia (não há agenda nem servidor).

## Rodar

```bash
npm install
npm run dev        # http://localhost:4321/palhares/
npm run build      # gera dist/
```

Requer Node 22.12 ou mais novo.

## Criar o site de uma barbearia nova

Passo a passo completo em **[GUIA.md](./GUIA.md)**. Resumo:

1. Copie o JSON mais parecido com a barbearia (`src/data/<exemplo>.json`) para `src/data/<novo-slug>.json` e troque os dados.
2. Coloque as fotos em `public/img/<novo-slug>/` (WebP, ~70) e, se houver, o vídeo em `public/video/`.
3. `npm run build` e confira em `/<novo-slug>/`.
4. Publique (Cloudflare Pages) e mande o link.

Também há uma skill para o Claude Code que faz tudo isso delegando a um agente: `.claude/skills/criar-site-barbearia/SKILL.md`.

## Regra de ouro

**Não invente dados.** Preço, horário, WhatsApp, equipe, nota e avaliações só entram se vierem do material da barbearia. O que faltar vai em `emBreve` e o site mostra o selo "Em breve". Todas as páginas saem com `noindex` (não aparecem no Google).

## Estrutura

```
src/data/<slug>.json        dados de cada barbearia (um arquivo = uma página)
src/pages/[slug].astro      o esqueleto (HTML de todas as seções)
src/scripts/barbearia.ts    comportamento: agendamento, vídeo, equipe, revelar ao rolar
src/styles/barbearia.css    estilos base + tema ouro
src/styles/<tema>.css       vintage, moderno, verde (um por tema)
public/img/<slug>/          fotos e logo da barbearia
public/video/               vídeos do hero (opcional)
public/_headers             noindex
```
