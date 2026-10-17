# 03 — Pull Request · brief

Ruta: `/lab/pull-request`. Alcance: loader + hero + un stub debajo que muestra el borde de sección.

## Concepto

El portfolio es un pull request entre Daniel y Claude, y el visitante es el reviewer. La página arranca como un diff que se escribe solo sobre papel: primero **borra** dos líneas que son citas textuales del portfolio viejo (`LOCAL_TIME: 04:21:00_PST` y `SYSTEM_ONLINE`, sacadas de `components/HeroSection.tsx` y `components/BioSection.tsx`). Es un chiste honesto: el primer commit tira el relleno falso. Después agrega seis líneas, y cuando el diff "se aplica", cada fragmento de código **viaja y se convierte** en su versión diseñada: el `Daniel` en mono de 12px pasa a ser el titular en Fraunces. Lo trabajé como una prueba de imprenta: el diff tiene la misma gramática que las marcas de corrección (tachado en bermellón, agregado resaltado, números en el margen). Por eso el look es papel y tinta, y no una terminal oscura. El hero nunca deja de ser un diff: conserva el margen con números de línea y `+`, y el visitante puede aceptarlo, rechazarlo o borrar líneas.

## Timeline loader → hero (ms desde el primer paint)

Todo el tramo de escritura es **CSS puro**, así que corre aunque el JS todavía no haya llegado (3G).

| ms | qué pasa |
|---|---|
| 0 | papel; barra `hero.tsx  +6 −2` (fade 200) |
| 90 | se escribe el hunk header `@@ -1,2 +1,6 @@ export default function Hero()` (clip-path con `steps()` = tipeo) |
| 260 / 330 | aparecen las 2 líneas borradas (`−`), fondo rosado; a +150 ms las cruza un tachado bermellón |
| 430 → 755 | 6 líneas agregadas, cada 65 ms: `<h1>Daniel Campuzano</h1>`, `<p>…statement…</p>`, `<Here>Buenos Aires · HH:MM</Here>` (hora real), `Co-authored-by: Claude`, `<Links>…`, `<Review>¿Lo aceptás?</Review>`. A +80 ms de cada una, un barrido verde de resaltador |
| 860 | cursor de bloque titilando al final |
| 950 | **apply** (JS): `document.startViewTransition` + `flushSync`. Hay 20 elementos emparejados por `view-transition-name` (nombre, apellido, statement, lugar, co-autor, links, pregunta, barra, los 6 números y los 6 `+`): cada uno se mueve de su lugar en el código a su lugar en el hero. Lo que no está emparejado hace crossfade |
| ~1510 | fin de la transición (560 ms de group). Entran la columna verde del margen (scaleY) y los botones |
| 1450 | **failsafe CSS**: si el JS no llegó, el loader se desvanece solo y el hero aparece (sin morph). Si el JS llega tarde (>1400 ms), aplica sin transición |

- **Skip**: cualquier click, tap o tecla durante el boot aplica el diff al instante, con morph.
- **Una vez por sesión**: un script inline en `page.tsx`, que corre antes del primer paint, lee y escribe `sessionStorage['lab-pull-request-booted']` y marca `<html data-pr-boot="run|skip">`. Con `skip`, el CSS oculta el loader antes de pintar y el hero entra en cascada (las líneas suben con un stagger de 70 ms).
- Si llegás por navegación client-side (el script inline no se ejecuta), la decisión se toma en `stores.ts` con la misma key.

## Tipografía y color

- **Fraunces** (variable: `opsz` automático + `SOFT`). Es una serif editorial con óptica de display a tamaños grandes: en peso 300 y opsz 144 tiene el contraste de una revista. El eje `SOFT` me da un segundo carácter (redondeado y cálido) para el estilo *nocturno*, sin sumar una familia.
- **Martian Mono** (variable: `wdth` 75–112.5, `wght`). Una mono con eje de ancho: condensada (`wdth 87.5`) para que el código entre en 360px, y expandida y negra (`wdth 112.5`, `wght 800`) para el estilo *cartel*. Elegí no usar JetBrains, Space ni IBM Plex Mono porque son las elecciones "por defecto" de cualquier sitio de dev.
- Solo `latin`, `display: swap`. Ojo: el subset latin no incluye `→`, `✓` ni `⋯`, así que la UI no los usa (por eso la rama se escribe `main...claude/hero`, como la sintaxis de compare de git).
- **Paleta** ("pliego"): papel `#EEEAE0`, tinta `#15130F`, gris `#6A6458` (4.8:1 sobre papel). Agregado: verde tinta `#17652F` sobre `#D3EBC9` (5.6:1). Borrado: bermellón `#B32E14` (5.3:1), que es el color clásico de la corrección de pruebas. El foco usa siempre el bermellón (2px, offset 3px).

## Estilos alternativos (Rechazar)

