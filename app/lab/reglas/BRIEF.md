# Las Reglas — `/lab/reglas`

## Concepto
La esencia de Daniel es un verbo: *rebuscárselas*. El hero no lista intereses: es un tablero de 4×5 donde las oraciones de bloques de palabras **son las reglas vivas de la página**. Arranca con `DANIEL ES PROBLEM SOLVER` y `PÁGINA ES CLARA`. El visitante mueve bloques, rompe y arma reglas, y la página reacciona. Se aprende jugando, como con un hermano mayor que te explica las cosas.

## Timeline del loader (primera visita de la sesión)
El loader **es** el hero: no hay pantalla aparte.
- 0 ms: script inline pone `data-stage=boot` (grilla y bloques invisibles). Espera la fuente (máx. 250 ms).
- run +0–260 ms: aparecen los casilleros punteados (la grilla).
- run +120 ms: caen los bloques, 48 ms entre cada uno, en orden: DANIEL → ES → PROBLEM SOLVER → PÁGINA ES CLARA → el resto. El último aterriza ~1.2 s.
- run +480–1030 ms: entran role, nombre, bajada, persona, links (110 ms de escalonado).
- run +1000 ms: las reglas activas se "encienden" (relleno de acento).
- run +1300 ms: `done`. +700 ms: pista sin palabras durante 5 s (VOLEY amaga hacia PROBLEM SOLVER con una flecha fantasma). Cualquier interacción la corta.
- Saltable con tap/click/tecla (termina las animaciones). `sessionStorage['lab-reglas-booted']`: segunda visita = fade de 0.6 s. Reduced motion = fade de 0.5 s.

## Decisiones visuales
- **Bloques de tipo cinética, no pixel art**: texto real del DOM, nítido en cualquier densidad, y el eje `wdth` de Archivo hace que el ancho de las letras sea parte de la "personalidad" (condensada en bloques, 125% en música, 62% sin regla). Evita parecerse al arte de Baba Is You.
- Fuentes (2): Archivo variable (wght+wdth) y JetBrains Mono 500/700 (capa de sistema: readout, links, modo gamer/profe), sin preload para no competir.
- Papel/tinta + un solo acento que cambia por persona. Sombras duras de 4 px = bloques empujables.
- Sustantivos: bloque de tinta. Propiedades: papel, se llenan de acento cuando su regla está viva. `ES`: borde punteado con flecha, **fijo** (es el verbo).
- Formas recurrentes: el casillero (grilla, bloques, logo DC, ilustraciones) y la flecha (bloque ES, pista, links ↗, franja inferior).

## Reglas (sustantivo · ES · propiedad, horizontal o vertical)
| Regla | Efecto |
|---|---|
| DANIEL ES PROBLEM SOLVER | default, naranja señal, ilustración: flecha que rodea un obstáculo |
| DANIEL ES VOLEY | amarillo, el nombre y los bloques saltan, pelota |
| DANIEL ES MÚSICA | violeta, tipografía ancha, bloques laten, ecualizador |
| DANIEL ES PROFE | verde pizarrón, nombre en mono, pizarrón con flecha |
| DANIEL ES GAMER | verde neón, bloques mono sin radio, glitch, sprite pixel |
| (sin regla para DANIEL) | nombre al 40%, wdth 62: "Daniel no es nada" |
| PÁGINA ES OSCURA / CLARA | tema oscuro / claro |
| DANIEL ES CLAUDE | gag: "No. Claude ayuda, pero las decisiones las toma Daniel." |
| **CLAUDE ES DANIEL** | huevo de pascua: los créditos se dan vuelta, versión honesta ("lo armó Daniel prompteando a Claude") |
| **PELOTA ES SAQUE** (o PELOTA ES VOLEY) | una pelota de vóley cruza la pantalla rebotando |
| otras reglas bien formadas | se tachan en el readout: "todavía no hace nada" |

Gag: tocar/arrastrar hacia un `ES` lo hace temblar ("ES no se mueve: es el verbo"). Secreto: la columna 2 tiene un ES en la fila 4 que permite armar reglas verticales.

## Interacción y accesibilidad
- Mobile: tocar bloque → tocar casillero (intercambia). También arrastrar. Desktop: drag, o teclado: flechas mueven el foco (roving tabindex), Enter/Espacio agarra y suelta, Escape cancela.
- Cada casillero es un `<button>` con `aria-label` ("Fila 1, columna 3: PROBLEM SOLVER") y `aria-pressed`. Cambios anunciados en `role=status` (aria-live). Instrucciones en `aria-describedby`.
- "dejame leer" siempre visible (header sticky): oculta el juego y muestra el contenido plano, mueve el foco.
- Reduced motion: sin caídas, sin rebotes, sin franja animada; la pista es una flecha estática; la pelota sólo aparece y se desvanece.

## Performance
Cero librerías, cero imágenes. Todo SVG/CSS. JS: un script inline ES5 (~1 KB) para el loader + un componente cliente chico (tablero). Toda la copia de cada persona se renderiza en el servidor y se elige por CSS con `data-persona`; el JS sólo escribe atributos en la raíz.

## Archivos
- `page.tsx` — fuentes, copia, ilustraciones, plain mode, franja, créditos.
- `reglas.css` — todo el look, loader y personas.
- `_components/rules.ts` — bloques, layout inicial, parser de reglas, efectos.
- `_components/Board.tsx` — tablero (tap, drag, teclado, anuncios, pelota, pista).
- `_components/ReadToggle.tsx` — "dejame leer".
- `_components/boot.ts` — script inline del loader.

## Riesgos conocidos
- En mobile, arrastrar sobre un bloque no scrollea (`touch-action: none`); los casilleros vacíos sí.
- El tema siempre arranca CLARA (no lee `prefers-color-scheme`, para no romper hidratación).
- `cqi` en bloques: navegadores muy viejos ven tamaño de fuente por defecto.
- El estado del tablero no persiste al recargar.

## Próximas secciones
Mismo lenguaje: cada sección se abre con una franja de bloques que se desliza (ya está el stub "PROYECTOS ES LO QUE SIGUE"). Proyectos como oraciones (`NZ AUTOMOTORES ES NEXT.JS`), contacto como regla `VOS ES ...` para completar. El acento y la tipografía de la persona elegida deberían heredarse en toda la página.
