# ServiceMatch MVP 1.0 · Plan de trabajo

> **Estado al 01-11-2026:** Fase 0 terminada en la rama `chore/phase-0-setup`, ajustada a los
> mockups y sin dudas abiertas: todas quedaron como decisiones al final de este plan. La Fase 1
> parte el 02-11, cinco días después de lo previsto; el atraso se absorbe llevando las fases 1 y 2
> en paralelo, como ya proponía el calendario.

Hoy es el martes de la semana 9 de 14. Entre el 28-10 y la demo del jueves 10-12 quedan seis
semanas para las fases 1 a 8, así que el calendario de abajo trabaja en dos frentes en paralelo
(backend y frontend) y deja la Fase 8 solo para pruebas y cierre.

## Cómo se usa este plan

- Una fase a la vez. Al cerrar cada una se detiene el trabajo para revisarla (§14 del prompt).
- Al empezar una fase se escribe su plan detallado en `docs/plans/fase-N-<tema>.md`, con tareas
  chicas, la prueba primero y un commit por tarea. Este archivo guarda el mapa general, las
  decisiones y las dudas.
- Una duda sin respuesta no detiene el trabajo: se avanza con la propuesta indicada, que es la
  opción más conservadora (§18).

## Fase 0 · Plan (terminada)

- [x] Monorepo pnpm 10 con `apps/web`, `apps/api`, `packages/shared` y `packages/config`.
- [x] TypeScript 5.6 strict, ESLint 9 (flat config), Prettier, Husky con lint-staged.
- [x] Preset de Tailwind con los tokens: tema claro por defecto y oscuro opcional de los mockups.
- [x] `formatearClp` con 11 pruebas; ruta `GET /api/v1/health` con prueba de Supertest.
- [x] `CLAUDE.md` con el resumen operativo y este `PLAN.md`.
- [x] Mockups revisados y medidos: escala, colores, bordes, sombras, radios, tipografía y layout en
      `docs/mockups/medidas.md`. Tokens del preset ajustados a esas medidas, con 118 pruebas de
      contraste y de nombres de utilidades.
- [x] Propuesta visual: <https://claude.ai/artifact/ViHnuux8nztLkJ1DcSsq4z>, actualizada el
      28-10 con el estilo de los mockups y la comparación lado a lado (privada: para que el
      equipo la vea, compártela desde el menú Share de la página).

Verificación en esta máquina con Node 22.23.2 (28-10, después del ajuste a los mockups):

| Comando          | Resultado                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `pnpm typecheck` | 4 paquetes sin errores                                                                      |
| `pnpm test`      | 139 pruebas pasan (118 de `config`, 20 de `shared`, 1 de `api`); `web` aún no tiene pruebas |
| `pnpm build`     | web: 9,3 kB de CSS y 143 kB de JS; api: `dist/server.js`                                    |
| `pnpm lint`      | ESLint y Prettier sin observaciones                                                         |
| `pnpm dev`       | Health responde directo en :3000 y a través del proxy de Vite en :5173                      |

Scripts de §4 que todavía no existen: `db:migrate`, `db:seed` y el worker de `pnpm dev` (Fase 1);
`test:e2e` (Fase 1, con una prueba de humo de login).

## Calendario propuesto

| Fase                  | Fechas        | Frente                                |
| --------------------- | ------------- | ------------------------------------- |
| 1 · Base              | 28-10 → 04-11 | Backend, más router y guardas en web  |
| 2 · Design system     | 29-10 → 06-11 | Frontend, en paralelo con la Fase 1   |
| 3 · Pantallas mockup  | 05-11 → 12-11 | Frontend con endpoints de lectura     |
| 4 · Flujo del cliente | 11-11 → 20-11 | Equipo completo                       |
| 5 · Flujo prestador   | 16-11 → 26-11 | Equipo completo                       |
| 6 · Administración    | 23-11 → 30-11 | Equipo completo                       |
| 7 · Transversales     | 26-11 → 03-12 | Equipo completo                       |
| 8 · Pruebas y cierre  | 01-12 → 09-12 | Equipo completo (el 08-12 es feriado) |
| Demo final            | 10-12         |                                       |

Reparto sugerido por frente, para que lo ajustes como gerente de proyecto:

