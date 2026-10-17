# 04 — Fanzine (risografía editorial) · BRIEF

Ruta: `/lab/fanzine`. Alcance: loader + hero + un stub de "próximas hojas" que muestra los cortes de borde entre secciones.

## Concepto

El sitio es un fanzine impreso en risógrafo: papel, dos tintas planas, registro que no cierra del todo, tramas de semitono, grano. Es lo opuesto al brillo liso de la estética "IA": todo tiene una lógica física de imprenta y cada efecto sale de esa lógica. La página **no carga, se imprime**: cada tinta es una pasada de tambor sobre la misma hoja, y cuando termina la segunda pasada lo que queda es el hero. Las interacciones también son de imprenta: el papel acepta sellos de goma, las marcas de registro mueven el registro, y si sellás demasiado rápido la impresora se atasca.

## Secuencia loader → hero (ms)

| t (ms)      | qué pasa |
|-------------|----------|
| 0           | Papel crema vacío (el HTML ya está; el script inline puso `data-boot="run"` antes del primer paint). Etiqueta abajo: "Pasada 1/2 · Fluorescent Pink · tocá para saltear". |
| 60 → 600    | **Pasada rosa**: la plancha rosa se revela de arriba hacia abajo (`clip-path: inset()`), con una franja de tinta (el tambor) en el frente de avance. Imprime: sol de semitono, nombre, marcas de registro, foto en medios tonos, subrayados de los links, viñetas, trama detrás de "cuando las tocás". |
| 620         | Etiqueta cambia a "Pasada 2/2 · Federal Blue". |
| 620 → 1160  | **Pasada azul**: misma barrida + la hoja "baila" en el tambor (`fz-wobble`: entra corrida −7px/+5px y 0.45°, rebota y asienta a las ~1400). Imprime todo el texto real. Donde se superponen las tintas el multiply da violeta. |
| 1180 → 1440 | **Sello**: cae un sello rosa "IMPRESO dd·mm·aaaa" (fecha real de Buenos Aires) al lado de "DANIEL", con golpe (escala 1.7 → 0.94 → 1). Enseña sin palabras que el papel acepta sellos. |
| 1220 → 1420 | La etiqueta de pasadas se va. |
| 1450        | `data-boot="done"`: se quitan las animaciones; queda el estado final (que es el estado por defecto del CSS). |

- Saltear: cualquier `pointerdown` o tecla → `data-boot="done"` al instante. El clic que saltea no estampa un sello (ventana de 450ms).
- Una vez por sesión: `sessionStorage["lab-fanzine-booted"]`. Se escribe al **empezar** la impresión (si recargás a mitad, no se repite).
- Sin JS: no hay `data-boot`, se ve el estado final directo.
- El loader no espera red: es CSS puro sobre HTML ya renderizado. Ni las fuentes ni la foto lo bloquean (fuentes `swap`; la foto entra cuando llega, y antes de llegar el semitono queda en blanco = sin tinta).

## Tintas, papel y textura

