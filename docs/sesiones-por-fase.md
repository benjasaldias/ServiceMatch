# Sesiones de Claude Code por fase

Prompts para abrir cada sesión de trabajo del MVP. Una sesión = un bloque de trabajo con un
entregable; al terminar se revisa y se abre la siguiente con `/clear` (o una sesión nueva).

## Antes de cada sesión

1. `nvm use` en la raíz del repo y, si es la primera vez, `corepack enable`.
2. Elige el modelo y el esfuerzo con `/model` según la tabla. No uses `max`: el costo no se
   justifica en este proyecto.
3. Si dos personas trabajan en paralelo (fases 1 y 2), cada una en su propio worktree
   (`superpowers:using-git-worktrees`) y su propia rama.
4. Pega el prompt de la sesión. Los prompts ya piden leer `CLAUDE.md` y las skills que
   corresponden.

| Sesión | Tema                                     | Modelo     | Esfuerzo | Responsable sugerido |
| ------ | ---------------------------------------- | ---------- | -------- | -------------------- |
| 0      | Cerrar la Fase 0 (PR a `main`)           | Sonnet 5.5 | medium   | Benjamín             |
| 1a     | Base backend: datos, Prisma, identidad   | Opus 5.5   | high     | Rocío, Tomás         |
| 1b     | Base web: router, guardas, sesión, E2E   | Opus 5.5   | high     | Benjamín             |
| 2      | Design system y `/dev/ui`                | Opus 5.5   | high     | Daniela              |
| 3      | Pantallas de los mockups y seed completo | Opus 5.5   | high     | Daniela, Ignacio     |
| 4a     | Solicitudes y aceptación de cotizaciones | Opus 5.5   | high     | Tomás                |
| 4b     | Pagos con Mercado Pago                   | Opus 5.5   | xhigh    | Agustín              |
| 4c     | Seguimiento, cargos, reseñas, disputas   | Opus 5.5   | high     | Tomás, Daniela       |
| 5      | Flujo del prestador                      | Sonnet 5.5 | high     | Ignacio, Rocío       |
| 6      | Administración                           | Sonnet 5.5 | high     | Rocío, Ignacio       |
| 7      | Transversales y accesibilidad            | Sonnet 5.5 | high     | Equipo               |
| 8      | Pruebas, revisión y despliegue           | Opus 5.5   | high     | Benjamín, Agustín    |

Por qué así: Opus en lo que no admite errores (seguridad, dinero, concurrencia, fidelidad visual)
y donde se fijan los patrones que el resto copia; Sonnet cuando ya hay patrones y el trabajo es
extenderlos. `xhigh` solo en pagos, donde se cruzan webhook, idempotencia y conciliación.

## Plugins del proyecto

Auditados el 01-11-2026 (detalle en la respuesta de esa sesión). Se instalan una vez por persona:

| Plugin                            | Para qué                                    | Desde   |
| --------------------------------- | ------------------------------------------- | ------- |
| MCP de Playwright, versión fijada | Capturas y comparación con los mockups, E2E | Fase 1b |
| `typescript-lsp`                  | Errores de tipos y navegación de código     | Fase 1  |
| `security-guidance`               | Avisos de inyección y XSS al editar         | Fase 1  |
| `mercadopago`                     | Referencia de la API de Mercado Pago        | Fase 4b |

```bash
# MCP de Playwright fijado a una versión (no @latest): consulta la última y úsala
npm view @playwright/mcp version
claude mcp add playwright -s project -- npx -y @playwright/mcp@<versión>

# Plugins del marketplace oficial (dentro de Claude Code)
/plugin install typescript-lsp@claude-plugins-official
/plugin install security-guidance@claude-plugins-official
/plugin install mercadopago@claude-plugins-official      # recién en la Fase 4
npm install -g typescript-language-server typescript      # lo necesita typescript-lsp
```

El plugin `mercadopago` funciona sin configurar su MCP: sus skills bastan como referencia. Su hook
bloquea leer archivos `.env`, lo que es deseable. No corras su `setup.sh` con credenciales reales.

## Reglas para no gastar tokens de más

- No uses `superpowers:brainstorming` ni `frontend-design` en este proyecto: el diseño y el alcance
  ya están definidos (prompt, mockups, `PLAN.md`). `frontend-design` además pide estéticas
  impredecibles y evitar Space Grotesk, lo contrario de lo que necesitamos.
- Ejecuta los planes con `superpowers:executing-plans` en la misma sesión. Usa
  `superpowers:subagent-driven-development` solo si hay tareas de verdad independientes: cada
  subagente arranca sin contexto y lo vuelve a leer.
- No releas el prompt completo: cada sesión dice qué secciones leer.
- No uses graphify en este repo.

