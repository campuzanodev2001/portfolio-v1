# Que entre (Ladrillo B): kinetic × neobrutalismo, página completa

Ruta: `/lab/ladrillo-b`. Loader, hero, sobre mí, proyectos, contacto y footer. No hay sección de experiencia porque no hay datos reales de trabajos en relación de dependencia en el repo, y no quise inventarlos.

## Concepto: «que entre»

**La caja no cede. La letra se las rebusca.** El neobrutalismo es la regla: cajas de tinta de 3 px, sombra dura, grilla a la vista, sellos. No se mueven, no se redondean y no negocian. La tipografía cinética es el rebusque: Roboto Serif variable se comprime (`wdth`), cambia de peso (`wght`), engorda sin cambiar de ancho (`GRAD`), se justifica con letter-spacing y, si ya no hay forma, se parte en dos. Siempre termina entrando.

Es la esencia de Daniel en una sola ficción: el hermano mayor al que le daban el problema con la caja que había, y se las ingeniaba. Por eso la tipografía es el material dominante y el marco sólo la contiene y choca con ella:

- Cada palabra grande es un `[data-fit]`: el JS mide la caja y resuelve el `wdth` exacto (50–150). Si a 150 le sobra lugar, justifica con letter-spacing; si a 50 no entra, recién ahí achica el cuerpo. Se mide en lote: 4 layouts para unas cien palabras.
- Las palabras **entran chocando**: arrancan a `wdth 150` (más anchas que su caja, la pasan de largo) y se aprietan hasta entrar. En el loader, con el scroll en los títulos y en los proyectos (`animation-timeline: view()`, con fallback por IntersectionObserver), y cuando tipeás «entra».
- **Lente**: con el puntero cerca, cada letra sube o baja de `wght`. Como el peso cambia el ancho, el resto de la palabra se reacomoda cuadro a cuadro para que siga entrando justo.
- **Velocidad de scroll**: el nombre se tuerce (skew) y engorda por `GRAD`, que es el único eje que no cambia el ancho, así nunca deja de entrar. Las hiladas de ladrillos se corren y las cintas aceleran o cambian de sentido.
- **Moreno Herramientas**, que está en obra de verdad, queda en `--sq: .5`: su nombre todavía no entra en la caja, y tiene la cinta de peligro «todavía no entra».

### Las dos formas

1. **El ladrillo**: rectángulo con borde de tinta y sombra dura. Es cada caja de la página (nombre, títulos, ficha, proyectos, botones, mail) y las **hiladas**, el borde entre secciones: dos hileras de ladrillos de anchos distintos, cada uno con una palabra del stack o de la vida de Daniel que entra como puede (unas re-apretadas, otras estiradas). Se corren con el scroll, en sentidos opuestos.
2. **La cuña**: el triángulo a 45°. Es la cinta de peligro (`--hazard`) arriba de cada hilada y en el pie, la cuña que asoma a la derecha del nombre cuando no entra, las esquinas cortadas de los sellos, el ▶ de las etiquetas y las cintas del hero.

## Qué se tomó de cada boceto y qué se cortó

| De `bocetos/kinetic` | Por qué |
|---|---|
| Roboto Serif con `wght/wdth/opsz/GRAD` y `@property` para animar ejes | Es el material. Se carga con `next/font` (sin itálica) |
| `fitJusto`: resolver `wdth` para que una palabra llene su columna | Es el corazón del concepto, generalizado a toda la página |
| Motor de velocidad de scroll (`S.sv` suavizado) y `GRAD` según velocidad | Nombre que se tuerce, hiladas y cintas |
| Letras que reaccionan al puntero por distancia (el «mejor» del CTA) | Lente del nombre, títulos y proyectos, con reajuste en vivo |
| Pie de página con el peso ondulando según el scroll | Igual, pero reajustando el ancho en vivo para que no se salga |
| Palabras que entran con `wdth` bajo → final (calibración) | Ahora es «entra a 150, choca y se aprieta» |
| Paleta, `--g` 18/40/64, `--ease`, `.sr`, `.skip`, reduced-motion | Tal cual |
| **Cortado:** GSAP + ScrollTrigger (todo es CSS + ~1 rAF que duerme), el pin con zoom por el punto, los mockups de teléfono, textos sobre path SVG, rubros rotando, pricing, FAQ, testimonios | Peso en 3G, y no es contenido de un portfolio personal |

| De `bocetos/neo-brutalismo` | Por qué |
|---|---|
| `--b: 3px`, `--sh` 6/7 px, sombra dura que se hunde al apretar | Es el marco: botones, cajas, ladrillos |
| Grillas de fondo `--grid`, `--grid-ink`, `--grid-gold` y `--hazard` | Fondo de cada sección y la cuña |
| Cintas de obra cruzadas con marquee | Al pie del hero, ahora en serif con pesos alternados |
| `.kick` (etiqueta rotada), `.sticker`, sellos | Etiquetas de sección y sellos «no entra» / «entró» |
| Ventana con barra y URL (`.win`) | Marco de cada captura de proyecto |
| Secciones paper / ink / gold alternadas | Sobre mí, proyectos, contacto |
| **Cortado:** Bespoke Serif (una sola serif: la variable), los bordes SVG generativos (castillo, teclas, cremallera…): quedó un solo borde, la hilada, para que sea reconocible; la máquina que arma webs, las ventanas arrastrables, el calendario, todo lo de ventas | Foco y peso |

## Loader → hero

Lo maneja CSS con `data-stage` en `#lb`. Un script inline (`_components/boot.ts`) decide el stage mientras se parsea el HTML. Clave: `sessionStorage['lab-ladrillo-b-booted']`. No es una pantalla aparte: la caja del loader ES la caja del nombre.

