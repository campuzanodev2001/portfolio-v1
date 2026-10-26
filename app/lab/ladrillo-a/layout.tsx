import type { Metadata } from "next";
import { mono, serif } from "./_components/fonts";

export const metadata: Metadata = {
  title: "A presión — Daniel Campuzano (lab)",
  description:
    "Daniel Campuzano, frontend engineer en Buenos Aires. Prototipo: letras variables apretadas adentro de ladrillos neobrutalistas.",
};

export default function LadrilloALayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${serif.variable} ${mono.variable}`}>{children}</div>;
}
