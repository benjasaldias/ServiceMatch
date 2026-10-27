# ServiceMatch · guía operativa

Marketplace chileno que conecta hogares con prestadores verificados de servicios domésticos agendados
(gasfitería, electricidad, cerrajería, electrodomésticos). MVP 1.0: web responsiva con tres portales
(cliente, prestador, administración), API, Postgres y Mercado Pago en sandbox. Demo final: 10-12-2026.

## Fuentes de verdad

1. Lo que pida el usuario en la sesión.
2. `PROMPT-ServiceMatch-MVP.md`: requisitos, reglas de negocio, modelo de datos, API, seed y pruebas.
   No lo releas completo: ve a la sección que necesites (§7 datos, §8 API, §9 reglas, §10 pagos,
   §12 seed, §16 microcopy).
3. `docs/mockups/*.png`: fuente visual (layout, orden, densidad, microcopy, estados). Están en tema
   oscuro; la app usa el tema claro por defecto (decisión del 27-10-2026).
4. `PLAN.md`: fases, calendario, decisiones tomadas y dudas abiertas. Actualízalo al cerrar cada fase.
5. `packages/config/tailwind-preset.ts`: fuente única de tokens de color, tipografía y forma.

## Forma de trabajo

- Por fases (§14 del prompt). Al terminar una fase, detente y muestra lo hecho antes de seguir.
- Al empezar una fase, escribe su plan detallado en `docs/plans/fase-N-<tema>.md` (tareas chicas,
  prueba primero, commit por tarea).
- Rama por funcionalidad. Commits pequeños en inglés con conventional commits.
- Si algo es ambiguo, anótalo en `PLAN.md` como duda y usa la opción más conservadora.
- No cambies el stack ni inventes funcionalidades fuera de §2. Si algo no calza, dilo y propón.

## Entorno y comandos

Node 22 (`nvm use`, lee `.nvmrc`) y pnpm 10 vía corepack (`corepack enable`). Con Node 20, `pnpm
install` falla a propósito por `engines`.

| Comando          | Qué hace                                                         |
| ---------------- | ---------------------------------------------------------------- |
| `pnpm dev`       | web (Vite, :5173, proxy `/api` → :3000) + api (tsx watch, :3000) |
| `pnpm build`     | `vite build` y `tsup` de la API                                  |
| `pnpm test`      | Vitest en todos los paquetes                                     |
| `pnpm lint`      | ESLint (`--max-warnings=0`) + `prettier --check`                 |
| `pnpm typecheck` | `tsc` en todos los paquetes                                      |
| `pnpm format`    | Prettier sobre todo el repo                                      |

`db:migrate`, `db:seed`, el worker de pg-boss y `test:e2e` llegan en la Fase 1 (ver `PLAN.md`).

## Stack (fijo)

TypeScript 5.6 strict · React 18 + Vite 5 + React Router 6 · TanStack Query 5 · React Hook Form 7 +
Zod 3 (esquemas compartidos con la API) · Tailwind 3.4 sin librerías de componentes · lucide-react ·
Leaflet + OSM · Node 22 + Express 4 · Prisma 5 + PostgreSQL 16 · pg-boss 10 · JWT 15 min + refresh
opaco rotatorio en cookie HttpOnly · Argon2id · almacenamiento S3 privado con URLs firmadas (disco
local en desarrollo) · SDK de Mercado Pago · Vitest, Supertest, Testing Library, Playwright ·
ESLint 9, Prettier, Husky y lint-staged · pino con redacción.

## Estructura

```text
apps/web/src/      routes/{public,cliente,prestador,admin} · components/ui · features · lib · styles
apps/api/src/      modules/<modulo>/{router,controller,service,repository} · middleware · jobs · infra
apps/api/prisma/   schema.prisma, migraciones, seed.ts
packages/shared/   esquemas Zod, tipos de API, máquina de estados, formato CLP y fechas
packages/config/   tsconfig base, ESLint, preset de Tailwind
```

- Cada módulo de la API tiene las cuatro capas. Un módulo nunca lee tablas de otro: llama a su servicio.
- Los paquetes internos exportan su fuente TypeScript; la API se empaqueta con tsup (`noExternal`).

## Convenciones de código

- Dominio en español (modelos, servicios, funciones de negocio, rutas, mensajes); infraestructura
  técnica en inglés (`createApp`, `logger`, middleware). Toda la interfaz en español de Chile.
- `import type` para tipos; `noUncheckedIndexedAccess` activo. Nada de `console.*`: logs con pino.
- API: prefijo `/api/v1`, errores problem+json con `code` estable, paginación por cursor,
  `Idempotency-Key` en cobros, fechas ISO 8601, montos enteros CLP.
- Base de datos: tablas snake_case, UUID generados por la app, `timestamptz` en UTC, enums como
  texto con CHECK, bitácoras solo inserción.
- Pruebas junto al código (`*.test.ts`). Nada de datos simulados en componentes: todo sale de la
  API y del seed.

## Design system

- **Temas**: claro por defecto. El oscuro (paleta de los mockups) se activa con
  `data-theme="dark"` en `<html>` y no sigue al sistema operativo.
