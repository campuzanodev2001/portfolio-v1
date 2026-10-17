# El Cuaderno — brief

**Concepto.** El sitio es el cuaderno de problemas de Daniel: el del que te lo explica. No lista intereses; el "de todo un poco" vive en el margen, como en el cuaderno de alguien curioso. El verbo central es *rebuscárselas*. Cada proyecto, más adelante, será un ejercicio resuelto.

**Timeline del loader (ms)** — el loader *es* el hero; no hay pantalla aparte.
| ms | qué pasa |
|---|---|
| 0–80 | papel cuadriculado + margen rojo |
| 80–760 | el lápiz escribe "Daniel Campuzano" (wipe con `clip-path` + lápiz SVG que lo sigue) |
| 760–1030 | doble subrayado (`stroke-dashoffset`, `pathLength=1`) |
| 1030–1260 | flecha hacia la frase |
| 1180–1420 | "Me las rebusco. Y después te explico cómo." en azul |
| 1250–1450 | círculo rojo sobre "más de 5 años" + resto de la hoja |

Se saltea con tap/click/tecla. Una vez por sesión (`sessionStorage` `lab-cuaderno-booted`). Un script inline decide antes del primer paint (funciona aunque el JS tarde en 3G). Sin JS o con `prefers-reduced-motion` se ve directamente el estado final.

**Decisiones visuales.**
- *Caveat* (la mano de Daniel): trazo rápido y adulto, variable (1 archivo). Se usa poco y grande, nunca para texto largo → no se ve escolar.
- *IBM Plex Mono* (la regla): letra de plano técnico para el texto, datos y etiquetas. También es la "letra" de Claude: una máquina escribe en tipografía, no a mano — honesto y legible.
- Papel de ingeniería: grilla 5 mm (20px) con mayor cada 100px, en verde-azulado muy bajo; grano procedural (de fanzine) en multiply.
- Tres tintas: **grafito** (Daniel), **azul** (Claude y la frase que lo define), **rojo** (corrección: círculo, tachado, sellos, margen). Todos ≥5.7:1 sobre el papel.

**Formas recurrentes.** Círculo a mano que no cierra (`Marks.tsx > Circle`) y flecha a mano. Espiral de cuaderno como borde de sección (patrón SVG de ~400 bytes). Tachado rojo para los intentos.

**Gags y triggers.**
- Goma (al lado de "Frontend Engineer"): borra y revela la versión anterior, *hermano mayor, arreglador oficial* (siempre se ve un fantasma, como en el papel).
- Doodles tocables: red de vóley (saque + "ace."), Am7 con diagrama (suena por WebAudio, solo con gesto), hoja (se mece), joystick ("+1 vida").
- Notas de Claude en el margen (mono azul, prefijo "C:").
- Easter egg de autoría: botón "¿quién escribió qué?" o tecla `?` (Esc cierra). Marca D. / C. / D.+C. y explica quién hizo qué.
- Regla escondida `DANIEL ES ___`: cada toque prueba una respuesta; al ver las 6 aparece el sello rojo "muy bien — todas correctas".

**Performance.** Cero imágenes, cero librerías. 2 fuentes subset latin. Texturas = data-URI SVG cacheadas en CSS. Animaciones solo CSS (clip-path, dashoffset, transform). JS cliente: 4 islas chicas (goma, doodles, regla, autoría). El hero es server-rendered y es texto real del DOM.

**Mapa de archivos.**
- `layout.tsx` fuentes + metadata · `page.tsx` estructura + script de boot · `cuaderno.css` todo el estilo y el timeline
- `_components/boot.ts` clave/duración/script · `Marks.tsx` círculo, lápiz, espiral · `Eraser.tsx` · `Doodles.tsx` (+ WebAudio) · `DanielEs.tsx` · `Authorship.tsx`

**Riesgos conocidos.**
- `pathLength` + `vector-effect: non-scaling-stroke` en los subrayados: Safari viejo puede dibujarlos sin animar (estado final igual correcto).
- En 360px el nombre puede partirse en dos líneas según métricas de la fuente; el wipe barre ambas a la vez.
- Textos de las frases redactados por Claude: Daniel debería validarlos. Las respuestas de `DANIEL ES` y la versión borrada salen de lo que contó, pero conviene que las ajuste.
- Sin modo oscuro (el papel es el concepto).

**Próximas secciones.** Cada proyecto como ejercicio en hoja nueva tras el espiral: *Problema NN* (sello rojo) · Datos · Intentos tachados (lo que no funcionó, real) · Resolución (con el stack) · Resultado encerrado en el círculo rojo (métrica o link). Notas de Claude en el margen solo donde aportan. Contacto final como "tarea para el hogar".