| Persona          | Frente sugerido                                                          |
| ---------------- | ------------------------------------------------------------------------ |
| Rocío Marquez    | Identidad y sesiones, perfiles, verificación, API de administración      |
| Tomás Capo       | Búsqueda, solicitudes, cotizaciones, servicios y máquina de estados      |
| Agustín Jadue    | Pagos con Mercado Pago, trabajos pg-boss, notificaciones, almacenamiento |
| Daniela Muñoz    | Design system y pantallas del cliente                                    |
| Ignacio Phillips | Pantallas del prestador y de administración                              |
| Benjamín Saldías | Gestión, router, guardas y sesión en web, integración y E2E              |

## Fase 1 · Base

**Entregable:** login funcionando con los tres usuarios de demo.

- [ ] `docker-compose.yml` con Postgres 16 y Mailpit; script de inicio que crea el rol de
      ejecución `servicematch_app`. `.env.example` con todas las variables.
- [ ] Prisma 5 con el esquema completo de §7 más las tablas y campos de la sección
      «Cambios al modelo de datos». Migración SQL explícita con los CHECK, índices y
      `REVOKE` de §7, y una secuencia para los códigos `SM-####`.
- [ ] Dos conexiones: `DATABASE_URL` con `servicematch_app` para la app y `MIGRATION_DATABASE_URL`
      con el dueño del esquema, porque `REVOKE UPDATE, DELETE` exige que la app no sea dueña de
      las tablas.
- [ ] Seed base: categorías, comisión vigente de 8 %, usuarios de demo con `Demo.1234`.
- [ ] Express: `errors` (problem+json), `validate` (Zod), `auth` (JWT de 15 min y
      `cred_version`), `rbac`, `rateLimit`, `audit`, pino-http con redacción y manejo de errores
      asíncronos (Express 4 no los captura solo).
- [ ] Módulo `identidad`: registro con rol, login con Argon2id y bloqueo temporal, refresh opaco
      rotatorio con detección de reutilización, logout, recuperar y restablecer contraseña.
- [ ] `packages/shared`: esquemas Zod de autenticación, máquina de estados del servicio con
      pruebas, formato de fechas es-CL en `America/Santiago`.
- [ ] Web: React Router 6 con rutas por rol y guardas, contexto de sesión, cliente de API con
      refresh automático y TanStack Query.
- [ ] Worker de pg-boss que arranca con `pnpm dev`; `@vitest/coverage-v8`; Playwright con una
      prueba de humo de login para los tres roles.
- [ ] ESLint con reglas que usan tipos en `apps/api` (`no-floating-promises`, `no-misused-promises`).

**Pruebas:** transiciones de la máquina de estados; registro con correo duplicado (RN-01); bloqueo
tras intentos fallidos; rotación del refresh y rechazo de un refresh reutilizado; suspensión que
invalida el token vigente.

## Fase 2 · Design system

**Entregable:** `/dev/ui` con todos los componentes de §5.4 en ambos temas, para comparar lado a
lado con `02-ui-kit.jpeg`. Medidas en `docs/mockups/medidas.md`.

- [ ] Button, Input, Select, DatePicker, Textarea, Checkbox, Radio, Switch, chip de filtro,
      StatusChip tipado por dominio, Badge, Avatar con rotación estable por `userId`, Rating.
- [ ] Card, ListRow, StatCard, EmptyState, Skeleton, Alert, ConfirmDialog, Toast.
- [ ] Stepper de servicio (5 pasos en desktop; «Paso 2 de 5» y puntos en móvil), Sidebar,
      BottomNav, Topbar móvil, QuoteCard, PaymentSummary, Timeline, ChatPanel.
- [ ] Logo como componente SVG: cuadrado naranjo con la casa con check y el punto info.
- [ ] Estados de interacción de las sombras duras (hover y presionado) y foco visible, que los
      mockups no muestran.
- [ ] Selector de tema en el menú de la cuenta: claro por defecto, oscuro opcional, guardado en el
      dispositivo y aplicado antes del primer pintado para que no parpadee.
- [ ] Superposición de mockup en `/dev/ui` (solo en desarrollo): la imagen encima de la página a
      su escala real y con opacidad regulable, para calzar medidas al píxel.
- [ ] Pruebas de Testing Library: StatusChip siempre con texto e icono, Button en carga y
      deshabilitado, cuenta regresiva que se recalcula cada minuto.

## Fase 3 · Pantallas de los mockups

**Entregable:** `/buscar`, `/solicitudes/:id` y `/pro` con datos reales del seed, en 1440 px y 390 px.

