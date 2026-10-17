import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./maquina.css";

// Name + text: Archivo, a grotesk with a real width axis. Condensed and heavy
// it reads like stencilled lettering on a workshop drawing.
const sans = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--mq-sans",
});

// Patent-drawing annotations (captions, legend, status).
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
  variable: "--mq-mono",
});

export const metadata: Metadata = {
  title: "La Máquina — Daniel Campuzano (lab)",
  description: "Prototipo: una máquina de reacción en cadena para ponerle el punto a la i.",
};

export default function MaquinaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${sans.variable} ${mono.variable}`}>{children}</div>;
}
