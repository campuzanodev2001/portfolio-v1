/*
 * Frases fileteadas. El filete porteño siempre lleva su frase en una cinta:
 * bendiciones ("Dios guarde…"), refranes y picardías de camionero.
 * Acá, las mismas fórmulas aplicadas al oficio de Daniel.
 */

const SUELTAS = [
  "Si tomás, no hagas force push",
  "Más vale commit en mano que cien en stash",
  "No me toques bocina, que estoy en producción",
  "Despacito y por las ramas",
  "Decime con qué stack andás y te diré quién sos",
  "En casa de herrero, CSS con !important",
  "A caballo regalado no se le mira el bundle",
  "Mirame y no me toques el main",
  "No hay bug que dure cien años",
  "El que avisa no es traidor: hay breaking changes",
  "Camarón que se duerme, se lo lleva el refactor",
  "La vida es un build: si falla, se vuelve a correr",
  "Que San Cayetano te dé laburo y buen wifi",
  "Mal de muchos, conflicto de merge",
  "Ojos que no ven, warnings que se juntan",
] as const;

const BENDICION = ["Dios guarde", "La Virgen cuide", "San Cayetano proteja"] as const;
const OBJETO = [
  "este deploy",
  "este repo",
  "la rama main",
  "a quien lea este código",
  "mi pull request",
] as const;

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

const PRIMERA = "Dios guarde a este deploy";

export function nextFrase(prev: string | null): string {
  if (prev === null) return PRIMERA;
  for (let i = 0; i < 8; i++) {
    const f = Math.random() < 0.6 ? pick(SUELTAS) : `${pick(BENDICION)} ${pick(OBJETO)}`;
    if (f !== prev) return f;
  }
  return PRIMERA;
}
