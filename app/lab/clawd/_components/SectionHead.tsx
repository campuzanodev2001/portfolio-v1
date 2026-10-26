import { Pixel, type Pose } from "./Pixel";

/**
 * Forma recurrente: el prompt. Cada sección arranca con una indicación de
 * Daniel en la terminal del hero; Clawd la ejecuta (se tipea al entrar).
 * Sin `pose`, el Clawd de la sección vive en la escena y no en el título.
 */
export function SectionHead({ id, title, prompt, pose }: { id: string; title: string; prompt: string; pose?: Pose }) {
  return (
    <header className="cl-sec__head">
      <p className="cl-sec__prompt" data-reveal style={{ "--n": prompt.length } as React.CSSProperties}>
        <span className="cl-prompt__who">daniel</span>
        <span className="cl-prompt__sep"> › </span>
        <span className="cl-sec__typed">{prompt}</span>
        <span className="cl-sec__ok" aria-hidden="true">
          ✓
        </span>
      </p>
      <div className="cl-sec__row">
        <h2 className="cl-sec__title" id={`${id}-t`}>
          {title}
        </h2>
        {pose && (
          <button type="button" className="cl-sec__clawd" data-hop aria-label="Saludar a Clawd">
            <Pixel pose={pose} />
          </button>
        )}
      </div>
    </header>
  );
}