## Bloque común

Todos los prompts empiezan con este bloque. Ya va incluido en cada uno; está aquí para que se
entienda qué hace.

```text
Lee CLAUDE.md completo. De PLAN.md lee el estado, la fase de esta sesión y las decisiones. Del
prompt (docs/PROMPT-ServiceMatch-MVP.md) lee solo las secciones que indico. No hagas brainstorming
ni uses la skill frontend-design: el alcance y el diseño ya están definidos.
Antes de codificar, usa superpowers:writing-plans y guarda el plan en docs/plans/fase-N-<tema>.md
(esa ruta manda sobre la que sugiere la skill). Implementa con superpowers:test-driven-development
y superpowers:executing-plans, un commit por tarea en la rama indicada. Ante un error usa
superpowers:systematic-debugging. Antes de decir que terminaste usa
superpowers:verification-before-completion (pnpm lint, typecheck, test y build). Al cerrar,
actualiza PLAN.md, resume lo hecho y detente sin pasar a la siguiente fase.
```

## Sesión 0 · Cerrar la Fase 0

```text
Lee CLAUDE.md. La Fase 0 está terminada en la rama chore/phase-0-setup. Usa
superpowers:finishing-a-development-branch para dejarla lista para main: corre lint, typecheck,
test y build, y propón el PR con un resumen de lo que trae (mockups medidos, tokens, decisiones).
No hagas merge sin mostrarme el PR.
```

## Sesión 1a · Base backend

```text
Fase 1, parte backend. Rama feat/fase-1-base desde main.
Lee CLAUDE.md completo y de PLAN.md el estado, la Fase 1, «Cambios al modelo de datos» y las
decisiones. Del prompt (docs/PROMPT-ServiceMatch-MVP.md) lee solo §3, §4, §7, §8 (identidad y
errores), §9 (máquina de estados), §11 y §12 (seed base). No hagas brainstorming ni uses
frontend-design.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-1-base.md. Alcance: docker
compose con Postgres 16 y Mailpit, Prisma 5 con el esquema completo más los cambios de PLAN.md,
migración SQL con CHECK, índices y REVOKE, dos conexiones (app y migraciones), middlewares
(errores problem+json, validación Zod, auth JWT 15 min con cred_version, rbac, rate limit,
auditoría, pino-http con redacción), módulo identidad completo con Argon2id, bloqueo temporal y
refresh opaco rotatorio con detección de reutilización, máquina de estados en packages/shared,
worker de pg-boss y seed base con los usuarios de demo.
Implementa con superpowers:test-driven-development y superpowers:executing-plans, un commit por
tarea. Las pruebas de PLAN.md para la Fase 1 son obligatorias. Ante un error usa
superpowers:systematic-debugging. Al terminar corre /security-review sobre la rama y corrige lo que
encuentre; luego superpowers:verification-before-completion. Actualiza PLAN.md y detente.
```

## Sesión 1b · Base web

```text
Fase 1, parte web. Rama feat/fase-1-web desde feat/fase-1-base (o main si ya se mergeó).
Lee CLAUDE.md completo y de PLAN.md la Fase 1 y las decisiones. Del prompt lee solo §6 (rutas por
rol), §8 (autenticación) y §13 (pruebas E2E). No hagas brainstorming ni uses frontend-design.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-1-web.md. Alcance: React Router
6 con rutas por rol y guardas, contexto de sesión, cliente de API con refresh automático y TanStack
Query, pantallas mínimas de login y registro con los componentes que existan, y Playwright con
una prueba de humo de login para los tres roles.
Implementa con superpowers:test-driven-development y superpowers:executing-plans. Para ver la app
corriendo usa la skill run y, si está instalado, el MCP de Playwright. Ante un error usa
superpowers:systematic-debugging. Cierra con superpowers:verification-before-completion (incluido
pnpm test:e2e), actualiza PLAN.md y detente.
```

## Sesión 2 · Design system

```text
Fase 2. Rama feat/fase-2-design-system desde main, en un worktree propio
(superpowers:using-git-worktrees) porque corre en paralelo con la Fase 1.
Lee CLAUDE.md completo, docs/mockups/medidas.md completo, packages/config/tailwind-preset.ts y de
PLAN.md la Fase 2 y las decisiones. Del prompt lee solo §5. Mira docs/mockups/02-ui-kit.jpeg antes
de escribir código. No hagas brainstorming ni uses frontend-design: el diseño es el de los mockups
y los tokens ya están medidos; no inventes colores, tamaños ni variantes.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-2-design-system.md. Alcance: los
componentes de §5.4 en components/ui con lucide-react, el logo en SVG, estados de interacción de
las sombras duras, foco visible, selector de tema guardado en el dispositivo y aplicado antes del
primer pintado, la página /dev/ui con todos los componentes en ambos temas y la superposición de
mockup (imagen encima a su escala real, opacidad regulable).
Implementa con superpowers:test-driven-development (Testing Library) y
superpowers:executing-plans. Para comparar contra el kit, levanta la app con la skill run y toma
capturas de /dev/ui con el MCP de Playwright a 1440 px en tema oscuro; corrige hasta que calce con
02-ui-kit.jpeg usando la superposición. Cierra con superpowers:verification-before-completion,
actualiza PLAN.md y detente.
```

