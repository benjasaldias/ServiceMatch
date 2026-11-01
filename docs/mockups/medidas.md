# Medidas de los mockups

Especificación medida sobre las cuatro imágenes de esta carpeta, para construir el design system
(Fase 2) y las pantallas (Fase 3) con fidelidad alta. Los tokens viven en
`packages/config/tailwind-preset.ts`; este documento explica de dónde sale cada valor.

## Cómo leer las imágenes

Las imágenes llegaron por WhatsApp: JPEG comprimido y reducido. Para pasar de píxeles de imagen a
píxeles CSS hay que dividir por la escala:

| Archivo                        | Contenido                                    | Escala (px imagen por px CSS) |
| ------------------------------ | -------------------------------------------- | ----------------------------- |
| `01-cliente-busqueda.jpeg`     | Cliente · buscar prestador, desktop y móvil  | 0,8205 (1440 + 120 + 390 px)  |
| `02-ui-kit.jpeg`               | UI kit: tokens y componentes, no es pantalla | 0,6958 (lienzo de 1440 px)    |
| `03-cliente-cotizaciones.jpeg` | Cliente · solicitud y cotizaciones           | 0,8205                        |
| `04-prestador-panel.jpeg`      | Prestador · panel diario                     | 0,8205                        |

En las tres pantallas el desktop ocupa de x = 0 a 1181 de la imagen y el móvil empieza en x = 1280.
La precisión es de ±1 px CSS: suficiente para posiciones y tamaños, no para distinguir 1,5 de 2 px a
ojo. Los grosores, radios y sombras de abajo se confirmaron renderizando candidatos en Chrome y
comparándolos con la imagen después de la misma reducción y compresión.

## Estilo general

- **Tinta.** Tarjetas, botones, inputs, avatares, tags, badges, checkbox y switch llevan un borde
  de 2 px casi negro (`tinta`).
- **Sombras duras.** Sombra desplazada hacia abajo y a la derecha, del color de la tinta y sin
  desenfoque: 4 px en tarjetas y paneles (`shadow-tarjeta`), 3 px en botones grandes y normales,
  logo, selector de ubicación e ítem activo del sidebar (`shadow-control`), y 2 px en botones
  chicos y chips de filtro seleccionados (`shadow-control-sm`). No llevan sombra los chips de
  estado, tags, avatares, inputs ni avisos.
- **Contornos de color.** Chips de estado, avisos y el banner «Perfil verificado» usan un borde de
  1,5 px del mismo color que su texto (`border-1.5` con `tono-*`).
- **Lienzo con puntos.** El fondo de las pantallas tiene una grilla de puntos de 1 px cada 24 px,
  anclada al origen de la página (`fondo-puntos`). Sidebar, topbar y bottom nav son opacos.
- **Radios.** Tarjetas y paneles 14 px; botones, inputs, ítems de navegación, logo y selector
  10 px; tags 4 px; chips y avatares redondos.
- **Deshabilitado.** El botón completo al 40 % de opacidad (borde y sombra incluidos). La tarjeta
  de un prestador no disponible, al 50 %.

## Color

El tema oscuro reproduce los valores medidos. El claro traduce cada rol a una superficie clara y
mantiene los rellenos (naranjo, durazno, pastel) y la tinta.

