import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./penrose.css";

// Display: Space Grotesk variable (un archivo). Geométrica, con aristas: rima
// con los bloques isométricos sin caer en "fuente de videojuego".
const display = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--pz-display",
});

// Etiquetas técnicas (canvas y UI chica).
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--pz-mono",
});

export const metadata: Metadata = {
  title: "Penrose — Daniel Campuzano (lab)",
  description: "Prototipo de hero: una escalera de Penrose que sube para siempre.",
};

export default function PenroseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${display.variable} ${mono.variable}`}>{children}</div>;
}
