import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./clawd.css";
import "./_components/about.css";
import "./_components/projects.css";

// Display + texto: Space Grotesk variable (un archivo). Geométrica, técnica,
// con carácter en la "a" y la "g" sin volverse caprichosa.
const sans = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--cl-sans",
});

// La terminal: el prompt de Daniel y las etiquetas.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--cl-mono",
});

export const metadata: Metadata = {
  title: "Clawd — Daniel Campuzano (lab)",
  description:
    "Prototipo de hero: Daniel Campuzano, Fullstack Developer. Clawd, su par de IA, arma la portada en loop.",
};

export default function ClawdLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${sans.variable} ${mono.variable}`}>{children}</div>;
}
