# ServiceMatch — Prompt de construcción del MVP 1.0

Eres el equipo de desarrollo de **ServiceMatch**, un marketplace chileno que conecta hogares con prestadores verificados de servicios domésticos (gasfitería, electricidad, cerrajería, reparación de electrodomésticos). Tu trabajo es construir el MVP 1.0 completo: aplicación web responsiva con tres portales (cliente, prestador, administración), base de datos, API y pagos vía Mercado Pago en modo sandbox.

Este documento es la fuente de verdad de **requisitos, reglas de negocio, datos y arquitectura**. Los mockups adjuntos son la fuente de verdad **visual**. Cuando ambos parezcan contradecirse en lo visual, mandan los mockups; cuando se contradigan en reglas de negocio, manda este documento.

---

## 0. Adjuntos y cómo usarlos

Se adjuntan cuatro imágenes. Guárdalas en `docs/mockups/` con estos nombres y refiérete a ellas así:

| Archivo | Qué es | Cómo usarlo |
|---|---|---|
| `01-cliente-busqueda.png` | Cliente · buscar prestador (desktop izquierda + móvil derecha) | Pantalla a reproducir |
| `02-ui-kit.png` | **Solo design system**: botones, tipografía, chips, formularios, avisos, tarjetas, navegación, iconos | **No es una pantalla.** Es el catálogo de tokens y componentes del que sale todo lo demás |
| `03-cliente-cotizaciones.png` | Cliente · detalle de solicitud y cotizaciones (desktop + móvil) | Pantalla a reproducir |
| `04-prestador-panel.png` | Prestador · panel diario (desktop + móvil) | Pantalla a reproducir |

Instrucciones sobre los mockups:

1. **Ábrelos y míralos antes de escribir una línea de código.** No desarrolles de memoria a partir de este texto: los mockups tienen densidad, jerarquía y espaciado que el texto no captura.
2. Las tres pantallas de producto son la referencia exacta de layout, orden de elementos, microcopy y estados. Reprodúcelas con fidelidad alta, no "inspirado en".
3. Cada mockup muestra **desktop (1440 px) y móvil (390 px)**. El móvil no es el desktop comprimido: tiene bottom nav, tarjetas apiladas y secciones colapsadas. Implementa ambos.
4. Las pantallas que no están en los mockups (registro, checkout, perfil del prestador, panel de administración, etc.) las construyes **extendiendo el mismo sistema**, sin inventar un estilo nuevo. La sección 6 lista todas.
5. Si el documento de arquitectura del proyecto muestra otra paleta (verde pino sobre blanco), está desactualizado: **la paleta vigente es la oscura de los mockups**.

---

## 1. Contexto del proyecto

- **Producto**: ServiceMatch, marketplace bilateral de servicios domésticos agendados (ventanas de días, no despacho inmediato tipo Uber).
- **Equipo**: 6 personas, 14 semanas (02/09/2026 – 10/12/2026). Gerente de proyecto y frontend: Benjamín Saldías. Backend: Rocío Marquez, Tomás Capo, Agustín Jadue. Frontend: Daniela Muñoz, Ignacio Phillips.
- **Modelo de ingresos**: comisión transaccional de 5% a 10% sobre el valor del servicio, configurable por administración y cobrada al cliente además del monto del servicio. Existe además un cobro por contacto de $1.500 a $3.000 en el modelo de negocio, **fuera del alcance del MVP**: no lo implementes.
- **Infraestructura**: capas gratuitas (Vercel para el frontend, contenedor para la API, Postgres administrado). Mercado Pago solo en sandbox.
- **Criterios de éxito del proyecto**: 100% de las historias "Must Have" operativas, cobertura de pruebas sobre 80% en flujos críticos, 0 defectos bloqueantes en la demo final.

---

## 2. Alcance

### Dentro del MVP
Registro e inicio de sesión con tres roles · gestión de perfil del cliente · gestión, verificación y disponibilidad del prestador · búsqueda de prestadores con filtros y geolocalización aproximada · solicitudes de servicio con fotos · cotizaciones con vigencia · aceptación y rechazo de cotizaciones · pago inicial por Mercado Pago sandbox · comisión configurable · seguimiento del servicio por estados · cargos adicionales con aprobación del cliente · evaluaciones cruzadas · historial de servicios · notificaciones in-app · mensajería interna acotada · panel de administración (verificaciones, usuarios, servicios, transacciones, comisión, disputas, registros).

### Fuera del MVP — no lo construyas
App móvil nativa · despacho inmediato o seguimiento en vivo · cobro por generación de contactos · liquidaciones automáticas al prestador · escrow real o garantías financieras · seguros · mensajería en tiempo real con websockets o adjuntos · recomendaciones automáticas o cualquier componente de IA · feeds sociales · gamificación · facturación electrónica · pagos reales fuera de sandbox.

---

## 3. Stack obligatorio

No cambies de stack. Si algo no te calza, dilo y propón, no sustituyas en silencio.

| Capa | Tecnología |
|---|---|
| Lenguaje | TypeScript 5.6 en todo el repo, `strict: true` |
| Frontend | React 18 + Vite 5 + React Router 6 |
| Estado remoto | TanStack Query 5 |
| Formularios | React Hook Form 7 + Zod 3 (mismos esquemas que la API) |
| Estilos | Tailwind CSS 3.4 con los tokens de la sección 5 en `tailwind.config.ts`. Sin librerías de componentes (nada de MUI, Chakra, shadcn): los componentes se construyen desde el UI kit |
| Iconos | `lucide-react` |
| Mapa | Leaflet + OpenStreetMap, o el placeholder estilizado del mockup si no hay tiempo. No Google Maps |
| Backend | Node.js 22 LTS + Express 4 |
| Validación | Zod en el borde de la API |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 16 |
| Trabajos asíncronos | pg-boss 10 sobre la misma base de datos |
| Autenticación | JWT de acceso (15 min) + refresh opaco rotatorio en cookie HttpOnly; contraseñas con Argon2id |
| Archivos | Almacenamiento compatible con S3, bucket privado, URLs firmadas. En desarrollo, disco local tras la misma interfaz |
| Pagos | SDK oficial de Mercado Pago, credenciales de prueba |
| Pruebas | Vitest + Supertest (API), Playwright (E2E), Testing Library (componentes) |
| Calidad | ESLint 9 + Prettier, Husky con lint-staged |
| Logs | pino con redacción de campos sensibles |

---

## 4. Repositorio

Monorepo con pnpm workspaces:

```
servicematch/
  apps/
    web/                   # React + Vite
      src/
        routes/            # public/ cliente/ prestador/ admin/
        components/ui/     # design system (sección 5)
        features/          # busqueda/ solicitudes/ cotizaciones/ pagos/ ...
        lib/               # api client, formato CLP y fechas, auth context
    api/                   # Express
      src/
        modules/           # identidad perfiles verificacion busqueda solicitudes
                           # cotizaciones servicios pagos resenas disputas
                           # notificaciones admin
        middleware/        # auth rbac validate rateLimit audit errors
        jobs/              # pg-boss
        infra/             # prisma storage mercadopago mailer geo
      prisma/              # schema.prisma + migrations + seed.ts
  packages/
    shared/                # esquemas Zod, tipos de API, máquina de estados, formato CLP
    config/                # eslint, tsconfig y preset de tailwind
  docs/
    mockups/               # las 4 imágenes adjuntas
  docker-compose.yml       # postgres para desarrollo
  .env.example
  README.md
```

Cada módulo de `api/src/modules/` tiene siempre las mismas cuatro capas: `router` (rutas, validación y rol), `controller` (HTTP), `service` (reglas de negocio y transacciones), `repository` (Prisma). Un módulo nunca lee las tablas de otro módulo directamente: llama a su servicio.