| ms (desde `run`) | Qué pasa |
|---|---|
| −200…0 | `boot`: grilla, la caja vacía (sin sombra) con un cursor dorado titilando. Se espera la fuente como mucho 200 ms. |
| 0 → 600 | D·A·N·I·E·L entran desde la derecha, escalonadas 45 ms, a `wdth 150 / wght 900`: no entran, pasan el borde de la caja. |
| 340 → 920 | Sello «NO ENTRA» y la cuña de peligro asoman a la derecha; la caja recibe el golpe (`lb-bump`). |
| 420 → 1240 | Las letras se aprietan de derecha a izquierda (`--sq` 1 → 0 con resorte) y bajan a `wght 800`. |
| 560 → 1020 | Entra la segunda caja (tinta) con CAMPUZANO; sus letras se aprietan escalonadas 28 ms. |
| 600 → 1255 | Barra, sticker, frase, botones, «achicá la caja» y cintas, escalonados 55 ms. |
| 940 → 1220 | La caja «fragua»: le aparece la sombra dura. Cae el sello «ENTRÓ». |
| 1300 | `done`: el JS mide y ajusta el `wdth` exacto (0,55 s con resorte). El nombre empieza a respirar por `GRAD`. |

- **Visita repetida** (`enter`, 0,7 s): fundido corto y las letras se aprietan una vez, sin choque.
- **Movimiento reducido** (`calm`, 0,3 s): todo aparece armado, sin lente, sin scroll cinético, sin cintas. Los ajustes se siguen calculando (estáticos) y los juguetes funcionan sin animación.
- **Saltear**: cualquier tecla, toque o rueda acelera todas las animaciones finitas x6 y cierra en ≤ 320 ms.
- **Sin JS**: queda armado (`<noscript>`), con un cuerpo estimado por cantidad de letras que ya casi entra.

## Gatillos, huevos y cosas que se tocan

| Dónde | Qué |
|---|---|
| Hero, botón **«Achicá la caja»** (o tocar la caja) | La caja se cierra de golpe (100 → 78 → 58 → 40 → 26 %). El nombre choca («no entra», cuña, golpe) y recién después se aprieta. Al 40 % ya no entra en una línea y se parte en DANI/EL. Al 26 % «Ni así se rinde». Un toque más le devuelve el lugar. El readout muestra caja % y `wdth`. |
| Sello **«Entró»** | Es un botón: se vuelve a sellar con otra rotación. |
| Logo **DC** | Vuelve a calibrar el nombre (se aprieta otra vez). Al pasar el mouse, «Campuzano» va de `wdth 72 / wght 800` a `150 / 300`. |
| Puntero sobre cualquier palabra grande | Lente de `wght` con reajuste de ancho en vivo. |
| Scroll rápido | El nombre se tuerce y engorda; las hiladas se corren; las cintas aceleran y se dan vuelta al subir. Si vas muy rápido aparece el sello «¡Despacio, que no entra!» (como mucho cada 9 s). |
| Tipear **«caja»** | Rayos X: cada palabra muestra su caja punteada y su `wdth` real. «caja» otra vez lo apaga. |
| Tipear **«entra»** | Todas las palabras de la página vuelven a chocar y apretarse. |
| «rebuscársela» en la bio | Al pasar el mouse se estira de `wdth 70` a `150`. |
| Retrato | Tocalo: se aplasta (como la letra) y vuelve; el sello va cambiando («A mí no me achicás»…). |
| Pared de «de todo un poco» | Cada ladrillo se golpea (se hunde y pulsa `GRAD`). **El ladrillo flojo** («juegos», torcido y tambaleante al pasar el mouse): a los 3 toques se cae y deja el hueco con la cinta de peligro y un mensaje. |
| Chips de herramientas en Proyectos | Filtran: los proyectos que usan esa herramienta se levantan y el resto se apaga. Cuenta real. |
| Mail | Primer toque: se copia y la dirección se vuelve a apretar. Segundo toque (dentro de 6 s): abre el correo. |
| Consola | Un saludo con la pista de «caja». |
| Footer | Pista visible: «hay palabras que se tipean». El CAMPUZANO del pie ondula su peso con el scroll sin salirse de ancho. |

## Rendimiento y accesibilidad

- Una sola familia pesada (Roboto Serif variable, 4 ejes, latin, sin itálica) + JetBrains Mono sin preload. Cero librerías: un solo `requestAnimationFrame` que se duerme cuando no hay scroll, lente ni ola. Lectura y escritura de layout en lote por cuadro.
- Las capturas van con `next/image` (lazy, `sizes`). No se usó ninguna imagen que no estuviera en `public/`.
- Las letras partidas son `aria-hidden`; cada palabra tiene su texto entero para lectores de pantalla (o `aria-label` en los botones). Las hiladas son decorativas.
- `:focus-visible` dorado de 3 px (en tinta sobre la sección dorada). `overflow-x: clip` en el root: las palabras que no entran se salen de su caja pero nunca de la pantalla a 360 px.

## Pendiente

- No se verificó visualmente (sólo `tsc` y `eslint`, como se pidió). Lo primero a mirar: el tamaño estimado sin JS del nombre a 360 px, el corte DANI/EL a 40 % y que el fallback sin `animation-timeline` (Firefox/Safari viejos) no deje títulos apretados a medias.
- Roboto Serif con 4 ejes es el archivo más pesado de la página; si en 3G molesta, sacar `GRAD` (lo usan la respiración y la velocidad) es lo primero que se puede cortar.
