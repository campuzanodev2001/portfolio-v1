# A presión (Ladrillo A), página completa

Ruta: `/lab/ladrillo-a`. Loader, hero, sobre mí, proyectos, contacto y footer.

## Concepto: la ficción

**Todo entra, a presión.** La página es una pared de ladrillos neobrutalistas (borde grueso, sombra dura, grilla visible) y cada palabra es el material que hay que meter adentro de un ladrillo. La caja manda: la letra se aprieta (`wdth` 50–150) hasta llenar su caja exacta, sea `DANIEL` o `Moreno Herramientas`. Si no entra ni con `wdth 50`, se la achica a lo bruto (`scaleX`); si sobra lugar con `wdth 150`, se abre el tracking.

Es el oficio de Daniel contado sin decirlo: el hermano mayor que se las rebusca para que las cosas entren con lo que hay (un diseño en 360 px, 14.000 productos en un catálogo, una idea en un plazo corto). El neobrutalismo es la **estructura** (cajas, sombras, cinta de peligro, botones que se hunden en su sombra) y la tipografía variable es el **movimiento** que vive adentro: letras estiradas que la caja comprime, una morsa que aprieta una palabra con el scroll, ladrillos que se empujan entre sí y re-aprietan a sus vecinos.

## Qué se tomó de cada boceto y qué se cortó

| De `neo-brutalismo` | Por qué |
|---|---|
| Paleta `--ink/--paper/--gold/--gold-d`, `--b: 3px`, `--sh` 6/7/8 px, grillas data-URI (paper/ink/gold), `--hazard` y `--stripes` | Es la estructura entera |
| `.btn` con sombra dura que se hunde en `:active` (`translate(var(--sh))` + sombra 0) | Es el gesto central: todo se "aprieta" |
| `.kick` con cuadradito dorado, `.sticker`, `.nb` (pila de bloques rotados que se pisan) | Kickers, sticker del hero y la ficha de Sobre mí |
| Cintas de peligro con marquee (`.tape`) | Borde Proyectos → Contacto (y se arranca) |
| `launch` + `bigbtn` + **tapa de hazard** que se levanta en 3D | El botón del mail |
| Logo: caja con sombra dorada que se hunde en `:active` | Rehecho como un ladrillo partido en traba (no la C del estudio) |
| Nav sticky con borde inferior, skip link, `:focus-visible` dorado (tinta sobre oro) | Accesibilidad tal cual |
| **Cortado**: precios, planes, FAQ, testimonios, GSAP + ScrollTrigger, bordes SVG generados por JS (castillo, zip, teclas, píxeles), "máquina" del hero, sticky CTA mobile, Bespoke Serif | Es copy de venta del estudio, o JS pesado. La forma de los bordes la resuelven ladrillos en CSS |

| De `kinetic` | Por qué |
|---|---|
| Roboto Serif variable con ejes registrados por `@property` (`--w`, `--wd`, `--gr`) y la clase `.v` que re-declara `font-variation-settings` | Es el motor kinetic, animable por CSS sin JS |
| El `hobby` que pasa de "mal compuesto" (fino, estirado, GRAD −50) a "impecable" | Es el loader: cada palabra llega estirada y fina y la caja la aprieta a 900 |
| Palabra-borde gigante (`.cut`) | La morsa `PROYECTOS` |
| `mejor` del CTA que engorda con la cercanía del puntero y respira solo | `Escribime` del contacto |
| Wordmark del footer con ola de pesos ligada al scroll | `CAMPUZANO` con ola de `GRAD` (no cambia el ancho, así no rompe el ajuste) |
| `--ease` `cubic-bezier(.22,1,.36,1)`, gutters 18/40/64 en 768/1200, `overflow-x: clip`, reduced motion | Tal cual |
| **Cortado**: opsz (pesa y a tamaño gigante la óptica de texto queda más petisa, más "ladrillo"), Big Shoulders, los mockups de celular, rubros rotativos, regla del proceso, GSAP | Peso y copy de venta |

**Fuentes** (`_components/fonts.ts`, `next/font/google`): Roboto Serif `wdth + GRAD` (wght viene siempre) y JetBrains Mono. Nada de fontshare: Bespoke Serif quedó afuera para tener una sola familia display.

**Boot**: los bocetos usan `html.anim` / `html.ready`. Acá, como en los otros prototipos del lab, el script inline pone `data-stage` en el root `#la` (no se toca `<html>` del layout compartido).