- **Fluorescent Pink `#FF48B0` + Federal Blue `#3D5588`** (swatches oficiales de Riso). Par clásico de riso: la fluorescente da el "golpe", el Federal Blue es lo bastante oscuro para cargar todo el texto. En multiply dan un violeta profundo (~`#3D185E`) que funciona como tercera tinta gratis.
- Contraste medido: Federal Blue sobre papel crema `#F2ECDF` = **6.25:1**; sobre los papeles de las otras hojas ≥ 5.7:1. Violeta (superposición) ≈ 12:1. El rosa da 2.6:1, así que **nunca lleva texto solo**: es decoración, trama, subrayado, sellos (`aria-hidden`).
- **Modelo de separaciones real**: el cover se renderiza dos veces (`<Cover ink="p">` y `<Cover ink="b">`) con layout idéntico. Cada plancha solo "entinta" lo suyo (`.i-p`, `.i-pb`; el resto queda transparente o en `visibility` neutra), así que las dos planchas encajan pixel a pixel... y después la rosa se corre `--mx/--my/--mr` (3px, −2px, −0.12°). Ese corrimiento es el misregistration, y se ve en el nombre (bordes rosa/azul alrededor de un núcleo violeta) y en las marcas de registro duplicadas.
- Las dos planchas son `mix-blend-mode: multiply`. La plancha azul es el documento real y accesible; la rosa es `aria-hidden`, sin `h1`/`a`, `pointer-events: none`.
- **Knockouts**: el masthead y el panel "Adentro" tienen fondo blanco dentro de cada plancha → tapan la trama de esa misma plancha (como un calado en imprenta) y en multiply el blanco desaparece.
- **Semitono de los soles**: generado en el server (`print.ts → halftoneDisc`) como trama AM real: grilla rotada por tinta (rosa 15°, azul 75°, amarilla 0° — ángulos distintos como en los tambores reales), tamaño de punto ∝ √tono, iluminación desde arriba a la izquierda. Cada punto es `M x y h0` con trazo de punta redonda, agrupado en 8 grosores → ~3KB gz por sol y 8 nodos DOM en vez de cientos de `<circle>`.
- **Semitono de la foto**: CSS puro. `img` en gris + patrón `radial-gradient(closest-side,#777,#fff)` en multiply + `filter: contrast(14)` en el contenedor = umbral → puntos de tamaño variable. Luego una capa de tinta en `screen` (negro → tinta, blanco → blanco) y la plancha en multiply sobre el papel. Azul = sombras (celda 5px, 45°), rosa = medios tonos (celda 6px, 15°) → roseta de dos tintas. Recorte con tijera (`clip-path` irregular).
- **Grano**: una sola baldosa SVG `feTurbulence` de 180px como `background-image` en data URI (el navegador la rasteriza una vez y la repite), en multiply al 55%. Los sellos usan otra baldosa de ruido como `mask-image` para que la tinta del sello salga despareja. No hay ningún filtro SVG en vivo sobre áreas grandes.

## Tipografía

- **Bricolage Grotesque** (variable, ejes `wght`, `wdth`, `opsz`). Condensada (`wdth 75`), pesada (800) y a cuerpo grande (opsz alto automático) tiene trampas de tinta y una aspereza de afiche fotocopiado; a `wdth 88–100` sirve de texto. Una sola familia hace display y lectura.
- **Courier Prime** 400: la voz de máquina de escribir del fanzine para lo marginal (masthead, kicker, colofón, metadatos de hoja, el aviso de atasco). Lleva `preload: false` para no competir con la display.
- 2 familias, subset latin, `display: swap`, via `next/font/google` en `app/lab/fanzine/layout.tsx`.

## Formas recurrentes

1. **El punto de semitono**: sol rosa grande (detrás de la foto), sol azul chico (asomando por el borde), sol amarillo escondido; viñetas de "Adentro" (puntos rosas); trama rosa detrás del remate de la frase; el centro de las marcas de registro.
2. **El corte de papel**: cada hoja/sección tiene un corte distinto. En el stub: Bio = rasgada a mano (SVG con fibra blanca que asoma más allá de la superficie impresa, generada con PRNG con semilla), Proyectos = tijera dentada (máscara `conic-gradient`), Blog = troquelada (línea de agujeros), Contacto = arrancada de anotador (muescas semicirculares con máscara `radial-gradient`). Cada hoja usa otro papel (rosa, celeste grisáceo, manila, blanco) y está levemente girada, como una pila.
3. Bonus: las marcas de registro (cruz + círculo) en las esquinas.

## El chiste clickeable y los easter eggs