Todos usan el mismo DOM y los mismos `view-transition-name`. Rechazar tacha todas las líneas en cascada (55 ms entre una y otra, 520 ms en total) y después cada elemento se transforma en su versión nueva: el nombre pasa de serif light a mono expandida, de mono a serif soft centrada, y así. Esa transformación es la demostración de rango.

1. **pliego** (default): composición asimétrica anclada abajo, nombre enorme en Fraunces 300, apellido sangrado en desktop y margen verde. Es la prueba de imprenta.
2. **cartel**: una línea agregada ampliada a afiche. Fondo verde "addition", mono 800 expandida en mayúsculas, filetes de 2px entre líneas, gutter en tinta con números en papel y un `+` gigante como forma recurrente llevada a afiche. Tiene más ruido a propósito.
3. **nocturno**: oscuro, simétrico y centrado. Fraunces con `SOFT 100` en peso 620, y un único `−` bermellón sobre el nombre. Es el registro calmo y cinematográfico.
4. **índice**: una ficha técnica o colofón. Todo a tamaño parecido, con etiquetas en mono (`nombre`, `qué hace`, `dónde`…) y filetes de 1px. Es tipografía sin show, lo que demuestra que el sistema también aguanta la sobriedad.

Después del cuarto vuelve al primero, con el mensaje "Volvimos al primero. Pasa más seguido de lo que creés." **Aceptar** mergea: desaparecen los `+` y la columna verde, la barra dice "mergeado" y las líneas que habías borrado se van de verdad. Con "Reabrir" vuelve todo.

## Formas recurrentes

`+` y `−`, dibujados con dos barras en CSS (no son glifos). Se usan en estos lugares:

- En el gutter de cada línea.
- En los botones (Aceptar `+`, Rechazar `−`).
- Como toggle de los hunks del stub: abierto `−`, cerrado `+`.
- Como `+` gigante en *cartel* y `−` en *nocturno*.
- En el diffstat de la barra (`++++++−−`), que se actualiza en vivo.

El `−` es literalmente el `+` con la barra vertical en `scaleY(0)`, así que pasar de uno al otro es una animación y no un cambio de ícono.

## El gag clickeable y el easter egg

- **Lo que no debería clickearse:** los `+` del margen. Si tocás uno, la barra vertical colapsa y queda un `−`, la línea se tacha con un barrido bermellón, el gutter se pone rosado y el diffstat de arriba cuenta de verdad (`+5 −3`). Podés borrarte el nombre. Si después aceptás, las líneas borradas desaparecen; la del review se salva para que no quedes trabado. En desktop, al hacer hover el `+` anticipa el `−`.
- **Easter egg, `git blame`:** apretá **`b`** (es el atajo real de GitHub para blame) o tocá el nombre de archivo **`hero.tsx`** arriba a la izquierda (en mobile es la única vía). Esc o `b` lo cierran. Cada línea muestra quién la escribió, con honestidad: "Daniel — en rigor, lo eligieron sus viejos", "Claude — redactó Claude con los datos que pasó Daniel", "Los dos — Daniel vive ahí; el reloj lo escribió Claude", "Claude — se anotó solo, pero es cierto". El resumen dice: *"Claude tipeó todo el código de esta página. Daniel puso el brief, los datos y el criterio de qué se queda y qué no."* En la consola hay una pista: `psst: apretá b…`.

## Copy

El copy está en rioplatense con voseo ("¿Lo aceptás?", "rechazá y te muestro otra"). Dejé en inglés el código y el trailer `Co-authored-by: Claude` porque es la convención real de git y se lee mejor así. El statement es: *"Frontend engineer. Hace más de 5 años que escribo interfaces con React y Next.js; últimamente, a cuatro manos con Claude."* La hora es real (`Intl`, `America/Argentina/Buenos_Aires`, UTC−3 todo el año) y se actualiza cada 10 s. No hay hashes inventados: los hunks usan una numeración coherente con las líneas reales del hero (1–6) y del stub (7–14).

## Presupuesto de performance

- **JS**: React solo, sin framer-motion (ahorra unos 30 KB gz). Todas las animaciones son CSS, más View Transitions nativas para el morph. Mi código cliente son unos pocos KB (estado más handlers). El estado del boot y el reloj usan `useSyncExternalStore`, sin `setState` dentro de efectos.
- **Fuentes**: 2 familias variables, latin, `swap`, self-hosted por `next/font` (sin request a Google). Peso estimado: Fraunces con `opsz`+`SOFT` unos 90–120 KB y Martian Mono con `wdth` unos 50–70 KB. No probé si `SOFT` vale lo que pesa: si hace falta recortar, sacar `SOFT` (y el nocturno queda con Fraunces normal) es el primer corte. No hay itálica, para no sumar otro archivo.
- **Sin imágenes, canvas, WebGL ni video.** El `+` gigante son dos `linear-gradient`. El stub usa `<details>` nativo, sin JS.
- El loader no espera ninguna red: es HTML y CSS que ya vienen en el documento.

