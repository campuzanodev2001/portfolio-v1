# 01 — Specimen (tipografía cinética)

Ruta: `/lab/specimen`. Alcance: loader + hero + un stub de borde de sección.

## Concepto

El sitio es una hoja de muestra tipográfica: la tipografía es la interfaz. No hay ilustraciones, fotos ni íconos; todo lo que se mueve es una letra cambiando de forma dentro del espacio de diseño de una fuente variable. El loader no es una pantalla aparte: son las mismas letras de `DANIEL_` (ya en su lugar en el DOM) que arrancan como trazo fino comprimido, viaja cada una a un extremo distinto de los ejes (negra ancha, fina ancha inclinada, negra comprimida…) y después se ponen de acuerdo en un solo estilo. Cuando se ponen de acuerdo, eso ya es el hero. Al final la palabra se "justifica" a lo ancho de la columna usando el eje `wdth` en vez del tamaño de cuerpo, como lo haría un componedor. Las marcas `_` y `.` (de su marca "DANIEL_") son lo único en rojo.

## Secuencia loader → hero (primera visita de la sesión)

Todo el loader es CSS (`@keyframes` disparados por `data-stage` en el root). Un `<script>` inline de ~1 KB decide el stage durante el parseo del HTML, antes de que React hidrate, así arranca en el primer paint aunque el JS del framework tarde en 3G.

| ms (desde `run`) | Qué pasa |
|---|---|
| −220…0 | Stage `boot`: papel vacío y un `_` rojo titilando. Se espera la fuente como máximo 220 ms (`document.fonts.load`), si no llega se sigue igual. |
| 0 | Stage `run`. |
| 40 → 265 | Las letras D·A·N·I·E·L aparecen de a una (escalonado 45 ms) en `wght 100 / wdth 25`: parece que se tipean y empujan al `_` hacia la derecha. El `_` titila 3 veces. |
| ~140 → ~1025 | Cada letra viaja a su extremo (al 52 % de su animación de 760 ms): D 1000/151, A 100/151 + slant, N 1000/25, I 1000/151 + slant, E 100/90 + slant, L 1000/25. La palabra desborda la pantalla un instante (está recortada). Luego todas convergen a `wght 860 / wdth = fit`. |
| 120 → 940 | El readout (`wght / wdth`) cuenta de 100→860 y 25→100 con contadores CSS (`@property` entero), sin JS. |
| 620 → 1260 | Entran, escalonados 60 ms: barra superior, CAMPUZANO + readout, la frase, links, nota al pie. |
| 950 → 1250 | Cae el punto final rojo de la frase, con un rebote chico: el `.` cierra la secuencia. |
| 1270 | Stage `done`. Si el JS ya hidrató, el eje `wdth` se reajusta (0,5 s) para que `DANIEL_` llene exactamente el ancho. |

Peor caso total: 220 + 1270 ≈ 1,49 s.

- **Skip**: cualquier `pointerdown`, `keydown`, `wheel` o `touchstart` durante el loader acelera todas las animaciones ×6 (no las corta: se ve la misma transición en ~200 ms) y pasa a `done`.
- **Una vez por sesión**: `sessionStorage['lab-specimen-booted']`. Si ya está, stage `enter`: las letras suben 0,22 em mientras pasan de trazo fino a negra (520 ms, escalonado 35 ms) y el resto aparece; ~0,9 s. Ese es el "entrance" del hero en visitas repetidas.
- **Navegación client-side** (venir desde `/lab` con `<Link>`): React no ejecuta scripts inline, así que `Enhance` inyecta el mismo boot en `<head>`.
- **Sin JS**: un `<noscript>` muestra el hero asentado.

## Tipografía

- **Roboto Flex** (via `next/font/google`, `subsets: ['latin']`, `axes: ['wdth']`, `display: 'swap'`). Es la variable de Google con el rango más extremo en los dos ejes que importan para este concepto: `wght 100–1000` y `wdth 25–151`. Una sola familia alcanza para el contraste negra/fina/ancha/comprimida, que es justamente lo que se "muestra" en un specimen. Fraunces/Anybody/Bricolage tienen rangos mucho más cortos de ancho; Anybody es lo más cercano pero visualmente más "display de moda".
- Medí el woff2 latin de Google: `wght` solo 34 KB · `wght+wdth` **60 KB** · `+slnt` 79 KB · `+opsz` 250 KB. Me quedé con wght+wdth. La inclinación del loader es `skewX` (gratis) y no el eje `slnt`; a 25 vw nadie nota la diferencia.
- La segunda "familia" es la mono del sistema (`ui-monospace`, Menlo, Consolas…) para anotaciones tipo specimen (hora, ejes, nota al pie): 0 bytes.
- No se puede subsetear por glifo con `next/font/google` (no expone `text=`); si se quiere bajar más, pasar a `next/font/local` con un subset propio (ver "Próximos pasos").

## Color

