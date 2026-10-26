# Despiece — brief del prototipo (solo hero)

Ruta: `/lab/despiece`

## Concepto

Desde los 6 años, cuando le agarraba el teléfono a la mamá para tocarle las configuraciones, Daniel necesita saber cómo funcionan las cosas por dentro. El hero es una **lámina de plano técnico** (marco, marcas de registro, cotas, cajetín) con un teléfono que, en loop, se **despieza en proyección isométrica** en sus capas: Interfaz → Componentes → Lógica → Red/API → Datos → Silicio → Bits. Cada capa lleva su rótulo en mono fino. Una "request" baja por la pila y la respuesta sube. Después se vuelve a armar, gira de frente y la cámara **entra en la pantalla**.

El momento "¿cómo hizo eso?": la pantalla del teléfono no es una imagen, es **la misma lámina** (Droste), con su propio teléfono que también se despieza, sincronizado. El zoom final termina exactamente donde empezó: la pantalla pasa a ser la lámina y el loop sigue sin corte. "ESC 1:2,5 · HOJA 1/∞" en el cajetín es literal.

Texto del hero (sale de HECHOS.md): nombre, "Fullstack Developer · construyo con IA", una línea de apoyo ("La IA escribe buena parte del código; el diseño, la arquitectura y las decisiones las pongo yo."), CTA "Contactame" (mailto), GitHub y LinkedIn.

## Coreografía (período 16 s, fase p ∈ [0,1))

| p | tiempo | qué pasa |
|---|---|---|
| 0.00–0.10 | 0.0–1.6 s | Quieto, de frente. Se leen las cotas (46 × 61) y el cajetín. La pantalla muestra la lámina. |
| 0.10–0.22 | 1.6–3.5 s | Gira a isometría verdadera (rotateX 54.7356°, rotateZ −45°), se achica un 22 % y se corre a la izquierda para dejar lugar a los rótulos. Las cotas se apagan. |
| 0.18–0.38 | 2.9–6.1 s | Despiece: las 7 capas se separan 13cqw en Z, centradas. Aparecen los rótulos. El teléfono de la pantalla hace lo mismo. |
| 0.38–0.56 | 6.1–9.0 s | Despiece completo. 0.40–0.47: un pulso naranja baja de Interfaz a Bits (la request); 0.47–0.54: sube (la respuesta). |
| 0.56–0.72 | 9.0–11.5 s | Se arma. |
| 0.68–0.80 | 10.9–12.8 s | Vuelve de frente. |
| 0.80–1.00 | 12.8–16 s | Zoom ×2.5 (exponencial, `2.5 ** smootherstep`) centrado en la pantalla hasta que la pantalla llena la lámina. En p = 1 la imagen es idéntica a p = 0. |

## Cómo funciona el loop sin corte

- **Una sola fase.** `timeline.ts` convierte p en 3 números (`--rot`, `--e`, `--zs`) + 7 brillos (`--h0…6`). Un rAF los escribe en la `<figure>`; todos los niveles del Droste los **heredan**, así que se mueven en sincronía sin JS extra por nivel.
- **Todo en cqw.** Cada `.dz-stage` es `container-type: inline-size` y todas sus medidas (posiciones, translateZ, tipografía, trazos SVG, la grilla del fondo) están en `cqw`. La pantalla mide 40 × 50 cqw: misma proporción 4:5 que la lámina, sin borde ni radio. Adentro hay otra `<Lamina>`, que por ser cqw es una copia exacta a escala 0.4.
- **El centro coincide.** La pantalla está centrada en la lámina (centro en 50, 62.5 de 100 × 125), así el zoom es un `scale()` con origen 50 % 50 %, de 1 a 2.5.
- **Solo la lámina exterior hace zoom.** Las internas reciben las mismas variables de giro/despiece, pero no el zoom: durante el zoom están quietas, armadas y de frente — igual que la exterior en p = 0. Al llegar a ×2.5 lo que se ve es el nivel 2 a tamaño completo = el nivel 1 en p = 0. Se vuelve a p = 0 y nadie lo nota.
- **Velocidad cero en las costuras** (smootherstep en todas las transiciones), así que tampoco hay salto de velocidad.
- **Profundidad finita.** Se dibujan 4 niveles; el 5.º es una pantalla con grilla vacía. En el empalme la diferencia está en una pantalla de ~10 px. Los niveles ≥ 3 dibujan las capas solo con contorno (los detalles serían sub-píxel); solo el nivel 1 tiene rótulos (en reposo están ocultos, no afectan el empalme).
- **Proyección ortográfica** (sin `perspective`): es un plano técnico, y de frente las capas coinciden píxel a píxel.

