import type { Metadata } from "next";
import { Fraunces, Grenze_Gotisch } from "next/font/google";

/*
 * Dos familias, nada más:
 *  - Fraunces (400 para leer, 900 para el apellido): romana "old style"
 *    blanda, con la panza de las letras de cartel del 1900. Pesos estáticos,
 *    sin ejes extra, para que pese poco.
 *  - Grenze Gotisch (600): la gótica de las frases de colectivo, pero legible.
 *    Solo para el nombre de pila, la firma y las frases.
 */
const romana = Fraunces({
  subsets: ["latin"],
  weight: ["400", "900"],
  display: "swap",
  variable: "--fil-serif",
});

const gotica = Grenze_Gotisch({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  variable: "--fil-gotica",
});

export const metadata: Metadata = {
  title: "Daniel Campuzano — Fileteado",
  description:
    "Daniel Campuzano, frontend engineer en Buenos Aires. React, Next.js y TypeScript, pintado a la manera del filete porteño.",
};

export default function FileteadoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${romana.variable} ${gotica.variable}`}>{children}</div>;
}
