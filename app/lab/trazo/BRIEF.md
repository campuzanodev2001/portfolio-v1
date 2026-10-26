# Trazo — brief

**Concepto.** Una sola línea, sin levantar la birome, cuenta la historia de Daniel. Es el horizonte de la página: entra por el borde izquierdo, se anuda en un dibujo y sale por el derecho. Cada pocos segundos la línea se desarma y se rehace en el capítulo siguiente: el teléfono de la mamá → la primera compu → el wifi del vecino → `{ }` → React → IA → la bandeja de DJ → la pelota de vóley → otra vez el teléfono. El "¿cómo hizo eso?" está en que es literalmente **un solo `<path>`** y el morph se ve hecho a mano. Minimalista, editorial: fondo casi negro, tinta hueso, un solo acento (la punta de la birome, rojo-naranja).

## Coreografía del loop (38,4 s, infinito)

Cada capítulo: **2,8 s quieto** (con pie de foto) + **2,0 s de morph** hacia el siguiente.

| t (s) | dibujo | pie de foto |
|---|---|---|
| 0,0 – 4,8 | teléfono con engranaje de configuración en pantalla | 2007 · 6 años — el teléfono de mamá |
| 4,8 – 9,6 | monitor con líneas de código | 2015 · 14 años — mi primera computadora |
| 9,6 – 14,4 | router + abanico de señal | 2016 · 15 años — el wifi del vecino |
| 14,4 – 19,2 | `{ }` | C → C++ → Java → JS — de Assembler a JavaScript |
| 19,2 – 24,0 | átomo de React | React — tutor de más de 150 estudiantes |
| 24,0 – 28,8 | chispa dentro de un anillo de nodos | hoy — construyo con IA |
| 28,8 – 33,6 | bandeja: vinilo en espiral + brazo | fuera del código — DJ |
| 33,6 – 38,4 | pelota de vóley | fuera del código — vóley |
| 38,4 → | morph vóley → teléfono (es un morph más: no hay reinicio) | |

Dentro de cada morph: el cambio recorre la línea de izquierda a derecha y la birome (punto con brillo + estela de ~64 puntos) viaja en el frente de onda, "redibujando". El pie de foto se va al empezar el morph y vuelve con el texto nuevo al 72 %.

## Cómo funciona

- **Dibujos** (`_components/shapes.ts`): cada uno se escribe con una mini-birome (`Pen`: `L`, `C`, `Q`, `arc`, `ell`, `A`, `loop`, `spiral`, `polar`). Todos empiezan en (0, 310) y terminan en (600, 310) → los extremos nunca se mueven. Las partes internas (pantalla, antena, nodos, brazo del tocadiscos) son ramas con `mark()` / `back()`: la birome vuelve exactamente sobre sus pasos. Quieto no se nota; en el morph las dos pasadas se separan y la línea parece desenredarse.
- **Remuestreo**: cada polilínea se remuestrea por longitud de arco a exactamente **900 puntos** (`Float32Array`). Mismo número de puntos → se puede interpolar punto a punto, sin librerías.
- **Morph** (`_components/morph.ts`): el punto *i* (posición *u* = i/899 en la línea) hace su viaje en una ventana escalonada (`SPREAD` 0,58 / `WIDTH` 0,42) con easing cúbico, y en vez de ir en línea recta viaja en arco (desvío perpendicular ∝ distancia · sen(π·e) · sen(4πu + semilla)) → la hebra "flamea" en lugar de deformarse como goma.
- **Loop sin costura**: el tiempo de la historia es un acumulador continuo; capítulo = ⌊t / 4,8 s⌋ mod 8. El último morph (vóley → teléfono) es igual a cualquier otro, así que no existe "volver al principio". La respiración (±0,55 u) depende del reloj real, no del capítulo: tampoco salta.
- **Un solo rAF**, cero re-renders de React: los refs escriben `d`, `transform` y `textContent` directo.
- **Puntero (desktop, `hover: hover` + `pointer: fine`)**: la línea se aparta del cursor (radio 64 u, caída cuadrática, entrada/salida suavizada).
- **Entrada**: el primer dibujo se traza con `stroke-dasharray` en CSS puro (`pathLength=1`) → se ve aunque el JS tarde en 3G. El SSR ya trae el teléfono dibujado (sin JS queda un frame quieto correcto).

## El nombre

"Daniel Campuzano" es texto real (`h1` con el nombre completo para lectores de pantalla); la versión visible está partida en letras con una ola lentísima de 7 s: cada letra sube 0,04 em y baja a 74 % de opacidad, desfasada 0,2 s de la anterior. Solo `transform` + `opacity`. "Campuzano" en itálica.

## Movimiento reducido

`prefers-reduced-motion: reduce` → no corre el rAF ni la ola del nombre ni la entrada: queda el teléfono quieto con su pie de foto. Tocar el dibujo cambia al siguiente sin animación. Se escucha el cambio de preferencia en vivo.

## Performance

- Sin librerías. JS del hero: shapes + morph + componente (unos pocos KB). 2 fuentes subset latin (Instrument Serif normal/itálica, Geist Mono 400/500).
- Por frame: 900 puntos → un string `d` (~12 KB) en un solo path. El rAF se corta con `visibilitychange` y con `IntersectionObserver` (hero fuera de pantalla); `dt` se limita a 64 ms para que no haya saltos al volver.
- Glow de la birome = gradiente radial + trazo ancho de baja opacidad (sin `filter`, que es caro en SVG animado).

## Easter eggs

- **"¿una sola línea?"** (botón discreto arriba a la derecha): la historia se congela y la birome recorre la línea entera de punta a punta (dash con `pathLength=1`). Es la prueba de que es un solo trazo.
- **Tocar/clickear el dibujo** (`button` accesible "Pasar al siguiente dibujo"): adelanta el morph al siguiente capítulo.
- **Consola**: un mensaje con la línea y "Un solo `<path>`, 900 puntos, sin librerías."

## Mapa de archivos

- `layout.tsx` fuentes + metadata · `page.tsx` hero (server) · `trazo.css` estilo, ola del nombre, entrada, reduced-motion
- `_components/shapes.ts` birome, 8 dibujos, remuestreo, capítulos · `morph.ts` interpolación, respiración, repulsión · `TrazoLine.tsx` rAF + interacción · `Name.tsx`

## Riesgos conocidos

- Algunos cruces del morph son "caóticos" a propósito (la línea se enreda); si algún par queda feo, se ajusta cambiando la semilla (`i * 1.7`) o `SWIRL`.
- Reescribir `d` de 900 puntos por frame es barato en desktop; en Android de gama baja conviene medir (bajar `N` a 600 si hace falta).
- Los años 2007/2015/2016 salen de "nacido en 2001" + las edades de HECHOS.md; los capítulos sin año usan contexto en vez de fecha para no inventar.
