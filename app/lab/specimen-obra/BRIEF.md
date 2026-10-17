# Specimen × La Obra (mezcla 1 + 2), página completa

Ruta: `/lab/specimen-obra`. Loader, hero, sobre mí, proyectos, notas (blog), contacto y footer.

## Concepto: la síntesis

**La hoja de muestra tipográfica está en obra.** Las letras variables gigantes de Specimen son la estructura, y la cuadrilla en pixel art de La Obra es la que las levanta, las ajusta y las repara. No hay un collage de dos estéticas. Hay una sola ficción con dos escalas: letras de 300 px y laburantes de 40 px, como en Lemmings.

- La palabra `DANIEL_` está parada sobre una **vereda de baldosas vainilla** (de La Obra), que cae justo en la línea de base de la tipografía (se mide con un `span` inline-block de alto 0).
- El `_` es una **viga** que baja de una grúa colgada de un cable y queda apoyada en la vereda.
- Las letras se levantan **por hiladas**, con un `clip-path` en `steps(6)` que es la escalera de La Obra, y después recorren los ejes `wght`/`wdth` (Specimen) hasta quedar ajustadas.
- Si tocás una letra, se cae (física de Specimen), gira y queda tirada sobre la vereda. El laburante libre más cercano camina hasta ella, la empuja con los brazos arriba y la letra vuelve a su lugar con un resorte.
- Cada tanto, un laburante elige una letra y la **ajusta a martillazos**: cada golpe sube el `wght` un escalón (910 → 960 → 1000) y el readout de specimen lo anota ("A · ajuste 2/3").
- En Proyectos, cada nombre arranca como estructura (hairline comprimida, `100/25`) y con el scroll se "aprieta" hasta su instancia de la familia. Moreno Herramientas, que está en obra de verdad, queda en estructura.

### Qué se tomó de cada padre y qué se cortó

| De Specimen | Por qué |
|---|---|
| Roboto Flex `wght+wdth`, fit por `wdth`, loader 100 % CSS por `data-stage` con script inline | Es lo que hace que el loader arranque en el primer paint sin JS |
| Viaje de cada letra a su extremo de ejes | Es el "ajuste" que después hace la cuadrilla |
| Física de letras (Euler, se acuestan a 90°), malabares, Escape | Es el gag principal y ahora tiene consecuencia (alguien la levanta) |
| Lente de ejes con el puntero (desktop), readout con contadores `@property` | Micro-animación fina sin costo |
| Huevo `claude` / long-press del `_` | Se mantiene y la cuadrilla festeja |
| Palabra-borde gigante partida en dos colores + scroll-timeline | Dos de los bordes de sección |
| `_` en links que se estira | Es la forma 1 |
| **Cortado:** el punto arrastrable (había demasiados gags en el hero) y la nota de las letras que se re-tipean solas (ahora las levanta la cuadrilla) | |

| De La Obra | Por qué |
|---|---|
| Sprites (11×10, arrays de strings), paleta de cuadrilla, casco blanco = capataz | Es la escala chica |
| Canvas a resolución de "art px" escalado por enteros, `--u` compartido DOM/canvas | Pixel crocante |
| Baldosa vainilla de 9 panes | La vereda del hero y del footer |
| NO MOLESTAR (7 molestias en 6 s → se sientan 7 s) | Es el gag de "te pasaste" |
| Turno noche con Konami: paleta `@property` en `steps(4)`, estrellas, linternas que siguen al puntero | Es un huevo de toda la página |
| Edificio isométrico server-side (`iso.ts`) | Es el "thumbnail" honesto de Moreno, que no tiene captura |
| Cartel de obra | Es la ficha de datos de la bio |
| Pausa del loop por IntersectionObserver y `visibilitychange` | Se mantiene y se mejora: ahora el loop también duerme cuando no hay nada que mover |
| **Cortado:** tipografía de bloques del nombre (ya está Roboto Flex), andamio/losa/pilotes, Jersey 10 y Atkinson (sólo queda una familia web), cartel torcible a martillazos, barrio entero (sólo queda Moreno) | |