Scripts que deben funcionar desde la raíz:

```
pnpm dev            # web + api + worker en paralelo
pnpm build
pnpm test           # unitarias + integración
pnpm test:e2e       # playwright
pnpm db:migrate
pnpm db:seed        # datos de la sección 12
pnpm lint
```

Primera entrega de la sesión: crea `CLAUDE.md` en la raíz con el resumen operativo del proyecto (stack, comandos, convenciones, reglas de negocio no negociables) para que las sesiones siguientes no relean este prompt completo.

---

## 5. Design system (extraído del UI kit)

### 5.1 Color

Tema oscuro único. No implementes tema claro.

```css
--bg:            #192032;  /* lienzo principal */
--surface:       #1F2638;  /* sidebar, topbar, inputs sobre lienzo */
--card:          #273246;  /* tarjetas y paneles */
--card-hover:    #2E3950;
--elevated:      #303B51;  /* celdas internas, mapa, inputs dentro de tarjeta */
--border:        #343E57;
--border-soft:   #2B3550;

--text:          #EEF3FB;  /* texto primario */
--text-muted:    #A8B1C4;  /* descripciones, metadatos */
--text-dim:      #76829A;  /* sobretítulos, etiquetas mono, placeholders */

--primary:       #FFAD7B;  /* acción principal y títulos de saludo */
--primary-soft:  #FFDCC2;  /* fondo de tarjeta destacada y item activo del sidebar */
--primary-ink:   #1A2234;  /* texto sobre naranjo */

--info:          #A9D7FD;
--success:       #A9EBC5;
--warning:       #FEE099;
--danger:        #FE9D9E;
--purple:        #CEC3FD;
```

Reglas de uso:

- El naranjo es la única acción principal por pantalla. Texto sobre naranjo siempre `--primary-ink`, nunca blanco.
- Los seis pastel se usan para avatares (iniciales sobre pastel con texto `--primary-ink`), chips de estado y avisos. Rotación de avatar por hash estable del `userId`.
- Chips y badges de estado: fondo = color base al 14% sobre la tarjeta, borde = color base al 32%, texto = color base. Excepción: los badges afirmativos sólidos del mockup (`VERIFICADO`, `MEJOR EVALUADO`) van con fondo sólido pastel y texto `--primary-ink`.
- **Ningún estado se comunica solo con color**: todo chip lleva texto y, cuando el UI kit lo muestra, icono. Es requisito de accesibilidad (RNF-08) y estándar de interfaz del documento de requerimientos.
- Sin degradados, sin glassmorphism, sin sombras grandes. Separación por borde de 1px y cambio de superficie.

### 5.2 Tipografía

Tres familias, cargadas desde Google Fonts con `font-display: swap`:

| Rol | Familia y peso | Tamaño | Uso |
|---|---|---|---|
| Título 1 | Space Grotesk Bold | 36 / 28 móvil | "Hola, Camila", títulos de pantalla |
| Título de tarjeta | Space Grotesk Bold | 18 | Nombres, títulos de sección y de tarjeta |
| Cuerpo | DM Sans Regular | 14 | Descripciones y texto general |
| Etiqueta de campo | DM Sans SemiBold | 12,5 | Labels de formulario, metadatos |
| Sobretítulo / etiqueta | JetBrains Mono Regular | 12, mayúsculas, tracking +0.08em | `ESPECIALIDAD`, `SOLICITUD #SM-1042`, `MARTES 21 DE OCTUBRE`, chips de estado |
| Monto | JetBrains Mono Bold | 30 (24 en tarjetas) | `$41.040`, `$38.000` |

Jerarquía adicional: números de métricas en Space Grotesk Bold 28. Nada en mayúsculas salvo los sobretítulos mono. Sin negritas decorativas.

### 5.3 Espaciado, radios y formas

- Escala de 8 px: 4, 8, 12, 16, 24, 32, 40, 48.
- Radios: tarjetas 12 px, botones e inputs 10 px, chips y badges 999 px, avatares círculo.
- Alturas de botón: **Grande 48 · Normal 40 · Chico 32**. Icon-only cuadrado del mismo alto.
- Ancho de contenido desktop: sidebar fijo 232 px + contenido fluido con padding 24–32 px. Panel lateral derecho (mapa, agenda) de ~360 px en pantallas ≥1280 px.
- Móvil: padding lateral 16 px, bottom nav fija de 64 px, controles táctiles ≥44 px.

### 5.4 Componentes a construir en `components/ui/`

Construye exactamente estas variantes, que son las del UI kit. Nada más, nada menos.

- **Button**: `primary` (naranjo sólido), `secondary` (superficie con borde), `success`, `danger`, `light` (blanco), `ghost`, `disabled`; tamaños `lg|md|sm`; estados hover, focus visible, loading, disabled; soporte de icono a la izquierda e icon-only.
- **Input / Select / DatePicker / Textarea**: estado normal, activo (borde `--primary`), error (borde `--danger` + mensaje con icono debajo), deshabilitado. Label arriba en DM Sans SemiBold 12,5; los campos de búsqueda del mockup llevan sobretítulo mono dentro del campo.
- **Checkbox, Radio, Switch**: con los tres estados del kit (marcado, vacío, deshabilitado). El switch verde es el de disponibilidad del prestador.
- **Chip de filtro**: seleccionable, con icono opcional (`Gasfitería`, `Electricidad`, `Disponible ahora`, `4,5 ★ o más`, `Ordenar`).
- **StatusChip**: tipado por dominio (ver 5.5).
- **Badge**: sólido pastel (`VERIFICADO`, `URGENTE`, `MEJOR EVALUADO`, `GASFITERÍA`, `BORRADOR`) y contador numérico para el sidebar y las notificaciones.
- **Avatar**: iniciales sobre pastel, tamaños 28/32/40.
- **Rating**: estrellas + valor con coma decimal + conteo entre paréntesis, p. ej. `★★★★★ 4,9 (128)`.
- **Card**, **ListRow** (fila densa de resultado), **StatCard** (icono + etiqueta + número + nota), **EmptyState**, **Skeleton**, **Alert** (info, éxito, advertencia, error, con icono y texto), **ConfirmDialog**, **Toast**.
- **Stepper de servicio**: 5 pasos horizontales en desktop (`Solicitado · Cotizado · Contratado · En ejecución · Finalizado`), con paso actual numerado y resaltado; en móvil se reduce a `Paso 2 de 5` + puntos.
- **Sidebar** (desktop, con item activo en `--primary-soft` y badges de conteo), **BottomNav** (móvil, 5 destinos por rol), **Topbar móvil** (ubicación + campana).
- **QuoteCard**, **PaymentSummary**, **Timeline** de bitácora, **ChatPanel** acotado.

### 5.5 Taxonomía de chips de estado

Los chips del UI kit están agrupados y mapean uno a uno con el modelo de datos:

| Grupo | Valores y color |
|---|---|
| Servicio (REQ-06) | `Solicitado` info · `Cotizado` info · `Contratado` purple · `En ejecución` warning · `Finalizado` success · `Cancelado` dim · `En disputa` danger |
| Pago y vigencia | `Pendiente de pago` warning · `Pagado` success · `Rechazado` danger · `Vence en 6 h` warning · `Vencida` danger |
| Verificación (REQ-09) | `Pendiente de revisión` warning · `Verificado` success · `Rechazado` danger |

La cuenta regresiva (`Vence en 6 h`, `Vence en 2 días`) se calcula en el cliente a partir de `expiraEn` y se re-renderiza cada minuto.

### 5.6 Iconografía

