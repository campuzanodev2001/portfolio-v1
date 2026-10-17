# 02 — La Obra · brief

## Concepto

El sitio es una obra en construcción a la vista, y la mantiene una cuadrilla de cinco laburantes en pixel art: casco, ropa de grafa azul, chaleco reflectivo. Son una cuadrilla de verdad y no "IA construyendo tu web": tienen jefe (casco blanco), se cansan y se ofenden. El nombre de Daniel es un edificio de ladrillos sobre pilotes, con un andamio encima de "ZANO". La cuadrilla anda por una vereda de baldosas vainilla de 9 panes, como la de cualquier cuadra porteña. Los datos van en un **cartel de obra** como los que hay en Buenos Aires (Obra / Dirección / Rubro / Materiales…), así la información real tiene un formato que sale del concepto y no de una plantilla. El referente formal es Lemmings: personajes chiquitos sobre una estructura enorme, escaleras de ladrillos y diagonales que en pixel son escalones.

## Secuencia loader → hero (primera visita de la sesión)

El script inline pone `data-boot="build"` antes de pintar. Los tiempos cuentan desde que arranca el motor, o sea desde la hidratación.

| ms | qué pasa |
|---|---|
| 0 | SSR: se ven los **puntos de replanteo** azules del nombre (SVG servido) y arriba a la derecha dice "Tocá para saltear". La cuadrilla ya está en la vereda y el del andamio martilla. |
| 80 → 980 | Los tres de la vereda **tiran ladrillos para arriba** (el pasamanos de ladrillos de las obras de acá). 160 bloques en escalera: de abajo a la izquierda hacia arriba a la derecha, con orden `col + filaDesdeAbajo·2.2`. Cada bloque vuela 260 ms en parábola hasta su lugar. |
| 1000 (CSS) | El lede se revela con un barrido en 8 escalones (`clip-path` + `steps(8)`). |
| 1150 (CSS) | El cartel de obra "se clava": cae 14u en 4 escalones. |
| ~1260 | Cae el último ladrillo. Se escribe `data-phase="done"` y `sessionStorage['lab-la-obra-booted']="1"`. El loader ya es el hero: no hay corte ni fundido, el nombre construido es el título. |

- **Saltear**: cualquier click, tap o tecla durante la construcción pone todo en su lugar al instante (`data-phase="skipped"` corta las animaciones CSS).
- **Entrada corta** (misma sesión, ya booteado): el nombre ya está construido y la cuadrilla **entra caminando** desde los bordes hasta sus puestos (~700 ms). El texto se revela a los 80 ms.
- **JS que llega tarde** (3G): si el motor arranca más de 2 s después del parse del HTML (`data-t0`), no hay loader y se pasa directo a la entrada corta. Si el JS no llega nunca, el SVG muestra el nombre sólido a los 2,4 s (animación CSS de fallback). Nadie espera a la cuadrilla.

## Paleta "Corralón", sprites y tipografía

- **Paleta** (sacada de un corralón y no de una consola): cal `#EFE7D6` de fondo, brea `#221B16` para la tinta, ladrillo `#C2512E` (con 3 hornadas: luz, cara y sombra), azul plano `#2B49C4` para los links y el replanteo, amarillo casco `#F2B21B`, grafa `#2F4FA2` para la ropa, hormigón `#9C958A` y baldosa vainilla `#D9CCB2`. De noche es índigo `#121630`. Evité a propósito NES y Game Boy.
- **Sprites**: todo procedural, desde arrays de strings en `_components/art.ts` (11×10, ancla en los pies). Los frames son idle, walkA, walkB, up (tirar o cargar), hamUp, hamDown y sit. Cada laburante tiene su casco y su tono de piel, y el espejado se hace en el dibujo. El nombre usa una tipografía de bloques propia de 5 filas con ancho variable (la M tiene 5, la I 3), y cada bloque mide 3×3 con luz arriba a la izquierda y sombra abajo a la derecha.
- **Escalado entero**: el motor dibuja en un canvas offscreen a resolución de "art px" y lo escala ×P (`P = round(u·dpr)`) con `imageSmoothingEnabled=false` + `image-rendering: pixelated`. `u` es entero: 2 px en mobile, hasta 6 en desktop. Se calcula como `floor(anchoStage/132)` y se publica como `--u`. Todo el CSS (bordes, sombras, escalones, el SVG del nombre y el barrio) se mide en `--u`, así DOM y canvas comparten el mismo pixel.
- **Fuentes** (2 familias vía `next/font/google`, subset latin, `display: swap`): **Jersey 10** para carteles y rótulos (condensada, parece pintada en chapa) y **Atkinson Hyperlegible** 400/700 para el texto corrido. Atkinson está diseñada para leerse sí o sí y tiene algo de señalética institucional, que le sienta a un cartel de obra.

