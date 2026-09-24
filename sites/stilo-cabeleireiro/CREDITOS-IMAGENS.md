# Créditos e uso das imagens

## As 28 fotos são de BANCO, não do Stilo

Todas as imagens em `src/assets/images/` vieram do **Pexels**. Nenhuma é do
salão, nenhuma é minha, nenhuma foi gerada por IA.

```bash
python scripts/baixar-fotos.py      # baixa o pool para .fotos-banco/
python scripts/processar-fotos.py   # recorta para src/assets/images/
```

O `MAPA` em `processar-fotos.py` é a fonte da verdade: cada linha traz o id do
Pexels, o nome final, a proporção do slot e o viés de recorte. `.fotos-banco/`
não vai para o Git.

### Licença

Pexels: uso comercial permitido, sem atribuição obrigatória, modificação
permitida. As duas proibições que importam aqui:

1. **Não sugerir que a pessoa retratada endossa algo.** É por isso que o site
   avisa, na faixa do topo, que as fotos não são trabalhos do salão.
2. **Não revender a foto sem alteração.** Não é o caso — elas são recortadas e
   usadas como parte de um site.

### O que o site afirma sobre elas

| Onde | O que diz |
| :--- | :--- |
| Faixa do topo | "As fotos são de banco de imagens, não são trabalhos do salão" |
| Seção antes/depois | Selo próprio: "cada lado é uma pessoa diferente" |
| `alt` de cada imagem | Descreve o que a foto MOSTRA, sem dizer que é o Stilo |

Os dois primeiros somem quando `site.demo` virar `false` — o que só deve
acontecer quando as fotos reais entrarem. **Virar `demo: false` com foto de
banco no ar transformaria um protótipo honesto num site que mente.**

## O antes/depois mudou de promessa

A versão original dizia "duas fotos da **mesma cliente**, no **mesmo dia**".
Banco de imagens não tem par real — não existe o mesmo rosto fotografado antes
e depois de um trabalho.

O que a seção afirma agora é **processo → resultado**, com pessoas diferentes,
e diz isso na tela. São 3 pares, não 4: preferi três coerentes a quatro
forçados.

## Quando as fotos do Stilo chegarem

O acervo virá do Instagram público deles
([@stilocabeleireirosoficial](https://www.instagram.com/stilocabeleireirosoficial)),
554 posts.

1. Troque as imagens em `src/assets/images/` mantendo os nomes.
2. **Reescreva o carrossel `tiposCabelo` olhando cada foto.** A regra é que o
   nome descreve a foto, nunca o serviço que se gostaria de vender. Foi por
   isso que a lista atual não tem "loiro platinado" nem "corte butterfly":
   nenhuma foto do pool mostrava isso.
3. **Volte a regra do antes/depois:** par = mesma cliente, mesmo trabalho,
   mesmo enquadramento (4:5, 1080x1350). Aí o selo de aviso sai.
4. Tire o aviso de banco da faixa do topo.

### O ponto sensível: rosto de cliente

Boa parte das fotos que este site usa tem rosto. Quando forem as reais, isso
passa a ser delicado: o salão publicou aquelas imagens no perfil dele, o que
indica autorização da cliente **para aquele canal** — e isso não se estende
automaticamente a um site público e indexável.

- Prefira **cabelo de costas** ou detalhe sempre que servir igual.
- Onde o rosto for essencial (noivas), use com `noindex` e, se o Stilo
  contratar, **peça a confirmação de que as clientes autorizam**.
- Se alguma cliente pedir remoção, remova na hora e sem discussão.

### Print de tela não serve

Foto tirada da tela do Instagram sai em baixa resolução e com a interface por
cima. O que serve é o arquivo salvo/original.

## Não aceitável

- Deixar o demo indexável, competindo no Google com o Instagram deles pelo nome
  do próprio salão. Por isso `site.demo === true` liga o `noindex`.
- Reaproveitar foto deste site em protótipo de **outro** cliente — e vice-versa.
  Nenhuma foto do Studio Priorize entrou aqui; são clientes de outro salão.
- Enviar imagens de clientes reais a serviços de terceiros: geradores de
  imagem/vídeo, upscalers, bancos de treino.
- Reproduzir o logo ou o monograma deles. O site usa só o nome em tipografia.

## Ferramentas

| Script | Para quê |
| :--- | :--- |
| `scripts/baixar-fotos.py` | Baixa do Pexels só o que falta |
| `scripts/processar-fotos.py` | Recorta para os slots, com viés por foto |
| `scripts/gerar-placeholders.py` | Volta a preencher buracos com magenta, se faltar alguma |
| `../../tools/folha-contato.py` | Folha de contato do lote sobre fundo magenta |