El UI kit lista 49 iconos de línea de Lucide. Usa estos nombres y no agregues otros sin necesidad:
`home, search, clipboard-list, file-text, credit-card, clock, star, bell, map-pin, check, x, chevron-down, chevron-right, chevron-left, plus, user, shield-check, wrench, zap, droplet, key, paintbrush, hammer, snowflake, camera, upload, calendar, message-square, filter, arrow-right, lock, mail, phone, eye, log-out, briefcase, alert-circle, list, send, receipt, map, layout-grid, info, play, flag, image, navigation, toggle-left, trending-up`.

Mapeo de categorías: gasfitería `droplet`, electricidad `zap`, cerrajería `key`, electrodomésticos `wrench`, pintura `paintbrush`, carpintería `hammer`, climatización `snowflake`.

### 5.7 Formato chileno

- Moneda: entero con punto de miles y símbolo pegado: `$25.000`, `$41.040`. Nunca decimales. Función única en `packages/shared`.
- Decimales de rating con coma: `4,9`.
- Fechas en es-CL, zona `America/Santiago`: `jue 23 oct · 10:30`, `Hoy 15:00–19:00`, `MARTES 21 DE OCTUBRE` en sobretítulo mono.
- Distancias con coma: `a 1,2 km`.
- Todo el texto de interfaz en español de Chile, directo y sin jerga de producto. Usa literalmente el microcopy de los mockups.

---

## 6. Pantallas

### 6.1 Las tres pantallas de los mockups (fidelidad alta)

**A. Cliente · Buscar prestador — `01-cliente-busqueda.png` → ruta `/buscar`**

Desktop: sidebar con logo, selector "Tu ubicación / Providencia, Santiago", items `Inicio · Buscar prestador · Mis solicitudes (2) · Cotizaciones (3) · Pagos · Historial`, y al pie `Notificaciones (4) · Ayuda` más la ficha del usuario (`Camila Rojas · Cliente`) con salir.

Contenido: sobretítulo mono con la fecha, título `Hola, Camila`, bajada `¿Qué necesitas arreglar hoy? Te mostramos prestadores verificados cerca de ti.`, campana y botón primario `+ Nueva solicitud`. Barra de búsqueda de tres campos con sobretítulo mono (`ESPECIALIDAD` = Gasfitería, `UBICACIÓN` = Av. Providencia 1234, `CUÁNDO` = Hoy, en la tarde) y botón `Buscar`. Fila de chips de categoría y enlace `Usar mi ubicación actual`.

Resultados: `12 prestadores cerca de ti`, selector `Ordenar por: Mejor evaluados`, chips de filtro activos (`Disponible ahora`, `Verificados`, `4,5 ★ o más`, `Hasta $30.000`). Cada fila: avatar de iniciales, nombre, badge `VERIFICADO`, especialidad · años, rating, a la derecha sobretítulo `Visita desde` y monto mono; segunda línea con distancia, ventana horaria y chip `Disponible`; acciones `Ver perfil` y `Solicitar cotización`. La última fila (`Luis Herrera`, no disponible) va atenuada con chip `No disponible` y acción primaria deshabilitada.

Columna derecha: panel `Mapa` con chip `Radio 5 km`, pines de precio (el seleccionado en naranjo, el resto en verde), punto de ubicación del cliente y leyenda `Tu ubicación · Seleccionado · Disponible`. Debajo, tarjeta `--primary-soft` con `¿Prefieres que te coticen?` y botón `Publicar solicitud →`.

Móvil: topbar con ubicación y campana, saludo, buscador de una línea con chip `Hoy` y botón de filtros, chips de categoría, mapa compacto, lista reducida de resultados y bottom nav `Inicio · Buscar · Solicitudes · Pagos · Perfil`.

**B. Cliente · Solicitud y cotizaciones — `03-cliente-cotizaciones.png` → ruta `/solicitudes/:id`**

Sobretítulo `SOLICITUD #SM-1042 · GASFITERÍA`, título `Fuga bajo el lavaplatos`, meta `Publicada hoy a las 09:12 · Av. Providencia 1234, Providencia`, chip `Cotizado` y botón `Editar solicitud`. Stepper de 5 pasos con el 2 activo.

`3 cotizaciones recibidas` con `Ordenar por: Mejor evaluado` y tres tarjetas en grilla: prestador con rating, badge `MEJOR EVALUADO` cuando aplica, sobretítulo `Valor estimado` y monto mono, descripción del trabajo, lista de condiciones con check verde o cruz roja (`Materiales incluidos`, `Garantía de 30 días`, `Visita jue 23 oct · 10:30`), línea de vigencia con chip (`Vence en 6 h`, `Vence en 2 días`, `Vencida`) y acciones `Rechazar` / `Aceptar`. **La cotización vencida se muestra con el monto tachado, todo atenuado y, en lugar de acciones, un recuadro con candado: `Esta cotización venció y ya no se puede aceptar.`**

Abajo: panel `Chat con Pedro Muñoz` con badge `Contacto oculto hasta contratar`, burbujas con hora y campo `Escribe un mensaje…` + `Enviar`; y tarjeta `--primary-soft` `Antes de aceptar` con el texto exacto sobre adjudicación, cierre de las demás cotizaciones y pago por Mercado Pago.

Móvil: stepper reducido, tarjetas apiladas y acordeón `1 cotización vencida`.

**C. Prestador · Panel — `04-prestador-panel.png` → ruta `/pro`**

Sidebar del prestador: `Panel · Solicitudes (3) · Cotizaciones · Trabajos · Disponibilidad · Evaluaciones · Mi perfil`, zona de cobertura arriba y ficha `Pedro Muñoz · Gasfiter · Verificado` al pie.

Cabecera con saludo `Hola, Pedro`, bajada con el conteo del día, **switch `Disponible`**, campana y botón `Ver agenda`. Banner verde `Perfil verificado` con las comunas de cobertura y enlace `Ver mi perfil`. Cuatro StatCards: `Solicitudes nuevas 3`, `Cotizaciones enviadas 5`, `Trabajos esta semana 4`, `Calificación 4,9`, cada una con nota al pie.

`Solicitudes nuevas (3)` con filtros `Todas · Urgentes · Más cercanas` y tarjetas con badge de categoría, badge `URGENTE` cuando aplica, antigüedad (`hace 12 min`), título, descripción, meta (comuna · distancia, fecha, cantidad de fotos), avatar del cliente y acciones `Rechazar` / `Aceptar y cotizar`.

Columna derecha: `Agenda de hoy` con bloques de hora en mono, cliente · comuna, chip de estado y acción contextual (`Iniciar trabajo` para contratado, `Marcar como finalizado` para en ejecución); `Mis cotizaciones` con monto y estado por línea; `Última evaluación` con estrellas y comentario.

Móvil: tarjeta de disponibilidad, cuatro StatCards en grilla 2×2, solicitudes apiladas y bottom nav `Panel · Solicitudes · Trabajos · Agenda · Perfil`.

### 6.2 Pantallas restantes (mismo sistema, sin mockup)

**Público**: landing con buscador y categorías · `Cómo funciona` · login · registro con selección de rol (`Quiero contratar` / `Quiero ofrecer servicios`) · recuperación y restablecimiento de contraseña. El registro de administrador no existe en público.

**Cliente**: inicio · perfil público del prestador (con `Solicitar cotización`, nota de precio referencial y reseñas) · creación de solicitud en 3 pasos (`Qué necesitas` → `Dónde y cuándo` → `Revisar y enviar`, con adjuntos y confirmación con código) · listado `Mis solicitudes` · checkout con desglose de comisión · resultados de pago (procesando, confirmado, rechazado, pendiente, servicio no disponible) · seguimiento del servicio con bitácora · aprobación de cargo adicional · formulario de reseña · historial (`Historial del Hogar`, filtrable por dirección, sin acciones de borrado) · notificaciones · cuenta y direcciones · cancelación con motivo · apertura de disputa.