| Token            | Oscuro (mockup)  | Claro     | Dónde se usa                                                                             |
| ---------------- | ---------------- | --------- | ---------------------------------------------------------------------------------------- |
| `bg`             | `#1F2638`        | `#F3F5FA` | Lienzo de la pantalla, con la grilla de puntos                                           |
| `surface`        | `#192032`        | `#E9EDF4` | Sidebar, topbar móvil y bottom nav                                                       |
| `card`           | `#273246`        | `#FFFFFF` | Tarjetas, paneles, selector de ubicación                                                 |
| `elevated`       | `#343E57`        | `#EDF1F7` | Botón secundario, tarjeta anidada, burbuja recibida, tile                                |
| `campo`          | `#232B40`        | `#F7F9FC` | Inputs y campos de la barra de búsqueda                                                  |
| `tinta`          | `#0B101C`        | `#1A2234` | Bordes de 2 px y sombras duras                                                           |
| `linea`          | `#4A5569`        | `#D5DCE6` | Divisores internos de tarjeta (1,5 px)                                                   |
| `contorno`       | `#7D89A1`        | `#737E92` | Chips de filtro sin seleccionar, acordeón (1,5 px)                                       |
| `punto`          | `#262D3E`        | `#E6E8EE` | Grilla del lienzo                                                                        |
| `text`           | `#EEF3FB`        | `#1A2234` | Texto principal                                                                          |
| `text-muted`     | `#A8B1C4`        | `#4A556B` | Descripciones, metadatos, sobretítulo de la cabecera                                     |
| `text-dim`       | `#8E9AB0` (\*)   | `#5F6A80` | «Visita desde», conteos, «hace 12 min», placeholders                                     |
| `primary`        | `#FFAD7B`        | `#FFAD7B` | Acción principal, badge contador, paso actual, tile de agenda                            |
| `primary-soft`   | `#FFDCC2`        | `#FFDCC2` | Ítem activo, tarjetas destacadas, burbuja enviada, avatar CR                             |
| `primary-ink`    | `#1A2234`        | `#1A2234` | Texto e iconos sobre naranjo, durazno y pastel                                           |
| `primary-strong` | `#FFAD7B`        | `#B04612` | Naranjo como texto o enlace («Usar mi ubicación actual»)                                 |
| `primary-titulo` | `#FFAD7B`        | `#D45A1A` | Saludo «Hola, Camila» y «Match» del logo                                                 |
| `seleccion`      | `#F2F5FC`        | `#1A2234` | Chip de filtro seleccionado; en claro se invierte a tinta                                |
| `claro`          | `#F2F5FC`        | `#FFFFFF` | Botón Claro («Publicar solicitud →») y perilla del switch                                |
| `rating`         | `#FEE099`        | `#FEE099` | Estrellas; en claro llevan trazo de tinta (`rating-borde`)                               |
| `neutral`        | `#8792A8`        | `#8792A8` | Tag BORRADOR                                                                             |
| pastel           | iguales en ambos |           | info `#A9D7FD`, success `#A9EBC5`, warning `#FEE099`, danger `#FE9D9E`, purple `#CEC3FD` |

(\*) El mockup usa `#76829A`, que queda en 3,3:1 sobre tarjeta. Es la única desviación de color
del tema oscuro: `#8E9AB0` es el valor más cercano que cumple AA (RNF-08). Volver al del mockup es
cambiar una línea del preset.

**Tonos de estado.** En los mockups, chips y avisos tienen texto y borde del color pastel y un
fondo del mismo pastel al 12 % sobre lo que haya debajo (medido: 12 % en los cuatro avisos del kit
y en el banner verde). En claro, texto y borde usan un tono profundo del mismo matiz y el fondo es
el pastel al 30 %. `dim` va sin relleno para que su texto apagado cumpla 4,5:1, y ningún tono se
pone sobre `elevated`.

## Tipografía