Papel `#edeae3`, tinta `#141414`, rojo señal `#e0371c` (sólo para `_` y `.`, siempre en tamaño grande), gris `#5b5852` para anotaciones (≈6:1 sobre papel), `#a8a49b` sobre tinta. Un solo tema claro a propósito: es una hoja impresa. La sección siguiente se invierte (tinta) y el borde entre ambas es la palabra gigante.

## Formas recurrentes

- **`_`** — Es el cursor del loader (lo primero que se ve, titilando), la marca después de DANIEL, el subrayado de los links (es un `_` real con `wdth 25` que se estira a `wdth 151 / wght 1000` en hover/focus: "el cursor va adonde apuntás"), y vuelve a titilar cuando tirás todas las letras al piso (la palabra queda vacía, sólo el cursor, y se re-tipea sola). Long-press sobre él dispara el easter egg en touch.
- **`.`** — Cierra cosas: cierra la frase del hero (última nota del loader), cierra la palabra gigante del borde de sección ("PROYECTOS."). Es arrastrable y siempre vuelve a su lugar con un resorte: un punto final no se mueve.

## El gag clickeable (las letras)

Las letras de `DANIEL` no son botones. Igual, tocalas (lo dice la nota al pie, con su ¹):

- **Click/tap en una letra** → se suelta con un saltito (la dirección y el giro dependen de qué lado de la letra tocaste), cae con gravedad, rebota contra el piso del hero y las paredes, y termina **acostada** sobre el lado más cercano (rota a múltiplos de 90°), como una letra de madera.
- **Click en una letra en el aire** → la volvés a tirar para arriba (malabares).
- **Click en una letra en el piso** → vuelve a su lugar con un resorte apenas sub-amortiguado.
- **Tirás las seis** → queda sólo el `_` titilando y a los 1,7 s las letras vuelven solas, escalonadas.
- **Escape** → todas vuelven. Un resize también las devuelve.
- **El punto final** se arrastra (pointer capture, sirve en touch) y al soltar vuelve con resorte, conservando la velocidad con la que lo soltaste.

Física propia (~100 líneas en `fx.ts`): Euler semi-implícito, gravedad 2600 px/s², restitución 0,42, fricción en piso, caja rotada para la colisión. Sólo usa `translate`/`rotate` (propiedades individuales, no tocan layout) y el rAF se apaga cuando todo está quieto.

## Easter egg

**Escribí `claude` en cualquier parte** (en touch: **mantené apretado el `_` ~0,65 s**). Las seis letras se afinan hasta casi desaparecer, una por una, y vuelven como **CLAUDE** (también seis letras: el `_` no se mueve). El eje `wdth` vuelve a justificar la palabra nueva al ancho de la columna, y aparece una línea en rojo (con `aria-live`): "Este sitio lo armé a puro prompt, con Claude Code." A los 3 s vuelve a DANIEL. Es verdad (el objetivo de Daniel con este sitio es ver hasta dónde llega diseñando sólo con prompts) y es temático: el mismo sistema tipográfico compone otra palabra.

## Interacción desktop vs mobile

- **Mobile (diseñado a 360 px)**: `DANIEL_` a `max(4.25rem, min(24vw, 44svh))`, justificado con `wdth`. Barra superior, nombre arriba (deja recorrido para que las letras caigan), frase, links y nota abajo. Tap en letras, drag del punto, long-press del `_`.
- **Desktop** (`hover: hover` + `pointer: fine`): **lente de ejes**: el puntero estira y engorda las letras cercanas y comprime las demás (se resta la media para que el ancho total se mantenga aprox.). El readout muestra la letra más afectada con sus valores reales `wght/wdth` en vivo. Layout en dos columnas desde 900 px.
- La hora de Buenos Aires es real (`Intl`, `America/Argentina/Buenos_Aires`); en el HTML estático va `--:--` para no mostrar una hora vieja.

## Borde de sección (stub)

`PROYECTOS.` a 31 vw, `wght 1000`, tan grande que no entra. El contenedor es mitad papel / mitad tinta y la palabra está pintada con el gradiente inverso (`background-clip: text`), así se lee continua cruzando el borde: pertenece a las dos secciones. Con scroll (CSS `animation-timeline: view()`, cero JS) se comprime de `wdth 151` a `40` mientras se desliza hacia la izquierda hasta que se lee entera. Sin soporte (Firefox hoy) queda estática y desbordada, que también funciona. Debajo, un índice provisorio de proyectos reales como **waterfall** de specimen: cada línea baja tamaño, peso y ancho a la vez.

## Performance

- Fuente: 1 archivo ~60 KB woff2 (latin, wght+wdth), preload automático de `next/font`, `swap`, fallback métrico ajustado. El loader espera la fuente ≤220 ms y nunca más.
- JS propio: ~18 KB sin minificar / **~5 KB gz** (estimado con `tsc` + gzip; minificado será menos). Sin framer-motion, sin librerías de física. El componente cliente renderiza `null`: sólo engancha comportamiento a DOM que ya vino del server, así que la hidratación no re-renderiza la tipografía.
- Loader 100 % CSS. Contadores del readout con `@property` + `counter()`. Scroll del borde con scroll-driven animations. Cero imágenes, cero canvas, cero WebGL.
- Evitado: `opsz` (+170 KB), `slnt` (+19 KB), cualquier segunda familia web, retrato (no hace falta para el concepto).
- Ojo: animar `font-variation-settings` re-layoutea la línea en cada frame. Son 7 glifos en una línea aislada; debería ir bien, pero no está perfilado en un Android de gama baja.