## Loader → hero (primera visita de la sesión)

CSS puro por `data-stage`. Script inline `_components/boot.ts`, clave `sessionStorage['lab-ladrillo-a-booted']`. El loader **es** el hero: la pared se levanta en su lugar definitivo.

| ms (desde `run`) | Qué pasa |
|---|---|
| −200…0 | `boot`: papel con grilla, los **moldes** vacíos de la pared (borde punteado) y el contador `Ladrillos 0/8`. Espera la fuente como mucho 200 ms. |
| 0 → 930 | Los 8 ladrillos caen de abajo para arriba (`k` = orden), 70 ms de escalonado, 440 ms cada uno. Caen sin sombra; al tocar se aplastan (`scale 1.035/.88`) y recién ahí aparece la sombra dura. |
| 300 → 1260 | Cada palabra entra **estirada y fina** (`wdth 150 / wght 100 / GRAD −50`, se desborda y la caja la corta), se pasa de rosca (`fit − 14`, `GRAD 100`) y se asienta en su ajuste (`wdth = fit`, `wght 900`). |
| 120 → 940 | El contador sube de 0 a 8 (`@property --n` entero + `counter()`). |
| 640 → 1200 | Entran nav, sticker, bajada, botones y nota (fade escalonado 80 ms). |
| 1300 | `done`. |

- **Saltear**: cualquier `pointerdown`, `keydown`, `wheel` o `touchstart` acelera ×6 las animaciones y pasa a `done` (~200–320 ms). Excluye loops y scroll-timelines.
- **Repetida** (`enter`, ~0,75 s): los ladrillos bajan 16 px con fade (28 ms de escalonado) y las palabras se aprietan desde `wdth 132`.
- **Reduced motion** (`calm`, 0,5 s): fade de 400 ms con todo en su lugar.
- **Peor caso**: 200 + 1300 ≈ 1,5 s.
- **Sin JS**: `<noscript>` muestra la pared terminada (ajuste estimado por CSS: `min(80cqh, 94cqw / --em)`).

## Las dos formas recurrentes

1. **El ladrillo** (caja + sombra dura desplazada). Pared del hero, las dos **hiladas** (bordes hero → sobre mí y contacto → footer: dos tiras en traba, la de abajo corrida medio ladrillo, con el stack o los nombres de proyectos apretados adentro), la ficha apilada, las tarjetas de proyecto (en desktop las pares bajan medio ladrillo: traba), los botones, el logo.
2. **La franja de peligro** (`--hazard`/`--stripes`). Ladrillo "No apretar", mordazas de la morsa, cinta que se arranca, parche de la rajadura, la tapa del mail, la placa de la prensa y el thumbnail de Moreno (sin captura).

### Cada borde de sección

| Borde | Cómo |
|---|---|
| Hero → Sobre mí | **Hilada** del stack (React, Next.js, TypeScript, Tailwind, Framer Motion, Firebase, Supabase, Claude Code, Cursor). Fondo mitad papel, mitad tinta. Con el scroll las tiras se corren en sentidos opuestos y cada palabra se aprieta de `wdth 150` a su ajuste, escalonada (`animation-range` con `--i`). Los ladrillos se pueden apretar. |
| Sobre mí → Proyectos | **La morsa**: `PROYECTOS` (es el `h2`) entre dos mordazas de hazard. Con el scroll las mordazas cierran (`--x`) y la palabra pasa de `wdth 150 / wght 300` a `wdth 50 / wght 900`; un readout `wdth 150→50` cuenta con `counter()`. El JS mide la palabra en los dos extremos para que entre exacta. |
| Proyectos → Escribime | **Cinta de peligro** inclinada ("No tocar · Frágil · Hecho a presión…") sobre fondo mitad papel, mitad oro. Abajo se asoma un texto. |
| Escribime → Footer | **Hilada** con los nombres de los 7 proyectos (tira de arriba en tinta sobre oro). |

## Secciones

