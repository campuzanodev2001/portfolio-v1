# Clawd — brief (solo hero)

**Concepto.** Clawd, la mascota de píxeles de Claude Code, es el par de IA de Daniel. En un loop infinito arma *esta misma portada* en miniatura: Daniel escribe la indicación en una terminal ("armá el hero"), Clawd la ejecuta. Genera cada pieza sobre su cabeza, la carga y la tira a su lugar, conecta el CTA, festeja de más, golpea la página y el título se cae. Daniel pide "alineá el título" y Clawd lo selecciona y lo endereza. "deploy": la página terminada se va por una cinta y entra una en blanco. Es la frase de los HECHOS hecha escena: *la IA escribe el código, él decide la arquitectura*.

Homenaje de fan: Clawd está dibujado a mano, píxel por píxel (no es un asset oficial). No aparecen logos ni wordmarks de Anthropic, y no se sugiere ningún respaldo. Un caption chico lo aclara.

## Coreografía (T = 16 s)

| s | Clawd | Página / prompt | h1 real |
|---|---|---|---|
| 0–0.4 | quieto en x=64, respira, parpadea | página en blanco con los huecos punteados | — |
| 0.3–1.3 | mira hacia abajo, al prompt | `daniel › armá el hero` (se tipea) | — |
| 1.3–2.05 | asiente y camina a la izquierda | | |
| 2.05–2.65 | brazos arriba, mira hacia arriba | el título **se genera** sobre su cabeza (dither + borde que brilla) | |
| 2.65–3.25 | lo carga, pesa (squash) y lo lleva al centro | | |
| 3.25–4.05 | anticipación → lo tira con un saltito | el título vuela, encaja con rebote y polvo | **brillo** que lo cruza (3.85) |
| 4.05–6.0 | va a la derecha, genera el subtítulo, vuelve y lo tira | subtítulo gris + tramo coral (la IA) | |
| 6.0–6.95 | genera el botón (liviano) y lo tira | | |
| 6.95–7.35 | levanta un brazo: chispa hacia arriba | el botón se **conecta**: se enciende, aparece el sobre, halo | el CTA real hace un *ping* |
| 7.2 | | ✓ en el prompt | |
| 7.35–8.4 | ojos felices, dos saltitos, salto grande | | |
| 8.4–8.75 | aterrizaje fuerte (squash), polvo | la página tiembla; **la punta derecha del título se cae** | se inclina 0.6° |
| 8.6–9.6 | "!" y ojos abiertos; gota de sudor | | |
| 9.1–10.0 | mira el prompt | `daniel › alineá el título` | |
| 10.0–11.3 | asiente, brazos arriba | selección con *marching ants* y handles; el título vuelve a nivel con overshoot | vuelve con rebote (11.2) |
| 11.3–12.4 | se seca la frente, ojos felices | ✓, la selección parpadea y se va | |
| 12.0–12.8 | lee | `daniel › deploy` | |
| 12.9–14.6 | camina sobre la cinta | la página terminada sale por la izquierda; entra una en blanco | |
| 14.6–16 | quieto, respira, parpadea | ✓ y se borra el prompt | — |

## Cómo es seamless

- Todo el canvas es una **función pura del tiempo**: `draw(ctx, t)` con `t ∈ [0,16)`. No hay estado acumulado (ni física, ni partículas con memoria), así que no hay deriva.
- El último estado **es** el primero: Clawd empieza y termina en x=64; la página que entra con la cinta es la misma página en blanco del frame 0; el prompt queda vacío.
- La cinta se mueve 136 px, múltiplo de 8 (el patrón del piso), así que las marcas del piso también coinciden.
- Todos los ciclos internos dividen 16 s: respiración 1.6 s, patas 1/8 s, marching ants 0.4 s. El "ruido" del dither es un hash determinista por píxel.
- Verificado en Node con un ctx falso: el frame en t=15.9999 difiere del de t=0 solo en el paso normal de la respiración (el mismo cambio que pasa cada 0.8 s).
- El reloj avanza con `dt` acotado a 100 ms: al volver de una pausa sigue donde estaba, sin saltar.