- **Sellos de goma (el papel no debería ser clickeable, pero lo es)**: clic/tap en cualquier superficie de papel (hero u hojas, no en links/botones) estampa un sello donde tocaste: "Aprobado", "OK", "Visto", "Original", "¡Joya!", "De acuerdo", "Chequeado". Rosa o azul, rotación aleatoria ±14°, textura de tinta despareja (máscara de ruido con offset aleatorio), golpe de 200ms, multiply sobre lo que haya debajo. Máx. 36 (se van los más viejos). En desktop el cursor es un sellito.
- **Marcas de registro** (las cruces de las esquinas): son botones. Al tocarlas se re-sortea el registro de la plancha rosa y se acomoda con un rebote (`transition` con overshoot). Hover en desktop: giran 45°.
- **Easter egg 1 — atasco de papel**: 7 sellos en menos de 2,4 s. La hoja se traba (sacudón + queda torcida), el registro se dispara (16px), y aparece el aviso "Atasco de papel… Abrir la tapa y sacar la hoja". Al sacarla se borran los sellos y la hoja **se vuelve a imprimir** (se reproduce la secuencia del loader, pasadas incluidas).
- **Easter egg 2 — la tinta escondida**: el colofón dice "Tambor 3: Yellow, cargado, sin usar". "Yellow" es un botón (subrayado punteado). Tocarlo (o escribir `amarillo` en cualquier parte, en desktop) hace una tercera pasada de Riso Yellow `#FFE800`: un sol amarillo al 0° que se monta sobre el rosa (→ naranja) y la foto. El colofón pasa a "¡en uso! Ahora son tres tintas." Se puede apagar con el mismo botón. Su geometría se calcula en el cliente solo cuando se activa, para no pesar en la carga.

## Copy (rioplatense, voseo, todo verdadero)

- Kicker: "Frontend engineer · +5 años · React, Next.js, TypeScript". H1: "Daniel Campuzano".
- Frase: "Hago interfaces rápidas y prolijas, con detalles que aparecen cuando las tocás." (el remate es literal: la página tiene detalles que aparecen cuando la tocás).
- "Adentro" = líneas de tapa de revista con proyectos reales (NZ Automotores, Moreno Herramientas con 14.000+ productos "en obra", Tailor AI, y además The Box, Portal Store, Tom Martorello, Nuestros Planes).
- Datos en vivo y reales: hora de Buenos Aires (`Intl`, `America/Argentina/Buenos_Aires`, se actualiza cada 10s) y la fecha del sello. Solo se renderizan en el cliente (`useSyncExternalStore` con snapshot de servidor `null`), así no hay hidratación mentirosa.
- "Hoja 01/05" es cierto: hay 5 hojas en la página. El colofón admite que la impresión es simulada ("Bueno, simulado: esto es una pantalla"). No hay número de edición ni tirada inventados.

## Performance (presupuesto)

- **JS propio**: un solo client component grande (`Press.tsx`: boot, sellos, atasco, tinta amarilla, reloj, sello de fecha, marcas de registro) + `print.ts`. Estimado ≈ 4–6KB gz. **No usa framer-motion**: todo el movimiento es CSS (keyframes + transitions), así que el loader corre antes de hidratar.
- **Script inline** (~500 bytes) en `page.tsx`: decide `run/done` antes del primer paint y habilita "saltear" aunque el bundle tarde en 3G. En navegación client-side (desde `/lab`) no corre y `Press` repite la lógica en `useLayoutEffect`.
- **SVG de los soles**: ~3KB gz cada uno (x2 por el payload RSC). El amarillo no viaja en el HTML.
- **Foto**: `next/image` (`/daniel.jpg` pesa 512KB en crudo; el optimizador sirve ~400px/60vw en WebP/AVIF). Lazy por defecto, no bloquea el loader. Mismo `src`/`sizes` en las dos planchas → una sola descarga.
- **Filtros**: `contrast()` solo sobre la foto (≤400px, estática). Nada de `feTurbulence`/`feDisplacementMap` en vivo; el ruido son baldosas data-URI rasterizadas una vez.
- **Capas de blend**: 2 planchas multiply + capa de sellos multiply + grano multiply. Las planchas animan `clip-path`/`transform` solo durante 1,4s.
- Evitado a propósito: canvas/WebGL, imágenes de textura, fuentes extra, framer-motion, listeners de `pointermove`.

## Reduced motion

Sin tambor, sin bamboleo, sin golpe de sello, sin etiqueta de pasadas: la tinta rosa aparece con un fundido de 420ms y la azul 280ms después, ya desregistrada (el misregistration es estático, así que la estética queda intacta). Los sellos aparecen con fundido; las marcas de registro cambian el registro sin rebote; el atasco deja la hoja torcida sin sacudón; la tinta amarilla entra con fundido.

## Mobile vs desktop

