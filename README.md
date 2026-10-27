# ServiceMatch

Marketplace chileno que conecta hogares con prestadores verificados de servicios domésticos
(gasfitería, electricidad, cerrajería y reparación de electrodomésticos). MVP 1.0 del curso GPTI
2026-2.

> Estado: Fase 0 (estructura del monorepo). El plan completo está en [PLAN.md](PLAN.md).

## Requisitos

- Node.js 22 LTS. Con nvm: `nvm install 22 && nvm use` (el repo trae `.nvmrc`).
- pnpm 10 vía corepack: `corepack enable`.

## Puesta en marcha

```bash
nvm use
corepack enable
pnpm install
pnpm dev        # web en http://localhost:5173 y API en http://localhost:3000
```

La API responde `GET /api/v1/health`; la web la alcanza en el mismo origen a través del proxy de Vite.

## Scripts

| Comando          | Qué hace                                      |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | Web y API en paralelo, con recarga            |
| `pnpm build`     | Build de producción de la web y de la API     |
| `pnpm test`      | Pruebas unitarias e integración (Vitest)      |
| `pnpm lint`      | ESLint y verificación de formato con Prettier |
| `pnpm typecheck` | Verificación de tipos en todos los paquetes   |
| `pnpm format`    | Formatea el repositorio con Prettier          |

La base de datos (`pnpm db:migrate`, `pnpm db:seed`) y las pruebas E2E (`pnpm test:e2e`) se agregan
en la Fase 1.

## Estructura

```text
apps/web          React 18 + Vite 5 + Tailwind 3.4
apps/api          Express 4 + Prisma 5 (desde la Fase 1)
packages/shared   Esquemas, tipos y utilidades compartidas entre web y API
packages/config   TypeScript, ESLint y el preset de Tailwind con los tokens de diseño
docs/mockups      Mockups de referencia visual
```

`CLAUDE.md` resume el stack, las convenciones y las reglas de negocio para el equipo y para las
sesiones de Claude Code.
