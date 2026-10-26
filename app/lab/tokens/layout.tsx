import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./tokens.css";

// Geist (variable) para el nombre y el texto; Geist Mono para etiquetas y
// para el atlas del canvas (el motor lee --tk-mono y re-rasteriza al cargar).
const sans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--tk-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--tk-mono",
});

export const metadata: Metadata = {
  title: "Tokens — Daniel Campuzano (lab)",
  description:
    "Prototipo de hero: un prompt se convierte en tokens, en interfaz y en código, en bucle. Daniel Campuzano, Fullstack Developer en Barcelona.",
};

export default function TokensLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${sans.variable} ${mono.variable}`}>{children}</div>;
}