- [ ] Seed completo de §12 con fechas relativas a la ejecución (decisión 14).
- [ ] Lectura: `GET /profesionales` con filtros, distancia y orden degradado si falla la
      geolocalización; `GET /solicitudes/:id` con cotizaciones y chat; `GET /pro/inicio`,
      `GET /pro/agenda`; contadores del sidebar.
- [ ] Las tres pantallas con su versión móvil propia: bottom nav, tarjetas apiladas y acordeón
      «1 cotización vencida».
- [ ] Snapshots visuales de Playwright en ambos anchos, y revisión contra los mockups en tema
      oscuro con la superposición de `/dev/ui`.

## Fase 4 · Flujo del cliente

- [ ] Solicitud en tres pasos con fotos y confirmación con código `SM-####`.
- [ ] Aceptar y rechazar cotizaciones dentro de una transacción con `FOR UPDATE`.
- [ ] Checkout con desglose de comisión; Checkout Pro en sandbox y `MP_MODE=fake`; webhook con
      firma e idempotencia; trabajo `conciliar-pagos`; pantallas de procesando, confirmado,
      rechazado, pendiente y servicio no disponible.
- [ ] Seguimiento con bitácora, aprobación de cargo adicional, reseña, historial filtrable por
      dirección, cancelación con motivo, disputa, cuenta y direcciones.

**Pruebas:** aceptación concurrente que deja un solo servicio; cotización vencida (409); webhook
duplicado; firma inválida (401 sin escritura); cliente que intenta leer un servicio ajeno; E2E del
recorrido completo del cliente en modo `fake`.

## Fase 5 · Flujo del prestador

- [ ] Registro y onboarding del perfil: especialidades, cobertura por comuna y disponibilidad semanal.
- [ ] Verificación con cédula (frente y reverso) y rostro, con sus tres estados.
- [ ] Bandeja de solicitudes, editor de cotización con revisión antes de enviar, agenda, trabajo
      activo, cargos adicionales, ganancias, historial y evaluación del cliente.

**Pruebas:** un prestador no verificado no aparece en búsqueda ni recibe solicitudes; no puede
iniciar un trabajo sin pago confirmado; E2E del recorrido del prestador.

## Fase 6 · Administración

- [ ] Resumen, cola de verificaciones y detalle con URL firmada de 5 min registrada en `registro_admin`.
- [ ] Usuarios (suspender y reactivar), servicios en solo lectura, transacciones con filtros,
      comisión con historial, disputas y reembolsos, registros administrativos.

**Pruebas:** comisión fuera de 5–10 rechazada por la API y por el CHECK; E2E en que el
administrador aprueba una verificación y cambia la comisión.

## Fase 7 · Transversales

- [ ] Notificaciones de los seis eventos de REQ-19 y mensajería acotada sin datos de contacto.
- [ ] Estados vacíos, errores en línea, skeletons, diálogos y confirmaciones en todas las pantallas.
- [ ] Teclado y foco visible en los flujos críticos, revisión con axe y responsive final.

## Fase 8 · Pruebas y cierre

- [ ] Cobertura de 80 % o más en `identidad`, `cotizaciones`, `servicios`, `pagos` y `verificacion`.
- [ ] README con instalación y despliegue, guía de usuario, datos de demo y la lista de §15
      revisada punto por punto.
- [ ] Despliegue de la demo y ensayo con el modo `fake` y con sandbox.

## Decisiones tomadas en la Fase 0

