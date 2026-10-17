# 05 — Fileteado (fileteado porteño generativo)

Ruta: `/lab/fileteado`. Alcance: loader + hero + un stub abajo que muestra cómo serían los bordes de sección (guardas).

## Concepto

El hero es un letrero fileteado que se pinta delante tuyo. No hay pantalla de carga aparte: el "loader" es el marco saliendo de los esquineros, las volutas creciendo pincelada a pincelada y el nombre contorneado letra por letra, hasta que la pieza queda terminada y eso ya es el hero. Los ornamentos no son imágenes ni clip-art: los genera el código con una sola primitiva (una curva cuya curvatura crece hacia el final, rellenada con un ancho variable como un pincel de pelo largo) y después se espejan como manda el oficio. Cambian una vez por día, como si el fileteador pintara una pieza nueva cada mañana. Paleta y gestos tomados del filete real: fondo negro laca, esmaltes planos en tres tonos (sombra, base, luz), filete fino crema que acompaña a las volutas, rombos facetados ("piedras"), banderín celeste y blanco, frase en gótica y la firma del fileteador.

## Secuencia loader → hero (ms desde que se pinta el HTML)

Todo es CSS: arranca sin esperar JS ni la hidratación.

| ms | qué pasa |
|---|---|
| 0 | rombo del esquinero aparece (máscara circular que escala) |
| 60 → 740 | el doble filete del marco sale de los 4 esquineros hacia el centro de cada lado |
| 60 → 700 | voluta madre pintada por su máscara (trazo blanco que recorre la espina) |
| 250 → ~1050 | contorno crema del nombre, letra por letra (34 ms de desfase entre letras, 560 ms cada una) |
| 260 → 840 | hoja de acanto |
| 360 → 780 | firuletes finos alrededor de "Daniel" |
| 480 → 960 | contra-voluta |
| 560 → 1020 | volutas de los remates (crests) arriba y abajo |
| 600 → 1060 | remates y rombos laterales "saltan" (pop) cuando el marco se cierra |
| 780 → 1220 | "pintura" del nombre: relleno partido en dos tonos + calle negra + filete de luz (barrido de izquierda a derecha) |
| 820 → 1340 | perlas sobre el eje de simetría |
| 980 → 1420 | sombra proyectada bordó + el banderín se despliega desde el centro |
| 1080 → ~1450 | bajada, links, hora y firma suben (70 ms de desfase) |
| ~1450 | listo → `data-state="done"` + `sessionStorage['lab-fileteado-booted']="1"` |

- **Saltear:** cualquier `pointerdown` o tecla → `data-state="done"` (todas las animaciones de intro en `none`, estado final al instante).
- **Una vez por sesión:** un `<script>` en línea dentro del hero (corre antes de pintar) lee `sessionStorage` y, si ya se vio, pone `data-state="calm"`: fundidos escalonados de ~1 s, sin trazos. En navegación del lado del cliente lo hace `IntroController` al montar.
- La sesión se marca cuando la intro **termina o se saltea**, no al empezar (si te vas a la mitad, la volvés a ver).

## Paleta

| token | hex | uso |
|---|---|---|
| negro laca | `#0c0a09` (+ radial `#1c1411` y un reflejo diagonal al 3.5%) | fondo |
| crema | `#f3e6c8` / `#fff1d2` | texto, filetes finos, contornos |
| bermellón | `#7a1610 / #c9322a / #f2735a` | volutas, línea interior del marco |
| oro | `#94540f / #e0a02e / #ffd97e` | volutas, apellido |
| celeste | `#1f5a8c / #57a4dc / #bfe3fb` | volutas, banderín, nombre de pila |
| verde | `#15492b / #2c8650 / #8bd193` | hojas |

Cada esmalte tiene tres tonos planos (como el sintético a pincel), nada de degradés suaves. Los únicos "degradés" son los de las letras y son cortes duros a la mitad (truco de letrista: luz arriba, sombra abajo).

## Generación de ornamentos (`_components/geometry.ts`)