**Prestador**: registro y onboarding progresivo del perfil · verificación de identidad (cédula + rostro) y sus tres estados · bandeja de solicitudes · editor de cotización con revisión antes de enviar · agenda y disponibilidad semanal · trabajo activo con cambios de estado · solicitud de cargo adicional · ganancias y pagos · historial de trabajos · evaluación del cliente.

**Administración** (sidebar propio): resumen operativo · cola de verificaciones y detalle con documentos en vista restringida · gestión de usuarios con suspensión y reactivación · monitoreo de servicios (solo lectura) · transacciones y comisiones con filtros · configuración de comisión con historial · disputas y reembolsos · registros administrativos.

**Estados del sistema** (en todas): carga con skeletons, resultados vacíos con sugerencia de ajustar filtros, errores de validación en línea, pago fallido con reintento, cotización vencida, diálogos de confirmación y confirmaciones de éxito.

---

## 7. Modelo de datos

Prisma sobre PostgreSQL. Tablas en snake_case, IDs UUID generados por la aplicación, timestamps `timestamptz` en UTC, **montos siempre enteros CLP**, enums como texto con CHECK. Las bitácoras solo admiten inserción.

```prisma
model Usuario {
  id              String   @id @default(uuid())
  rol             String   // cliente | prestador | admin
  nombre          String
  email           String   @unique
  telefono        String?
  passwordHash    String   @map("password_hash")
  estadoCuenta    String   @default("activa") @map("estado_cuenta") // activa | suspendida
  motivoSuspension String? @map("motivo_suspension")
  credVersion     Int      @default(1) @map("cred_version")
  creadoEn        DateTime @default(now()) @map("creado_en")
  @@map("usuario")
}

model Direccion {
  id        String  @id @default(uuid())
  usuarioId String  @map("usuario_id")
  alias     String?
  comuna    String
  calleNumero String @map("calle_numero")
  latitud   Decimal?
  longitud  Decimal?
  @@map("direccion")
}

model Categoria {
  id     String  @id @default(uuid())
  nombre String
  slug   String  @unique
  icono  String
  activa Boolean @default(true)
  @@map("categoria")
}

model PerfilProfesional {
  id                  String   @id @default(uuid())
  usuarioId           String   @unique @map("usuario_id")
  descripcionServicios String?  @map("descripcion_servicios")
  anosExperiencia     Int      @map("anos_experiencia")
  tarifaBaseClp       Int      @map("tarifa_base_clp")
  disponible          Boolean  @default(false)
  estadoVerificacion  String   @default("pendiente") @map("estado_verificacion")
  ratingPromedio      Decimal  @default(0) @map("rating_promedio")
  totalResenas        Int      @default(0) @map("total_resenas")
  @@map("perfil_profesional")
}

model PerfilEspecialidad { perfilId String @map("perfil_id"); categoriaId String @map("categoria_id"); tarifaDesdeClp Int @map("tarifa_desde_clp"); @@id([perfilId, categoriaId]); @@map("perfil_especialidad") }
model CoberturaComuna   { perfilId String @map("perfil_id"); comuna String; @@id([perfilId, comuna]); @@map("cobertura_comuna") }
model Disponibilidad    { id String @id @default(uuid()); perfilId String @map("perfil_id"); diaSemana Int @map("dia_semana"); horaInicio String @map("hora_inicio"); horaFin String @map("hora_fin"); @@map("disponibilidad") }

model Verificacion {
  id            String    @id @default(uuid())
  usuarioId     String    @map("usuario_id")
  estado        String    @default("pendiente") // pendiente | verificado | rechazado
  enviadaEn     DateTime? @map("enviada_en")
  revisadaEn    DateTime? @map("revisada_en")
  revisorId     String?   @map("revisor_id")
  motivoRechazo String?   @map("motivo_rechazo")
  @@map("verificacion")
}

model DocumentoVerificacion {
  id             String   @id @default(uuid())
  verificacionId String   @map("verificacion_id")
  tipo           String   // cedula_frontal | cedula_reverso | rostro
  objectKey      String   @map("object_key")
  hashSha256     String   @map("hash_sha256")
  purgarDespuesDe DateTime? @map("purgar_despues_de")
  @@map("documento_verificacion")
}

model Solicitud {
  id           String   @id @default(uuid())
  codigo       String   @unique            // SM-1042
  clienteId    String   @map("cliente_id")
  categoriaId  String   @map("categoria_id")
  direccionId  String   @map("direccion_id")
  titulo       String
  descripcion  String
  ventanaDesde DateTime @map("ventana_desde")
  ventanaHasta DateTime @map("ventana_hasta")
  urgente      Boolean  @default(false)
  estado       String   @default("abierta") // abierta | cotizada | contratada | cancelada
  motivoCancelacion String? @map("motivo_cancelacion")
  creadaEn     DateTime @default(now()) @map("creada_en")
  @@map("solicitud")
}

model SolicitudFoto { id String @id @default(uuid()); solicitudId String @map("solicitud_id"); objectKey String @map("object_key"); orden Int; @@map("solicitud_foto") }

model Cotizacion {
  id                String   @id @default(uuid())
  solicitudId       String   @map("solicitud_id")
  profesionalId     String   @map("profesional_id")
  montoClp          Int      @map("monto_clp")
  descripcionTrabajo String  @map("descripcion_trabajo")
  condiciones       Json     // { materialesIncluidos: bool, garantiaDias: int, notas: string }
  agendaPropuesta   DateTime @map("agenda_propuesta")
  expiraEn          DateTime @map("expira_en")
  estado            String   @default("enviada") // enviada | aceptada | rechazada | expirada | descartada
  creadaEn          DateTime @default(now()) @map("creada_en")
  @@unique([solicitudId, profesionalId])
  @@map("cotizacion")
}

model Servicio {
  id            String   @id @default(uuid())
  solicitudId   String   @unique @map("solicitud_id")
  cotizacionId  String   @unique @map("cotizacion_id")
  profesionalId String   @map("profesional_id")
  agendadoPara  DateTime @map("agendado_para")
  estado        String   @default("contratado_pendiente_pago")
  comisionPct   Decimal  @map("comision_pct")
  iniciadoEn    DateTime? @map("iniciado_en")
  finalizadoEn  DateTime? @map("finalizado_en")
  @@map("servicio")
}

model ServicioEstado {
  id            String   @id @default(uuid())
  servicioId    String   @map("servicio_id")
  estadoAnterior String? @map("estado_anterior")
  estadoNuevo   String   @map("estado_nuevo")
  actorId       String?  @map("actor_id")
  motivo        String?
  ocurridoEn    DateTime @default(now()) @map("ocurrido_en")
  @@map("servicio_estado")
}

model Pago {
  id               String   @id @default(uuid())
  servicioId       String   @map("servicio_id")
  tipo             String   // inicial | adicional
  montoServicioClp Int      @map("monto_servicio_clp")
  montoComisionClp Int      @map("monto_comision_clp")
  montoTotalClp    Int      @map("monto_total_clp")
  estado           String   @default("pendiente") // pendiente | en_proceso | confirmado | rechazado | reembolsado
  mpPreferenceId   String?  @map("mp_preference_id")
  mpPaymentId      BigInt?  @unique @map("mp_payment_id")
  idempotencyKey   String   @unique @map("idempotency_key")
  confirmadoEn     DateTime? @map("confirmado_en")
  @@map("pago")
}

model CargoAdicional {
  id          String   @id @default(uuid())
  servicioId  String   @map("servicio_id")
  pagoId      String?  @map("pago_id")
  motivo      String
  descripcion String
  montoClp    Int      @map("monto_clp")
  estado      String   @default("propuesto") // propuesto | aprobado | rechazado | pagado
  aprobadoEn  DateTime? @map("aprobado_en")
  @@map("cargo_adicional")
}

model Disputa {
  id           String   @id @default(uuid())
  servicioId   String   @map("servicio_id")
  reclamanteId String   @map("reclamante_id")
  motivo       String
  detalle      String
  estado       String   @default("abierta")
  resolucion   String?
  resueltaEn   DateTime? @map("resuelta_en")
  @@map("disputa")
}

model Reembolso {
  id        String   @id @default(uuid())
  pagoId    String   @map("pago_id")
  disputaId String?  @map("disputa_id")
  montoClp  Int      @map("monto_clp")
  estado    String   @default("solicitado") // solicitado | procesado | rechazado
  mpRefundId BigInt? @map("mp_refund_id")
  @@map("reembolso")
}

model Resena {
  id         String   @id @default(uuid())
  servicioId String   @map("servicio_id")
  autorId    String   @map("autor_id")
  evaluadoId String   @map("evaluado_id")
  puntaje    Int
  comentario String?
  creadaEn   DateTime @default(now()) @map("creada_en")
  @@unique([servicioId, autorId])
  @@map("resena")
}

model Mensaje {
  id          String   @id @default(uuid())
  solicitudId String?  @map("solicitud_id")
  servicioId  String?  @map("servicio_id")
  autorId     String   @map("autor_id")
  cuerpo      String
  leidoEn     DateTime? @map("leido_en")
  creadoEn    DateTime @default(now()) @map("creado_en")
  @@map("mensaje")
}

model Notificacion {
  id         String   @id @default(uuid())
  usuarioId  String   @map("usuario_id")
  tipo       String
  titulo     String
  cuerpo     String?
  urlDestino String   @map("url_destino")
  leidaEn    DateTime? @map("leida_en")
  creadaEn   DateTime @default(now()) @map("creada_en")
  @@map("notificacion")
}

model ConfigComision {
  id           String   @id @default(uuid())
  porcentaje   Decimal
  vigenteDesde DateTime @map("vigente_desde")
  creadaPor    String   @map("creada_por")
  @@map("config_comision")
}

model RegistroAdmin {
  id         String   @id @default(uuid())
  adminId    String   @map("admin_id")
  accion     String
  entidad    String
  entidadId  String   @map("entidad_id")
  detalle    Json?
  ocurridoEn DateTime @default(now()) @map("ocurrido_en")
  @@map("registro_admin")
}
```

