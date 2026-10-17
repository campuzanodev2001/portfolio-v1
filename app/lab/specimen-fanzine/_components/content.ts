/**
 * Everything the page says. Only facts Daniel gave us — no invented dates,
 * counts or clients. Copy in rioplatense Spanish (voseo).
 */

export { EMAIL, GITHUB, LINKEDIN } from "./constants";

/**
 * Loader paths. Both plates print DANIEL_, but each letter travels to a
 * different extreme of the design space on each drum (wght / wdth / fake
 * slant). The plates only agree — come into register — at the end.
 */
export const LETTERS = [
  { c: "D", b: [1000, 151, 0], p: [100, 25, 0] },
  { c: "A", b: [100, 151, -12], p: [1000, 25, 0] },
  { c: "N", b: [1000, 25, 0], p: [100, 151, -12] },
  { c: "I", b: [1000, 151, -12], p: [100, 40, 0] },
  { c: "E", b: [100, 90, -12], p: [1000, 151, 0] },
  { c: "L", b: [1000, 25, 0], p: [100, 151, -12] },
] as const;

export type Project = {
  n: string;
  name: string;
  kind: string;
  /** The font instance this project is set in, like a style in a specimen. */
  style: string;
  w: number;
  d: number;
  desc: string;
  stack: string[];
  live?: string;
  repo?: string;
  img?: { src: string; w: number; h: number };
  wip?: boolean;
};

export const PROJECTS: Project[] = [
  {
    n: "01",
    name: "Tailor AI",
    kind: "SaaS · IA",
    style: "Thin Extended",
    w: 120,
    d: 151,
    desc:
      "Subís tu CV, pegás la búsqueda y Gemini compara las dos cosas: te marca qué falta, qué palabras clave no aparecen y te devuelve una versión pensada para pasar los filtros ATS, con su puntaje. Historial por usuario y créditos que se pagan con Stripe.",
    stack: ["Next.js 16", "Gemini API", "Firebase", "Stripe", "Puppeteer"],
    live: "https://tailor-ai-pi.vercel.app",
    repo: "https://github.com/TioDanx/tailor-ai",
    img: { src: "/tailorai.png", w: 1919, h: 1079 },
  },
  {
    n: "02",
    name: "Moreno Herramientas",
    kind: "E-commerce a medida · en obra",
    style: "Black Compressed",
    w: 960,
    d: 32,
    desc:
      "Un e-commerce hecho desde cero para una ferretería argentina con más de 14.000 productos. Nada de Tiendanube ni Shopify: el código es del cliente y el dueño maneja todo desde un panel propio. MercadoPago, envíos con Andreani y Correo Argentino, e integración con Eleventa, el sistema de gestión que ya usan.",
    stack: ["Next.js 15", "TypeScript", "Tailwind v4", "Supabase", "Drizzle ORM", "MercadoPago"],
    wip: true,
  },
  {
    n: "03",
    name: "NZ Automotores",
    kind: "Sitio + catálogo",
    style: "Black Extended",
    w: 1000,
    d: 120,
    desc:
      "El sitio de una agencia de autos usados de Mar del Plata. Una landing pensada para convertir, un catálogo con búsqueda y filtros por categoría, precio y kilometraje, y un botón de WhatsApp por auto con el mensaje ya escrito. El stock se carga desde un panel, sin tocar código.",
    stack: ["Next.js 16", "TypeScript", "Tailwind", "Firebase", "Cloudinary"],
    live: "https://nzautomotores.vercel.app/",
    img: { src: "/nz.png", w: 1897, h: 938 },
  },
  {
    n: "04",
    name: "Nuestros Planes",
    kind: "PWA privada",
    style: "Light",
    w: 300,
    d: 100,
    desc:
      "Una PWA hecha para dos personas: un lugar para organizar planes en pareja. Cada plan pasa de pendiente a confirmado a hecho, con mapa, cuenta regresiva, fotos y reseña con estrellas. Sincroniza en tiempo real, manda notificaciones push, exporta a calendario y se instala en el celu.",
    stack: ["Next.js 16", "React 19", "Firebase", "Framer Motion", "Cloudinary"],
    repo: "https://github.com/TioDanx/franteamomuchomucho",
    img: { src: "/nuestrosplanes.png", w: 1919, h: 1079 },
  },
  {
    n: "05",
    name: "Tom Martorello",
    kind: "Portfolio · DJ",
    style: "ExtraBold Condensed",
    w: 820,
    d: 60,
    desc:
      "Portfolio y booking para un DJ de Mar del Plata: hero animado, galería de fotos, carrusel de los lugares donde tocó y sets embebidos de SoundCloud y YouTube. GSAP y Framer Motion para que tenga algo de la energía de una fecha en vivo.",
    stack: ["Next.js", "TypeScript", "Tailwind v4", "Framer Motion", "GSAP"],
    live: "https://portfolio-tom-phi.vercel.app/",
    repo: "https://github.com/campuzanodev2001/portfolio-tom",
    img: { src: "/tom.png", w: 1902, h: 945 },
  },
  {
    n: "06",
    name: "The Box",
    kind: "Tiendanube",
    style: "Medium Wide",
    w: 560,
    d: 125,
    desc:
      "La tienda online de una marca de calzado y accesorios de mujer de Mar del Plata. Sobre Tiendanube, con MercadoPago y una experiencia de compra pensada primero para el celular y para la estética de la marca.",
    stack: ["Tiendanube", "Liquid", "MercadoPago", "CSS"],
    live: "https://theboxmdp.com.ar/",
    img: { src: "/thebox.png", w: 1903, h: 943 },
  },
  {
    n: "07",
    name: "Portal Store",
    kind: "E-commerce · Rubicom",
    style: "Regular Narrow",
    w: 420,
    d: 72,
    desc:
      "La tienda del primer espacio de cultura gamer y tecnología de Mar del Plata. Catálogo multicategoría con marcas como ASUS, armado sobre Rubicom con un layout que aguanta inventarios grandes.",
    stack: ["Rubicom", "CSS"],
    live: "https://portalstore.com.ar/",
    img: { src: "/portal.png", w: 1917, h: 939 },
  },
];

