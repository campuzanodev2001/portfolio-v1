/** Everything here is true. No dates, counts or quotes that didn't happen. */

export const EMAIL = "danicampu56@gmail.com";
export const GITHUB = "https://github.com/TioDanx";
export const LINKEDIN = "https://www.linkedin.com/in/daniel-campuzano-7149552b7";

/**
 * Each project is set in its own instance of Roboto Flex, like the styles of
 * a family in a type specimen. `sk` is a fake slant (skewX), not the slnt axis.
 */
export type Project = {
  slug: string;
  name: string;
  kind: string;
  desc: string;
  stack: string[];
  image?: { src: string; w: number; h: number };
  live?: string;
  repo?: string;
  wip?: boolean;
  w: number;
  d: number;
  sk?: number;
  style: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "nz",
    name: "NZ Automotores",
    kind: "Concesionaria",
    desc: "El sitio de una concesionaria de usados de Mar del Plata. Una landing pensada para vender, un catálogo con búsqueda y filtros por categoría, precio y kilometraje, y un botón de WhatsApp en cada auto con el mensaje ya escrito. El stock lo carga el dueño desde un panel, sin tocar código.",
    stack: ["Next.js 16", "TypeScript", "Tailwind", "Firebase", "Cloudinary"],
    image: { src: "/nz.png", w: 1897, h: 938 },
    live: "https://nzautomotores.vercel.app/",
    w: 1000,
    d: 151,
    style: "Black Extended",
  },
  {
    slug: "tailor",
    name: "Tailor AI",
    kind: "SaaS",
    desc: "Subís tu CV, pegás la búsqueda laboral y Gemini compara los dos: marca lo que falta, sugiere palabras clave, arma una versión pensada para pasar los filtros ATS y te devuelve un puntaje. Tiene historial por usuario y se paga con créditos de Stripe.",
    stack: ["Next.js 16", "Gemini API", "Firebase", "Stripe", "Puppeteer"],
    image: { src: "/tailorai.png", w: 1919, h: 1079 },
    live: "https://tailor-ai-pi.vercel.app",
    repo: "https://github.com/TioDanx/tailor-ai",
    w: 160,
    d: 25,
    style: "Thin Compressed",
  },
  {
    slug: "moreno",
    name: "Moreno Herramientas",
    kind: "E-commerce a medida",
    desc: "Una tienda hecha desde cero para una ferretería argentina con más de 14.000 productos. Panel de administración propio, pagos con MercadoPago, envíos por Andreani y Correo Argentino, e integración con Eleventa, el sistema de gestión que ya usan. Nada de plataformas de terceros: el código es del cliente.",
    stack: ["Next.js 15", "TypeScript", "Tailwind v4", "Supabase", "Drizzle ORM", "MercadoPago"],
    wip: true,
    w: 860,
    d: 100,
    style: "Heavy, la del título",
  },
  {
    slug: "planes",
    name: "Nuestros Planes",
    kind: "PWA privada",
    desc: "Una app para dos: un lugar donde una pareja organiza sus planes. Cada plan pasa de pendiente a confirmado a hecho, con mapa, cuenta regresiva, fotos y estrellitas. Se sincroniza en tiempo real, manda notificaciones push, exporta al calendario y se instala en el celu.",
    stack: ["Next.js 16", "React 19", "Firebase", "Framer Motion", "Cloudinary"],
    image: { src: "/nuestrosplanes.png", w: 1919, h: 1079 },
    live: "https://franteamomuchomucho.vercel.app/",
    repo: "https://github.com/TioDanx/franteamomuchomucho",
    w: 300,
    d: 151,
    style: "Light Extended",
  },
  {
    slug: "tom",
    name: "Tom Martorello",
    kind: "Portfolio",
    desc: "Portfolio y contrataciones de un DJ de Mar del Plata: hero animado, galería de fotos, carrusel de lugares donde tocó y sets de SoundCloud y YouTube adentro. GSAP y Framer Motion para que tenga la energía de una fecha en vivo.",
    stack: ["Next.js", "TypeScript", "Tailwind v4", "Framer Motion", "GSAP"],
    image: { src: "/tom.png", w: 1902, h: 945 },
    live: "https://portfolio-tom-phi.vercel.app/",
    repo: "https://github.com/campuzanodev2001/portfolio-tom",
    w: 900,
    d: 60,
    sk: -11,
    style: "Black Condensed, inclinada",
  },
  {
    slug: "thebox",
    name: "The Box",
    kind: "Tienda Tiendanube",
    desc: "La tienda online de una marca de calzado y accesorios de mujer de Mar del Plata. Tiendanube con MercadoPago, mobile-first y con la estética de la marca de punta a punta.",
    stack: ["Tiendanube", "Liquid", "MercadoPago", "CSS"],
    image: { src: "/thebox.png", w: 1903, h: 943 },
    live: "https://theboxmdp.com.ar/",
    w: 700,
    d: 25,
    style: "Bold Compressed",
  },
  {
    slug: "portal",
    name: "Portal Store",
    kind: "Tienda gamer",
    desc: "La tienda del primer espacio de cultura gamer y tecnología de Mar del Plata. Catálogo de muchas categorías, con marcas como ASUS, armado en Rubicom para bancarse un inventario grande.",
    stack: ["Rubicom", "CSS"],
    image: { src: "/portal.png", w: 1917, h: 939 },
    live: "https://portalstore.com.ar/",
    w: 420,
    d: 120,
    style: "Regular Wide",
  },
];

export type Post = { title: string; status: string; excerpt: string };

/** Daniel has no posts yet. These are drafts, and they say so. */
export const POSTS: Post[] = [
  {
    title: "Este portfolio lo armé a puro prompt",
    status: "En prensa",
    excerpt:
      "Varios prototipos y una sola regla: no escribir el código a mano. Cómo es diseñar dándole instrucciones a agentes de IA, qué sale bien de entrada, qué hay que corregir y dónde todavía hace falta el ojo de uno.",
  },
  {
    title: "14.000 productos con la IA en el loop",
    status: "Borrador",
    excerpt:
      "Moreno Herramientas es un e-commerce a medida para una ferretería: catálogo enorme, panel propio, MercadoPago, Andreani, Correo Argentino y Eleventa. Qué le delegué a la IA, qué no, y por qué.",
  },
  {
    title: "Tailor AI: Gemini contra la descripción del puesto",
    status: "Próximamente",
    excerpt:
      "Cómo funciona por dentro un SaaS que lee tu CV y una búsqueda laboral, marca lo que falta y te devuelve una versión pensada para pasar los filtros ATS. Con los créditos de Stripe incluidos.",
  },
];

export const STACK = [
  { t: "React", w: 900, d: 151 },
  { t: "Next.js", w: 300, d: 25 },
  { t: "TypeScript", w: 700, d: 60 },
  { t: "Tailwind", w: 1000, d: 100 },
  { t: "Framer Motion", w: 200, d: 151 },
  { t: "Firebase", w: 800, d: 25 },
  { t: "Supabase", w: 500, d: 120 },
];