1. **Espina:** clotoide generalizada. Se integra un punto desde `(x0,y0)` con ángulo `a0`; la curvatura vale `k(s) = k0 + c·(s/L)^p`, con `c` calculado para acumular `turn` radianes de giro. Con `p` alto (5–5.6) la curva corre casi recta y enrosca toda al final: es la voluta en "C" del filete. 220 pasos de integración, punto medio.
2. **Pincelada:** se muestrea la espina (más denso hacia la punta, donde enrosca), se desplaza a cada lado por la normal según un perfil de ancho y se cierra el contorno con Catmull-Rom → Bézier. Voluta: cabeza redonda que engorda en el primer 16% y cola afinada `(1-u)^0.8`.
3. **Sombreado:** cada pieza se dibuja en 4 capas (sombra completa, base corrida al lado "iluminado", luz más angosta y un filete crema finito). La hoja usa el mismo esquema escalando el perfil lobulado, lo que deja las vetas escalonadas típicas del acanto.
4. **Hoja de acanto:** espina en "S" (curva suave + rulo en la punta) con lóbulos sólo del lado convexo: `bump = sin(π·f)^0.5·(0.5+0.5f)` sobre 3–4 lóbulos (asimétricos, apuntando a la punta).
5. **Media esquina:** voluta madre por el borde + hoja que nace de su pie hacia el centro + contra-voluta que brota de abajo de la madre y enrosca al revés + 3 perlas sobre la diagonal. La otra mitad es el reflejo sobre la diagonal (`matrix(0 1 1 0 0 0)`), y las 4 esquinas son la misma pieza espejada con `<use>`. En el ángulo, un rombo facetado.
6. **Semilla:** `hashStr("filete:" + fechaPorteña)` → mulberry32. Elige colores (madre ∈ oro/rojo/celeste, hoja ∈ verde/rojo, contra-voluta y piedra distintas) y varía largos, ángulos, anchos y cantidad de lóbulos dentro de rangos chicos y probados. La página tiene `revalidate = 3600`, así que el ornamento cambia una vez por día (hora de Buenos Aires).
7. **Animación:** cada pieza tiene una `<mask>` con un trazo blanco grueso sobre su espina (`pathLength=1`, `stroke-dasharray: 1 2`) que se anima de `dashoffset 1 → 0`. Las máscaras viven una sola vez en `<defs>` (no se clonan con `<use>`), así que agregar brotes después no re-dispara nada.

**Desvío respecto del pedido:** propuse "uno por visita"; lo hice "uno por día". Razones: el ornamento sale en el HTML (server-render, sin esperar JS), la intro es CSS puro y no hay riesgo de que el ornamento "salte" al hidratar. El azar por visita quedó en el gag (cada florecimiento es distinto) y en las frases.

## Tipografía (`layout.tsx`, `next/font/google`)

- **Fraunces** 400 y 900 (sólo esos dos pesos estáticos, latin, `swap`): romana "old style" blanda, con la panza de las letras de cartel de principios de siglo. A 900 y con contorno + calle + sombra queda como letra de letrista sin caer en western/Tuscan de cotillón (descarté Rye/Sancreek por eso). El 400 es el texto de lectura.
- **Grenze Gotisch** 600 (latin, `swap`): la gótica de las frases de colectivo, pero legible. Sólo para "Daniel", la firma, el título del stub y las frases del easter egg.
- La mezcla gótica chica + romana grande es la jerarquía de los letreros fileteados de verdad.
- Las capas del lettering (sombra, contorno, calle, relleno partido, filete de luz con clipPath sobre el propio texto) son SVG: no hay paths de glifos, es `<text>` real (`aria-hidden`; el `<h1>` tiene el nombre en texto visible sólo para lectores de pantalla).

## Formas recurrentes

- **Voluta/espiral:** esquineros, remates del marco, unidad de guarda, brotes del gag.
- **Rombo facetado ("piedra"):** ángulo de cada esquinero, centro de cada lado del marco, separadores de los links, remates del nombre de pila, centro de la unidad de guarda.

## El click que no debería existir

Los **esquineros** son botones (sin cursor de mano ni nada que lo delate; en desktop sólo brillan un poco al hover). Al tocar uno:
- brota un zarcillo o una hojita del lado de afuera de la voluta madre (forma al azar, lugar entre 5 fijos para que nunca se enreden), pintado con su máscara;
- como las cuatro esquinas son la misma pieza, **florecen las cuatro a la vez**: la simetría no se negocia;
- el esquinero tocado hace un pequeño resorte;
- al sexto toque "el fileteador poda": se borran los brotes y empieza de nuevo.

## Easter egg: la frase y la firma

Todo filete lleva la firma del fileteador. Abajo a la derecha del bloque dice **"fileteó D.C."**: tocala (o escribí **`filete`** en cualquier lado de la página) y aparece abajo una cinta celeste y blanca con una frase en gótica, firmada. La primera siempre es "Dios guarde a este deploy"; después sale al azar entre refranes adaptados ("Si tomás, no hagas force push", "Más vale commit en mano que cien en stash", "Despacito y por las ramas", "En casa de herrero, CSS con !important"…) y bendiciones combinadas ("San Cayetano proteja la rama main"). Cada toque, otra. `Esc` o la × la guardan. Para devs: un `console.info` invita a escribir "filete".

## Presupuesto de performance

