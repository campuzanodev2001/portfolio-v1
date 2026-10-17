/* Todo lo que se muestra es verdad. Si algo no se puede verificar, no va. */

export const BOOT_KEY = "lab-pull-request-booted";
export const FILE = "hero.tsx";
export const BRANCH = "main...claude/hero";

export const NAME = { first: "Daniel", last: "Campuzano" };

export const STATEMENT =
  "Frontend engineer. Hace más de 5 años que escribo interfaces con React y Next.js; últimamente, a cuatro manos con Claude.";

export const LINKS = [
  { label: "GitHub", href: "https://github.com/TioDanx" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/daniel-campuzano-7149552b7" },
  { label: "Mail", href: "mailto:danicampu56@gmail.com" },
] as const;

/* Las dos líneas que el diff borra son citas textuales del portfolio viejo
   (components/HeroSection.tsx y components/BioSection.tsx). */
export const REMOVED = ["LOCAL_TIME: 04:21:00_PST", "SYSTEM_ONLINE"] as const;

export type RowKey = "name" | "statement" | "place" | "coauthor" | "links" | "review";

export type Author = "Daniel" | "Claude" | "Los dos";

export const ROWS: {
  key: RowKey;
  label: string;
  blame: { who: Author; note: string };
}[] = [
  { key: "name", label: "nombre", blame: { who: "Daniel", note: "en rigor, lo eligieron sus viejos" } },
  { key: "statement", label: "qué hace", blame: { who: "Claude", note: "redactó Claude con los datos que pasó Daniel" } },
  { key: "place", label: "dónde", blame: { who: "Los dos", note: "Daniel vive ahí; el reloj lo escribió Claude" } },
  { key: "coauthor", label: "co-autor", blame: { who: "Claude", note: "se anotó solo, pero es cierto" } },
  { key: "links", label: "links", blame: { who: "Daniel", note: "sus cuentas, sus links" } },
  { key: "review", label: "review", blame: { who: "Los dos", note: "la idea está en el brief de Daniel; el código, de Claude" } },
];

export const BLAME_SUMMARY =
  "Claude tipeó todo el código de esta página. Daniel puso el brief, los datos y el criterio de qué se queda y qué no.";

export type HeroStyle = "pliego" | "cartel" | "nocturno" | "indice";

export const STYLES: { id: HeroStyle; name: string; message: string }[] = [
  { id: "pliego", name: "pliego", message: "¿Lo aceptás?" },
  { id: "cartel", name: "cartel", message: "Rechazado. Probemos más fuerte." },
  { id: "nocturno", name: "nocturno", message: "Rechazado otra vez. Bajemos las luces." },
  { id: "indice", name: "índice", message: "Ok: solo los datos, sin show." },
];

export const BACK_TO_FIRST = "Volvimos al primero. Pasa más seguido de lo que creés.";
export const MERGED = "Mergeado en main. Gracias por el review.";

export const PROJECTS: { name: string; what: string; stack?: string; wip?: boolean }[] = [
  { name: "NZ Automotores", what: "sitio para una concesionaria", stack: "Next.js · Firebase · Cloudinary" },
  { name: "The Box", what: "e-commerce sobre Tiendanube" },
  { name: "Portal Store", what: "e-commerce" },
  { name: "Tom Martorello", what: "portfolio", stack: "GSAP · Framer Motion" },
  { name: "Tailor AI", what: "SaaS que optimiza CVs con IA", stack: "Gemini · Stripe" },
  { name: "Nuestros Planes", what: "PWA para planear en pareja" },
  { name: "Moreno Herramientas", what: "e-commerce a medida, +14.000 productos", stack: "Supabase · Drizzle · MercadoPago", wip: true },
];