## Reduced motion

Stage `calm`: todo aparece con un fade de opacidad de 500 ms, las letras ya asentadas, sin viaje por los ejes ni escalonado. Sin lente. Click en una letra la alterna instantáneamente entre negra y fina (sin vuelo). El punto se puede arrastrar (lo mueve el usuario) pero al soltarlo vuelve al instante. El easter egg cambia las letras sin transición. El borde de sección queda estático. Sin transiciones en los `_` de los links.

## Accesibilidad

`h1` con texto real "Daniel Campuzano" (sr-only); la versión visual por letras es `aria-hidden` porque se rompe y cambia. `h2` real "Proyectos.". Links reales con `focus-visible` rojo y el `_` estirándose también en foco. Readout decorativo `aria-hidden`. El gag y el easter egg no son accesibles por teclado salvo `claude`/Escape (son extras, no contenido).

## Mapa de archivos

```
app/lab/specimen/
  page.tsx                 Server component: markup, fuente, metadata, script inline de boot
  specimen.module.css      Todo el estilo: stages, keyframes del loader, layout, borde
  _components/boot.ts      Script de boot como string (stages, sessionStorage, skip, espera de fuente)
  _components/fx.ts        Enhancement sin React: fit por wdth, lente, física, punto, easter egg
  _components/Enhance.tsx  "use client" que monta fx.ts (renderiza null)
  _components/Clock.tsx    Hora real de Buenos Aires (useSyncExternalStore)
  BRIEF.md
```

## Próximos pasos (resto del sitio)

- **Bordes de sección**: cada sección arranca con su palabra-borde (`PROYECTOS.`, `SOBRE MÍ.`, `NOTAS.`, `ESCRIBIME.`), alternando papel/tinta, siempre cerrada con `.` rojo. Variar el eje que se anima en cada una (ancho, peso, y uno que se "corte" con `clip-path` al cruzar).
- **Proyectos**: lista tipo specimen; cada proyecto es una línea gigante con su nombre, y al hover/tap la línea se "estira" (`wdth`) y abre una ficha con stack, año y link real. Cada proyecto con su propio "estilo" fijo de la fuente (como las variantes de una familia: NZ Automotores = Black Extended, Tailor AI = Thin Condensed…).
- **Bio**: texto largo con un párrafo en tamaño de lectura; los datos duros (5+ años, Técnico en Informática, stack) como tabla de "glifos" del specimen. Retrato `/daniel.jpg` opcional, en duotono tinta/papel con CSS.
- **Blog/notas**: índice como "waterfall": títulos en tamaños decrecientes, fecha en mono.
- **Contacto**: `ESCRIBIME_` gigante con el cursor titilando; al click copia el mail y el `_` se convierte en `.`.
- **Fuente**: si el peso molesta, pasar a `next/font/local` con un subset propio (pyftsubset) de Roboto Flex limitado a los glifos de español + ejes recortados (p. ej. `wdth 25–151` pero `wght 100–1000` sólo en las instancias usadas): probablemente <35 KB.

## Problemas conocidos / no probado

No pude abrir un navegador (ni `next dev`/`build`); sólo pasan `tsc --noEmit` y `eslint` en esta carpeta, y validé el CSS con lightningcss (nombres de keyframes hasheados bien). Riesgos a revisar en el primer `next dev`:

1. **Fit por `wdth`**: el valor inicial (`100`) y el tamaño en `vw` están estimados a ojo con las métricas de Roboto Flex; si el ajuste final es grande se va a ver una corrección de ancho al terminar el loader. Afinar `font-size` de `.word` para que el fit quede cerca de 100.
2. Si la fuente tarda más de 220 ms (3G frío), el viaje por los ejes ocurre con la fuente fallback (sin ejes) y se ve un swap a mitad de camino. Alternativa: `display: 'optional'` + loader más estático.
3. El split de colores de `PROYECTOS.` asume el centro de la caja de línea ≈ centro de las mayúsculas (calculado con las métricas de Roboto, `line-height .78`); puede quedar un par de px corrido.
4. Script inline dentro de un server component + `suppressHydrationWarning` en el root: en dev React podría loguear algún warning por los atributos que el script cambia antes de hidratar.
5. `animation-timeline` en el shorthand: dejé longhands a propósito porque lightningcss fusionaba todo en un shorthand inválido para Chrome.
6. Colisiones de la física: caja rotada aproximada (no el contorno del glifo); las letras no chocan entre sí (a propósito, para mantenerlo chico).
7. Firefox: sin scroll-driven animations (borde estático) y `@property` con contadores requiere FF 128+.