## Animación del nombre (sutil)

`<h1>` de texto real, sin spans por letra. Tres capas, todas en CSS:
1. **Respiración**: sube 0.04em y baja, una vez cada 16 s (un ciclo por loop).
2. **Brillo**: un gradiente crema→coral→blanco con `background-clip: text` más ancho que la caja; solo se ve el tramo crema salvo durante el barrido de 1.3 s. Se dispara cuando el mini-título encaja en la escena.
3. **Golpe y arreglo**: cuando Clawd golpea la página, el h1 se inclina 0.6° (pivote a la izquierda, como el mini); cuando lo endereza, vuelve con un rebote (`cubic-bezier` con overshoot).

La sincronía la da `data-beat` en `<main>`, que el canvas actualiza solo cuando cambia (4 escrituras al DOM por ciclo).

## Reduced motion

Con `prefers-reduced-motion: reduce` no corre el rAF: se dibuja **un solo frame** (t=11.8: hero completo y recién arreglado, Clawd contento) y el prompt fijo `armá el hero ✓`. Sin respiración, brillo, inclinación, ping ni caret. Si la preferencia cambia en vivo, se respeta sin recargar.

## Performance

- Cero librerías y cero imágenes. Un canvas de 128×84 (10.752 píxeles lógicos) que el CSS escala por un **entero** de píxeles de pantalla (`image-rendering: pixelated`): nítido en cualquier DPR, y redibujarlo cuesta casi nada.
- Bloques pre-renderizados en canvases offscreen (`drawImage`); el dibujo píxel a píxel solo durante la generación (menos de 1 s por ciclo).
- Un solo `requestAnimationFrame`, pausado con `visibilitychange` (pestaña oculta) e `IntersectionObserver` (hero fuera de pantalla).
- El texto del hero se renderiza en el servidor; el canvas es una isla cliente chica. El marco reserva el alto con `aspect-ratio`: no hay CLS.
- Fuentes: Space Grotesk variable + JetBrains Mono 400/500, subset latin, `display: swap`.

## Easter eggs

- **Click / tap / Enter sobre Clawd** (es un `<button>` "Saludar a Clawd"): salta, ojos felices y un corazón que sube. No toca el reloj del loop. Con reduced motion: corazón quieto durante 1 s.
- **Hover o foco en "Contactame"**: Clawd mira y señala el botón (calcula hacia dónde está: abajo en móvil, a la izquierda en desktop).

## Accesibilidad

- `h1` de texto real; el canvas es `aria-hidden` con un `figcaption` para lectores de pantalla que describe la escena.
- Foco visible en coral claro en CTA, links y Clawd. Contrastes: texto 16:1, secundario ~8:1, coral ~5.9:1.
- `forced-colors`: el h1 vuelve a `CanvasText` (sin `background-clip`).

## Archivos

- `layout.tsx` fuentes + metadata · `page.tsx` hero (server) · `clawd.css` estilo y sincronía del h1
- `_components/engine.ts` motor: timeline, sprites, fuente 4×5, dibujo (puro, sin React)
- `_components/ClawdStage.tsx` isla cliente: canvas, rAF, pausas, escala entera, prompt, easter eggs

## Riesgos

- En pantallas muy chicas con DPR 1 la escala entera puede dejar un borde del color del marco a los costados del canvas (es el mismo color, casi no se nota).
- `background-clip: text`: el color transparente va detrás de `@supports`; sin soporte el h1 queda crema y sin brillo. Igual conviene mirarlo en un iPhone real.
- Con 16 s de loop, el chiste del golpe llega a los 8 s: si alguien mira solo el primer segundo ve "solo" una construcción. Podría acortarse a 12 s si se siente lento.

---

# Página completa (2026-10-26)

