// Contenido de la página. Sale de docs/portfolio-v3/HECHOS.md y del copy
// "Criterio" (docs/portfolio-v3/copy/04-criterio.md). Lo que falta va como
// `pending` y se ve marcado en la página: no se inventa.

export const MAIL = "danicampu56@gmail.com";
export const AGENCY = "https://campuzano.studio";

export const LINKS = [
  { label: "GitHub", href: "https://github.com/TioDanx" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/daniel-campuzano-7149552b7" },
];

export const NAV = [
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "proyectos", label: "Proyectos" },
  { id: "hobbies", label: "Hobbies" },
  { id: "notas", label: "Notas" },
  { id: "contacto", label: "Contacto" },
];

/** Una línea de texto, o un dato que Daniel tiene que completar. */
export type Text = string | { pending: string };

/** La historia como `git log --reverse`: cada hito es un commit. */
export const STORY: { when: string; commit: string; text: string }[] = [
  {
    when: "6 años",
    commit: "chore: tocar la config del celu de mamá",
    text: "Le agarraba el teléfono a su mamá para tocarle las configuraciones. No buscaba nada, solo quería ver qué pasaba.",
  },
  {
    when: "12 años",
    commit: "feat: escuela técnica",
    text: "Entró a una escuela técnica.",
  },
  {
    when: "14 años",
    commit: "feat: primera computadora propia",
    text: "Su primera computadora propia. Ahí empezó a jugar con programación.",
  },
  {
    when: "15 años",
    commit: "fix: no había internet en casa",
    text: "Con Kali Linux y bastante paciencia se conectó al wifi del vecino, porque en su casa no había internet. No es su logro más presentable, pero explica bastante.",
  },
  {
    when: "Lenguajes",
    commit: "refactor: reescribirlo todo en",
    text: "C, C++, C#, Pascal, hasta Assembler. POO con Java. Después JavaScript, HTML y CSS: ver el resultado de lo que construía lo enganchó.",
  },
  {
    when: "Docencia",
    commit: "docs: tutor de React, +150 estudiantes",
    text: "Hizo un curso de React y su tutor lo recomendó como tutor del curso. Dio clases y mentoreó a más de 150 estudiantes.",
  },
  {
    when: "Accenture",
    commit: "feat: primer trabajo como desarrollador",
    text: "Su primer trabajo como desarrollador.",
  },
  {
    when: "Globant",
    commit: "feat: equipos multidisciplinarios, en inglés",
    text: "Equipos multidisciplinarios, en inglés. Aprendió a hacerse cargo de su código y a trabajar en equipo.",
  },
  {
    when: "Abr 2025",
    commit: "release: freelance y Campuzano",
    text: "Se fue por su cuenta: hablar con clientes y llevar un proyecto de punta a punta. Fundó Campuzano, su agencia de diseño web.",
  },
  {
    when: "Hoy",
    commit: "wip: agentes, contexto y arquitectura",
    text: "LLMs, desarrollo agéntico, ingeniería de contexto, harness engineering y modelos open-source. Acá aparezco yo: escribo el código y él se ocupa de la arquitectura, los patrones y el código limpio.",
  },
];

/** Lo que sostiene: se muestra como `git config`. */
export const VALUES = [
  {
    title: "Criterio antes que herramienta",
    key: "criterio.antesQueHerramienta",
    text: "Yo puedo escribir mil líneas en un minuto. Decidir cuáles tienen que existir sigue siendo trabajo de él.",
  },
  {
    title: "Entender cómo funciona por dentro",
    key: "codigo.entenderPorDentro",
    text: "No le alcanza con que algo ande. Quiere saber por qué anda, y por qué se rompería. Me lo pregunta a mí también.",
  },
  {
    title: "Hacerme cargo",
    key: "codigo.hacermeCargo",
    text: "Él lo dice así: si el código lo escribió un agente y yo lo aprobé, el código es mío.",
  },
  {
    title: "Terminar lo que empiezo",
    key: "trabajo.terminarLoQueEmpiezo",
    text: "Cuando un problema lo engancha, lo sigue hasta resolverlo. Doy fe.",
  },
  {
    title: "Compartir lo que aprendo",
    key: "equipo.compartirLoQueAprendo",
    text: "Enseñarle a más de 150 personas lo obligó a entender las cosas lo suficiente como para explicarlas.",
  },
];

/** Qué busca: los TODO del working tree. */
export const NEXT = ["Seguir creciendo como desarrollador y seguir formándose.", "Aprender de negocio: entender por qué se construye algo, no solo cómo.", "Sacar adelante su agencia."];

export type Tag = "producto" | "agentes" | "curso";
export const FILTERS: { id: Tag | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "producto", label: "Producto" },
  { id: "agentes", label: "Agentes de IA" },
  { id: "curso", label: "En curso" },
];

export type Project = {
  slug: string;
  name: string;
  kicker: string;
  oneLiner: Text;
  body: Text[];
  ai: Text[];
  me: Text[];
  stack: string[];
  status: Text;
  tags: Tag[];
  note?: string;
  /** Sitio publicado (o pendiente, si se sabe que existe pero falta el link). */
  href?: Text;
  repo?: string;
  /** Captura en /public. */
  img?: string;
};