## Loader → hero (primera visita de la sesión)

Lo maneja CSS con `data-stage` en `#so`. Un script inline (`_components/boot.ts`) decide el stage mientras se parsea el HTML. Clave: `sessionStorage['lab-specimen-obra-booted']`.

| ms (desde `run`) | Qué pasa |
|---|---|
| −200…0 | `boot`: papel, vereda de baldosas y la viga `_` roja colgando del cable a 48 svh, titilando. Se espera la fuente como mucho 200 ms. |
| 0 → 520 | La grúa baja la viga (`lower`, con un overshoot chico) hasta la vereda. |
| 470 → 860 | El cable se recoge hacia arriba (`scale` con origen arriba). |
| 60 → 635 | Las letras D·A·N·I·E·L se levantan por hiladas (`clip-path`, `steps(6)`), escalonadas 55 ms. |
| 220 → 1255 | Cada letra viaja a su extremo (`wght`/`wdth`/skew) y converge a `wght 860 / wdth = fit`. |
| 220 → 1040 | El readout cuenta de 100→860 y de 25→fit, con contadores CSS. |
| 620 → 1260 | Entran escalonados la barra superior, CAMPUZANO, el readout, la frase, el índice y la nota. |
| 1000 → 1260 | Cae el punto final rojo de la frase. |
| 1300 | `done`: el JS justifica la palabra con `wdth` (0,5 s). |

- **Cuadrilla**: si el JS hidrata durante `run`, los cuatro laburantes ya están en la vereda martillando (están "ajustando" lo que se levanta). Si llega tarde, entran caminando desde los bordes. Sin JS, la obra está terminada y no hay cuadrilla.
- **Saltear**: cualquier `pointerdown`, `keydown`, `wheel` o `touchstart` acelera ×6 las animaciones del documento y pasa a `done` (~200 ms). Las animaciones con scroll-timeline quedan excluidas.
- **Repetida** (`enter`, ~0,9 s): las letras suben de fino a negra, la viga baja en 380 ms y la cuadrilla entra caminando.
- **Peor caso**: 200 + 1300 ≈ 1,5 s.

## Tipografía, paleta y sprites

- **Una sola familia web**: Roboto Flex con `next/font/google`, subset latin, `axes: ['wdth']` (~60 KB woff2, medido en Specimen). La segunda voz es la mono del sistema, que pesa 0 bytes, para las anotaciones. Los carteles ("NO MOLESTAR", "EN OBRA", "CARTEL DE OBRA") son Roboto Flex `1000/40` en mayúsculas, que ya parece letra de chapa. Así no hace falta una fuente pixel.
- **Paleta** (tokens registrados con `@property`, así noche y plano interpolan todo junto en `steps(4)`):
  - `--bg-a` cal `#ece6d8` y `--fg-a` brea `#1c1714` (secciones claras)
  - `--bg-b`/`--fg-b`, el inverso (secciones oscuras)
  - `--red` `#e0371c`, sólo para las dos formas
  - `--blue` `#2b49c4`, replanteo: sólo Moreno y el modo plano
  - casco `#f2b21b`, sólo en sprites y en NO MOLESTAR
  - Noche: índigo `#121630`. Plano: azul plano `#1f3fae` con grilla.
- **Sprites**: los frames de La Obra más `mate` (sentado con termo) y `carta` (lleva un sobre). Se dibujan en dos lugares. En el canvas del hero van en vivo. En el resto de la página son **SVG servidos** (`Sprite.tsx`, paths agrupados por color, sin JS), y cuando hace falta alternar frames lo hace el CSS.

## Las dos formas

