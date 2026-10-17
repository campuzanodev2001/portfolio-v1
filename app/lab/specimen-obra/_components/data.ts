/*
 * Contenido real (sólo hechos que Daniel dio). Cada proyecto es una
 * "instancia" de la familia tipográfica, como en un specimen: su nombre se
 * compone con un peso y un ancho fijos, y la cuadrilla lo aprieta hasta ahí
 * a medida que entra en pantalla.
 */

export type Project = {
  name: string;
  instance: string; // nombre de la instancia, estilo specimen
  w: number; // wght 100–1000
  d: number; // wdth 25–151
  img?: { src: string; w: number; h: number };
  alt?: string;
  text: string;
  stack: string[];
  live?: string;
  repo?: string;
  wip?: boolean;
};

export const PROJECTS: Project[] = [
  {
    name: "NZ Automotores",
    instance: "Black Extended",
    w: 1000,
    d: 140,
    img: { src: "/nz.png", w: 1897, h: 938 },
    alt: "Captura del sitio de NZ Automotores: catálogo de autos usados.",
    text:
      "El sitio de una agencia de autos usados de Mar del Plata. Catálogo con búsqueda y filtros por categoría, precio y kilometraje; cada auto tiene su botón de WhatsApp con el mensaje ya armado. Y un panel para que carguen el stock sin tocar una línea de código.",
    stack: ["Next.js 16", "TypeScript", "Tailwind", "Firebase", "Cloudinary"],
    live: "https://nzautomotores.vercel.app/",
  },
  {
    name: "The Box",
    instance: "Heavy Condensed",
    w: 900,
    d: 55,
    img: { src: "/thebox.png", w: 1903, h: 943 },
    alt: "Captura de la tienda online de The Box: calzado y accesorios.",
    text:
      "Tienda online de una marca de calzado y accesorios de mujer, también de Mar del Plata. Montada sobre Tiendanube, con MercadoPago y pensada primero para el celular, al tono de la marca.",
    stack: ["Tiendanube", "Liquid", "MercadoPago", "CSS"],
    live: "https://theboxmdp.com.ar/",
  },
  {
    name: "Portal Store",
    instance: "Medium Wide",
    w: 520,
    d: 128,
    img: { src: "/portal.png", w: 1917, h: 939 },
    alt: "Captura de Portal Store: tienda de gaming y tecnología.",
    text:
      "La tienda del primer polo gamer y tech de Mar del Plata. Catálogo de muchas categorías, con marcas como ASUS, hecho sobre Rubicom con un layout que aguanta inventarios grandes.",
    stack: ["Rubicom", "CSS"],
    live: "https://portalstore.com.ar/",
  },
  {
    name: "Tom Martorello",
    instance: "Thin Extended",
    w: 140,
    d: 151,
    img: { src: "/tom.png", w: 1902, h: 945 },
    alt: "Captura del portfolio de Tom Martorello, DJ.",
    text:
      "Portfolio y contrataciones para un DJ de Mar del Plata: hero animado, galería de fotos, carrusel de lugares donde toca y sets de SoundCloud y YouTube. GSAP y Framer Motion para que tenga la energía de una fecha en vivo.",
    stack: ["Next.js", "TypeScript", "Tailwind v4", "Framer Motion", "GSAP"],
    live: "https://portfolio-tom-phi.vercel.app/",
    repo: "https://github.com/campuzanodev2001/portfolio-tom",
  },
  {
    name: "Tailor AI",
    instance: "Light Compressed",
    w: 300,
    d: 40,
    img: { src: "/tailorai.png", w: 1919, h: 1079 },
    alt: "Captura de Tailor AI: análisis de un CV contra una búsqueda laboral.",
    text:
      "Una SaaS que te adapta el CV a cada búsqueda. Subís el CV, pegás la descripción del puesto y Gemini compara las dos cosas: te marca lo que falta, arma una versión pensada para los filtros ATS y te da un puntaje. Historial por usuario y créditos con Stripe.",
    stack: ["Next.js 16", "Gemini API", "Firebase", "Stripe", "Puppeteer"],
    live: "https://tailor-ai-pi.vercel.app",
    repo: "https://github.com/TioDanx/tailor-ai",
  },
  {
    name: "Nuestros Planes",
    instance: "Book Semi-Wide",
    w: 380,
    d: 112,
    img: { src: "/nuestrosplanes.png", w: 1919, h: 1079 },
    alt: "Captura de Nuestros Planes: planificador de planes en pareja.",
    text:
      "Una PWA privada, hecha para dos: un lugar para organizar planes en pareja. Cada plan pasa de pendiente a confirmado a hecho, con mapa, cuenta regresiva, fotos y reseña con estrellas. Sincroniza en tiempo real, manda notificaciones y se instala en el celu.",
    stack: ["Next.js 16", "React 19", "Firebase", "Framer Motion", "Cloudinary"],
    repo: "https://github.com/TioDanx/franteamomuchomucho",
  },
  {
    name: "Moreno Herramientas",
    instance: "Hairline Compressed",
    w: 100,
    d: 25,
    text:
      "E-commerce a medida para una ferretería argentina con más de 14.000 productos. Panel de administración propio, pagos con MercadoPago, envíos por Andreani y Correo Argentino, e integración con Eleventa, el sistema de gestión que ya usan. Nada de plataformas de terceros: el código es del cliente.",
    stack: ["Next.js 15", "TypeScript", "Tailwind v4", "Supabase", "Drizzle ORM", "MercadoPago"],
    wip: true,
  },
];

export type Post = { title: string; excerpt: string; tag: string };

export const POSTS: Post[] = [
  {
    title: "Este portfolio, a puro prompt",
    tag: "IA · proceso",
    excerpt:
      "Cómo armé este sitio sin escribir el código a mano: prompts, agentes de IA laburando en paralelo sobre el mismo repo y yo de director de obra. Qué salió, qué hubo que tirar y qué aprendí de pedirle diseño a una máquina.",
  },
  {
    title: "14.000 productos con la IA en el loop",
    tag: "E-commerce · Moreno Herramientas",
    excerpt:
      "Un e-commerce a medida para una ferretería: catálogo enorme, panel propio, MercadoPago, Andreani, Correo Argentino y Eleventa. Dónde la IA acelera de verdad y dónde conviene no soltarle el volante.",
  },
  {
    title: "Tailor AI: Gemini contra tu CV",
    tag: "SaaS · Gemini · Stripe",
    excerpt:
      "Una SaaS que lee tu CV y la búsqueda, encuentra lo que falta y te devuelve una versión pensada para los filtros ATS, con puntaje. Cómo la armé y qué cambia cuando un producto con IA adentro cobra por créditos.",
  },
];

export const EMAIL = "danicampu56@gmail.com";
export const GITHUB = "https://github.com/TioDanx";
export const LINKEDIN = "https://www.linkedin.com/in/daniel-campuzano-7149552b7";