/** Narra Clawd (la IA) en primera persona; Daniel va en tercera. El orden es
    cronológico, de abajo hacia arriba: el primer elemento es la planta baja. */
export const PROJECTS: Project[] = [
  {
    slug: "the-box",
    name: "The Box",
    kicker: "E-commerce",
    oneLiner: "Tienda online de una marca premium de calzado y accesorios de mujer de Mar del Plata.",
    body: [],
    ai: [{ pending: "qué hizo la IA acá" }],
    me: ["Tiendanube, con MercadoPago integrado.", "Mobile-first, con la compra diseñada alrededor de la estética de la marca."],
    stack: ["Tiendanube", "Liquid", "MercadoPago", "CSS"],
    status: "Publicado",
    tags: [],
    href: "https://theboxmdp.com.ar/",
    img: "/thebox.png",
  },
  {
    slug: "portal-store",
    name: "Portal Store",
    kicker: "E-commerce",
    oneLiner: "Tienda online del primer hub de cultura gamer y tech de Mar del Plata.",
    body: ["Catálogo multicategoría, con marcas como ASUS."],
    ai: [{ pending: "qué hizo la IA acá" }],
    me: ["Rubicom, con un layout pensado para un inventario grande y muchas líneas de producto."],
    stack: ["Rubicom", "CSS"],
    status: "Publicado",
    tags: [],
    href: "https://portalstore.com.ar/",
    img: "/portal.png",
  },
  {
    slug: "tom-martorello",
    name: "Tom Martorello",
    kicker: "Portfolio de DJ",
    oneLiner: "Portfolio y sitio de booking para un DJ de Mar del Plata.",
    body: ["Hero animado, galería de fotos y carrusel de venues."],
    ai: [{ pending: "qué hizo la IA acá" }],
    me: [
      "GSAP y Framer Motion, para que el sitio tenga la energía de un show en vivo.",
      "Los sets embebidos desde SoundCloud y YouTube.",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS v4", "Framer Motion", "GSAP"],
    status: "Publicado",
    tags: [],
    href: "https://portfolio-tom-phi.vercel.app/",
    repo: "https://github.com/campuzanodev2001/portfolio-tom",
    img: "/tom.png",
  },
  {
    slug: "nuestros-planes",
    name: "Nuestros Planes",
    kicker: "PWA",
    oneLiner: "Una PWA privada para que una pareja organice sus planes juntos.",
    body: ["Cada plan tiene mapa, cuenta regresiva, galería de fotos y reseña con estrellas, y todo se sincroniza en tiempo real."],
    ai: [{ pending: "qué hizo la IA acá" }],
    me: [
      "Privada, hecha solo para dos.",
      "Cada plan pasa por estados: por hacer → confirmado → hecho.",
      "PWA instalable, con notificaciones push y exportación al calendario en .ics.",
    ],
    stack: ["Next.js 16", "React 19", "Firebase", "Framer Motion", "Cloudinary"],
    status: "Publicado",
    tags: ["producto"],
    href: "https://franteamomuchomucho.vercel.app/",
    repo: "https://github.com/TioDanx/franteamomuchomucho",
    img: "/nuestrosplanes.png",
  },
  {
    slug: "tailor-ai",
    name: "Tailor AI",
    kicker: "SaaS",
    oneLiner: "Un SaaS que usa IA para adaptar un CV a cada oferta de trabajo.",
    body: ["Subís el CV, pegás la descripción del puesto y te devuelve una versión nueva, con historial de uso por usuario."],
    ai: [
      "Gemini analiza el CV y la oferta.",
      "Encuentra lo que falta y las palabras clave ausentes.",
      "Genera una versión optimizada para ATS y le pone un puntaje.",
    ],
    me: ["Precios por créditos, cobrados con Stripe."],
    stack: ["Next.js 16", "Gemini API", "Firebase", "Stripe", "Puppeteer"],
    status: "Publicado",
    tags: ["producto"],
    href: "https://tailor-ai-pi.vercel.app/",
    repo: "https://github.com/TioDanx/tailor-ai",
    img: "/tailorai.png",
  },
  {
    slug: "campuzano",
    name: "Campuzano",
    kicker: "Agencia",
    oneLiner: "La agencia de diseño web de Daniel: webs a medida para que pequeñas empresas y profesionales tengan presencia online.",
    body: [],
    ai: [{ pending: "qué hizo la IA acá" }],
    me: [{ pending: "qué decidió Daniel acá" }],
    stack: [],
    status: "Publicado",
    tags: [],
    href: "https://campuzano.studio",
  },
  {
    slug: "barberias",
    name: "Barberías en Barcelona",
    kicker: "Webs para clientes",
    oneLiner: "Daniel hizo webs para barberías de Barcelona.",
    body: [{ pending: "nombres de las barberías" }],
    ai: [{ pending: "qué hizo la IA acá" }],
    me: [{ pending: "qué decidió Daniel acá" }],
    stack: [],
    status: { pending: "estado" },
    tags: [],
    href: { pending: "links a los sitios" },
  },
  {
    slug: "leads",
    name: "Pipeline de captación de leads",
    kicker: "Pipelines con IA",
    oneLiner: "Encuentra negocios con buena reputación y sin web real, y prepara el contacto.",
    body: [
      "Busca negocios en Barcelona con buenas reseñas pero sin página propia. Primero mide qué rubros rinden más: ganó belleza y estética, con 201 leads y un 32 % cualificados.",
      "Después genera una web demo y prepara el contacto por teléfono o WhatsApp. Alimenta a la agencia de Daniel.",
    ],
    ai: [{ pending: "qué parte hago yo (la IA)" }],
    me: [
      "Los criterios de cualificación y el puntaje para priorizar a quién llamar primero.",
      "Medir antes de barrer: reconocimiento por nicho antes de gastar llamadas a la API.",
      "Tope de llamadas mensual y caché en disco para que el costo no se dispare.",
    ],
    stack: ["Python", "Google Places API"],
    status: "En curso",
    tags: ["agentes", "curso"],
  },
  {
    slug: "job-search",
    name: "Pipeline de búsqueda laboral",
    kicker: "Pipelines con IA",
    oneLiner: "Un sistema de agentes que busca ofertas, evalúa el fit y postula de punta a punta.",
    body: [
      "Un agente orquestador coordina subagentes especializados. Uno barre portales, filtra y puntúa cada oferta; otro postula usando el navegador, incluido crear la cuenta y verificarla por email.",
      "Un dashboard muestra el estado en vivo mientras trabajan.",
    ],
    ai: ["Busco y leo ofertas.", "Evalúo el fit.", "Completo formularios y postulo."],
    me: [
      "Todo el estado vive en disco: cualquier sesión nueva retoma sin depender de la memoria del modelo.",
      "Reglas inviolables separadas de los playbooks que describen cómo se hace cada tarea.",
      "Agentes en paralelo, pero solo el orquestador escribe el estado.",
      "Cada error encontrado queda registrado para que el próximo agente no lo repita.",
    ],
    stack: ["Agentes de IA", "Orquestación", "Automatización de navegador", "Python"],
    status: { pending: "estado actual" },
    tags: ["agentes"],
    note: "Por privacidad, no muestro datos de postulaciones ni de empresas.",
  },
  {
    slug: "inbox-radar",
    name: "Inbox Radar",
    kicker: "LLM local",
    oneLiner: { pending: "qué hace Inbox Radar" },
    body: ["Corre con un modelo de lenguaje local, en la máquina de Daniel: los mails nunca salen a la nube."],
    ai: [{ pending: "qué tarea resuelve el LLM local" }],
    me: ["Modelo local en vez de una API externa, para que el contenido del correo no salga de la máquina."],
    stack: ["Python", "LLM local"],
    status: { pending: "estado" },
    tags: ["agentes"],
  },
  {
    slug: "diano",
    name: "Diano",
    kicker: "Inventario de pirotecnia",
    oneLiner: "Inventario con control legal de pólvora para un negocio de fuegos artificiales en Suecia.",
    body: [
      "Una PWA para un negocio con 9 tiendas y un warehouse. Se escanean las cajas con la cámara del teléfono, el stock se lleva por sitio y el sistema calcula la pólvora (kg NEM, grupos 1.3 y 1.4) de cada uno.",
      "Avisa cuando un sitio se acerca al límite legal de su permiso, según la normativa sueca MCFFS 2026:4.",
    ],
    ai: ["Investigué y ordené el marco legal.", "Escribí buena parte del código de la aplicación."],
    me: [
      "PWA y no app nativa, para llegar a tiempo a la temporada alta.",
      "El stock no es un número que se pisa: se calcula desde un registro de movimientos inmutable, auditable ante una inspección.",
      "El NEM se suma por separado para cada grupo de riesgo.",
    ],
    stack: ["Next.js", "Postgres", "Vercel", "ZXing", "PWA"],
    status: "En desarrollo",
    tags: ["producto", "curso"],
  },
];

/** Notas del blog. Cuando una se publique, sumarle date y href: la marca de
    prueba pasa a ser un sello con la fecha y el título, un link. */
export const NOTES: { title: string; text: string; date?: string; href?: string }[] = [
  {
    title: "El estado vive en disco, no en el modelo",
    text: "Por qué un sistema de agentes tiene que poder retomar desde cero, sin contexto, y cómo lo arma.",
  },
  {
    title: "Reglas y playbooks no son lo mismo",
    text: "Separar lo que un agente nunca puede hacer de cómo se hace cada tarea.",
  },
  {
    title: "Muchos agentes, un solo escritor",
    text: "Correr agentes en paralelo es fácil. Que no se pisen el estado es la parte que hay que diseñar.",
  },
  {
    title: "Si lo escribió un agente, igual es mío",
    text: "SOLID, patrones de diseño y revisión de código cuando la mayor parte del código la tipeo yo.",
  },
];