Restricciones adicionales que van en una migración SQL explícita, porque son las que garantizan las reglas de negocio:

```sql
ALTER TABLE config_comision ADD CONSTRAINT comision_rango CHECK (porcentaje >= 5 AND porcentaje <= 10);
ALTER TABLE cotizacion     ADD CONSTRAINT cotizacion_monto CHECK (monto_clp > 0);
ALTER TABLE cotizacion     ADD CONSTRAINT cotizacion_vencimiento CHECK (expira_en > creada_en);
ALTER TABLE pago           ADD CONSTRAINT pago_total_coherente
  CHECK (monto_total_clp = monto_servicio_clp + monto_comision_clp);
ALTER TABLE resena         ADD CONSTRAINT resena_puntaje CHECK (puntaje BETWEEN 1 AND 5);

CREATE INDEX perfil_busqueda ON perfil_profesional (disponible) WHERE estado_verificacion = 'verificado';
CREATE INDEX cobertura_idx   ON cobertura_comuna (comuna, perfil_id);
CREATE INDEX cotizacion_vence_idx ON cotizacion (expira_en) WHERE estado = 'enviada';
CREATE INDEX bitacora_idx    ON servicio_estado (servicio_id, ocurrido_en DESC);

REVOKE UPDATE, DELETE ON servicio_estado, registro_admin FROM servicematch_app;
```

---

## 8. API

Convenciones: prefijo `/api/v1`; token en `Authorization: Bearer`; errores en formato problem+json con `code` estable; paginación por cursor (`cursor`, `limit`); `Idempotency-Key` en las operaciones de cobro; fechas ISO 8601; montos enteros.

```json
HTTP/1.1 409 Conflict
{
  "type": "https://servicematch.cl/errors/cotizacion-expirada",
  "title": "La cotización ya no está vigente",
  "status": 409,
  "code": "COTIZACION_EXPIRADA",
  "detail": "La cotización venció el 2026-10-24T20:00:00-03:00.",
  "instance": "/api/v1/cotizaciones/0193f0a1/aceptar"
}
```