1. **La viga `_`**, horizontal y roja. Es el cursor/viga de `DANIEL_`, la que baja la grúa, el subrayado de todos los links (se estira con `wdth` en hover/focus), el cierre de cada título (`Quién dirige la obra_`, `Libro de obra_`, `Daniel Campuzano_`), el final de las palabras-borde (`PROYECTOS_`, `ESCRIBIME_`), la viga roja apoyada en cada escalera y el final del mail (cuando copiás, pasa a `.`).
2. **El escalón ▪**: el pixel cuadrado y su suma, la escalera. Es el punto final rojo, las viñetas `▪` de los kickers (con sombra dura de 1 `u`), las esquinas en escalera del retrato y de los thumbnails, las sombras duras del cartel, del botón y del toast, todas las animaciones en `steps()` (hiladas, tapa de thumbnails, títulos de notas, sello) y los bordes escalonados.

### Cada borde de sección

| Borde | Cómo |
|---|---|
| Hero → Sobre mí | Una **escalera de 6 escalones** que sube a la derecha (`clip-path` con `--rise`). Con el scroll se **levanta por escalones** (`animation-timeline: view()`, `steps(6)`). Arriba del último escalón hay una viga roja, y en el cuarto escalón un laburante sentado. Asoma abajo del hero (`min-height: 100svh − 2.5 escalones`) y te invita a bajar. |
| Sobre mí → Proyectos | La **palabra-borde `PROYECTOS_`** (31 vw, `wght 1000`), partida en dos capas recortadas al 50 %, así se lee continua cruzando del oscuro al claro. Con el scroll se comprime de `wdth 151` a `40` mientras se corre. Si tocás una letra, se hunde una hilada. |
| Proyectos → Notas | Una **escalera que baja**, con la viga ya en el último escalón y un **laburante que baja la escalera con tu scroll**: un timeline con nombre (`--bajada`) mueve su posición escalón por escalón y alterna `walkA/walkB`. |
| Notas → Escribime | La palabra-borde `ESCRIBIME_`, igual que la de Proyectos. |
| Escribime → Footer | La **vereda** (baldosas vainilla) con un cordón de 2 `u`. Un laburante toma mate sentado en el cordón y una de las baldosas está floja. |

## Notas por sección

- **Hero**: hora real de Buenos Aires (`Intl`, `--:--` en el server), nombre real en `h1` (sr-only) con la versión visual `aria-hidden`, readout de specimen, frase, índice de secciones con `_` y la nota ¹. El "tocalas" de la nota es un `<button>` que tira una letra al azar, así el gag también anda con teclado.
- **Sobre mí** ("Quién dirige la obra_"): la idea de director de obra con una cuadrilla es literalmente cómo se hizo el sitio (prompts + agentes). Hay un retrato en esquinas escalonadas, cuatro párrafos en voseo y un **cartel de obra** con tabla de specimen (Oficio / Experiencia / Base / Formación / Materiales / Herramientas / Disponible). No hay ningún dato inventado.
- **Proyectos**: los 7 proyectos van como lista de specimen. Cada nombre está en su propia **instancia**:
  - NZ: Black Extended (1000/140)
  - The Box: Heavy Condensed (900/55)
  - Portal: Medium Wide (520/128)
  - Tom: Thin Extended (140/151)
  - Tailor AI: Light Compressed (300/40), entallado
  - Nuestros Planes: Book Semi-Wide (380/112)
  - Moreno: Hairline Compressed (100/25), todavía estructura, con subrayado de replanteo azul

  Los thumbnails son `next/image` lazy con `sizes`. Una "tapa" del color del papel se retira por hiladas al entrar en pantalla. Moreno no tiene captura y por eso muestra un edificio isométrico a medio levantar, con andamio, sobre una grilla de replanteo y un laburante martillando arriba. Los links son los reales del sitio viejo.
