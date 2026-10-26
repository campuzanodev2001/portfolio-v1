import { Pixel } from "./Pixel";
import { SectionHead } from "./SectionHead";

/**
 * Fuera del código como un disco. Un tramo pineado: el vinilo sale del sobre y
 * gira con el scroll (Lado A: DJ). A mitad de camino el sobre se da vuelta
 * (Lado B: vóley) y Clawd cambia de pose. Al salir, la púa se levanta y el
 * sobre se aplana hasta quedar como una barra crema: la platina de la imprenta
 * con la que arranca Notas.
 *
 * Las fases las marcan dos [data-step] invisibles dentro del tramo: data-at
 * pasa a 0 (Lado B) y a 1 (salida). Todo lo continuo usa --p.
 */

function Photo({ label }: { label: string }) {
  // Cuando estén las fotos: <img> en escala de grises con el duotono encima.
  return (
    <div className="lb-photo" role="img" aria-label={label}>
      <span className="cl-pending">pendiente: {label.toLowerCase()}</span>
    </div>
  );
}

export function Hobbies() {
  return (
    <section className="cl-sec lb" id="hobbies" aria-labelledby="hobbies-t">
      <SectionHead id="hobbies" title="Fuera del código" prompt="poné algo" />
      <p className="cl-intro">Lo que hago cuando no estoy programando.</p>

      <div className="lb-pin" data-scrub="0.5" data-pin>
        <i className="lb-mark lb-mark--b" data-step aria-hidden="true" />
        <i className="lb-mark lb-mark--out" data-step aria-hidden="true" />

        <div className="lb-stage">
          <div className="lb-deck" data-reveal="custom">
            <div className="lb-disc" aria-hidden="true">
              <div className="lb-label">
                <Pixel pose="idle" />
              </div>
            </div>

            <div className="lb-sleeve">
              <figure className="lb-face lb-face--a">
                <p className="lb-side">Lado A</p>
                <p className="lb-title">DJ</p>
                <Photo label="Foto de Daniel pasando música" />
                <figcaption className="lb-cap">
                  Armar un set tiene algo parecido a programar: leer qué está pasando y decidir qué viene después.
                </figcaption>
              </figure>
              <figure className="lb-face lb-face--b">
                <p className="lb-side">Lado B</p>
                <p className="lb-title">Vóley</p>
                <Photo label="Foto de Daniel jugando al vóley" />
                <figcaption className="lb-cap">Es de los pocos lugares donde no pienso en código.</figcaption>
              </figure>
            </div>

            <div className="lb-arm" aria-hidden="true" />

            <button type="button" className="lb-clawd" data-hop aria-label="Saludar a Clawd">
              <Pixel pose="dj" className="lb-clawd--a" />
              <Pixel pose="volley" className="lb-clawd--b" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
