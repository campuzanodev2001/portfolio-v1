# La Máquina — `/lab/maquina`

**Concepto.** Daniel no es una lista de hobbies: es un verbo, *rebuscárselas*. El hero es una máquina de Rube Goldberg armada con objetos de su vida (teclado, joystick, regla + púa, cuerda de guitarra, maceta, libro, subibaja sobre un parlante) que resuelve un problema ridículamente chico: **ponerle el punto a la i** de "danıel". El nombre se escribe con `ı` sin punto; la pelota de vóley ES el punto. Juego doble: "ponerle los puntos a las íes" = resolver. Si la máquina se traba, la i queda sin punto: el problema queda a la vista y lo arregla el visitante.

**Timeline del intro (primera visita, ms desde el mount).** 0–620 las piezas caen y encajan en orden de la cadena (CSS, delays 0–230) · 120 aparece la pelota · 240–460 rueda por el teclado · 460–610 empuja el joystick → la regla → la púa corta la cuerda (la maceta queda colgando un instante, beat de dibujo animado) · ~710 cae por el agujero al libro · ~980 cae al subibaja · ~1000 cae la maceta · ~1060 sube el subibaja · ~1060–1380 vuela y aterriza como punto de la i · 420–1040 letras · 500–1470 textos y links. Saltable con cualquier tap/click/tecla. Una vez por sesión (`sessionStorage["lab-maquina-booted"]`). El intro ES el hero: no hay overlay.

**Dirección visual.** Lámina de patente: papel cálido (#f2ede2), una sola tinta (#16181f) con trazo uniforme de 2px, cuatro planos (amarillo/azul de pelota de vóley, terracota, verde hoja), piso y techo rayados, piezas numeradas con leyenda (desktop), trayectoria punteada azul. Se evita el clip-art: nada de degradés ni sombras, siluetas geométricas, una línea segura. Tipos: **Archivo** (eje `wdth`, condensada 70 a 800 para el nombre, tipo rotulado de taller) + **IBM Plex Mono** (anotaciones de lámina). Ambas `next/font/google`, subset latin (incluye `ı`), la mono sin preload.

**Formas recurrentes.** Círculo (pelota, puntos de la lista de links, botón, numerales) y rampa diagonal (teclado, libro, borde superior de la sección siguiente con `clip-path`).

**Gags y triggers.**
- Tocar una pieza → reacción propia (joystick rumble, regla "30 cm", maceta, libro, subibaja, teclado `git commit`, cuerda "Mi", parlante ♪). Segundo toque en <1.3s → se cae al piso y aparece su silueta punteada.
- Arreglar: arrastrar la pieza hasta la silueta (o foco + Enter). "Probar la máquina" corre la cadena; si falta algo se traba donde corresponde (sin libro la pelota va al piso, sin regla no se corta la cuerda, etc.) y lo dice.
- Pelota: tocarla = bote. **3 botes en 4s → entra una segunda pelota** (blanca/roja), choca con la primera y se queda como el punto final de "campuzano." — equipo/amigos.
- Primer scroll (>60px): la pelota salta de la i, cae a la rampa de la sección siguiente y rueda fuera. Volviendo arriba, cae de nuevo en la i.

**Perf.** Sin libs, sin imágenes. React solo renderiza markup estático; `engine.ts` escribe `transform`s. Un único rAF con reloj virtual que solo corre si hay tweens/física activos (idle = 0 frames) y se pausa off-screen (IntersectionObserver) y con la pestaña oculta. Script inline pre-paint decide el modo (`data-mq` = boot/done/calm) para que no haya flash; si el JS no llega, un failsafe CSS revela todo a los 2.2s y un punto CSS dibuja la i.

**Reduced motion.** Modo `calm`: sin intro, estado final directo; la cadena se muestra como storyboard (saltos con pausas de 320ms), sin tweens.

**Archivos.** `page.tsx` (markup, copy, links) · `layout.tsx` (fuentes) · `maquina.css` · `_components/MachineSvg.tsx` (arte) · `geometry.ts` (coordenadas, poses START/AFTER/FALLEN) · `engine.ts` (motor, cadena, gags) · `Mount.tsx` (cliente) · `boot.ts` (script pre-paint).

**Riesgos.** (1) La posición del punto depende de métricas: `1ex + --dot-gap` sobre la línea base; si en algún browser queda alto/bajo, ajustar `--dot-gap`/`DOT_R_EM`. (2) Intro calculado a ~1.45s: en hidratación lenta (>1.8s desde el pre-paint) se salta. (3) Con piezas en el piso hay superposiciones (es una pila, pero puede tapar alguna). (4) Solo tema claro (lámina en papel). (5) No verificado en browser (solo tsc/eslint).

**Próximas secciones.** La pelota sigue: cada sección es una pieza nueva de la misma máquina que resuelve algo concreto (proyectos = una pieza por proyecto que hay que activar; sobre mí = la cadena explicada; contacto = la máquina termina mandando el mail). Bordes de sección siempre rampa diagonal, la pelota cruza de una a otra al scrollear.
