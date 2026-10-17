import type { Metadata } from "next";
import { Caveat, IBM_Plex_Mono } from "next/font/google";
import "./cuaderno.css";

// La mano: Caveat variable (un solo archivo, eje wght 400–700). Trazo de
// birome/lápiz rápido, adulto, sin redondeces escolares.
const hand = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--cq-hand",
});

// La regla: IBM Plex Mono, letra de plano técnico. Es también la "letra" de
// Claude en el margen: una máquina escribe en tipografía, no a mano.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--cq-mono",
});

export const metadata: Metadata = {
  title: "Cuaderno — Daniel Campuzano (lab)",
  description:
    "Prototipo: el cuaderno de problemas de Daniel Campuzano, Frontend Engineer en Buenos Aires.",
};

export default function CuadernoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${hand.variable} ${mono.variable}`}>{children}</div>;
}
