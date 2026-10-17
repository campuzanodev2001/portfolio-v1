import type { Metadata } from "next";
import { Bricolage_Grotesque, Courier_Prime } from "next/font/google";
import "./fanzine.css";

// Display + text: a variable grotesk with real width and optical-size axes.
// Condensed (wdth 75) and big (opsz 96) it gets the gritty, ink-trapped
// poster feel of a photocopied zine headline.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  display: "swap",
  variable: "--fz-display",
});

// Typewriter voice for marginalia (masthead, colophon, captions).
const mono = Courier_Prime({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--fz-mono",
});

export const metadata: Metadata = {
  title: "Fanzine — Daniel Campuzano (lab)",
  description:
    "Prototipo: la portada de Daniel Campuzano impresa como un fanzine en risografía.",
};

export default function FanzineLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${display.variable} ${mono.variable}`}>{children}</div>;
}
