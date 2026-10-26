import { JetBrains_Mono, Roboto_Serif } from "next/font/google";

// La voz que se aprieta: Roboto Serif variable. wght 100–900 viene siempre;
// sumamos wdth (50–150, el eje que la caja aprieta) y GRAD (-50–100: engorda
// el trazo sin cambiar el ancho, así el "sello" no rompe el ajuste).
// Sin opsz a propósito: la óptica de texto chico a tamaño gigante queda
// petisa y robusta, como un ladrillo.
export const serif = Roboto_Serif({
  subsets: ["latin"],
  axes: ["wdth", "GRAD"],
  display: "swap",
  variable: "--la-serif",
});

// La voz de obra: etiquetas, stickers, botones.
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--la-mono",
});