**Público y autenticación**: `POST /auth/registro` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` · `POST /auth/recuperar` · `POST /auth/restablecer` · `GET /categorias` · `GET /profesionales` (filtros: `categoria`, `comuna`, `fecha`, `ratingMin`, `precioMax`, `disponibleAhora`, `orden`) · `GET /profesionales/:id`.

**Cliente**: `GET /mi/resumen` · `POST /solicitudes` · `GET /solicitudes` · `GET /solicitudes/:id` · `POST /solicitudes/:id/fotos` · `POST /solicitudes/:id/cancelar` · `POST /cotizaciones/:id/aceptar` · `POST /cotizaciones/:id/rechazar` · `POST /servicios/:id/checkout` · `GET /servicios/:id` · `POST /servicios/:id/cancelar` · `POST /servicios/:id/disputas` · `GET /servicios/:id/cargos` · `POST /cargos/:id/aprobar` · `POST /cargos/:id/rechazar` · `POST /servicios/:id/resena` · `GET /historial` · `GET /notificaciones` · `POST /notificaciones/:id/leer` · `GET|PATCH /mi/perfil` · `GET|POST|DELETE /mi/direcciones`.

**Prestador**: `GET /pro/inicio` · `PATCH /pro/perfil` · `PUT /pro/disponibilidad` · `PATCH /pro/disponible` · `POST /pro/verificacion/documentos` · `POST /pro/verificacion` · `GET /pro/verificacion` · `GET /pro/solicitudes` · `POST /pro/solicitudes/:id/descartar` · `POST /pro/cotizaciones` · `GET /pro/cotizaciones` · `GET /pro/agenda` · `POST /servicios/:id/iniciar` · `POST /servicios/:id/finalizar` · `POST /servicios/:id/cargos` · `POST /servicios/:id/resena-cliente` · `GET /pro/ganancias`.

**Administración**: `GET /admin/resumen` · `GET /admin/verificaciones` · `GET /admin/verificaciones/:id` · `POST /admin/verificaciones/:id/aprobar` · `POST /admin/verificaciones/:id/rechazar` · `GET /admin/usuarios` · `POST /admin/usuarios/:id/suspender` · `POST /admin/usuarios/:id/reactivar` · `GET /admin/servicios` · `GET /admin/transacciones` · `GET|PUT /admin/comision` · `GET /admin/disputas` · `POST /admin/disputas/:id/resolver` · `GET /admin/registros`.

**Webhook**: `POST /webhooks/mercadopago` (público, valida firma).

---

## 9. Reglas de negocio no negociables

### 9.1 Ciclo de vida

Estados visibles del servicio (REQ-06): `Solicitado → Cotizado → Contratado → En ejecución → Finalizado`, más `Cancelado` y `En disputa`. Los dos primeros viven en `solicitud.estado`; el resto en `servicio.estado`, que agrega el intermedio interno `contratado_pendiente_pago` (no se muestra como tal: el cliente ve la pantalla de pago).

Transiciones permitidas, validadas en el servicio de dominio desde `packages/shared`:

| Transición | Quién | Precondición |
|---|---|---|
| abierta → cotizada | Prestador | Cotización válida y prestador verificado |
| cotizada → contratado_pendiente_pago | Cliente | Cotización vigente y solicitud sin servicio |
| → contratado | Sistema | Mercado Pago confirma el pago inicial |
| contratado → en_ejecucion | Prestador | Pago inicial confirmado |
| en_ejecucion → finalizado | Prestador | Sin cargos adicionales propuestos pendientes |
| cualquiera → cancelado | Cliente, prestador o admin | Motivo obligatorio; si hubo pago, se evalúa reembolso |
| en_ejecucion o finalizado → en_disputa | Cliente o prestador | Dentro del plazo de reclamo |
| en_disputa → finalizado o cancelado | Admin | Resolución registrada |

Cualquier transición no declarada se rechaza con 409, aunque el rol sea correcto.

### 9.2 Trazabilidad de requisitos

Implementa cada regla donde dice la columna derecha y escribe la prueba que falla si se elimina el mecanismo.

| Regla | Mecanismo |
|---|---|
| REQ-01 / RN-01 Cuenta única por correo, permisos por rol | `UNIQUE` en `usuario.email`; rol en el token y verificado por middleware |
| REQ-02 Búsqueda y geolocalización | Filtros por especialidad, comuna, fecha y disponibilidad; distancia calculada desde la dirección del cliente; si falla el servicio de geo, ingreso manual de comuna y orden degradado |
| REQ-03 Solicitud de servicio | Código `SM-####` secuencial, campos obligatorios validados con Zod; si falta algo, no se registra y se indica qué completar |
| REQ-04 / RN-06 Cotizaciones | Descripción, valor, condiciones y vigencia obligatorios; aceptar solo si está vigente |
| REQ-05 / RN-03 Pago | Pago inicial por Mercado Pago antes de iniciar el trabajo; comisión 5–10% al cliente sobre el valor del servicio |
| REQ-06 Seguimiento | Los siete estados y la bitácora `servicio_estado` |
| REQ-07 / REQ-13 / RN-07 Evaluaciones | `UNIQUE(servicio_id, autor_id)` y solo con servicio finalizado |
| REQ-08 Perfil y disponibilidad | Switch disponible/no disponible; validación de campos del perfil |
| REQ-09 / RN-02 Verificación | Cédula + rostro obligatorios; estados pendiente, verificado, rechazado; **solo verificados aparecen en búsqueda y reciben solicitudes** |
| REQ-10 Recepción de solicitudes | Notificación solo a prestadores cuya especialidad y cobertura calcen |
| REQ-11 Emisión de cotizaciones | Rechazo de cotización sin valor, descripción o vigencia; notificación al prestador cuando el cliente responde |
| REQ-12 Actualización del servicio | Cambios a en ejecución y finalizado con fecha registrada |
| REQ-14 Validación de prestadores | Aprobación o rechazo con fecha, resultado y responsable |
| REQ-15 / RN-10 Gestión de usuarios | Suspender y reactivar con motivo, fecha y administrador; suspensión invalida los tokens activos |
| REQ-16 Monitoreo de pagos | Listado filtrable por fecha, usuario y estado |
| REQ-17 Configuración de comisión | `CHECK` de 5 a 10, historial con vigencia y responsable, rechazo fuera de rango |
| REQ-18 / RN-09 Disputas y reembolsos | Antecedentes, estado y resolución; reembolso solo por decisión administrativa |
| REQ-19 Notificaciones | Los seis eventos: nueva solicitud, nueva cotización, aceptación o rechazo, confirmación o rechazo de pago, cambio de estado, disputa |
| REQ-20 / RN-11 Historial | Consulta de servicios propios; **sin acciones de borrado para clientes ni prestadores** |
| RN-04 Pagos adicionales | Nacen en `propuesto`, requieren aprobación explícita y generan su propio cobro |
| RN-05 Evasión de comisiones | Teléfono y correo ocultos hasta que exista servicio con pago confirmado; la coordinación previa va por mensajería interna |
| RN-08 Cancelaciones | Usuario responsable, fecha y motivo obligatorios; advertencia de posibles condiciones tras el pago, **sin inventar un porcentaje de penalización** |
| RNF-02 Seguridad | Argon2id, autorización por rol y por recurso, bloqueo temporal tras varios intentos fallidos (el UI kit ya trae el aviso `Te quedan 2 intentos antes del bloqueo temporal`) |
| RNF-03 Privacidad | Solo los datos necesarios por proceso; cada usuario ve únicamente lo propio |
| RNF-04 Integridad | Sin evaluaciones duplicadas ni doble confirmación del mismo pago |
| RNF-07 / RNF-08 Responsivo y accesible | Layouts propios de 390 px y 1440 px, navegación por teclado, foco visible, estados con texto además de color, contraste AA |
| RNF-11 Registro de errores | Logs de autenticación, pagos e integraciones con fecha, tipo y contexto, sin contraseñas ni datos de tarjeta |
| RNF-14 Fallas externas | Si Mercado Pago o geolocalización no responden, se informa y **no se registra pago exitoso ni ubicación válida** |

---

## 10. Pagos

1. El cliente acepta una cotización vigente. Dentro de una transacción con la fila bloqueada (`SELECT … FOR UPDATE`) se crea el `servicio` en `contratado_pendiente_pago`, se marca la cotización como `aceptada`, las demás como `descartada` y la solicitud como `contratada`. La unicidad de `servicio.solicitud_id` es la garantía real de RN-06 ante aceptaciones simultáneas.
2. `POST /servicios/:id/checkout` calcula el desglose y crea la preferencia de Checkout Pro con `external_reference = servicio.id` y clave de idempotencia:

```
comision_clp = round(monto_servicio_clp * porcentaje / 100)
total_clp    = monto_servicio_clp + comision_clp
```

   Ejemplo del UI kit, con comisión vigente de 8%: servicio `$38.000` + comisión `$3.040` = **`$41.040`**. Úsalo como caso de prueba.
3. El retorno del navegador **no confirma nada**: la interfaz muestra "pago en proceso". El estado solo cambia con el webhook o con la conciliación.
4. El webhook valida la firma, es idempotente por `mp_payment_id`, consulta el pago en la API de Mercado Pago (nunca confía en el cuerpo de la notificación) y recién entonces actualiza. Mapeo: `approved → confirmado`, `pending|in_process|authorized → en_proceso`, `rejected|cancelled → rechazado`, `refunded|charged_back → reembolsado`.
5. Trabajo `conciliar-pagos` cada 10 minutos sobre pagos pendientes de más de 15 minutos, para cubrir webhooks perdidos.
6. Cargos adicionales: cobro independiente, solo tras aprobación del cliente.
7. Reembolsos: siempre desde una decisión administrativa, con clave de idempotencia.
8. **Modo demo**: variable `MP_MODE=sandbox|fake`. En `fake` un servicio local simula los estados de Mercado Pago (aprobado, pendiente, rechazado, caído) para poder demostrar todos los caminos sin depender de la red. La interfaz es idéntica en ambos modos y en ningún caso se marca un pago como exitoso sin confirmación.

Nunca almacenes datos completos de tarjeta. El pago al prestador queda fuera del MVP: la interfaz no promete liquidaciones automáticas.

---

## 11. Autenticación, autorización y datos sensibles