- **Nav**: logo-ladrillo (se hunde al apretarlo), "D. Campuzano", links (desde 768) y botón "Escribime".
- **Hero**: `h1` real sr-only ("Daniel Campuzano, frontend engineer en Buenos Aires"); la pared visual es `aria-hidden` salvo el botón de peligro. Filas: `DANIEL` + peligro · `CAMPUZANO` · `FRONTEND` `ENGINEER` · `BUENOS AIRES` `5+ AÑOS` `REACT · NEXT · TS`. Bajada en voseo, dos botones y la nota ¹ con el botón "mezclalos".
- **Sobre mí** (tinta): "Hermano mayor. Me las *rebusco*_" (el bloque dorado se puede apretar y se comprime). Retrato en gris con sombra dorada; al apretarlo se hunde y aparece a color. Cuatro párrafos (oficio, hermano mayor/rebuscársela, lo que le importa, Claude Code + Cursor). Ficha apilada: Oficio, Experiencia 5+, Base, Formación, Todos los días, Disponible.
- **Experiencia**: no hay datos de empleos/fechas en el repo, así que **no hay sección de experiencia**. Lo que hay (5+ años, Técnico en Informática) está en la ficha.
- **Proyectos** (papel): 7 tarjetas. Cabecera tinta con número dorado y el nombre **ajustado a la caja** (todos con la misma altura de letra; el ancho lo pone `wdth`). Con el scroll cada nombre llega estirado y se aprieta. Hover (desktop): `GRAD 100` y zoom suave del thumb. Moreno sin captura: hazard con "Sin captura todavía" y nota "cuando salga de la prensa, va acá". `next/image` lazy con `sizes`.
- **Escribime** (oro): `Escribime` gigante que respira (`wght`/`wdth` en loop, desfasado por letra) y, en desktop, engorda y se ensancha hacia el puntero. Links GitHub/LinkedIn/Mail y el **botón con tapa** del mail.
- **Footer** (tinta): `CAMPUZANO` ajustado al ancho con ola de `GRAD` por scroll, línea honesta ("Hecha a puro prompt con Claude Code"), contador de ladrillos apretados y "Volver arriba".

## Cosas que no parecen clickeables y hacen algo

1. **Todo ladrillo se aprieta**: pared, hiladas, ficha, retrato, bloque "rebusco", botones. Se hunden en su sombra; las palabras suben a `GRAD 100` y se aplastan un 10 %.
2. **Empujón** (desktop): el ladrillo bajo el puntero ocupa 1,9× su lugar y empuja a los vecinos; todas las palabras de la fila se re-aprietan frame a frame. En touch, tocar un ladrillo lo agranda (otro toque lo suelta).
3. **Retrato**: apretado se ve a color.
4. **Bloque "rebusco"**: apretado se comprime a `wdth 60`.
5. **Tapa del mail**: primero levantás la tapa de hazard (gira en 3D), después aparece el botón; copia al portapapeles (si falla, `mailto:`). La etiqueta pasa a "Copiado ✓".

## Huevos de pascua

| # | Dónde | Cómo | Qué pasa |
|---|---|---|---|
| 1 | Hero | Apretar **el mismo ladrillo 6 veces en 3 s** | Se raja (línea quebrada, se tuerce, la letra se lava a `GRAD −50`). A los 0,9 s aparece un **parche de cinta** y queda así: "Listo: emparchado con lo que había a mano. Sigue andando." |
| 2 | Hero | Apretar el ladrillo **"¡No!" / "No apretar"** (es un botón, anda con teclado) o **Konami** (↑↑↓↓←→←→BA) | **La prensa**: baja una placa de hazard con su vástago, la pared se aplasta al 55 % y, para conservar el volumen, todas las palabras se estiran a `wdth 150`. A los 1,5 s sube. |
| 3 | Hero | Escribir **`rebusque`** o tocar **"mezclalos"** en la nota ¹ | Las palabras de la pared se mezclan (derangement) y cada una se re-aprieta en su caja nueva: `CAMPUZANO` en un ladrillo chico, `5+ AÑOS` estirada en la fila grande. Vuelve sola a los 4,8 s; Escape la devuelve antes. |
| 4 | Borde Proyectos → Escribime | Tocar la **cinta de peligro** (es un botón) | Se arranca y cae. Abajo estaba: "Fuera de la pantalla me gusta de todo un poco: vóley, música, juegos, la naturaleza, enseñar y los amigos." |
| 5 | Footer | Apretar cosas | Contador de "Ladrillos apretados en esta visita" (sessionStorage). A los 25: "Ya da para una medianera."; 60: "Con esto ya te hacés un quincho."; 120: "¿No tenés nada que hacer? Yo tampoco. Escribime." También salen como toast. |

## Performance

