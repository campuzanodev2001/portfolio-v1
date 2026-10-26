import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif } from "next/font/google";
import "./trazo.css";

// Display: Instrument Serif (un solo peso, normal + itálica). Editorial y liviana.
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--tz-serif",
});

// Letra fina de los pies de foto y datos.
const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--tz-mono",
});

export const metadata: Metadata = {
  title: "Trazo — Daniel Campuzano (lab)",
  description: "Prototipo de hero: una sola línea que dibuja, en loop, la historia de Daniel Campuzano.",
};

export default function TrazoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${serif.variable} ${mono.variable}`}>{children}</div>;
}