| Decisión                                                                                                                                                         | Motivo                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Tema claro por defecto; el oscuro de los mockups queda opcional con `data-theme="dark"` y no sigue al sistema operativo                                          | Pedido del equipo (27 y 28-10-2026). Seguir al sistema mostraría el oscuro a parte de los usuarios   |
| Donde el texto de §5 y los mockups no coinciden, manda el mockup                                                                                                 | Pedido del equipo (28-10) y §0. Las diferencias están en `docs/mockups/medidas.md`                   |
| Estilo de los mockups en ambos temas: tinta de 2 px y sombras duras de 2, 3 y 4 px, radios 14 / 10 / 4, lienzo con puntos cada 24 px                             | Es lo que muestran las cuatro imágenes; el «borde de 1 px sin sombras» de §5.1 no calza con ellas    |
| Tema oscuro con los valores medidos; el claro traduce cada rol y mantiene naranjo `#FFAD7B`, durazno, pastel y tinta                                             | Con borde de tinta, los rellenos claros se distinguen sobre blanco (15,9:1) sin oscurecer el naranjo |
| En claro, naranjo como texto en `primary-strong` (`#B04612`) y títulos grandes en `primary-titulo` (`#D45A1A`); estados con tono profundo y tinte pastel al 30 % | El durazno y los pastel no alcanzan contraste como texto sobre fondo claro                           |
| En oscuro, `text-dim` pasa de `#76829A` a `#8E9AB0`; es la única desviación de color del mockup                                                                  | El valor del mockup queda en 3,3:1 sobre tarjeta (RNF-08 pide AA)                                    |
| La paleta y las sombras por defecto de Tailwind están desactivadas                                                                                               | Que no se pueda salir de los tokens por accidente (§15)                                              |
| Tamaños con nombre propio (`text-titulo-1`, `text-chip`…) medidos en los mockups, y clase `.sobretitulo`                                                         | Tailwind ya tiene una utilidad `overline`, que es otra cosa                                          |
| Tema elegido guardado en el dispositivo, sin campo nuevo en `usuario`                                                                                            | Opción más conservadora: no toca el modelo de datos                                                  |
| pnpm 10.34 vía corepack, Node 22 en `.nvmrc`, lint-staged 16                                                                                                     | lint-staged 17 exige Node 22.22 y los hooks de git corren con el Node del sistema (20 en tu equipo)  |
| Paquetes internos con fuente TypeScript; API empaquetada con tsup y ejecutada con tsx en desarrollo                                                              | Evita compilar `shared` por separado                                                                 |
| `/api` por el proxy de Vite en desarrollo y por un rewrite de Vercel en producción                                                                               | Mismo origen para que la cookie de refresh funcione con SameSite=Lax                                 |
| Dominio en español, infraestructura técnica en inglés                                                                                                            | Sigue los nombres del modelo de datos y de los módulos del prompt                                    |

## Cambios al modelo de datos

El esquema de §7 no alcanza para varias reglas del propio prompt. Se agregan en la Fase 1:

1. Tabla `sesion_refresh` (hash del token, familia, expiración, revocación, reemplazo): el refresh
   opaco rotatorio de §11 necesita guardarse.
2. Tabla `restablecimiento_clave` (hash del token, expiración, uso): para recuperar contraseña.
3. `usuario.intentos_fallidos` y `usuario.bloqueado_hasta`: bloqueo temporal de RNF-02.
4. `perfil_profesional.latitud`, `longitud` y `comuna_base`, redondeadas a unos 100 m: sin una
   ubicación del prestador no se puede mostrar «a 1,2 km».
5. `mensaje.profesional_id`: separa el chat de cada prestador cuando varios cotizan la misma solicitud.
6. Secuencia Postgres para `solicitud.codigo`; el seed inserta `SM-1042` y ajusta la secuencia.
7. Estados de `disputa`: `abierta | en_revision | resuelta` (§7 no los define).

## Riesgos

| Riesgo                                                                  | Mitigación                                                                                            |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Seis semanas para ocho fases                                            | Dos frentes en paralelo; primero lo Must Have; la Fase 7 se va resolviendo dentro de cada fase        |
| Los mockups son JPEG reducidos al 82 %, con ±1 px de precisión          | Medidas confirmadas renderizando candidatos; superposición en `/dev/ui`; sumar originales si aparecen |
| Mercado Pago necesita una URL pública para el webhook                   | `MP_MODE=fake` en local y en E2E; sandbox solo en el ambiente desplegado                              |
| Las capas gratuitas duermen el contenedor y con él el worker de pg-boss | Worker dentro del proceso de la API en producción; calentar el ambiente antes de la demo              |
| Nominatim limita a una consulta por segundo                             | Caché de direcciones geocodificadas y respaldo por centroide de comuna                                |
| ESLint 9 ya no tiene soporte y TypeScript 5.6 quedó atrás               | Se mantienen porque así lo fija el stack (decisión 19)                                                |

## Decisiones de producto, reglas e infraestructura

Todas las dudas quedaron cerradas el 01-11-2026. Se conserva la numeración porque el resto del plan
las cita. Si el equipo quiere cambiar alguna, se reabre aquí.

### Mockups, paleta y tema (28-10)

1. **Mockups.** Están en `docs/mockups/` con los nombres de §0 (en JPEG) y medidos en
   `docs/mockups/medidas.md`.
