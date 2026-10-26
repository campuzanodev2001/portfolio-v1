import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./despiece.css";

// Geist para el nombre y el texto; Geist Mono para rótulos de plano.
// Ambas variables: un archivo por familia.
const sans = Geist({ subsets: ["latin"], display: "swap", variable: "--dz-sans" });
const mono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--dz-mono" });

export const metadata: Metadata = {
  title: "Despiece — Daniel Campuzano (lab)",
  description: "Prototipo de hero: Daniel Campuzano, Fullstack Developer. Un despiece en loop de cómo funciona una interfaz por dentro.",
};

export default function DespieceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${sans.variable} ${mono.variable}`}>{children}</div>;
}