- **Fuentes:** 2 familias, 3 archivos (Fraunces 400, Fraunces 900, Grenze 600), subset latin, `display: swap`, sin ejes variables extra (opsz/SOFT/WONK duplicaban el peso). Nada de la intro espera a las fuentes; el apellido arranca a trazarse a los 250 ms para darles margen.
- **JS propio:** ~26 KB sin minificar / ~9.5 KB gz (antes de minificar) entre Ornaments, geometría, controlador de intro, reloj y easter egg. Sin framer-motion, sin librerías.
- **HTML:** ~53 KB / ~20 KB gz (incluye CSS). El ornamento se define una vez en `<defs>` y se reutiliza con `<use>`: ~16 paths por media esquina, renderizados 8 veces sin repetir bytes.
- **Imágenes:** ninguna. Ni el retrato: no aportaba al concepto.
- **Evitado:** canvas/WebGL, filtros SVG (blur/turbulence) — caros en mobile y el filete es plano —, texturas de ruido, video.
- La guarda del stub se pinta al entrar en pantalla con CSS scroll-driven (`animation-timeline: view()`), cero JS; donde no hay soporte, aparece quieta.

## Reduced motion

`prefers-reduced-motion: reduce`: no hay trazos, ni crecimiento, ni pop, ni resorte, ni brillo que sigue al puntero. Todo aparece con fundidos escalonados de 900 ms (ornamentos → nombre → cinta → texto). Los brotes del gag aparecen ya pintados. El easter egg funciona igual, con fundido.

## Mobile vs desktop

- Diseñado a 360 px: esquineros de `clamp(112px, 35vmin, 260px)`, marco a `clamp(10px, 2.6vmin, 28px)` del borde, apellido escalado al ancho del bloque, links que pueden partirse en dos líneas.
- Desktop: esquineros grandes (hasta 260 px), remates más anchos, y un **brillo de laca** que sigue al puntero sobre las letras (sólo `hover: hover` + `pointer: fine`, recortado al relleno de las letras).
- Pantallas desktop bajas (≤640 px de alto): esquineros más chicos.

## Mapa de archivos

```
app/lab/fileteado/
  layout.tsx                 fuentes (variables CSS) + metadata
  page.tsx                   server: semilla del día, estructura del hero y stub, script de arranque
  fileteado.module.css       todo el estilo, la línea de tiempo de la intro y los estados
  BRIEF.md                   esto
  _components/
    geometry.ts              RNG, espina, pinceladas, hoja, rombo, composición, brotes
    Ornaments.tsx  (client)  <defs> + 4 esquineros + gag de florecer
    Frame.tsx                doble filete, remates y rombos laterales
    NameLettering.tsx        nombre fileteado en capas SVG
    Ribbon.tsx               banderín "FRONTEND ENGINEER"
    IntroController.tsx (client)  saltear, sesión, brillo de laca, pista en consola
    boot.ts                  clave de sesión + script en línea
    BaClock.tsx    (client)  hora real de Buenos Aires
    FraseEgg.tsx   (client)  firma + cinta con frase
    frases.ts                frases
    Guarda.tsx               banda de borde de sección
```

## Lo que haría después

- **Bordes de sección:** cada sección abre con una guarda distinta generada con la misma primitiva (S corrida, ola de volutas, cadena de rombos), y la sección "se enmarca" con el doble filete al entrar en pantalla.
- **Bio:** un cartel chico tipo "chapa de colectivo" con la info real (5+ años, Técnico en Informática, Buenos Aires) y el retrato dentro de un óvalo fileteado (marco generado, foto en duotono cálido).
- **Proyectos:** cada proyecto como un "letrero" con su marco: color de esquinero según el stack (por ejemplo, celeste = Next.js), nombre en la letra fileteada y una frase-cinta corta con lo que resolvió. Moreno Herramientas con un cartelito "en obra".
- **Blog:** índice tipo "pizarrón de bodegón" con títulos en gótica y fechas reales.
- **Contacto:** el mail en una cinta grande, y la firma final del fileteador.
- Afinar a ojo con el navegador real: grosor de filetes a 360 px, tamaño de las perlas, ritmo de la intro.

## Riesgos conocidos / sin probar (no pude abrir un navegador)

- Lo revisé con TypeScript, ESLint y renders estáticos (SSR con `react-dom/server` + Quick Look de macOS) del estado final a 360 y 1440 px. **La intro animada no la vi correr.**
- Animar `stroke-dasharray` en `<tspan>`: Chrome/Firefox OK; si Safari no lo hace, el contorno aparece de golpe (fallback aceptable).
- Masks con `<use>` en SVGs distintos: está en la spec y anda en los motores actuales, pero conviene probar Safari iOS.
- Ancho de "Campuzano" con Fraunces 900: estimado, no medido (el SVG tiene `overflow: visible`, si se pasa invade el margen pero no se corta).
- Hidratación: el ornamento se calcula igual en server y cliente con floats redondeados a 0.1. Si un motor redondeara distinto un decimal, React avisaría un mismatch en dev (sin efecto visual).
- El `<script>` en línea dentro de un Server Component: React 19 lo emite tal cual; en dev podría aparecer un warning.
- `animation-timeline: view()` para la guarda no existe en Firefox estable: ahí aparece quieta.
- La sesión se guarda al terminar la intro; si el usuario recarga a mitad, la ve de nuevo (a propósito).
