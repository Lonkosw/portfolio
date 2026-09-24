/**
 * Ponto de entrada.
 *
 * Tudo aqui é leve e sem dependência: o site inteiro roda com poucos KB de
 * JavaScript. Não há GSAP, ScrollTrigger nem Lenis — a coreografia vive no
 * CSS, que a executa no compositor sem baixar nada.
 *
 * Este site não tem montador nem formulário: todo caminho para a conversa é
 * um <a href="https://wa.me/..."> escrito no build. O script cuida do
 * cabeçalho, do menu, das entradas e do comparador antes/depois.
 *
 * O comparador é o único acréscimo sobre a base, e mesmo ele quase não é
 * código: o gesto vem de um `<input type="range">` nativo, e o script só
 * copia o valor para uma custom property. Ver `comparador.ts`.
 */
import { setupBase } from './base';
import { setupComparadores } from './comparador';

setupBase();
setupComparadores();