## Formas recurrentes

1. **El bloque cuadrado**: los ladrillos del nombre, el cuadradito amarillo del header, los bullets del barrio, el cartel con sombra dura y el NO MOLESTAR.
2. **La escalera**: el orden de construcción del loader, las diagonales del andamio (Bresenham = escalones), el borde escalonado de la sección siguiente (`clip-path` en múltiplos de `--u`), los bordes 2:1 del barrio isométrico y todas las animaciones en `steps()`.

## El gag clickeable

- **Ladrillos del nombre** (no parecen clickeables y lo son): en desktop, al pasar el mouse el ladrillo "baila" 1 px y aparece el cursor pointer. Si lo clickeás o tocás, se suelta, rebota en la vereda y deja ver su punto de replanteo. El laburante libre más cercano camina hasta el ladrillo, se lo pone en la cabeza, va hasta debajo del hueco y **lo tira de vuelta a su lugar**.
- **Cartel de obra**: tocarlo (fuera de los links) lo tuerce (`rotate` en escalones). Viene el sereno (o el más cercano, si en desktop el cartel está en la vereda) y lo **endereza a martillazos**: cada golpe saca un escalón de inclinación.
- **NO MOLESTAR**: 7 roturas en 6 s y la cuadrilla se enoja. Clavan un cartel amarillo "NO MOLESTAR · volvemos en un toque" en la vereda, todos se sientan de brazos cruzados (también el del andamio) y durante 7 s ignoran todo. Si seguís clickeando, el cartel tiembla, y si seguís rompiendo el cartel de obra se alarga el descanso. Después lo sacan y arreglan lo que quedó. Se anuncia por `aria-live`.

## Easter egg: turno noche

- **Cómo**: Konami (↑↑↓↓←→←→BA) con teclado. En touch: deslizar ↑↑↓↓←→←→ y después dos toques. La sección de abajo lo insinúa ("Hay turno noche… el código de siempre").
- **Qué hace**: anochece en 4 escalones. Los colores están registrados con `@property`, así la paleta entera interpola junta. Salen estrellas fijas (esquivan los textos) y una luna. Se prenden las **linternas de los cascos** y, como mejora sobre la idea original, **la cuadrilla te sigue con la luz**: los conos apuntan al puntero (o al último toque) y el que está libre se da vuelta para alumbrarte. Vos sos el capataz. El header pasa a decir "Turno noche" y el anuncio accesible dice la hora real de Buenos Aires. Se repite el código para volver al día.

## Presupuesto de performance

- **JS propio**: ~43 KB sin minificar y ~12 KB gz con comentarios (motor, dibujo, datos, Obra, Clock). Minificado debería quedar en ~6 a 7 KB gz. No uso Framer Motion ni ninguna librería: es un loop de canvas de ~600 líneas.
- **Cero imágenes**: el nombre y el barrio son SVG generados en el server con `shape-rendering="crispEdges"` y paths agrupados por color. El barrio isométrico se rasteriza en el server (`iso.ts`) y no manda nada de JS. Los sprites salen de strings.
- **Fuentes**: 2 familias, latin, swap, self-hosted por next/font.
- **Render**: el estático (losa, pilotes, andamio, vereda) se cachea en un canvas aparte y solo se redibuja con resize o al cambiar de día a noche. El loop se pausa si el hero no está en pantalla (IntersectionObserver) o si la pestaña está oculta. En modo calmo solo dibuja cuando hay algo que dibujar.
- **Evitado a propósito**: WebGL, video, imágenes raster, librerías de animación, el custom cursor y cualquier "dato" decorativo inventado. La hora es real (`Intl`, `America/Argentina/Buenos_Aires`). En el server se muestra `--:--` porque el server no sabe tu hora.

## Reduced motion (`prefers-reduced-motion: reduce`)

Hay `data-boot="calm"`: el nombre aparece construido, sin loader y sin entrada. Los laburantes quedan quietos en sus puestos (no pasean ni martillan solos). Las animaciones y transiciones CSS se cortan. El gag sigue andando pero sin movimiento: el ladrillo tocado se vuelve replanteo por 650 ms y el laburante más cercano queda en pose de martillazo. El cartel no se tuerce. El NO MOLESTAR aparece sin animación. El turno noche cambia de golpe y los conos siguen al puntero, porque es movimiento que dirige el usuario. El loop solo corre mientras hay algo pendiente.

## Mobile vs desktop