- **Mobile (360 primero)**: una columna. Masthead → foto a la derecha (60vw) con el sol rosa enorme saliéndose por la derecha y el sol azul asomando por la izquierda → kicker metido al costado de la foto → nombre gigante (17vw, `wdth 75`) con el sello de fecha al lado de "DANIEL" → frase → panel "Adentro" → links → colofón. Toques: sello. Sin hover.
- **Desktop (≥960px)**: grilla de dos columnas. El nombre (12.4vw, máx. 15rem) se mete en la columna de la foto; la foto gira 2° al otro lado; "Adentro" ocupa la columna derecha como líneas de tapa; el sol rosa ocupa media pantalla. Cursor-sello, hover en marcas de registro y links, `amarillo` por teclado.

## Mapa de archivos

```
app/lab/fanzine/
  layout.tsx            fuentes (Bricolage Grotesque + Courier Prime), metadata, importa fanzine.css
  page.tsx              raíz .fz + script inline de boot + composición (2 planchas + amarilla + stub)
  fanzine.css           todo el estilo, scopeado en .fz (tokens, planchas, loader, sellos, atasco, hojas, desktop, reduced-motion)
  BRIEF.md              este documento
  _components/
    print.ts            puro: PRNG, halftoneDisc (trama AM), tornEdge (borde rasgado), constantes de boot
    Halftone.tsx        <svg> de un disco de semitono (server o client)
    Cover.tsx           server: una separación de la tapa (ink="p" | "b")
    Press.tsx           client: boot, sellos, atasco, tinta amarilla, BaClock, DateStamp, marcas de registro
    Sheets.tsx          server: stub de las 4 hojas siguientes con sus cortes
```

## Próximos pasos (bio / proyectos / blog / contacto)

- **Bio** (hoja rosa, borde rasgado): retrato a pantalla completa en semitono duotono, texto en columnas de fanzine con capitular gigante; datos reales (Técnico en Informática, 5+ años, stack, Claude Code/Cursor). Un "recorte pegado" con la hora de BA.
- **Proyectos** (tijera dentada): cada proyecto = una lámina/afiche pegado a la pared con cinta; los afiches se **despegan** al arrastrar (la idea de los posters que se despegan), y al despegar muestran el reverso con stack y links. Screenshots reales pasados por el mismo pipeline de semitono a dos tintas (mismo CSS, sin procesar imágenes en build).
- **Blog** (troquelado): notas como recortes de una tira perforada; "cortar por la línea de puntos" arrastrando.
- **Contacto** (hoja de anotador): formulario escrito como una ficha a máquina; el envío "sella" la ficha con "ENVIADO".
- **Final**: el easter egg grande — "Imprimí el fanzine": stylesheet `@media print` que arma un zine de una hoja plegable (8 páginas, imposición de 1 hoja A4 con un corte) con las mismas planchas en escala de grises.
- Los bordes ya están resueltos como modificadores de `.fz-sheet` (`--torn`, `--zigzag`, `--perf`, `--pad`), listos para envolver cada sección.

## Riesgos / no probado (no pude abrir un navegador)

- **No lo vi renderizado.** Solo validé `tsc` y `eslint`, y rendericé los soles de semitono aparte (los puntos de largo cero con punta redonda funcionan). Revisar en navegador real, sobre todo:
  - El umbral de la foto (`contrast(14)` + `multiply` + `screen`): el balance de `--tone` por plancha puede necesitar ajuste (muy oscuro/claro). Safari a veces aplica distinto `mix-blend-mode` dentro de elementos con `filter`.
  - Alineación entre planchas: depende de que el layout sea idéntico; cualquier diferencia de ancho (p. ej. el reloj) movería el nombre rosa. El reloj tiene ancho fijo `5ch`.
  - Tamaño del nombre en 360px con la fuente de fallback (más ancha que Bricolage condensada) antes de que cargue la fuente: puede desbordar un instante (está recortado por el `overflow` del hero).
  - Posición del sello de fecha al lado de "DANIEL" en 360px (entra justo).
  - Que el `<script>` inline dentro del árbol no dispare advertencias de React en dev al navegar client-side (es inofensivo).
- El `clip-path` animado en las planchas no es compositor-only en todos los navegadores: en mobile viejo podría tirar frames durante 1,1s.
- El atasco mueve el foco al botón del aviso; al cerrarlo el foco vuelve al `body` (mejorable).
