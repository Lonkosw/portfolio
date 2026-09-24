# Créditos e uso das imagens

## Origem

Todas as fotos em `src/assets/images/` vieram do **Instagram público do Studio
Priorize** ([@studiopriorize_cabelos](https://www.instagram.com/studiopriorize_cabelos)).

Nenhuma é minha. Nenhuma é de banco de imagens. Nenhuma foi gerada por IA.

## De quem elas são

Do Studio Priorize — e, em parte, **das próprias clientes que aparecem nelas**.
Este ponto é mais sensível aqui do que nos protótipos anteriores: uma foto de
brigadeiro não tem rosto; uma foto de noiva tem.

O salão publicou essas imagens no perfil dele, o que indica autorização de uso
por parte da cliente **para aquele canal**. Isso não se estende automaticamente
a um site em domínio público e indexável.

**Regra prática para este protótipo:**

- Prefira fotos de **cabelo de costas** ou de detalhe, sem rosto identificável,
  sempre que a foto servir igual.
- Onde o rosto for essencial (noivas), use e mantenha o `noindex` — mas se o
  Studio contratar, **peça a eles a confirmação de que as clientes autorizam o
  uso no site** antes de virar `demo: false`.
- Se alguma cliente pedir a remoção, remova na hora e sem discussão.

## O que é aceitável

**Aceitável:** montar este protótipo e apresentá-lo **ao próprio Studio**, como
proposta comercial. O material é deles, o site é sobre o negócio deles.

**Não aceitável:**

- Deixar o demo indexável, competindo no Google com o Instagram deles pelo nome
  do próprio salão. Por isso `site.demo === true` liga o `noindex`.
- Usar as fotos em portfólio pessoal, anúncio ou vitrine pública sem autorização
  por escrito.
- Reaproveitar qualquer uma destas fotos em protótipo de **outro** cliente.
- Enviar estas imagens a serviços de terceiros — geradores de imagem/vídeo,
  upscalers, bancos de treino. Vale em dobro aqui: são rostos de pessoas reais.
- Reproduzir o logo ou o monograma deles. O site usa só o nome em tipografia, e
  o favicon é uma flor de quatro pétalas desenhada por mim, não o arquivo deles.

## Ao fechar o contrato

1. Peça os **originais em alta** (o que está aqui saiu de print de Instagram).
2. Peça autorização de uso das fotos no site, incluindo as das clientes.
3. Pergunte se querem creditar algum fotógrafo.

Só depois disso vale virar `demo: false`.
