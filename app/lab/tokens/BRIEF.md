# Tokens — brief del prototipo de hero

Ruta: `/lab/tokens`. Solo el hero.

## Concepto

Cómo construye software un LLM, a la vista. Un campo de miles de partículas-glifo
(caracteres, trazos de borde, celdas de relleno) recorre un ciclo infinito:

**prompt → tokens → interfaz → código → prompt siguiente**

Un prompt se escribe solo, se parte en tokens resaltados, los tokens salen a orbitar
en un vórtice al que se suma todo el ambiente, el vórtice cristaliza en una interfaz
real (nav, cards, botones, gráfico) dibujada por las mismas partículas, la interfaz se
descompone en las líneas de código que la generan y ese código se "desenrolla" en el
prompt siguiente. El "wow" está en que las partículas forman texto y layouts nítidos,
alineados al píxel, no manchas.

Es la tesis de Daniel en una imagen: la IA escribe, él diseña y decide. Las cuatro
escenas salen de su trabajo real (HECHOS.md): una web para una pyme de Barcelona, un
panel de stock para 9 tiendas y un almacén (Diano), una landing local y el agente de
captación de leads ("201 leads · 32 % cualificados", "belleza y estética" son los datos
reales del recon). Los nombres de negocios de las UIs son ficticios: son mockups.

## Coreografía (por escena, 13,8 s · 4 escenas · ~55 s el ciclo completo)

| t (s)        | Fase        | Qué pasa |
|--------------|-------------|----------|
| 0,0 – 1,6    | prompt      | El borde del prompt se dibuja en sentido horario con las partículas más cercanas. Las líneas del código anterior se desarman de arriba hacia abajo. |
| 0,3 – ~3,1   | tipeo       | Cada carácter del prompt sale *del código anterior* (en orden de lectura) y aterriza en su celda en el instante de su "pulsación"; scramble de glifos en vuelo. Caret menta. |
| 3,5 – 4,8    | tokens      | Resaltado tipo tokenizador (BPE: el espacio va con la palabra siguiente, trozos de 4 y 3), aparece token por token + contador "N tokens". |
| 4,8 – 6,3    | stream      | Cada token sale a una órbita elíptica (el texto se mantiene legible sobre el arco, coloreado por token). El ambiente de toda la pantalla se suma al vórtice como glifos aleatorios. Velocidad tipo Kepler (adentro gira más rápido). |
| 6,4 – 8,5    | ui          | El vórtice cristaliza en la interfaz, en cascada de arriba hacia abajo. Las partículas sobrantes vuelven al ambiente. |
| 8,8 – 9,9    | render pass | Una banda de luz barre la UI armada. |
| 10,6 – 12,6  | código      | La UI (ordenada por lectura) se mapea a las líneas de código (ordenadas por lectura): lo de arriba de la UI se vuelve lo de arriba del código. Resaltado de sintaxis. Barrido de "compilación". |
| 13,8 = 0,0   | →           | Arranca la escena siguiente desde el estado actual: no hay reset. |

## Cómo funciona

- **Grilla.** Todo (prompt, UIs, código) está diseñado en una grilla monoespaciada de
  40 × 22 celdas (`scenes.ts`). Cada `Target` es una partícula: un carácter, un trazo
  (`H`, `V`, esquinas redondeadas), un relleno (`FILL`, para botones y barras) o un
  punto. La grilla es independiente de la pantalla; el motor la escala a la caja del
  `.tk-stage`, que el CSS ubica (arriba en mobile, a la derecha en desktop).
- **Atlas.** Los glifos se rasterizan una vez (lazy) a un canvas atlas por
  glifo × color × peso, al tamaño exacto de celda y `devicePixelRatio`. Cada frame es
  `drawImage` desde el atlas. Los trazos de borde son paths propios (no dependen de que
  la fuente tenga box-drawing), así las líneas empalman sin cortes. Partículas
  asentadas se alinean al píxel de dispositivo → texto nítido.