Copy: **"Criterio"** (`docs/portfolio-v3/copy/04-criterio.md`). Datos en `_components/data.ts`; lo que falta se ve en la página como `pendiente: …` (no se inventa).

**Formas recurrentes**
1. **El prompt**: cada sección arranca con una indicación de Daniel en la terminal del hero (`daniel › mostrá los proyectos`), que se tipea al entrar en pantalla y termina con ✓.
2. **El piso del canvas**: la línea con marcas cada 8 px separa las secciones.

**Clawd por sección** (`_components/Pixel.tsx`, SVG 32×20 con la geometría del sprite; animación CSS en `steps()`):
| Sección | Pose |
|---|---|
| Sobre mí | lee una hoja |
| Proyectos | lupa; en cada tarjeta, lupa en "Qué decidí yo" y notebook en "Qué hace la IA" |
| Hobbies | bandeja de DJ con auriculares (cabecea a 120 BPM) · vóley con la pelota |
| Notas | escribe en una notebook |
| Contacto | levanta un sobre |

**Proyectos interactivos** (`Projects.tsx`): filtros con conteo (Todos · Producto · Agentes de IA · En curso); en cada tarjeta un switch **Qué decidí yo / Qué hace la IA** (la perilla se desliza y Clawd cambia de tarea); "Ver más" despliega la descripción.

**Easter eggs**: tocar cualquier Clawd → saltito + corazón · escribir `clawd` → todos festejan · mensaje en consola · "Copiar mail".

**Pendiente de Daniel**: Inbox Radar, estado del pipeline laboral, qué hace la IA en leads, fotos de DJ y vóley, confirmar Barcelona.

## Secciones v2: un estilo por sección, una sola historia

Cada sección tiene entrada, scroll y salida, y la salida de una es la entrada de la siguiente. Clawd las recorre todas.

| Sección | Estilo | Entrada | Scroll | Salida → |
|---|---|---|---|---|
| Sobre mí | `git log --reverse` | el piso del hero se pone de pie: riel con marcas cada 8 px | Clawd baja sticky por el riel; cada commit que pasa se asienta (capucha en el de Kali, C→JS en Lenguajes); valores como `git config`, TODOs | la rama `campuzano.studio` dobla en horizontal… |
| Proyectos | las vías | …y se vuelve la vía: se tienden los durmientes | estaciones con swipe; la aguja es la decisión de Daniel; recién ahí entra el vagón y descarga la carga de la IA | la vía se vuelve la onda de un track… |
| Fuera del código | Lado B | …que entra al disco | pineado: el vinilo sale y gira, el sobre se da vuelta (DJ → vóley) | el sobre se aplana en una barra crema… |
| Notas | la imprenta | …que es la platina: baja y estampa el título | cada renglón se imprime de a píxel; Clawd tira de la palanca | Clawd descuelga la lámpara… |
| Contacto + footer | apagá las luces | …y entra con ella a la sala que se oscurece | baja por el cable (el riel de Sobre mí, eléctrico) y prende cada fila; cuelga la lámpara sobre el CTA | la pantalla se apaga como un CRT y Clawd se duerme sobre el punto; si subís, se despierta |

**Motor común (`Enhance.tsx`).** `[data-scrub]` recibe `--p` (0→1) con un solo rAF por scroll: según la línea de lectura (`data-scrub` = fracción del viewport, `data-span` para un recorrido fijo) o el recorrido pineado (`data-pin`). Sus `[data-step]` que cruzaron la línea quedan con `data-on`; el último cruzado es `data-at` y el anterior `data-prev`. Mientras se scrollea, `data-scrolling` hace caminar a los Clawd `.is-walker`. Todo lo demás es CSS.

**Reduced motion.** Sin pineados ni viajes: el riel ya recorrido, las vías tendidas y descargadas, los dos lados del disco uno al lado del otro, las notas impresas y la pantalla prendida con Clawd dormido.