- **Notas** ("Libro de obra_"): son tres borradores marcados como tales: "Borrador · sin fecha" y un sello EN OBRA. No hay fechas ni lecturas inventadas. Los títulos están en hairline comprimida porque todavía no están construidos. Con hover o foco la cuadrilla "los levanta un poco" (`steps(5)`) y los deja así.
- **Escribime**: el mail gigante es un `<button>` que copia al portapapeles (si falla, abre `mailto:`). El `_` se vuelve `.` y dice "Copiado". Abajo hay un **parte de pedido**: chips (Freelance / Remoto full-time / Sólo saludar) y un textarea. El submit arma un `mailto:` con asunto y cuerpo codificados, y un laburante cruza corriendo con el sobre. Sin JS, el `<form action="mailto:" method="get">` igual funciona. Al lado están GitHub, LinkedIn y Mail.
- **Footer**: vereda, laburante con mate, nombre, línea honesta ("Obra levantada a puro prompt con Claude Code…") y "Volver arriba_".

## Gags (cosas que no parecen clickeables y hacen algo)

1. **Letras de DANIEL**: se caen, giran y quedan tiradas en la vereda. Un laburante las levanta. Si la clickeás en el aire, hace malabares; si la clickeás en el piso, vuelve sola. Escape devuelve todas.
2. **NO MOLESTAR**: 7 toques de letras en 6 s. La cuadrilla clava el cartel amarillo y se sienta 7 s; si seguís tocando, el cartel tiembla y el descanso se alarga. Se anuncia por `aria-live`.
3. **Ajuste a martillazos** (solo, cada 3 a 7 s): un laburante camina hasta una letra y le sube el peso en tres golpes.
4. **Letras de las palabras-borde**: si las tocás, se hunden una hilada y vuelven.
5. **Retrato**: tocalo (es un `button` con `aria-pressed`) y aparece la **versión cuadrilla**, pixelada a 32 px con un casco amarillo en pixel art que se clava.
6. **Sello EN OBRA** de cada nota: se vuelve a sellar con otra inclinación.
7. **Mail**: se copia y el `_` pasa a `.`.
8. **Parte de pedido**: el laburante sale corriendo con la carta.

## Huevos de pascua (cómo dispararlos)

| # | Dónde | Cómo | Qué pasa |
|---|---|---|---|
| 1 | Hero | Escribir **`claude`** en cualquier parte. En touch, **mantener apretado el `_`** ~0,65 s | DANIEL se afina letra por letra y vuelve como **CLAUDE**. La cuadrilla festeja con los brazos arriba y aparece "Este sitio lo armé a puro prompt, con Claude Code. La cuadrilla también." A los 3,2 s vuelve a DANIEL. |
| 2 | Toda la página | **Konami** (↑↑↓↓←→←→BA). En touch, **tres toques rápidos sobre la hora** de la barra superior | **Turno noche**: toda la paleta anochece en 4 escalones, la vereda pasa a baldosa de noche, hay estrellas sobre el nombre y se prenden las **linternas de los cascos**, que siguen al puntero (o al último toque). El header dice "turno noche" y el anuncio da la hora real de BA. Se repite para volver. |
| 3 | Proyectos | Escribir **`plano`**, o tocar el **rollito de plano azul** al pie de Proyectos ("Los planos de la obra quedaron por acá") | **Modo plano**: la página entera se vuelve un plano azul con grilla, los títulos pasan a contorno (`-webkit-text-stroke`), los bloques aparecen con línea punteada, las fotos quedan fantasma y hay un rótulo "PLANO · ESC 1:1". `plano`, Escape o el rollito lo cierran. |
| 4 | Footer | Tocar la **6.ª baldosa** de la vereda del footer (es un `button`; con teclado se llega con Tab) | **Baldosa floja**: se mueve y te salpica (gotas pixel). "Te salpicó, como en cualquier vereda de Buenos Aires." La segunda y la tercera vez el texto cambia. |

## Presupuesto de performance

