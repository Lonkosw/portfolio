/**
 * Ponto de entrada.
 *
 * Tudo aqui é leve e sem dependência: o site inteiro roda com poucos KB de
 * JavaScript. Não há GSAP, ScrollTrigger nem Lenis — a coreografia vive no
 * CSS, que a executa no compositor sem baixar nada.
 *
 * Este site não tem montador nem formulário: todo caminho para a conversa é
 * um <a href="https://wa.me/..."> escrito no build. O script só cuida do
 * cabeçalho, do menu e das entradas.
 */
import { setupBase } from './base';

setupBase();
