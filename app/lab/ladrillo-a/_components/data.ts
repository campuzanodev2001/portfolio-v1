/*
 * Contenido real (sólo hechos que Daniel dio en el sitio viejo y en el lab).
 * Nada de métricas, clientes ni testimonios inventados.
 */

export type Project = {
  name: string;
  kind: string;
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
    kind: "Agencia de autos · Mar del Plata",
    img: { src: "/nz.png", w: 1897, h: 938 },
    alt: "Captura del sitio de NZ Automotores: catálogo de autos usados.",
    text:
      "El sitio de una agencia de autos usados. Catálogo con búsqueda y filtros por categoría, precio y kilometraje; cada auto con su botón de WhatsApp y el mensaje ya armado. Y un panel para que carguen el stock sin tocar una línea de código.",
    stack: ["Next.js 16", "TypeScript", "Tailwind", "Firebase", "Cloudinary"],
    live: "https://nzautomotores.vercel.app/",
  },
  {
    name: "The Box",
    kind: "Calzado y accesorios · Mar del Plata",
    img: { src: "/thebox.png", w: 1903, h: 943 },
    alt: "Captura de la tienda online de The Box: calzado y accesorios.",
    text:
      "Tienda online de una marca de calzado y accesorios de mujer. Montada sobre Tiendanube, con MercadoPago y pensada primero para el celular, al tono de la marca.",
    stack: ["Tiendanube", "Liquid", "MercadoPago", "CSS"],
    live: "https://theboxmdp.com.ar/",
  },
  {
    name: "Portal Store",
    kind: "Gaming y tecnología · Mar del Plata",
    img: { src: "/portal.png", w: 1917, h: 939 },
    alt: "Captura de Portal Store: tienda de gaming y tecnología.",
    text:
      "La tienda del primer polo gamer y tech de Mar del Plata. Muchas categorías y marcas como ASUS, sobre Rubicom, con un layout que aguanta inventarios grandes.",
    stack: ["Rubicom", "CSS"],
    live: "https://portalstore.com.ar/",
  },
  {
    name: "Tom Martorello",
    kind: "Portfolio de DJ",
    img: { src: "/tom.png", w: 1902, h: 945 },
    alt: "Captura del portfolio de Tom Martorello, DJ.",
    text:
      "Portfolio y contrataciones para un DJ: hero animado, galería, carrusel de lugares donde toca y sets de SoundCloud y YouTube. GSAP y Framer Motion para que tenga la energía de una fecha en vivo.",
    stack: ["Next.js", "TypeScript", "Tailwind v4", "Framer Motion", "GSAP"],
    live: "https://portfolio-tom-phi.vercel.app/",
    repo: "https://github.com/campuzanodev2001/portfolio-tom",
  },
  {
    name: "Tailor AI",
    kind: "SaaS · CV contra búsqueda",
    img: { src: "/tailorai.png", w: 1919, h: 1079 },
    alt: "Captura de Tailor AI: análisis de un CV contra una búsqueda laboral.",
    text:
      "Subís el CV, pegás la búsqueda y Gemini compara las dos cosas: te marca lo que falta, arma una versión pensada para los filtros ATS y te da un puntaje. Historial por usuario y créditos con Stripe.",
    stack: ["Next.js 16", "Gemini API", "Firebase", "Stripe", "Puppeteer"],
    live: "https://tailor-ai-pi.vercel.app",
    repo: "https://github.com/TioDanx/tailor-ai",
  },
  {
    name: "Nuestros Planes",
    kind: "PWA privada, para dos",
    img: { src: "/nuestrosplanes.png", w: 1919, h: 1079 },
    alt: "Captura de Nuestros Planes: planificador de planes en pareja.",
    text:
      "Un lugar para organizar planes en pareja. Cada plan pasa de pendiente a confirmado a hecho, con mapa, cuenta regresiva, fotos y reseña con estrellas. Sincroniza en tiempo real, manda notificaciones y se instala en el celu.",
    stack: ["Next.js 16", "React 19", "Firebase", "Framer Motion", "Cloudinary"],
    repo: "https://github.com/TioDanx/franteamomuchomucho",
  },
  {
    name: "Moreno Herramientas",
    kind: "E-commerce a medida · ferretería",
    text:
      "E-commerce a medida para una ferretería con más de 14.000 productos. Panel de administración propio, MercadoPago, envíos por Andreani y Correo Argentino, e integración con Eleventa, el sistema de gestión que ya usan. Sin plataformas de terceros: el código es del cliente.",
    stack: ["Next.js 15", "TypeScript", "Tailwind v4", "Supabase", "Drizzle ORM", "MercadoPago"],
    wip: true,
  },
];

export const STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind",
  "Framer Motion",
  "Firebase",
  "Supabase",
  "Claude Code",
  "Cursor",
];

export const EMAIL = "danicampu56@gmail.com";
export const GITHUB = "https://github.com/TioDanx";
export const LINKEDIN = "https://www.linkedin.com/in/daniel-campuzano-7149552b7";