- **JS propio** (cliente): `hero.ts` + `page.ts` + parte de `sprites.ts` + el string de boot. Son ~37 KB fuente y ~12 KB gz sin minificar; minificado debería rondar 6–7 KB gz. Sin librerías y sin framer-motion. `Enhance` renderiza `null` y engancha comportamiento al HTML del server, así que la hidratación no re-renderiza nada. `Clock` es el único componente con estado.
- **Un solo loop rAF** (física + cuadrilla) que **duerme** cuando no hay letras en movimiento ni laburantes caminando o martillando. Las ganas de laburar llegan por `setTimeout` y, si el hero no se ve o la pestaña está oculta, se reprograman sin despertar el loop. El loop no corre con el hero fuera de pantalla (IntersectionObserver) ni con la pestaña oculta. El canvas sólo cubre del techo del hero a la vereda.
- **Fuente**: 1 woff2 (~60 KB) más la mono del sistema.
- **Imágenes**: `next/image` lazy (todas están bajo el pliegue), `sizes="(min-width:1024px) 46vw, calc(100vw - 32px)"` y calidad por defecto (75, la única permitida en Next 16). El retrato va con `sizes` de 360 px o 62 vw. La versión pixelada pide la variante de 32/64 px y sólo se descarga al tocar el retrato (está en `display:none` + lazy).
- **Cero imágenes de decoración**: sprites, baldosas (data-URI SVG de 8×8), casco y edificio isométrico son SVG generados en el server.
- **Scroll sin JS**: todas las animaciones ligadas al scroll son `animation-timeline: view()` en CSS (escaleras, palabras-borde, nombres de proyectos, tapas de thumbnails, laburante en la escalera), dentro de `@supports` y `prefers-reduced-motion: no-preference`. Sin soporte (Firefox) quedan en su estado final.

## Reduced motion

- El stage es `calm`: todo aparece con un fade de 500 ms, con las letras y la viga ya en su lugar (sin grúa).
- La cuadrilla queda quieta en sus puestos (no pasea ni ajusta) y el canvas sólo se dibuja cuando algo cambia.
- Tocar una letra la alterna entre negra y fina (sin vuelo) y el laburante más cercano hace un martillazo quieto.
- No hay animaciones de scroll: escaleras levantadas, palabras quietas y nombres en su instancia final.
- No hay transiciones de fuente, de `_` ni de sellos. La baldosa muestra las gotas quietas y se apagan.
- La noche y el plano cambian de golpe. Los conos siguen al puntero porque es movimiento que dirige el usuario.

## Mobile (360) vs desktop

- **360**:
  - `--u` 2 px: los laburantes miden 22×20 px y la palabra mide `max(4.25rem, min(24vw, 40svh))`, justificada con `wdth` (~78).
  - Todo va en una columna. Las palabras-borde desbordan a propósito y se leen enteras con el scroll.
  - Escaleras de 14 px por escalón.
  - Gags por tap. `claude` por long-press, noche por triple toque en la hora.
- **≥600**: `--u` 3 px, cartel con dos columnas.
- **≥1024**:
  - `--u` 4 px (5 px desde 1600) y escalones de 24 px.
  - Lente de ejes con el mouse (sólo `hover:hover` + `pointer:fine`) y los laburantes se dan vuelta para mirarte.
  - La bio va en 3 columnas (retrato, texto, cartel). Los proyectos van en grilla de 12, alternando thumbnail izquierda/derecha y el nombre alineado al lado del thumbnail. Notas en 3 columnas. Contacto en 2.

## Accesibilidad

- `h1` "Daniel Campuzano" (sr-only), `h2` por sección (las palabras-borde son `h2` con texto sr-only y capas `aria-hidden`), `h3` por proyecto y por nota.
- Skip link a "Sobre mí". `focus-visible` rojo en todo.
- Las notas son `li` con `tabIndex=0`, así el "levantar el título" también anda con foco.
- Los gags centrales tienen camino por teclado: "tocalas" es un botón, el retrato y la baldosa son botones, el rollito de plano tiene `aria-pressed`, y Escape, `claude`, `plano` y Konami funcionan con teclado.
- Los mensajes van a un toast `aria-live="polite"` que se limpia a los 6 s.
- Los grises se eligieron por contraste: `--mute-a` `#5b5550` sobre cal, `--mute-b` `#aaa298` sobre brea.