## Animación del nombre (sutil)

"Daniel Campuzano" es un `<h1>` de texto real. Cada 9 s un brillo suave (blanco → un toque cálido) lo recorre con `background-clip: text`; 35 % del ciclo está quieto. Debajo, una cota fina con topes y un cursor de calibre (un rombo naranja de 7 px) que la recorre al mismo ritmo, como midiéndolo. Nada se mueve de lugar, no hay reflow.

## Interacción (desktop)

- Mover el mouse sobre la lámina **inclina** el conjunto (±9°/±6°, suavizado). La inclinación se multiplica por `--rot`: de frente vale cero, para no romper el empalme del zoom.
- **Hover sobre una capa** (despiezado): se aísla (las otras al 12 %), el contorno se pinta y el loop se congela mientras esté el cursor.
- **Arrastrar** horizontalmente recorre el tiempo hacia adelante o atrás (también con touch; el scroll vertical sigue funcionando por `touch-action: pan-y`). Se puede atravesar la costura en los dos sentidos.
- Botón **Pausar / Reproducir** en el epígrafe (WCAG 2.2.2).

## Reduced motion

Con `prefers-reduced-motion: reduce` no corre el reloj: queda el cuadro quieto del despiece completo (p = 0.39, el mismo que se renderiza en el servidor), sin inclinación ni brillo del nombre. El botón dice "Reproducir": si la persona quiere verlo, lo elige ella.

## Performance

- Cero librerías: CSS 3D + SVG inline + ~200 líneas de TS. Dos fuentes variables (Geist, Geist Mono) por `next/font`.
- El HTML del servidor ya trae el cuadro final quieto (las variables por defecto están en CSS): no hay salto al hidratar, porque el reloj arranca en esa misma fase.
- El rAF se apaga con la pestaña oculta (`visibilitychange`), con la figura fuera de pantalla (`IntersectionObserver`), en pausa, y cuando no hay nada que mover (p. ej. congelado por hover y sin inclinación pendiente).
- Por cuadro: 12 `setProperty` en un solo elemento. Sin re-render de React.
- Riesgo conocido: 4 niveles anidados × 7 capas 3D con aplanado en cada pantalla. En gama baja puede costar; la palanca es bajar `MAX_LEVEL` a 3 en `timeline.ts`.

## Easter eggs

- El cajetín dice **ESC 1:2,5 · HOJA 1/∞**: es la escala real del Droste y la cantidad de hojas.
- La capa **Bits** muestra `01000100 01000011`: "D" y "C" en ASCII.
- La capa **Lógica** muestra el código del propio zoom (`const s = 2.5 ** z;`).
- La capa **Componentes** dibuja el árbol de este hero: `<Hero>`, `<Name />`, `<Cta />`, `<Lamina />`.
- En la consola: una línea explicando que la pantalla muestra la lámina que la contiene.

## Archivos

- `layout.tsx` — fuentes (Geist / Geist Mono) + css.
- `page.tsx` — barra, copy del hero, CTA.
- `_components/Despiece.tsx` — cliente: reloj, pausas, puntero, botón.
- `_components/Lamina.tsx` — la lámina recursiva.
- `_components/plates.tsx` — dibujos SVG de cada capa.
- `_components/timeline.ts` — coreografía y constantes.
- `despiece.css`.
