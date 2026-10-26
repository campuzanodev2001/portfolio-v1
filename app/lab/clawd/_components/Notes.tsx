import { NOTES } from "./data";
import { Pixel } from "./Pixel";
import { SectionHead } from "./SectionHead";

/**
 * Notas como pruebas de galera. Arriba baja la platina (la barra crema en la
 * que terminó el disco) y estampa el título. Cada nota es un renglón en tinta
 * floja (tramado) que se imprime de a píxel cuando cruza la línea de lectura;
 * Clawd tira de la palanca de la prensa cada vez. Al margen, la marca del
 * corrector: "prueba · próximamente", o un sello con la fecha si ya salió.
 * Salida: Clawd descuelga la lámpara de la prensa y se la lleva a Contacto.
 */

function Line({ text }: { text: string }) {
  // Dos capas del mismo texto: la tramada debajo y la entintada que se revela.
  return (
    <>
      <span className="np-ghost" aria-hidden="true">
        {text}
      </span>
      <span className="np-ink">{text}</span>
    </>
  );
}

export function Notes() {
  return (
    <section className="cl-sec np" id="notas" aria-labelledby="notas-t">
      <div className="np-press" data-reveal="custom">
        <span className="np-platen" aria-hidden="true" />
        <SectionHead id="notas" title="Notas" prompt="componé las notas" />
      </div>
      <p className="cl-intro">
        Lo que voy aprendiendo sobre desarrollo con agentes, escrito para ordenar las ideas. Todavía no hay notas
        publicadas; estas son las primeras que tengo en mente.
      </p>

      <div className="np-body" data-scrub="0.6">
        <ol className="np-list">
          {NOTES.map((n, i) => (
            <li key={n.title} className="np-note" data-step>
              <span className="np-n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="np-title">
                {n.href ? (
                  <a href={n.href}>
                    <Line text={n.title} />
                  </a>
                ) : (
                  <Line text={n.title} />
                )}
              </h3>
              <p className="np-text">{n.text}</p>
              <span className={n.date ? "np-mark np-mark--out" : "np-mark"}>
                {n.date ? `Publicada · ${n.date}` : "Prueba · próximamente"}
              </span>
            </li>
          ))}
        </ol>

        {/* La prensa: Clawd y la palanca. Sticky al costado mientras se imprime. */}
        <div className="np-rig" aria-hidden="true">
          <div className="np-machine">
            <span className="np-lever" />
            <Pixel pose="idle" className="np-clawd" />
          </div>
        </div>
      </div>

      {/* Salida: la lámpara de la prensa se va con Clawd hacia Contacto. */}
      <div className="np-exit" data-scrub="0.9" data-span="0.5" aria-hidden="true">
        <i className="np-go" data-step />
        <span className="np-cord" />
        <div className="np-carrier">
          <Pixel pose="lamp" className="is-walker" />
        </div>
      </div>
    </section>
  );
}