| Token            | Medida                | Ejemplos en los mockups                                          |
| ---------------- | --------------------- | ---------------------------------------------------------------- |
| `titulo-1`       | Space Grotesk 700 36  | «Hola, Camila», «Fuga bajo el lavaplatos» (cabecera)             |
| `titulo-1-movil` | Space Grotesk 700 28  | Saludo y título en móvil                                         |
| `titulo-seccion` | Space Grotesk 700 20  | «12 prestadores cerca de ti», «Solicitudes nuevas»               |
| `titulo-tarjeta` | Space Grotesk 700 18  | Título de solicitud en tarjeta, títulos de sección del kit       |
| `titulo-panel`   | Space Grotesk 700 16  | Nombres en tarjetas, «Mapa», «Agenda de hoy», «Mis cotizaciones» |
| `cuerpo`         | DM Sans 400 14        | Descripciones, ítems del sidebar, botones normales               |
| `etiqueta`       | DM Sans 600 12,5      | Labels, metadatos, botones chicos                                |
| `sobretitulo`    | JetBrains Mono 12     | «MARTES 21 DE OCTUBRE», en mayúsculas con tracking 0,08 em       |
| `chip`           | JetBrains Mono 600 11 | Chips de estado y sobretítulos dentro de campos (`ESPECIALIDAD`) |
| `tag`            | JetBrains Mono 700 10 | VERIFICADO, URGENTE, GASFITERÍA, MEJOR EVALUADO, BORRADOR        |
| `monto`          | JetBrains Mono 700 30 | «$38.000» en cotización, «$41.040»                               |
| `monto-fila`     | JetBrains Mono 700 17 | «$25.000» en la fila de prestador                                |
| `metrica`        | JetBrains Mono 700 30 | Números de las StatCards («3», «4,9»)                            |

Otros tamaños vistos: montos de «Mis cotizaciones» en mono 14, hora de la agenda en mono 15,
nombres en móvil 15 y monto de cotización en móvil 28.

## Layout

**Desktop (1440 px).** Sidebar de 248 px con borde derecho de tinta y padding de 16. Contenido con
padding de 32 a los lados y alrededor de 30 arriba.

| Pantalla        | Columnas                                                                       |
| --------------- | ------------------------------------------------------------------------------ |
| Buscar          | Resultados 680 + 24 + panel derecho 424 (mapa y «¿Prefieres que te coticen?»)  |
| Cotizaciones    | Tres cotizaciones de 363 con 20 de separación; abajo chat 729 + 20 + aviso 380 |
| Panel prestador | Cuatro StatCards de 270 con 16; abajo solicitudes 708 + 20 + panel derecho 400 |

Barra de búsqueda: 80 de alto, borde 2, padding 10, tres campos de 312 × 56 con 12 de separación
y botón «Buscar» de 132 × 56. Chips de categoría de 34 de alto. Lista de prestadores con 14 entre
tarjetas. Padding interno: 18 en filas de prestador y StatCards, 20 en tarjetas de cotización.
Botones dentro de tarjetas con 10 de separación.

**Móvil (390 px).** Padding lateral de 16. Topbar de 64 (incluido el borde inferior de tinta).
Bottom nav de 84: borde superior de 2, 10 arriba, ítems de 56 de alto y 16 abajo; el ítem activo
va en `primary-soft` con borde y sombra.

## Componentes

- **Botones.** Alto 48 / 40 / 32, radio 10, borde de tinta. Sombra 3 en grande y normal, 2 en
  chico. Variantes del kit: Primario (naranjo), Secundario (`elevated`), Éxito (success), Peligro
  (danger), Claro (`claro`) y Deshabilitado (40 %). Texto DM Sans 700 de 15 en grande, 14 en
  normal y 13 en chico, en `primary-ink` salvo en Secundario (`text`).
- **Chips de filtro.** 34 de alto, redondos. Sin seleccionar: transparente, borde `contorno` de
  1,5 px, texto `text-muted`. Seleccionado: `seleccion`, borde de tinta, sombra 2, icono check.
- **Chips de estado.** Redondos, mono 11, `border-1.5` + `tono-*`, icono a la izquierda según el
  kit.
- **Tags.** Radio 4, relleno pastel, borde de tinta, mono 10 en mayúsculas con icono, sin sombra.
- **Avatares.** Iniciales mono sobre pastel con borde de tinta. 48 en filas de resultados, 44 en
  la tarjeta del kit, más chicos en listas y chat.
- **Inputs.** Relleno `campo`, borde de 2 px: tinta en normal, `primary` en activo y `danger` en
  error, con mensaje e icono `alert-circle` debajo. Label `etiqueta` en `text-muted` arriba.