- **JS propio**: `engine.ts` (~13 KB fuente) + string de boot. Sin librerías. `Enhance` renderiza `null`. Un rAF sólo mientras dura un empujón (460 ms) o mientras el puntero se mueve sobre "Escribime".
- **Ajuste**: una regla oculta (`[data-ruler]`) mide cada texto en `wdth 50` y `150` (con caché por texto/tamaño/peso) y se interpola; durante el empujón se re-usa la medida, sin layout extra. Re-ajuste en `resize` (rAF) y al terminar de cargar las fuentes.
- **Fuentes**: 2 familias variables por `next/font` (self-hosted, subset latin).
- **Imágenes**: sólo las capturas reales y el retrato, `next/image` lazy con `sizes`. Toda la decoración es CSS/data-URI.
- **Scroll sin JS**: morsa, hiladas, nombres de proyectos y ola del footer son `animation-timeline: view()` dentro de `@supports` + `prefers-reduced-motion: no-preference`. Sin soporte (Firefox) quedan en el estado final.

## Reduced motion

Stage `calm`; sin scroll-timelines (morsa cerrada, palabras en su ajuste); sin loops (marquee, `_`, respiración); transiciones casi a 0. El prensado y el empujón siguen respondiendo (movimiento que dirige el usuario), pero sin animación. La prensa y la mezcla funcionan sin re-presión animada.

## Mobile (360) vs desktop

- **360**: pared de 324 px (`--th = clamp(64px, min(21vw, 23svh), 230px)`), el ladrillo de peligro dice "¡No!", todo a una columna, hiladas de 108×38. Sin empujón por hover: es por tap. No hay scroll horizontal: palabras que desbordan van dentro de cajas con `overflow: hidden` y la raíz tiene `overflow-x: clip`.
- **≥768**: gutter 40, links en la nav, Sobre mí a 2 columnas con la ficha en 3.
- **≥900**: bajada + botones en 2 columnas, tarjetas en 2 columnas en traba, contacto a 2 columnas, "No apretar" completo.
- **≥1200**: gutter 64, sombras de 8 px; Sobre mí en 3 columnas (retrato, texto, ficha) desde 1100.

## Accesibilidad

`h1` sr-only, `h2` por sección (la morsa es el `h2` de Proyectos, con texto sr-only y la palabra visual `aria-hidden`), `h3` por proyecto. Skip link. `:focus-visible` dorado (tinta sobre oro). Los huevos centrales tienen camino por teclado: "No apretar", "mezclalos", la cinta y la tapa son botones; Konami, `rebusque` y Escape andan con teclado. Toast `aria-live="polite"`.

## Mapa de archivos

```
app/lab/ladrillo-a/
  layout.tsx             metadata + variables de fuente
  page.tsx               server: todo el markup, pared, Hilada, Crack, boot inline, noscript
  ladrillo.module.css    tokens, @property, pared, loader por data-stage, secciones, scroll, reduced motion
  BRIEF.md
  _components/
    fonts.ts             Roboto Serif (wdth + GRAD) y JetBrains Mono (next/font/google)
    boot.ts              script de boot (stages, sessionStorage, skip, espera de fuente)
    engine.ts            ajuste por wdth, prensado, empujón, rajadura, prensa, mezcla, cinta, tapa, teclas, "Escribime"
    Enhance.tsx          "use client": monta engine.ts (renderiza null)
    data.ts              proyectos, stack y links (sólo hechos reales)
```

## Verificación y lo no probado

- `npx tsc --noEmit` y `npx eslint app/lab/ladrillo-a app/lab/page.tsx` dan limpio. **No corrí `next dev` ni `next build`** ni lo miré en un navegador (regla de uso), así que nada de esto está verificado visualmente.
- Riesgos a mirar primero: (1) que el CSS module compile (`@property`, `counter-reset` con `var()`, `animation-range` con `calc(var(--i))`); si este último no lo acepta el navegador, las hiladas y la ola del footer usan el rango por defecto. (2) El centrado vertical de las versales dentro de cada ladrillo (`translate: 0 .04em` a ojo). (3) Que el ajuste use la interpolación lineal entre `wdth 50` y `150`: puede quedar 1–3 px corto o largo en algunas palabras. (4) El cálculo de la placa de la prensa (asume la suma de alturas de las 4 filas).
- La tapa del mail usa `hidden`; depende del preflight de Tailwind (`[hidden] { display: none !important }`).