## Mapa de archivos

```
app/lab/specimen-obra/
  page.tsx               server: fuente, metadata, todo el markup, Stairs, BorderWord, script inline de boot
  so.module.css          todo el estilo: tokens @property, stages del loader, bordes, secciones, plano, noche, scroll
  BRIEF.md
  _components/
    boot.ts              script de boot como string (stages, sessionStorage, skip, espera de fuente)
    hero.ts              motor del hero: fit por wdth, lente, física, cuadrilla en canvas, NO MOLESTAR, huevo claude
    page.ts              delegación de toda la página: teclas (claude/plano/Konami/Escape), noche, plano, copiar, parte, baldosa, sellos, retrato
    Enhance.tsx          "use client": monta page.ts (renderiza null)
    Clock.tsx            hora real de BA (useSyncExternalStore)
    Sprite.tsx           laburante en SVG servido (frames alternables por CSS)
    sprites.ts           frames, paletas, baldosa data-URI, casco del retrato
    iso.ts               edificio isométrico de Moreno, rasterizado en el server
    data.ts              proyectos y notas (sólo hechos reales)
```

## Verificación, problemas conocidos y lo no probado

- `npx tsc --noEmit` y `npx eslint app/lab/specimen-obra` dan limpio. **No corrí `next dev` ni `next build`**, por la regla del repo.
- Armé un **arnés aparte** (fuera del repo): CSS module compilado con lightningcss, `page.tsx` renderizado con `renderToStaticMarkup` (con mocks de `next/font` y `next/image`), el motor transpilado a ESM y Chrome headless por CDP a 360 y 1440. Revisé:
  - el loader a 450 y 950 ms, la entrada repetida y reduced motion
  - todas las secciones scrolleadas
  - la caída y la recuperación de letras, NO MOLESTAR, `claude`, noche y plano
  - el retrato con casco, la baldosa y el corredor del parte

  Lo que **no** cubre el arnés:
  - la hidratación real de React (Clock, StrictMode doble montaje)
  - el optimizador de imágenes (el pixelado real del retrato)
  - el preflight exacto de Tailwind (usé una aproximación)
- **Bug encontrado y arreglado en el boot (heredado de Specimen)**: en `enter` y `calm`, `done()` llamaba a `off()` antes de que se asignara `ev` y tiraba excepción, así que el stage nunca llegaba a `done` y en visitas repetidas el hero no respondía. Acá está corregido. **`app/lab/specimen/_components/boot.ts` tiene el mismo bug** y no lo toqué, porque no es mi carpeta.
- El `skip` del boot ahora excluye las animaciones con scroll-timeline: si les aplicaba `playbackRate ×6`, se rompían.
- **La alineación de la vereda con la línea de base** sale de una medición JS (`span` de alto 0). El CSS arranca con un estimado (`-0.06em`), así que con la fuente fallback puede verse un salto de 1 a 3 px cuando carga Roboto Flex.
- **El `_` apoyado** usa `measureText('_').actualBoundingBoxDescent` y lo publica como `--usd` en el root. Hasta que corre el JS, se usa un estimado de `-0.16em`.
- La colisión de letras es la caja rotada, no el contorno del glifo. Las letras tiradas pueden "flotar" unos px (la caja de línea es más alta que la versal) y no chocan entre sí.
- Un laburante puede quedar dibujado encima de una letra tirada: el canvas va por delante a propósito, porque están "adelante" de la estructura.
- Con DPR fraccional, el art px del canvas puede diferir medio px del `--u` del DOM (igual que en La Obra).
- Firefox no tiene scroll-driven animations, así que bordes y nombres quedan estáticos en su estado final. Un Safari viejo sin `@property` cambia noche y plano de golpe.
- El script inline dentro de un server component: en navegación cliente, `hero.ts` lo reinyecta. En dev, React podría loguear un warning por el `<script>`. Es inofensivo.
- `navigator.clipboard` necesita contexto seguro. En `http://` de una IP local cae al `mailto:`.