- **Mobile (360)**: `u=2`, así que el nombre mide 264 px y los laburantes 14×20 px. El orden es header, escenario (nombre, andamio y vereda), lede y cartel de obra apoyado sobre la meseta de la sección siguiente. El sereno vive al lado del cartel, en ese "segundo piso", y tres laburantes viven en la vereda. Las filas del cartel se apilan (rótulo arriba). El Konami se hace por swipe y el barrio isométrico scrollea en horizontal.
- **Desktop (≥1024)**: grid de 2 columnas. El lede va arriba, el escenario abajo a la izquierda (`u` hasta 6, el nombre hasta 792 px) y el cartel a la derecha **clavado en la misma vereda**: el sereno y la cuadrilla comparten el piso y cualquiera puede ir a arreglarlo. Hay hover en los ladrillos (cursor y bailecito), y de noche la linterna sigue al mouse en vivo.

## Mapa de archivos

```
app/lab/la-obra/
  layout.tsx            fuentes (Jersey 10 + Atkinson) y metadata
  page.tsx              server: markup, script de boot, SVG del nombre, borde escalonado, stub del barrio
  obra.module.css       todo el estilo; --u, paleta día/noche con @property, entradas en steps()
  BRIEF.md
  _components/
    art.ts              geometría del escenario, tipografía de bloques, paletas, sprites, cuadrilla
    draw.ts             dibujo puro (bloque, replanteo, escenario estático, cielo, laburante, linterna)
    engine.ts           motor: layout, loader, física de ladrillos, IA de la cuadrilla, gag, Konami, render
    iso.ts              rasterizador isométrico server-side del barrio (7 proyectos reales)
    Obra.tsx            client: canvas + cartel NO MOLESTAR + aria-live
    Clock.tsx           client: hora real de BA (useSyncExternalStore)
    time.ts             formateo de la hora
```

## Próximas secciones (si gana esta)

- **Bio**: la "casilla del capataz", un obrador con una ventanita donde está el retrato `/daniel.jpg`, procesado a 2 o 3 tonos de la paleta con dithering ordenado (canvas). El texto va en una libreta de obra (Atkinson). Las formaciones (Técnico en Informática) y los años van como "certificados" clavados en la pared.
- **Proyectos = el barrio**: es lo que adelanta el stub. Cada proyecto es un edificio isométrico con altura según escala o complejidad. Al hover se prenden sus ventanas, y al click la cámara entra por la puerta a una ficha (stack, rol y link real). Moreno Herramientas aparece en obra con andamio, y la cuadrilla trabaja ahí de verdad: es el WIP. The Box es un cubo perfecto. Nuestros Planes podría ser una casita para dos.
- **Blog**: un "libro de obra" con entradas fechadas como partes diarios.
- **Contacto = el correo**: un edificio del correo. Escribir el mail hace que un laburante lleve la carta caminando al buzón. El submit es un `mailto` o un form real, nunca un fake "enviado".
- **Bordes de sección**: escalones con `clip-path` en `--u`, como el del stub. Los entre secciones pueden alternar el lado de la escalera, y algunos llevar andamio montado sobre el borde (SVG en `--u`) con un laburante que se pasa de una sección a otra cuando scrolleás.

## Problemas conocidos / no probado

- **No corrí `next dev` ni `next build`**, por la regla del repo. Sí verifiqué el render con un arnés aparte: el markup del page en `renderToStaticMarkup`, el motor compilado y Chrome headless a 360, 768, 1024 y 1440. Revisé día, noche, loader a medio camino, entrada, ladrillos sueltos, cartel martillado y NO MOLESTAR. En ese arnés **no hubo hidratación de React**, así que el reloj y la limpieza de efectos no se probaron en vivo, y las transiciones CSS en tiempo virtual no se pueden juzgar.
- `tsc --noEmit` y `eslint app/lab/la-obra` dan limpio.
- El script inline de boot va dentro del page. En una navegación cliente (por ejemplo desde `/lab` con `<Link>`) React no lo ejecuta y puede tirar un warning de dev por `<script>` renderizado en el cliente. Es inofensivo: el motor decide el modo igual. Si molesta, se mueve a un layout o se reemplaza por `next/script`.
- El orden del loader está pensado para ~1,3 s desde la hidratación. En una navegación con hard reload y JS lento, el lede (con delay CSS desde el paint) puede aparecer antes de que terminen de caer los ladrillos. Es intencional: el texto nunca espera al JS.
- La interpolación del anochecer usa `@property`. En un navegador sin soporte, el cambio es instantáneo, lo cual está bien.
- El Konami táctil compite con el scroll vertical: los swipes ↑↓ scrollean la página igual. Funciona, pero hay que hacerlo cerca del hero.
- Con un DPR fraccional (Android 2.625) el art px es `round(u·dpr)/dpr` y puede diferir medio px CSS del `--u` del DOM. No se nota, pero el canvas y el SVG de fallback no calzan al píxel. Por eso el SVG se oculta cuando arranca el canvas.
- Clickear y arrastrar para seleccionar texto del cartel también lo tuerce (el click llega igual).