- Argon2id para contraseñas; JWT de acceso de 15 min; refresh opaco de 30 días en cookie HttpOnly, SameSite=Lax, rotado en cada uso; `credVersion` invalida sesiones al suspender una cuenta.
- Autorización en dos niveles: el rol habilita la ruta, la pertenencia al recurso habilita la operación. Todo servicio verifica que el usuario sea parte de la solicitud, cotización o servicio que toca.
- Rate limit en login, registro, recuperación, subida de archivos y creación de solicitudes.
- Los documentos de verificación van a bucket privado, se suben con URL firmada desde el navegador y se leen con URL firmada de 5 minutos solo desde la ficha de revisión; cada lectura queda en `registro_admin`. Se guarda el hash SHA-256 y una fecha de purga.
- Los datos de contacto se ocultan en la capa de serialización, no en la interfaz.
- Logs con redacción de `password`, `token`, `authorization`, `cookie` y cualquier campo de tarjeta.

---

## 12. Datos semilla

`pnpm db:seed` debe dejar la base en el estado exacto de los mockups, con fechas relativas a hoy para que las cuentas regresivas siempre funcionen (`hoy a las 09:12`, `vence en 6 h`, `vence en 2 días`, una cotización ya vencida).

**Usuarios** (contraseña única de demo `Demo.1234` para todos):
- Cliente: `Camila Rojas` · camila@demo.cl · Providencia, Av. Providencia 1234.
- Prestadores verificados: `Pedro Muñoz` (gasfitería · calefont, 12 años, 4,9 con 128 reseñas, desde $25.000, a 1,2 km, hoy 15:00–19:00, cobertura Providencia, Ñuñoa, Las Condes, Santiago, Recoleta), `Andrea Soto` (gasfitería · destapes, 7 años, 4,8 con 86, desde $22.000, a 2,4 km, hoy 17:00–20:00), `Javiera Vidal` (gasfitería · instalaciones, 4,6 con 41, desde $24.000, a 4,0 km, hoy 18:00–21:00), `Luis Herrera` (gasfitería · termos y calefont, 4,7 con 64, desde $28.000, a 3,1 km, mañana desde 9:00, **no disponible**).
- Prestadores en otros estados de verificación: uno `pendiente` y uno `rechazado`, para la cola de administración.
- Clientes secundarios: `Tomás G.`, `María F.`, `Sofía L.`, `Diego M.`.
- Administrador: `admin@servicematch.cl`.
- Suficientes prestadores adicionales para que el contador diga `12 prestadores cerca de ti`.

**Solicitud SM-1042** — `Fuga bajo el lavaplatos`, gasfitería, Av. Providencia 1234, publicada hoy 09:12, ventana jue 23 oct por la tarde, 2 fotos, estado `cotizada`, descripción: "Hay una filtración en el sifón del lavaplatos de la cocina. Gotea todo el día y el mueble de abajo está mojado."

Sus tres cotizaciones:

| Prestador | Monto | Condiciones | Visita | Vigencia |
|---|---|---|---|---|
| Pedro Muñoz | $38.000 | materiales incluidos, garantía 30 días | jue 23 oct 10:30 | hoy 20:00 (`Vence en 6 h`) |
| Andrea Soto | $32.000 | materiales **no** incluidos, garantía 15 días | mié 22 oct 18:00 | jue 23 oct (`Vence en 2 días`) |
| Luis Herrera | $45.000 | materiales incluidos, garantía 60 días | lun 20 oct 9:00 | vencida (`Vencida`) |

Descripciones: Pedro "Cambio de sifón de PVC, revisión de la llave de paso y sellado con silicona."; Andrea "Reparación de la filtración y ajuste del sifón. Si hay que cambiarlo, se cobra aparte."; Luis "Cambio completo de sifón y desagüe del lavaplatos con material metálico."

Chat de la solicitud, tres mensajes con horas 10:02, 10:05 y 10:07, tal como aparecen en el mockup.

**Otras solicitudes abiertas** para la bandeja del prestador: `Calefont no enciende` (urgente, Ñuñoa, a 3,4 km, hoy 18:00–20:00, 1 foto, Tomás G., hace 40 min) y `Cambiar llave de la ducha` (Las Condes, a 4,8 km, sáb 25 oct por la mañana, María F., hace 2 h).

**Servicios de Pedro**: uno `contratado` con pago confirmado agendado hoy 15:00 (`Instalación de calefont`, Sofía L., Ñuñoa), uno `en_ejecucion` desde las 11:00 (`Destape de lavamanos`, Diego M., Providencia), y finalizados suficientes para `4 trabajos esta semana`, `5 cotizaciones enviadas` (una pendiente, dos aceptadas, una rechazada: $38.000, $24.000, $65.000, $20.000) y la última evaluación de Diego M. con 5 estrellas y el comentario "Muy prolijo y puntual. Explicó todo antes de empezar."

**Transversal**: comisión vigente 8%; pagos en los cuatro estados; un cargo adicional propuesto; una disputa abierta; notificaciones que den los contadores del mockup (`Mis solicitudes 2`, `Cotizaciones 3`, `Notificaciones 4` para Camila; `Solicitudes 3`, `Notificaciones 2` para Pedro).

Nota: el mockup rotula `MARTES 21 DE OCTUBRE`; genera la fecha desde `new Date()` en vez de fijarla, para que el día de la semana y el texto siempre coincidan.

---

## 13. Pruebas

Objetivo del proyecto: sobre 80% de cobertura en flujos críticos y 0 defectos bloqueantes.

- **Unitarias**: cálculo de comisión y redondeo (incluido el caso $38.000 → $3.040 → $41.040), validación de transiciones, esquemas Zod, ocultamiento de datos de contacto, formato CLP y de fechas.
- **Integración (API + Postgres real)**: aceptación concurrente de dos cotizaciones termina con un solo servicio; cotización vencida no se puede aceptar; webhook duplicado no confirma dos veces; webhook con firma inválida responde 401 y no escribe; prestador no verificado no aparece en búsqueda ni recibe solicitudes; prestador no puede iniciar el trabajo sin pago confirmado; cliente no puede leer el servicio de otro; comisión fuera del rango 5–10 se rechaza; no se puede insertar una segunda reseña del mismo autor.
- **E2E (Playwright)** sobre los tres recorridos: cliente busca, solicita, recibe cotizaciones, acepta, paga (modo `fake`), sigue el servicio y evalúa; prestador se registra, se verifica, recibe solicitud, cotiza, ejecuta y finaliza; administrador aprueba una verificación y cambia la comisión.
- **Visual**: snapshot de las tres pantallas de los mockups en 1440 px y 390 px.

---

## 14. Plan de trabajo

Trabaja por fases y **detente al final de cada una** para mostrar lo hecho antes de seguir. No intentes el MVP completo en una sola pasada.

1. **Fase 0 — Plan.** Revisa los mockups, levanta el monorepo vacío, escribe `CLAUDE.md` y un `PLAN.md` con tu desglose por fases y las dudas que tengas. Para aquí.
2. **Fase 1 — Base.** Docker Compose con Postgres, Prisma con el esquema completo, migraciones, seed, Express con middleware transversal, autenticación con los tres roles, Vite con rutas por rol y guardas. Entregable: login funcionando con los tres usuarios de demo.
3. **Fase 2 — Design system.** Todos los componentes de la sección 5.4 renderizados en una ruta interna `/dev/ui` que replique el UI kit del mockup, para comparar lado a lado. Entregable: esa página.
4. **Fase 3 — Las tres pantallas del mockup** con datos reales del seed, desktop y móvil.
5. **Fase 4 — Flujo del cliente completo**: solicitud, cotizaciones, checkout, pagos, seguimiento, reseña, historial.
6. **Fase 5 — Flujo del prestador completo**: onboarding, verificación, bandeja, cotizador, agenda, trabajo activo, cargos adicionales, ganancias.
7. **Fase 6 — Administración**: verificaciones, usuarios, servicios, transacciones, comisión, disputas, registros.
8. **Fase 7 — Transversales**: notificaciones, mensajería, estados vacíos, errores, skeletons, accesibilidad, responsive final.
9. **Fase 8 — Pruebas y cierre**: suite completa, README con instalación y despliegue, guía de usuario, datos de demo, verificación de la lista de la sección 15.