2. **Paleta y estilo.** Siguen estrictamente a los mockups: el oscuro usa sus valores y el claro
   traduce el mismo estilo.
3. **Tema oscuro.** Opcional, no principal.

### Producto y reglas

4. **Filtro «Disponible ahora».** El chip ordena: primero los prestadores con disponibilidad hoy y
   al final los demás, atenuados, con «No disponible» y sin poder pedir cotización. Así se reproduce
   el mockup `01` (chip activo y Luis Herrera atenuado al final) sin esconder opciones al cliente.
5. **Filtro «Verificados».** Chip informativo fijo, no removible: por RN-02 solo aparecen
   verificados.
6. **Contadores del seed.** El seed agrega lo mínimo para que calcen todos los números de los
   mockups: segunda solicitud de Camila, tercera solicitud abierta para Pedro, una quinta
   cotización enviada por Pedro (fuera de la lista de cuatro que muestra el panel) y las
   notificaciones (4 de Camila, 2 de Pedro).
7. **Correos de demo.** `pedro@demo.cl`, `andrea@demo.cl`, `javiera@demo.cl`, `luis@demo.cl`.
8. **Referencia en Mercado Pago.** `external_reference = pago.id`: cada cargo adicional tiene su
   propio cobro y el pago ya apunta a su servicio.
9. **Comisión en cargos adicionales.** Se cobra con el mismo `comision_pct` congelado al contratar.
10. **Plazo de reclamo.** 7 días desde `finalizado_en`, en la variable `PLAZO_DISPUTA_DIAS`.
11. **Cancelación después de pagar.** Crea un `reembolso` en estado `solicitado` que el
    administrador aprueba o rechaza. La interfaz avisa que se revisa caso a caso y no promete
    devolución.
12. **Pantalla de ganancias.** «Montos de servicios pagados. La transferencia al prestador no se hace
    desde la plataforma durante el MVP.»
13. **Contacto escrito en el chat.** No se filtran mensajes en el MVP: no está en §2.
14. **Fechas del seed.** Relativas a la ejecución: vencimiento en ahora + 6 h y publicación a las
    09:12 de hoy, o hace 5 minutos si el seed corre antes de esa hora.
15. **Tag BORRADOR.** Para el borrador local del editor de cotización, que no se guarda en la API.

### Accesibilidad

16. **Placeholder en oscuro.** Van sobre `campo`, donde `text-dim` queda en 5,0:1.
17. **Bordes de controles en oscuro.** Se mantiene el borde de tinta del mockup. El tema principal
    cumple WCAG 1.4.11 (15,9:1) y en el oscuro el estado se distingue igual: el control marcado
    cambia de relleno y el foco usa el anillo naranjo (7:1). Cambiarlo a `contorno` sería una línea
    del preset.

### Infraestructura y cuentas

18. **Servicios externos.** Vercel (web), Render (API y worker de pg-boss en el mismo contenedor),
    Neon (Postgres 16), Cloudflare R2 (archivos privados), Nominatim con caché (geocodificación) y
    Mailpit en desarrollo; todos en capa gratuita. Agustín Jadue crea las cuentas de Mercado Pago
    (vendedor y comprador de prueba) y las de los servicios, en la Fase 4; las credenciales van
    solo en las variables de entorno de cada servicio.
19. **Versiones.** Se mantiene lo que fija el stack (ESLint 9, TypeScript 5.6).
20. **Prompt.** Versionado en `docs/PROMPT-ServiceMatch-MVP.md`.

### Diferencias entre el prompt y los mockups

21. **Color de «Contratado».** Morado, como en el UI kit, que define la taxonomía; la agenda de
    `04` se construye con ese color.
22. **Color de «Vence en…».** Amarillo (`warning`) con menos de 24 h de vigencia y verde
    (`success`) desde 24 h. Lo calcula una función de `packages/shared` con pruebas.
23. **Mapa.** Leaflet con teselas estándar de OSM en claro y las mismas con filtro CSS oscuro en el
    tema oscuro. Pines de precio, radio y leyenda como en el mockup.
24. **Imágenes originales.** Se trabaja con los JPEG y las medidas de `docs/mockups/medidas.md`
    (±1 px). Si aparecen los PNG o el archivo de diseño, se agregan a `docs/mockups/` y se
    re-miden los valores dudosos.
