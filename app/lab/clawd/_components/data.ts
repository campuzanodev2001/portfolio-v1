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
    text: "Le agarraba el teléfono a mi mamá para tocarle las configuraciones. No buscaba nada, solo quería ver qué pasaba.",
  },
  {
    when: "12 años",
    commit: "feat: escuela técnica",
    text: "Entré a una escuela técnica.",
  },
  {
    when: "14 años",
    commit: "feat: primera computadora propia",
    text: "Mi primera computadora propia. Empecé a jugar con programación.",
  },
  {
    when: "15 años",
    commit: "fix: no había internet en casa",
    text: "Con Kali Linux y bastante paciencia me conecté al wifi del vecino, porque en casa no teníamos internet. No es mi logro más presentable, pero explica bastante.",
  },
  {
    when: "Lenguajes",
    commit: "refactor: reescribirlo todo en",
    text: "C, C++, C#, Pascal, hasta Assembler. POO con Java. Después JavaScript, HTML y CSS: ver el resultado de lo que construía me enganchó.",
  },
  {
    when: "Docencia",
    commit: "docs: tutor de React, +150 estudiantes",
    text: "Hice un curso de React y mi tutor me recomendó como tutor del curso. Di clases y mentoreé a más de 150 estudiantes.",
  },
  {
    when: "Accenture",
    commit: "feat: primer trabajo como desarrollador",
    text: "Mi primer trabajo como desarrollador.",
  },
  {
    when: "Globant",
    commit: "feat: equipos multidisciplinarios, en inglés",
    text: "Equipos multidisciplinarios, en inglés. Aprendí a hacerme cargo de mi código y a trabajar en equipo.",
  },
  {
    when: "Abr 2025",
    commit: "release: freelance y Campuzano",
    text: "Me fui por mi cuenta: hablar con clientes y llevar un proyecto de punta a punta. Fundé Campuzano, mi agencia de diseño web.",
  },
  {
    when: "Hoy",
    commit: "wip: agentes, contexto y arquitectura",
    text: "LLMs, desarrollo agéntico, ingeniería de contexto, harness engineering y modelos open-source. La IA escribe; yo me ocupo de la arquitectura, los patrones y el código limpio.",
  },
];

/** Lo que sostiene: se muestra como `git config`. */
export const VALUES = [
  {
    title: "Criterio antes que herramienta",
    key: "criterio.antesQueHerramienta",
    text: "Un modelo puede escribir mil líneas en un minuto. Decidir cuáles tienen que existir sigue siendo trabajo de una persona.",
  },
  {
    title: "Entender cómo funciona por dentro",
    key: "codigo.entenderPorDentro",
    text: "No me alcanza con que algo ande. Quiero saber por qué anda, y por qué se rompería.",
  },
  {
    title: "Hacerme cargo",
    key: "codigo.hacermeCargo",
    text: "Si el código lo escribió un agente y yo lo aprobé, el código es mío.",
  },
  {
    title: "Terminar lo que empiezo",
    key: "trabajo.terminarLoQueEmpiezo",
    text: "Cuando un problema me engancha, lo sigo hasta resolverlo.",
  },
  {
    title: "Compartir lo que aprendo",
    key: "equipo.compartirLoQueAprendo",
    text: "Enseñarle a más de 150 personas me obligó a entender las cosas lo suficiente como para explicarlas.",
  },
];

/** Qué busca: los TODO del working tree. */
export const NEXT = ["Seguir creciendo como desarrollador y seguir formándome.", "Aprender de negocio: entender por qué se construye algo, no solo cómo.", "Sacar adelante mi agencia."];

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
};

export const PROJECTS: Project[] = [
  {
    slug: "diano",
    name: "Diano",
    kicker: "Inventario de pirotecnia",
    oneLiner: "Inventario con control legal de pólvora para un negocio de fuegos artificiales en Suecia.",
    body: [
      "Una PWA para un negocio con 9 tiendas y un warehouse. Se escanean las cajas con la cámara del teléfono, el stock se lleva por sitio y el sistema calcula la pólvora (kg NEM, grupos 1.3 y 1.4) de cada uno.",
      "Avisa cuando un sitio se acerca al límite legal de su permiso, según la normativa sueca MCFFS 2026:4.",
    ],
    ai: [
      "Investigar y ordenar el marco legal.",
      "Escribir buena parte del código de la aplicación.",
    ],
    me: [
      "PWA y no app nativa, para llegar a tiempo a la temporada alta.",
      "El stock no es un número que se pisa: se calcula desde un registro de movimientos inmutable, auditable ante una inspección.",
      "El NEM se suma por separado para cada grupo de riesgo.",
    ],
    stack: ["Next.js", "Postgres", "Vercel", "ZXing", "PWA"],
    status: "En desarrollo",
    tags: ["producto", "curso"],
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
    ai: ["Buscar y leer ofertas.", "Evaluar el fit.", "Completar formularios y postular."],
    me: [
      "Todo el estado vive en disco: cualquier sesión nueva retoma sin depender de la memoria del modelo.",
      "Reglas inviolables separadas de los playbooks que describen cómo se hace cada tarea.",
      "Agentes en paralelo, pero solo el orquestador escribe el estado.",
      "Cada error encontrado queda registrado para que el próximo agente no lo repita.",
    ],
    stack: ["Agentes de IA", "Orquestación", "Automatización de navegador", "Python"],
    status: { pending: "estado actual" },
    tags: ["agentes"],
    note: "Por privacidad, no muestro datos de postulaciones ni empresas.",
  },
  {
    slug: "leads",
    name: "Pipeline de captación de leads",
    kicker: "Pipelines con IA",
    oneLiner: "Encuentra negocios con buena reputación y sin web real, y prepara el contacto.",
    body: [
      "Busca negocios en Barcelona con buenas reseñas pero sin página propia. Primero mide qué rubros rinden más: ganó belleza y estética, con 201 leads y un 32 % cualificados.",
      "Después genera una web demo y prepara el contacto por teléfono o WhatsApp. Alimenta a mi agencia.",
    ],
    ai: [{ pending: "qué parte hace la IA" }],
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
    slug: "inbox-radar",
    name: "Inbox Radar",
    kicker: "LLM local",
    oneLiner: { pending: "qué hace Inbox Radar" },
    body: ["Corre con un modelo de lenguaje local, en mi propia máquina: los mails nunca salen a la nube."],
    ai: [{ pending: "qué tarea resuelve el LLM local" }],
    me: ["Modelo local en vez de una API externa, para que el contenido del correo no salga de la máquina."],
    stack: ["Python", "LLM local"],
    status: { pending: "estado" },
    tags: ["agentes"],
  },
];

export const NOTES = [
  {
    title: "El estado vive en disco, no en el modelo",
    text: "Por qué un sistema de agentes tiene que poder retomar desde cero, sin contexto, y cómo lo armo.",
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
    text: "SOLID, patrones de diseño y revisión de código cuando la mayor parte del código no la tipeás vos.",
  },
];
