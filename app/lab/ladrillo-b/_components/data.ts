/*
 * Contenido real (sólo hechos que Daniel dio: el sitio viejo, el data.ts de
 * specimen-obra y lo que contó de sí mismo). Nada inventado: sin métricas,
 * sin clientes de más, sin testimonios.
 */

export type Project = {
  name: string;
  /** Texto corto para la barra de la ventana. */
  host: string;
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
    host: "nzautomotores.vercel.app",
    img: { src: "/nz.png", w: 1897, h: 938 },
    alt: "Captura del sitio de NZ Automotores: catálogo de autos usados.",
    text:
      "El sitio de una agencia de autos usados de Mar del Plata. Catálogo con búsqueda y filtros por categoría, precio y kilometraje; cada auto tiene su botón de WhatsApp con el mensaje ya armado. Y un panel para que carguen el stock sin tocar una línea de código.",
    stack: ["Next.js", "TypeScript", "Tailwind", "Firebase", "Cloudinary"],
    live: "https://nzautomotores.vercel.app/",
  },
  {
    name: "The Box",
    host: "theboxmdp.com.ar",
    img: { src: "/thebox.png", w: 1903, h: 943 },
    alt: "Captura de la tienda online de The Box: calzado y accesorios.",
    text:
      "Tienda online de una marca de calzado y accesorios de mujer, también de Mar del Plata. Montada sobre Tiendanube, con MercadoPago y pensada primero para el celular, al tono de la marca.",
    stack: ["Tiendanube", "Liquid", "MercadoPago", "CSS"],
    live: "https://theboxmdp.com.ar/",
  },
  {
    name: "Portal Store",
    host: "portalstore.com.ar",
    img: { src: "/portal.png", w: 1917, h: 939 },
    alt: "Captura de Portal Store: tienda de gaming y tecnología.",
    text:
      "La tienda del primer polo gamer y tech de Mar del Plata. Catálogo de muchas categorías, con marcas como ASUS, hecho sobre Rubicom con un layout que aguanta inventarios grandes.",
    stack: ["Rubicom", "CSS"],
    live: "https://portalstore.com.ar/",
  },
  {
    name: "Tom Martorello",
    host: "portfolio-tom-phi.vercel.app",
    img: { src: "/tom.png", w: 1902, h: 945 },
    alt: "Captura del portfolio de Tom Martorello, DJ.",
    text:
      "Portfolio y contrataciones para un DJ de Mar del Plata: hero animado, galería de fotos, carrusel de lugares donde toca y sets de SoundCloud y YouTube. GSAP y Framer Motion para que tenga la energía de una fecha en vivo.",
    stack: ["Next.js", "TypeScript", "Tailwind", "Framer Motion", "GSAP"],
    live: "https://portfolio-tom-phi.vercel.app/",
    repo: "https://github.com/campuzanodev2001/portfolio-tom",
  },
  {
    name: "Tailor AI",
    host: "tailor-ai-pi.vercel.app",
    img: { src: "/tailorai.png", w: 1919, h: 1079 },
    alt: "Captura de Tailor AI: análisis de un CV contra una búsqueda laboral.",
    text:
      "Una SaaS que te adapta el CV a cada búsqueda. Subís el CV, pegás la descripción del puesto y Gemini compara las dos cosas: te marca lo que falta, arma una versión pensada para los filtros ATS y te da un puntaje. Historial por usuario y créditos con Stripe.",
    stack: ["Next.js", "Gemini", "Firebase", "Stripe", "Puppeteer"],
    live: "https://tailor-ai-pi.vercel.app",
    repo: "https://github.com/TioDanx/tailor-ai",
  },
  {
    name: "Nuestros Planes",
    host: "PWA privada",
    img: { src: "/nuestrosplanes.png", w: 1919, h: 1079 },
    alt: "Captura de Nuestros Planes: planificador de planes en pareja.",
    text:
      "Una PWA privada, hecha para dos: un lugar para organizar planes en pareja. Cada plan pasa de pendiente a confirmado a hecho, con mapa, cuenta regresiva, fotos y reseña con estrellas. Sincroniza en tiempo real, manda notificaciones y se instala en el celu.",
    stack: ["Next.js", "React 19", "Firebase", "Framer Motion", "Cloudinary"],
    repo: "https://github.com/TioDanx/franteamomuchomucho",
  },
  {
    name: "Moreno Herramientas",
    host: "en obra",
    text:
      "E-commerce a medida para una ferretería argentina con más de 14.000 productos. Panel de administración propio, pagos con MercadoPago, envíos por Andreani y Correo Argentino, e integración con Eleventa, el sistema de gestión que ya usan. Nada de plataformas de terceros: el código es del cliente.",
    stack: ["Next.js", "TypeScript", "Tailwind", "Supabase", "Drizzle ORM", "MercadoPago"],
    wip: true,
  },
];

/** Lo que dijo él: le gusta "de todo un poco". Cada cosa es un ladrillo. */
export const INTERESTS = [
  "vóley",
  "programar",
  "enseñar",
  "naturaleza",
  "música",
  "juegos",
  "tecnología",
  "amigos",
];

/** Stack del sitio viejo + lo que aparece en los proyectos. */
export const STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind",
  "Firebase",
  "Supabase",
  "Stripe",
  "Gemini",
  "GSAP",
  "Framer Motion",
  "Vercel",
  "Cloudinary",
  "MercadoPago",
  "Claude Code",
];

export const EMAIL = "danicampu56@gmail.com";
export const GITHUB = "https://github.com/TioDanx";
export const LINKEDIN = "https://www.linkedin.com/in/daniel-campuzano-7149552b7";
