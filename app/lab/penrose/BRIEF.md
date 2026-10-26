# Penrose — brief

**Concepto.** Una escalera de Penrose isométrica (Escher, *Ascending and Descending*; Monument Valley) hecha de bloques de piedra marfil sobre una noche índigo. Tres paquetes suben escalón por escalón para siempre, pasando por cuatro estaciones —**frontend → API → agente IA → DB**— y vuelven al inicio: más arriba, pero en el mismo lugar. Es el trabajo de un fullstack dibujado como un circuito que nunca termina. Quien lo mira busca la costura y no la encuentra, porque no hay costura que esconder.

**Copy (todo de HECHOS.md).** Eyebrow "Barcelona" · título "Daniel Campuzano" · "**Fullstack Developer** · construyo con IA" · CTA "Contactame" (mailto) + GitHub y LinkedIn.

## Coreografía del loop (período = 18 saltos × 620 ms = 11,16 s)

| s (en saltos) | qué pasa |
|---|---|
| 0 | un paquete aterriza en **frontend** (escalón 0): se aplasta un 22 % y recupera; la columna coral brilla y se apaga en ~1 s; el paquete toma color coral |
| 0–6 | sube 6 escalones hacia la derecha (los contrapasos quedan ocultos: la escalera "baja" visualmente pero sube) |
| 6 | **API**: destello verde agua, el paquete cambia a ese color |
| 6–12 | 6 escalones hacia el frente |
| 12 | **agente IA**: destello ámbar; el paquete pasa a ámbar y **brilla** (es el único que emite luz) |
| 12–15 | 3 escalones hacia la izquierda, ahora sí con contrapasos visibles |
| 15 | **DB**: destello violeta |
| 15–18 | 3 escalones hacia atrás; el salto 17→18 cae exactamente sobre el escalón 0 → vuelve a empezar |

Cada salto: 36 % de reposo + 64 % de vuelo (ease in-out cúbico, parábola de 0,55 bloques) con estiramiento leve en el aire y aplastamiento al aterrizar. Los tres paquetes están desfasados 0 / 6,4 / 12,2 saltos (no enteros) para que siempre haya uno en el aire y nunca destellen dos estaciones a la vez.

## Cómo funciona la ilusión (y por qué el loop no tiene salto)

1. **La escalera es real.** Son 18 bloques en una espiral: 6 pasos en +x, 6 en +y, 3 en −x, 3 en −y; cada paso sube 1/6 de bloque. En planta no cierra: termina corrida (+3, +3) y 3 bloques más arriba.
2. **La isometría aplasta (1,1,1) a un punto.** Con la cámara a 45° de giro y atan(1/√2) ≈ 35,26° de elevación, el vector (3,3,3) proyecta a (0,0) en pantalla. El escalón 19 (= escalón 0 + (3,3,3)) se dibuja en los mismos píxeles que el 0. No es un truco de máscara: es exacto en punto flotante.
3. **Orden del pintor honesto.** Como el objeto existe en 3D, se ordena con ejes separadores entre cajas (si una caja está entera del lado +x/+y/+z de otra, va adelante) y un orden topológico (Kahn) desempatado por profundidad. Por eso las oclusiones son siempre coherentes y el ojo no encuentra el error.
4. **Loop sin costura.** El estado es una función pura del tiempo módulo 11,16 s: posición, color (última estación), brillos. Cuando un paquete completa la vuelta, su posición 3D "real" salta (3,3,3) hacia atrás — sobre el eje de la mirada, o sea, invisible. Ni un píxel se mueve.
5. **La revelación.** Arrastrar horizontalmente (o el botón "¿Cómo funciona?") gira la cámara hasta ±18°. Al dejar de ser isométrica, (3,3,3) ya no se aplasta: la escalera se abre, aparece en línea punteada el **"escalón 19 (el real)"** flotando al lado del 17, y se ve al paquete teletransportarse. Al soltar, un resorte apenas subamortiguado la vuelve a encajar (con un rebotito mínimo). El caption explica el truco en una línea (`aria-live`).

## El nombre (sutil)

"Daniel Campuzano" es texto real (`h1`, con capa visual por letra `aria-hidden` y copia `sr-only`). Una ola de luz recorre las letras una vez por vuelta del loop (mismo período, `--pz-loop`): cada letra sube un escalón de 0,045 em, se aclara a `--glint` y vuelve, con 70 ms de desfase entre letras. El 89 % del tiempo el nombre está quieto. Solo `transform` + `color`.

## Reduced motion

`prefers-reduced-motion: reduce` → un solo fotograma: un paquete recién llegado a frontend (columna encendida), otro en pleno salto, otro en reposo. Sin rAF. El botón "¿Cómo funciona?" sigue andando, pero el giro es instantáneo (sin resorte). La ola del nombre se apaga. Se escucha el cambio de la media query en vivo.

## Performance

- Cero librerías, cero imágenes. Un canvas 2D, ~25 cajas por frame (18 escalones, 4 columnas, 3 paquetes), orden O(n²) ≈ 300 comparaciones: despreciable incluso en gama baja.
- DPR tope 2. `ResizeObserver` para el tamaño.
- El rAF se corta con la pestaña oculta (`visibilitychange`) y con el hero fuera de pantalla (`IntersectionObserver`); el reloj de simulación solo avanza mientras corre, así que al volver no hay salto. Cuando se pausa, `.pz[data-paused]` también pausa la ola del nombre.
- Fuentes: Space Grotesk variable + JetBrains Mono 400, subset latin, `display: swap`. El canvas lee la familia mono computada (y redibuja en `document.fonts.ready`).
- El texto del hero es server-rendered; el JS cliente es una sola isla (`PenroseMachine`, ~6 KB min).

## Easter eggs

- **Arrastrar la escalera** (mouse o touch horizontal; el scroll vertical queda libre con `touch-action: pan-y`): rompe la ilusión mientras arrastrás y se sostiene 650 ms al soltar.
- **El escalón 19** solo existe cuando la ilusión está rota.
- **El paquete de IA brilla**: después de pasar por "agente IA" es el único que emite luz, hasta que la DB lo apaga.
- **El nombre sube un escalón** al mismo ritmo que la escalera.

## Mapa de archivos

- `layout.tsx` fuentes + metadata · `page.tsx` hero (server) · `penrose.css` estilo, layout mobile-first, ola del nombre
- `_components/engine.ts` geometría, proyección, orden del pintor, coreografía, resorte, eventos
- `_components/PenroseMachine.tsx` isla cliente (canvas + botón + caption) · `_components/Name.tsx` título letra por letra

## Riesgos conocidos

- El canvas está vacío hasta que hidrata (en 3G se ve el fondo y el texto primero). Si molesta: pintar un SVG estático del primer fotograma como fallback.
- La forma es asimétrica (lados 6/6/3/3, como el Penrose original): el centro óptico cae un poco a la derecha del canvas.
- Las etiquetas de estación se dibujan en el canvas (decorativas); el contenido accesible está en el `aria-label` del canvas.
- No se probó en navegador (verificación limitada a `tsc` + `eslint`): conviene mirar en 360 px que las etiquetas "API"/"DB" no queden al ras del borde.