## Reduced motion

El diff aparece entero y quieto: sin tipeo, con el tachado y el resaltado ya puestos y el cursor fijo. A los 950 ms se funde con el hero con un **crossfade de página completa**, porque en reduced-motion los `view-transition-name` se anulan y nada viaja por la pantalla. Rechazar cambia de estilo con el mismo fundido y sin el tachado en cascada. Las entradas son solo de opacidad.

## Mobile vs desktop

- **360px**: gutter de 2.6rem, código a 12px con mono condensada, nombre a `16vw`. En *cartel* el nombre va a `11.2vw` y en *nocturno* a `13vw`, con márgenes calculados para que "Campuzano" entre. Para tocar fácil: los `+` tienen un área táctil de unos 40px con un pseudo-elemento y los botones miden 42px de alto. En mobile el blame aparece arriba de cada línea.
- **≥640**: aparece la rama `main...claude/hero` y el hint "rechazá y te muestro otra".
- **≥900**: gutter de 4.6rem, apellido sangrado, blame en una columna propia de 16rem (como el blame real) y proyectos del stub en dos columnas.
- **Puntero fino**: hover de fila como en un diff (tinte suave y el número pasa a tinta), el `+` anticipa el `−`, los links se resaltan con un barrido verde y el header del hunk se resalta.

## Mapa de archivos

```
app/lab/pull-request/
  layout.tsx            fuentes (Fraunces + Martian Mono), metadata, wrapper con variables
  page.tsx              script inline de boot (sessionStorage + t0) + <PullRequest><Stub/></PullRequest>
  pull-request.css      todo el diseño (prefijo .pr / pr-), estilos alternativos, VT, reduced motion
  BRIEF.md
  _components/
    content.ts          todo el copy y los datos (verdaderos), filas, blame, estilos, proyectos
    stores.ts           reloj de Buenos Aires y modo de boot (useSyncExternalStore)
    vt.ts               helpers de View Transitions (vt(), transition())
    Loader.tsx          el diff que se escribe (markup; la animación está en el CSS)
    PullRequest.tsx     estado: boot→hero, rechazar/aceptar, borrar líneas, blame
    Stub.tsx            preview del borde de sección (hunk header) + proyectos
```

## Qué haría después

- **Bordes de sección**: cada sección es un hunk `@@ -a,b +c,d @@ <Seccion />` con numeración continua a lo largo de todo el sitio, y el `<summary>` permite colapsarla (ya está en el stub). Las secciones que todavía no existen se muestran como un hunk pendiente.
- **Bio**: escrita como un diff de "versiones de Daniel": el Técnico en Informática y los 5+ años, con líneas tachadas que son de verdad (por ejemplo, tecnologías que dejó) y líneas agregadas. El blame acá se vuelve contenido: qué escribió él y qué yo.
- **Proyectos**: cada proyecto es un archivo del PR (`nz-automotores.tsx +34 −0`). Al expandirlo aparece un caso corto con el stack real y el link. Moreno Herramientas va marcado como "draft PR" (WIP), con su número real de productos.
- **Blog**: un log de commits (`git log --oneline` editorial), con un post por commit y fechas reales.
- **Contacto**: "Dejá un comentario en el PR". Un textarea que arma un `mailto:` con el texto: no hace falta backend.
- Recortar fuentes (sacar `SOFT` si no se usa nocturno) y medir en un 3G real.

## Problemas conocidos / qué no pude probar (no corrí el browser)

- **No probé nada visualmente.** Pasan `tsc` y `eslint`, pero no corrí `next dev` ni `next build`, por regla. Puede haber detalles de alineación, sobre todo el baseline del gutter con el titular gigante y el ancho real de "CAMPUZANO" en mono expandida a 360px.
- **View Transitions**: el morph de texto mono→serif es un crossfade más escala de bitmaps. Puede verse algo estirado a mitad de camino; si molesta, hay que tocar `::view-transition-old/new(pr-first|pr-last)` (por ejemplo `height:100%; width:auto`). Los browsers sin `startViewTransition` cambian al instante: el boot tiene la entrada en cascada como fallback, pero Rechazar cambia en seco.
- Los selectores `:root:has(.pr)::view-transition-group(*)` son para no pisar transiciones de otros labs. Si un browser no los acepta, quedan los defaults (250 ms).
- El script inline pone `data-pr-boot` en `<html>`, que pertenece al layout del lab. React podría avisar en dev por un atributo extra, aunque no debería romper nada. Igual, el JS no depende del atributo, porque también lo lee desde `window.__prBoot`.
- Antes de que hidrate, el skip (tap o tecla) no funciona: el loader dura 1.45 s igual gracias al failsafe.
- Con JS muy lento (más de 1.4 s), el usuario ve el failsafe (fade sin morph). Es correcto, pero menos lindo.
- No medí el peso real de las fuentes con esos ejes.