- **Solo existen los tokens**: la paleta por defecto de Tailwind está desactivada. Colores:
  `bg`, `surface`, `card(-hover)`, `elevated`, `border(-soft|-strong)`, `text(-muted|-dim)`,
  `primary(-hover|-soft|-ink|-strong)`, `rating`, `{info,success,warning,danger,purple}` con
  `-fg`, `-bg` y `-border`, y `neutral-{fg,bg,border}`.
- **Reglas de color**:
  - `bg-primary` solo para la acción principal, con texto `text-primary-ink`, nunca blanco.
  - Naranjo como texto, enlace o foco: `primary-strong`. Sobre `primary-soft`, todo en `primary-ink`.
  - Los pastel son rellenos (badges sólidos, avatares, pines) con texto `primary-ink`. En claro
    nunca son color de texto.
  - Chips de estado: clases `chip-info|success|warning|danger|purple|neutral` más texto e icono.
    Ningún estado se comunica solo con color.
  - Bordes de controles (input, checkbox, radio, switch): `border-strong`. El `border` de tarjetas
    es decorativo.
  - Sin degradados, glassmorphism ni sombras grandes: borde de 1 px y cambio de superficie.
- **Tipografía**: `font-display` (Space Grotesk), `font-sans` (DM Sans), `font-mono` (JetBrains
  Mono). Tamaños `text-titulo-1` (36) / `text-titulo-1-movil` (28), `text-titulo-tarjeta` (18),
  `text-cuerpo` (14), `text-etiqueta` (12,5), `text-sobretitulo` (12), `text-monto` (30) /
  `text-monto-tarjeta` (24), `text-metrica` (28). Clase `.sobretitulo` para el rótulo mono en
  mayúsculas. Nada más va en mayúsculas.
- **Forma**: `rounded-card` 12, `rounded-control` 10, `rounded-full` para chips y avatares. Botones
  `h-12` / `h-10` / `h-8`. `w-sidebar` 232 px, `w-aside` 360 px. Móvil: padding 16, bottom nav 64,
  toques de 44 px o más.
- **Componentes**: solo las variantes de §5.4. Iconos: solo la lista de §5.6.
- **Estados (§5.5)**: Solicitado y Cotizado info · Contratado purple · En ejecución warning ·
  Finalizado success · Cancelado neutral · En disputa danger · Pendiente de pago warning · Pagado
  success · Rechazado danger · Vence en… warning · Vencida danger · Pendiente de revisión warning ·
  Verificado success.
- **Formato chileno**: `formatearClp` (`$41.040`) de `@servicematch/shared`; rating `4,9`;
  distancias `a 1,2 km`; fechas es-CL en `America/Santiago` (`jue 23 oct · 10:30`).
- **Microcopy**: literal de §16. Nada de frases de marketing.

## Reglas de negocio no negociables

- Estados: `Solicitado → Cotizado` viven en `solicitud.estado`; `contratado_pendiente_pago →
contratado → en_ejecucion → finalizado`, más `cancelado` y `en_disputa`, en `servicio.estado`.
  Las transiciones se validan con la máquina de estados de `packages/shared`; cualquier
  transición no declarada responde 409, aunque el rol sea correcto. Cada cambio va a la bitácora
  `servicio_estado` con actor, fecha y motivo.
- Solo prestadores verificados aparecen en búsqueda y reciben solicitudes.
- Una cotización vencida no se acepta. Aceptar ocurre en una transacción con `SELECT … FOR UPDATE`:
  crea el servicio (único por solicitud), descarta las demás cotizaciones y adjudica la solicitud.
- Comisión de 5 a 10 % sobre el valor del servicio, cobrada al cliente y congelada en
  `servicio.comision_pct`: `comision = round(monto * pct / 100)`. Caso de prueba: $38.000 + $3.040
  = $41.040.
- Un pago se confirma solo por webhook (firma válida, idempotente por `mp_payment_id`, consultando
  el pago en Mercado Pago) o por la conciliación cada 10 min. El retorno del navegador no confirma
  nada. `MP_MODE=sandbox|fake`.
- No se inicia un trabajo sin pago inicial confirmado. No se finaliza con cargos adicionales
  propuestos pendientes. Un cargo adicional requiere aprobación del cliente y genera su propio cobro.
- Teléfono y correo se ocultan en la serialización hasta que exista un servicio con pago confirmado.
- Una reseña por servicio y autor, y solo con el servicio finalizado.
- Historial sin acciones de borrado. Cancelación con motivo, responsable y fecha, sin inventar
  penalizaciones. Reembolsos solo por decisión administrativa y con clave de idempotencia.
- Autorización en dos niveles: el rol habilita la ruta y la pertenencia al recurso habilita la
  operación. Suspender una cuenta invalida sus sesiones (`cred_version`). Bloqueo temporal tras
  varios intentos fallidos.
- Documentos de verificación en bucket privado, URL firmada de 5 min solo desde la ficha de
  revisión, cada lectura en `registro_admin`, con hash SHA-256 y fecha de purga.
- Logs sin contraseñas, tokens, cookies ni datos de tarjeta. Nunca se guardan datos de tarjeta.

## Fuera del alcance (no construir)

App nativa · despacho inmediato o seguimiento en vivo · cobro por contacto · liquidaciones automáticas
al prestador · escrow · seguros · websockets o adjuntos en el chat · IA o recomendaciones · feeds
sociales · gamificación · facturación electrónica · pagos reales.