En cada fase: commits pequeños en inglés con conventional commits, rama por funcionalidad, pruebas junto al código y nada de `console.log` en el código final.

---

## 15. Definición de terminado

Antes de declarar el MVP listo, verifica una por una:

- [ ] Las tres pantallas del mockup son reconocibles lado a lado con la imagen, en desktop y en móvil.
- [ ] Ningún componente nuevo se salió del UI kit ni de los tokens de la sección 5.
- [ ] Los 20 requerimientos funcionales y las 11 reglas de negocio tienen implementación y prueba.
- [ ] Un prestador no verificado no aparece en búsqueda ni recibe solicitudes.
- [ ] Una cotización vencida no se puede aceptar y lo explica en pantalla.
- [ ] Aceptada una cotización, las otras quedan descartadas y la solicitud no se puede readjudicar.
- [ ] La comisión se muestra desglosada antes de pagar y está entre 5% y 10%.
- [ ] Ningún pago se marca como confirmado sin confirmación de Mercado Pago.
- [ ] El trabajo no puede iniciarse sin pago confirmado.
- [ ] Un cargo adicional no se cobra sin aprobación del cliente.
- [ ] Teléfono y correo no se exponen antes de contratar, ni en la API ni en la interfaz.
- [ ] Cada cambio de estado quedó en la bitácora con actor, fecha y motivo.
- [ ] Ningún usuario puede ver ni borrar datos de otra cuenta.
- [ ] Todos los estados se entienden sin depender del color.
- [ ] Los flujos críticos se recorren completos con teclado.
- [ ] `pnpm test` y `pnpm test:e2e` pasan en limpio sobre 80% en flujos críticos.
- [ ] `pnpm db:seed` reproduce exactamente el contenido de los mockups.
- [ ] El README permite a otra persona levantar el proyecto desde cero.

---

## 16. Microcopy literal

Usa estos textos tal cual. Son los que aparecen en los mockups y en el UI kit.

**Cliente · búsqueda**: `¿Qué necesitas arreglar hoy? Te mostramos prestadores verificados cerca de ti.` · `Nueva solicitud` · `Buscar` · `Usar mi ubicación actual` · `12 prestadores cerca de ti` · `Ordenar por` · `Mejor evaluados` · `Disponible ahora` · `Verificados` · `4,5 ★ o más` · `Hasta $30.000` · `Visita desde` · `Ver perfil` · `Solicitar cotización` · `Disponible` · `No disponible` · `Radio 5 km` · `Tu ubicación` · `Seleccionado` · `¿Prefieres que te coticen?` · `Publica tu solicitud y los prestadores de tu zona te envían cotizaciones con precio, condiciones y vigencia.` · `Publicar solicitud →`

**Cliente · cotizaciones**: `Publicada hoy a las 09:12` · `Editar solicitud` · `3 cotizaciones recibidas` · `Valor estimado` · `Materiales incluidos` · `Materiales no incluidos` · `Garantía de 30 días` · `Vigente hasta hoy 20:00` · `Vence en 6 h` · `Vence en 2 días` · `Vencida` · `Esta cotización venció y ya no se puede aceptar.` · `Aceptar` · `Rechazar` · `1 cotización vencida` · `Chat con Pedro Muñoz` · `Contacto oculto hasta contratar` · `Escribe un mensaje…` · `Enviar` · `Antes de aceptar` · `Al aceptar una cotización, la solicitud queda adjudicada a ese prestador y las demás se cierran automáticamente.` · `Luego pagas con Mercado Pago. El servicio queda como pagado solo cuando Mercado Pago confirma la transacción.`

**Prestador · panel**: `Tienes 3 solicitudes nuevas en tu zona y 2 trabajos para hoy.` · `Disponible` · `Estás disponible` · `Recibes solicitudes nuevas` · `Ver agenda` · `Perfil verificado` · `Apareces en las búsquedas de Providencia, Ñuñoa, Las Condes, Santiago y Recoleta.` · `Ver mi perfil` · `Solicitudes nuevas` · `Cotizaciones enviadas` · `Trabajos esta semana` · `Calificación` · `en tu especialidad y zona` · `2 aceptadas este mes` · `128 evaluaciones` · `Todas` · `Urgentes` · `Más cercanas` · `URGENTE` · `Aceptar y cotizar` · `Agenda de hoy` · `Iniciar trabajo` · `Marcar como finalizado` · `Mis cotizaciones` · `Ver todas` · `Última evaluación`

**Avisos del UI kit**: `Te llevaremos a Mercado Pago para completar el pago.` (info) · `Pago confirmado por Mercado Pago.` (éxito) · `Te quedan 2 intentos antes del bloqueo temporal.` (advertencia) · `Falta 1 dato obligatorio: fecha preferida.` (error) · `Selecciona una fecha preferida.` (error de campo) · placeholder de fecha `dd / mm / aaaa` · selector de vigencia `24 horas`.

**Nunca uses**: "Gestiona tu flujo de trabajo", "Optimiza tu experiencia" ni frases de marketing vacías. Si una pantalla necesita un texto que no está acá, escríbelo en el mismo registro: directo, en español de Chile, explicando qué está pasando.

---

## 17. Configuración de Tailwind

Deja los tokens en una sola fuente, `packages/config/tailwind-preset.ts`, y que `apps/web` lo extienda:

```ts
export default {
  theme: {
    extend: {
      colors: {
        bg: '#192032',
        surface: '#1F2638',
        card: { DEFAULT: '#273246', hover: '#2E3950' },
        elevated: '#303B51',
        border: { DEFAULT: '#343E57', soft: '#2B3550' },
        text: { DEFAULT: '#EEF3FB', muted: '#A8B1C4', dim: '#76829A' },
        primary: { DEFAULT: '#FFAD7B', soft: '#FFDCC2', ink: '#1A2234' },
        info: '#A9D7FD',
        success: '#A9EBC5',
        warning: '#FEE099',
        danger: '#FE9D9E',
        purple: '#CEC3FD',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: { card: '12px', control: '10px' },
      spacing: { 18: '4.5rem' },
    },
  },
}
```

Define los chips de estado como utilidades componibles (por ejemplo `chip-success`, `chip-warning`) construidas con `color-mix` o con valores precalculados al 14% y 32% sobre `--card`, para no repetir opacidades a mano en cada pantalla.

---

## 18. Qué no hacer

- No cambies el stack, la paleta, la tipografía ni los nombres de los estados.
- No inventes funcionalidades que no están en la sección 2, por "completitud".
- No uses librerías de componentes ni plantillas de dashboard.
- No rellenes espacio con gráficos, métricas decorativas ni ilustraciones.
- No pongas emoji como iconos de interfaz.
- No uses degradados morado-azul, glassmorphism, sombras grandes ni bordes brillantes.
- No inventes porcentajes de penalización, coberturas de seguro, garantías de reembolso ni liquidaciones automáticas.
- No guardes datos de tarjeta, documentos de identidad en almacenamiento público ni secretos en el repositorio.
- No borres ni edites filas de historial ni de bitácora.
- No dejes datos simulados escritos a mano en los componentes: todo sale de la API y del seed.
- Si una decisión queda ambigua, escríbela en `PLAN.md` como pregunta abierta y usa la opción más conservadora, en vez de resolverla en silencio.
