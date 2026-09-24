/**
 * Ponto de entrada.
 *
 * Tudo aqui é leve e sem dependência: o site inteiro roda com poucos KB de
 * JavaScript. Não há GSAP, ScrollTrigger nem Lenis — a coreografia vive no
 * CSS, que a executa no compositor sem baixar nada.
 *
 * A ordem importa: interatividade primeiro (as pessoas podem tocar antes de
 * a fonte carregar), animação depois.
 */
import { setupBase } from './base';
import { setupOrcamento } from './orcamento';

// Usar não é animar: o montador continua valendo com prefers-reduced-motion.
setupOrcamento();

setupBase();
