import { JetBrains_Mono, Roboto_Serif } from "next/font/google";

// La letra que se rebusca: Roboto Serif variable con los cuatro ejes
// (wght 100–900, wdth 50–150, opsz 8–144, GRAD −50–100). Es el material de
// toda la página, así que es el único archivo pesado; sin itálica.
export const serif = Roboto_Serif({
  subsets: ["latin"],
  axes: ["opsz", "wdth", "GRAD"],
  display: "swap",
  variable: "--lb-serif",
});

// El marco: JetBrains Mono para sellos, etiquetas y botones.
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--lb-mono",
  preload: false,
});
