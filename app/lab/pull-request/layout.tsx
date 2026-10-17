import type { Metadata } from "next";
import { Fraunces, Martian_Mono } from "next/font/google";
import "./pull-request.css";

/* Dos familias, ambas variables y sólo latin.
   Fraunces: opsz (automático por tamaño) + SOFT (estilo "nocturno").
   Martian Mono: wdth (condensada para código, expandida para "cartel"). */
const display = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
  variable: "--pr-display",
});

const mono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--pr-mono",
});

export const metadata: Metadata = {
  title: "Pull Request — Daniel Campuzano",
  description: "Prototipo 03: el portfolio como un diff entre Daniel y Claude.",
};

export default function PullRequestLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${mono.variable}`}>{children}</div>;
}