## Sesión 3 · Pantallas de los mockups

```text
Fase 3. Rama feat/fase-3-pantallas desde main (con las fases 1 y 2 mergeadas).
Lee CLAUDE.md completo, docs/mockups/medidas.md (sección Layout y Componentes) y de PLAN.md la
Fase 3 y las decisiones 4, 5, 6, 14, 21, 22 y 23. Del prompt lee solo §6.1, §8 (lectura de
profesionales, solicitudes y panel pro) y §12. Mira los mockups 01, 03 y 04 antes de escribir
código. No hagas brainstorming ni uses frontend-design.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-3-pantallas.md. Alcance: seed
completo de §12 con fechas relativas y los contadores de los mockups, los endpoints de lectura, y
/buscar, /solicitudes/:id y /pro en 1440 y 390 px con datos reales del seed, más el mapa Leaflet
con OSM según la decisión 23.
Implementa con superpowers:test-driven-development y superpowers:executing-plans. Para cada
pantalla: levántala con la skill run, captúrala con el MCP de Playwright en tema oscuro a 1440 y
390 px, compárala con la superposición de /dev/ui y corrige hasta calzar al píxel; después revisa
el tema claro. Agrega los snapshots visuales de Playwright. Cierra con
superpowers:verification-before-completion, actualiza PLAN.md y detente.
```

## Sesión 4a · Solicitudes y cotizaciones

```text
Fase 4, parte 1. Rama feat/fase-4-solicitudes desde main.
Lee CLAUDE.md completo y de PLAN.md la Fase 4 y las decisiones. Del prompt lee solo §6.2
(cliente), §8 (solicitudes y cotizaciones), §9 y §13. No hagas brainstorming ni uses
frontend-design.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-4a-solicitudes.md. Alcance:
creación de solicitud en tres pasos con fotos y código SM-####, aceptar y rechazar cotizaciones en
una transacción con SELECT … FOR UPDATE (servicio único por solicitud), y las pantallas del cliente
que eso requiere, con los componentes del design system.
Implementa con superpowers:test-driven-development y superpowers:executing-plans. Las pruebas de
aceptación concurrente y de cotización vencida (409) son obligatorias. Al terminar corre
/security-review, luego superpowers:verification-before-completion, actualiza PLAN.md y detente.
```

## Sesión 4b · Pagos con Mercado Pago

```text
Fase 4, parte 2. Rama feat/fase-4-pagos desde main.
Lee CLAUDE.md completo y de PLAN.md la Fase 4 y las decisiones 8, 9, 11 y 18. Del prompt lee solo
§9 (pagos y comisión), §10 y §13 (pruebas de pagos). No hagas brainstorming ni uses
frontend-design. Si está instalado el plugin mercadopago, consulta sus skills mp-checkout-online,
mp-notifications y mp-security como referencia de la API, pero las reglas de CLAUDE.md mandan: el
pago se confirma solo por webhook o conciliación, nunca por el retorno del navegador.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-4b-pagos.md. Alcance: checkout
con desglose de comisión, Checkout Pro en sandbox y MP_MODE=fake, webhook con firma, consulta del
pago e idempotencia por mp_payment_id, trabajo conciliar-pagos cada 10 min y las pantallas de
procesando, confirmado, rechazado, pendiente y servicio no disponible.
Implementa con superpowers:test-driven-development y superpowers:executing-plans. Pruebas
obligatorias: webhook duplicado, firma inválida (401 sin escritura), comisión $38.000 + $3.040 =
$41.040. Ninguna credencial en el repo ni en los logs. Al terminar corre /security-review, luego
superpowers:verification-before-completion, actualiza PLAN.md y detente.
```

## Sesión 4c · Seguimiento y cierre del servicio

