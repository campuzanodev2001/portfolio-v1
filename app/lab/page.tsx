const prototypes = [
  { slug: "specimen", name: "Specimen", note: "Kinetic type" },
  { slug: "la-obra", name: "La Obra", note: "Pixel art + cuadrilla" },
  { slug: "pull-request", name: "Pull Request", note: "El sitio es un diff" },
  { slug: "fanzine", name: "Fanzine", note: "Risografía editorial" },
  { slug: "fileteado", name: "Fileteado", note: "Fileteado porteño generativo" },
  { slug: "specimen-fanzine", name: "Specimen × Fanzine", note: "Mezcla 1 + 4 · página completa" },
  { slug: "specimen-obra", name: "Specimen × La Obra", note: "Mezcla 1 + 2 · página completa" },
  { slug: "specimen-obra-fanzine", name: "Specimen × La Obra × Fanzine", note: "Mezcla 1 + 2 + 4 · página completa" },
  { slug: "maquina", name: "La Máquina", note: "Rube Goldberg · hero" },
  { slug: "reglas", name: "Las Reglas", note: "Puzzle de reglas · hero" },
  { slug: "cuaderno", name: "El Cuaderno", note: "Cuaderno del que te lo explica · hero" },
  { slug: "ladrillo-b", name: "Que Entre (Ladrillo B)", note: "Kinetic × Neobrutalismo · página completa" },
  { slug: "ladrillo-a", name: "A presión (Ladrillo A)", note: "Neobrutalismo × Kinetic · página completa" },
  { slug: "clawd", name: "Clawd", note: "El bichito de Claude · página completa" },
  { slug: "despiece", name: "Despiece", note: "Vista explotada: cómo funciona por dentro · loop" },
  { slug: "penrose", name: "Penrose", note: "Escalera imposible · loop" },
  { slug: "trazo", name: "Trazo", note: "Una sola línea cuenta la historia · loop" },
  { slug: "tokens", name: "Tokens", note: "Prompt → interfaz → prompt · loop" },
];

export default function LabIndex() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-mono">
      <h1 className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
        lab / hero + loader prototypes
      </h1>
      <ol className="space-y-3">
        {prototypes.map((p, i) => (
          <li key={p.slug}>
            {/* Plain <a>: full page load so each prototype's inline boot script runs. */}
            <a href={`/lab/${p.slug}`} className="hover:underline">
              {String(i + 1).padStart(2, "0")} — {p.name}
            </a>{" "}
            <span className="text-neutral-500">· {p.note}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
