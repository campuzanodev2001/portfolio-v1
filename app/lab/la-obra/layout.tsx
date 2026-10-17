import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Jersey_10 } from "next/font/google";

// Pixel para carteles y rótulos; Atkinson (hecha para leerse sí o sí) para todo lo demás.
const jersey = Jersey_10({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jersey",
});

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: "La Obra — Daniel Campuzano",
  description:
    "Daniel Campuzano, frontend engineer en Buenos Aires. React, Next.js y TypeScript. Prototipo 02 del lab.",
};

export default function LaObraLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${jersey.variable} ${atkinson.variable}`}>{children}</div>;
}