```text
Fase 4, parte 3. Rama feat/fase-4-seguimiento desde main.
Lee CLAUDE.md completo y de PLAN.md la Fase 4 y las decisiones 10 y 11. Del prompt lee solo §6.2
(seguimiento, cargos, reseña, historial, cancelación y disputa), §9 y §13. No hagas brainstorming
ni uses frontend-design.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-4c-seguimiento.md. Alcance:
seguimiento con bitácora, aprobación de cargo adicional con su propio cobro, reseña, historial
filtrable por dirección sin borrado, cancelación con motivo, disputa, cuenta y direcciones, y el
E2E del recorrido completo del cliente en modo fake.
Implementa con superpowers:test-driven-development y superpowers:executing-plans. Cierra con
superpowers:verification-before-completion, actualiza PLAN.md y detente.
```

## Sesión 5 · Flujo del prestador

```text
Fase 5. Rama feat/fase-5-prestador desde main.
Lee CLAUDE.md completo y de PLAN.md la Fase 5 y las decisiones 12 y 15. Del prompt lee solo §6.2
(prestador), §8 (prestador y verificación), §9 y §11 (documentos). Sigue los patrones de API y de
pantallas que ya existen en el repo. No hagas brainstorming ni uses frontend-design.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-5-prestador.md. Alcance: registro
y onboarding del perfil, verificación con cédula y rostro en almacenamiento privado, bandeja de
solicitudes, editor de cotización con revisión, agenda, trabajo activo, cargos adicionales,
ganancias, historial y evaluación del cliente.
Implementa con superpowers:test-driven-development y superpowers:executing-plans. Pruebas
obligatorias: un prestador no verificado no aparece en búsqueda; no se inicia un trabajo sin pago
confirmado. Al terminar corre /security-review, luego superpowers:verification-before-completion,
actualiza PLAN.md y detente.
```

## Sesión 6 · Administración

```text
Fase 6. Rama feat/fase-6-admin desde main.
Lee CLAUDE.md completo y de PLAN.md la Fase 6 y las decisiones. Del prompt lee solo §6.2
(administración), §8 (admin), §9 y §11. Sigue los patrones que ya existen. No hagas brainstorming
ni uses frontend-design.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-6-admin.md. Alcance: resumen,
cola y detalle de verificaciones con URL firmada de 5 min registrada en registro_admin, usuarios
(suspender y reactivar con cred_version), servicios en solo lectura, transacciones, comisión con
historial, disputas y reembolsos con idempotencia, y registros administrativos.
Implementa con superpowers:test-driven-development y superpowers:executing-plans. Pruebas
obligatorias: comisión fuera de 5–10 rechazada por la API y por el CHECK; E2E del administrador.
Al terminar corre /security-review, luego superpowers:verification-before-completion, actualiza
PLAN.md y detente.
```

## Sesión 7 · Transversales y accesibilidad

```text
Fase 7. Rama feat/fase-7-transversales desde main.
Lee CLAUDE.md completo y de PLAN.md la Fase 7 y las decisiones 13 y 17. Del prompt lee solo §6.2
(notificaciones y mensajería), §15 y §16. No hagas brainstorming ni uses frontend-design.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-7-transversales.md. Alcance:
notificaciones de los eventos de REQ-19, mensajería acotada sin datos de contacto, estados vacíos,
errores en línea, skeletons y diálogos en todas las pantallas, teclado y foco visible en los
flujos críticos, revisión con axe y responsive final en 390 y 1440 px.
Implementa con superpowers:test-driven-development y superpowers:executing-plans. Recorre los
flujos con el MCP de Playwright para revisar foco, contraste y responsive. Cierra con
superpowers:verification-before-completion, actualiza PLAN.md y detente.
```

## Sesión 8 · Pruebas, revisión y despliegue

```text
Fase 8. Rama chore/fase-8-cierre desde main.
Lee CLAUDE.md completo y PLAN.md completo. Del prompt lee solo §13, §15 y §18. No hagas
brainstorming ni uses frontend-design.
Usa superpowers:writing-plans y guarda el plan en docs/plans/fase-8-cierre.md. Alcance: cobertura
de 80 % o más en identidad, cotizaciones, servicios, pagos y verificación; /code-review en nivel
high sobre main y corrección de lo confirmado; /security-review; README con instalación,
despliegue, guía de usuario y datos de demo; la lista de §15 revisada punto por punto; despliegue
según la decisión 18 y ensayo de la demo en modo fake y en sandbox.
Usa superpowers:systematic-debugging para cada falla y superpowers:verification-before-completion
antes de cada cierre. Actualiza PLAN.md y detente.
```

## Para continuar una fase en otra sesión

```text
Continúa la Fase N en la rama <rama>. Lee CLAUDE.md, docs/plans/fase-N-<tema>.md y el git log de
la rama. Retoma la primera tarea sin marcar del plan con superpowers:executing-plans, con las mismas
reglas del plan. No vuelvas a planificar lo ya planificado.
```