- **Fuentes de posición.** Cada partícula interpola entre dos fuentes: `AMB` (su
  "doble" ambiente, que siempre deriva en un campo de flujo), `FROM`/`TO` (anclas fijas)
  y `ORB` (órbita analítica en función del tiempo). Posición = mezcla con easing
  in-out entre fuente origen y destino, más una curva perpendicular (`curl`) para el
  "swoosh". Como ambas fuentes pueden moverse (órbita, ambiente), la mezcla es continua
  en posición *y* velocidad.
- **Loop sin costura.** Nunca se reinicia nada: en cada evento `go()` captura el
  estado actual de la partícula como nuevo origen y programa el destino. El código de
  una escena literalmente es la materia prima del prompt siguiente. Los tiempos están
  calibrados para que cada transición termine antes del evento siguiente (si no, se
  congela la posición actual: tampoco salta).
- **Asignación.** Prompt ← partículas del código (equiespaciadas en orden de lectura).
  Borde del prompt ← las partículas más cercanas. Stream ← prompt + borde + ambiente al
  azar hasta completar la UI. Código ← UI ordenada por lectura, equiespaciada.
- **Ambiente.** Campo de flujo trigonométrico barato, rebote blando en los bordes (sin
  wrap, sin saltos).
- **Lente de atención** (desktop): el puntero empuja y agranda los glifos cercanos, los
  tiñe de menta y traza líneas finas hacia los 10 tokens asentados más cercanos (los
  "pesos de atención"). **Tap/click**: ripple que empuja las partículas en anillo.

## El nombre (animación sutil)

"Daniel Campuzano" es texto real (`h1`, con una copia `sr-only` para lectores de
pantalla). Dos capas, ambas CSS puras:
1. Un brillo lento lo cruza cada 9 s (degradado en `background-clip: text`; el brillo
   vive en el tercio central del degradado, así el reinicio cae sobre color plano y no
   se ve).
2. Un subrayado por token (`Dan · iel · Camp · uz · ano`, como lo partiría un
   tokenizador) recorre el nombre en ola cada 7,5 s, a opacidad baja.

## Reduced motion y accesibilidad

- `prefers-reduced-motion`: no hay loop. El motor resuelve la coreografía hasta la UI
  de la primera escena armada y dibuja ese cuadro fijo una vez (se redibuja en resize).
  El nombre no anima; se oculta el botón de pausa.
- Botón "pausa / seguir" (`aria-pressed`) para el movimiento continuo (WCAG 2.2.2).
- El canvas es `role="img"` con descripción; el texto, CTA y links son HTML con
  `:focus-visible` en menta.

## Performance

- Sin librerías. El motor (~10 KB min) se carga con `import()` dinámico después de la
  hidratación: el HTML del hero pinta primero (3G).
- Cantidad de partículas según área y dispositivo: ~1000 en mobile, hasta 2800 en
  desktop grande, ×0,8 con ≤ 4 núcleos; nunca menos que la escena más grande + 320.
- Typed arrays, un solo rAF, sin asignaciones por frame. `dpr` máx. 2.
- El loop se detiene con la pestaña oculta (`visibilitychange`), con el hero fuera de
  pantalla (`IntersectionObserver`) o en pausa. `dt` limitado a 50 ms: al volver no
  hay saltos.

## Easter eggs

1. **Escribí tu prompt.** Con el foco en la página, tipeá algo y apretá Enter: el
   próximo ciclo lo escribe, lo tokeniza y lo construye (con la UI que toque). Se ve
   en la fila de pasos mientras escribís. Esc borra.
2. **Vista tokenizador.** Doble click en el nombre: muestra los tokens con borde y
   un "id" encima de cada uno (decorativo).
3. **Consola.** Un mensaje en `console.info` cuenta los dos anteriores.

## Riesgos / para revisar

- A 360 px la celda mide ~8 px: el texto del canvas queda en ~12 px. Legible, pero
  conviene verlo en un teléfono real.
- `background-clip: text` sobre spans que cortan línea: probado conceptualmente,
  revisar en Safari iOS.
- El easter egg de teclado escucha `keydown` global mientras el foco no esté en un
  control; en la página completa habría que acotarlo al hero.