- **Checkbox, radio y switch.** Checkbox marcado: relleno naranjo, borde y check de tinta. Radio
  elegido: círculo `claro` con punto naranjo, ambos con borde de tinta. Switch: pista success
  (encendido) o `elevated` (apagado) con perilla `claro`, todo con borde de tinta.
- **Stepper.** Círculos con borde de tinta: success con check (hecho), naranjo con número (actual)
  y `elevated` con número apagado (pendiente). Conectores de 2 px: success si está hecho,
  `linea` si no. Etiqueta del paso actual en negrita.
- **Sidebar.** Ítems de 44 de alto, radio 10. Activo: `primary-soft`, borde y sombra 3, texto en
  negrita. Badges contadores naranjos con borde de tinta.
- **Logo.** Cuadrado naranjo de 40 con radio 10, borde y sombra 3; casa con check dibujada en
  tinta y un punto info con borde arriba a la derecha. «Service» en `text` y «Match» en
  `primary-titulo`, Space Grotesk 700.
- **Iconos.** Lucide de línea, los 49 del kit. En el kit cada icono va en un tile `elevated` con
  borde de tinta y su nombre en mono debajo.

## Estados (según el UI kit)

| Grupo        | Estado                | Tono      | Icono          |
| ------------ | --------------------- | --------- | -------------- |
| Servicio     | Solicitado            | `neutral` | clipboard-list |
| Servicio     | Cotizado              | `info`    | file-text      |
| Servicio     | Contratado            | `purple`  | briefcase      |
| Servicio     | En ejecución          | `primary` | hammer         |
| Servicio     | Finalizado            | `success` | check          |
| Servicio     | Cancelado             | `dim`     | x              |
| Servicio     | En disputa            | `danger`  | flag           |
| Pago         | Pendiente de pago     | `warning` | clock          |
| Pago         | Pagado                | `success` | check          |
| Pago         | Rechazado             | `danger`  | x              |
| Vigencia     | Vence en… (< 24 h)    | `warning` | sin icono      |
| Vigencia     | Vence en… (≥ 24 h)    | `success` | sin icono      |
| Vigencia     | Vencida               | `danger`  | sin icono      |
| Verificación | Pendiente de revisión | `warning` | clock          |
| Verificación | Verificado            | `success` | shield-check   |
| Verificación | Rechazado             | `danger`  | x              |
| Búsqueda     | Disponible            | `success` | sin icono      |
| Búsqueda     | No disponible         | `dim`     | sin icono      |

## Diferencias con el texto del prompt

Donde el texto de §5 y los mockups no coinciden, manda el mockup (§0: «referencia exacta»).

| Tema               | El prompt dice                         | El mockup muestra                             |
| ------------------ | -------------------------------------- | --------------------------------------------- |
| Bordes y sombras   | Borde de 1 px, sin sombras             | Tinta de 2 px y sombras duras de 2, 3 y 4 px  |
| Lienzo y sidebar   | `bg #192032` lienzo, `surface` sidebar | Al revés: lienzo `#1F2638`, sidebar `#192032` |
| Chips y avisos     | Fondo 14 %, borde 32 %                 | Fondo 12 %, borde del color pleno de 1,5 px   |
| Solicitado         | info                                   | Neutro gris                                   |
| En ejecución       | warning                                | Naranjo (`primary`)                           |
| Vence en 2 días    | warning                                | success                                       |
| Números de métrica | Space Grotesk 28                       | JetBrains Mono 30                             |
| Radio de tarjeta   | 12 px                                  | 14 px                                         |
| Tags               | Radio 999 px                           | Radio 4 px con borde de tinta                 |
| Sidebar            | 232 px                                 | 248 px                                        |
| Panel derecho      | ~360 px                                | 424 en Buscar, 400 en el panel del prestador  |
| Bottom nav         | 64 px                                  | 84 px                                         |
| Tamaños de texto   | Seis tamaños                           | Además 20, 16, 11, 10 y 17 (ver Tipografía)   |
