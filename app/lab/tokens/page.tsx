import { Fragment } from "react";
import { TokenField } from "./_components/TokenField";

// El nombre partido como lo partiría un tokenizador BPE (el espacio va pegado
// a la palabra siguiente; acá queda afuera del span para no romper el subrayado
// al cortar la línea). Los ids son decorativos: aparecen con doble click.
const NAME_TOKENS: { t: string; id: string; sp?: boolean }[] = [
  { t: "Dan", id: "8907" },
  { t: "iel", id: "1155" },
  { t: "Camp", id: "6503", sp: true },
  { t: "uz", id: "4010" },
  { t: "ano", id: "5770" },
];

const LINKS = [
  { href: "https://github.com/TioDanx", label: "GitHub" },
  { href: "https://www.linkedin.com/in/daniel-campuzano-7149552b7", label: "LinkedIn" },
  { href: "https://campuzano.studio", label: "campuzano.studio" },
];

export default function TokensPage() {
  return (
    <div className="tk">
      <section className="tk-hero" aria-labelledby="tk-name">
        <TokenField />

        <header className="tk-top">
          <span className="tk-mark" aria-hidden="true">
            DC
          </span>
          <span>Barcelona</span>
        </header>

        <div className="tk-copy">
          <h1 id="tk-name" className="tk-name" data-tk-name="">
            <span className="tk-sr">Daniel Campuzano</span>
            <span className="tk-name__vis" aria-hidden="true">
              {NAME_TOKENS.map((k, i) => (
                <Fragment key={k.id}>
                  {k.sp ? " " : null}
                  <span
                    className="tk-tok"
                    data-id={k.id}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    {k.t}
                  </span>
                </Fragment>
              ))}
            </span>
          </h1>

          <p className="tk-role">
            <strong>Fullstack Developer</strong>
            <span className="tk-role__ai"> · construyo con IA</span>
          </p>

          <p className="tk-lede">
            Más de cinco años haciendo producto web, de la base de datos a la interfaz. Hoy
            trabajo con agentes de IA: escriben buena parte del código; la arquitectura, el
            diseño y el criterio los pongo yo.
          </p>

          <div className="tk-actions">
            <a className="tk-cta" href="mailto:danicampu56@gmail.com">
              Contactame
            </a>
            <ul className="tk-links">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
