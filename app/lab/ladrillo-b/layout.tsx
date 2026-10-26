import type { Metadata, Viewport } from "next";
import { mono, serif } from "./_components/fonts";
import "./ladrillo.css";

export const metadata: Metadata = {
  title: "Que entre — Daniel Campuzano (lab)",
  description:
    "Prototipo: Daniel Campuzano, frontend engineer en Buenos Aires. Cajas que no ceden y letras que siempre encuentran la forma de entrar.",
};

export const viewport: Viewport = {
  themeColor: "#F4F1EA",
};

export default function LadrilloBLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${serif.variable} ${mono.variable}`}>{children}</div>;
}