/** The stack, set like the list of styles in a type specimen. */
export const STACK = [
  { t: "React", style: "Thin", w: 100, d: 100 },
  { t: "Next.js", style: "Black", w: 1000, d: 100 },
  { t: "TypeScript", style: "SemiBold Condensed", w: 640, d: 40 },
  { t: "Tailwind", style: "Light Extended", w: 280, d: 151 },
  { t: "Framer Motion", style: "Black Compressed", w: 950, d: 25 },
  { t: "Firebase", style: "ExtraLight Wide", w: 200, d: 130 },
  { t: "Supabase", style: "Bold", w: 740, d: 90 },
] as const;

export const DRAFTS = [
  {
    n: "1",
    title: "Este portfolio lo hice a puro prompt",
    excerpt:
      "Quiero contar cómo armé esta página sin escribir el código a mano: dándole instrucciones a agentes de IA, revisando lo que proponían y decidiendo qué se imprimía y qué no. Qué funcionó, qué tuve que pedir de nuevo y dónde está el límite.",
  },
  {
    n: "2",
    title: "14.000 productos con la IA en el loop",
    excerpt:
      "Moreno Herramientas es un e-commerce hecho a medida para una ferretería: catálogo enorme, panel propio, MercadoPago, envíos con Andreani y Correo Argentino, e integración con Eleventa. Cómo lo estoy encarando con IA metida en el día a día.",
  },
  {
    n: "3",
    title: "Tailor AI: Gemini contra tu CV",
    excerpt:
      "Cómo funciona por dentro un SaaS que lee tu CV y una búsqueda laboral, encuentra lo que falta, reescribe el CV para los filtros ATS y le pone un puntaje. Y cómo se cobra por créditos con Stripe.",
  },
] as const;
