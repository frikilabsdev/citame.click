# citame.click — Mapa del proyecto

Sistema de gestión de citas: Cloudflare Workers + React, multi-tenant por slug.

## Stack

- **Backend:** Hono en Workers, D1 (SQLite), R2 (imágenes), KV (sesiones)
- **Frontend:** React 19, Vite 7, React Router 7, Tailwind
- **Auth:** Mocha users-service + sesiones en KV

## Estructura de código

| Ruta | Qué es |
|------|--------|
| `src/worker/index.ts` | App Hono, CORS, health, montaje de APIs |
| `src/worker/api/*.ts` | auth, tenants, services, schedules, appointments, public, service-images, social, payments, customize, upload |
| `src/react-app/App.tsx` | Rutas: /, /login, /register, /:slug, /dashboard/* |
| `src/react-app/contexts/AuthContext.tsx` | Estado de usuario y login/logout |
| `src/react-app/components/DashboardLayout.tsx` | Layout y menú del dashboard |
| `src/shared/types.ts` | Tipos compartidos (Tenant, Service, Appointment, etc.) |
| `migrations/` | Esquema D1 (1.sql … 5.sql) |

## Rutas principales

- **Público:** `/:slug` → reserva; API `/api/public/*`
- **Dashboard:** `/dashboard`, `/dashboard/services`, etc.; APIs `/api/tenants`, `/api/services`, etc. (con auth)

## Documentación

- Índice: [docs/README.md](../docs/README.md)
- Arquitectura: [docs/arquitectura.md](../docs/arquitectura.md)
- API: [docs/api.md](../docs/api.md)
- Modelo de datos: [docs/modelo-datos.md](../docs/modelo-datos.md)
- Desarrollo local: [docs/desarrollo-local.md](../docs/desarrollo-local.md)
- Estado: [docs/estado-proyecto.md](../docs/estado-proyecto.md)

## Nota

Las páginas DashboardCustomize, DashboardPayments y DashboardSocial existen pero no están en el menú del dashboard; para exponerlas hay que añadir rutas en App.tsx y enlaces en DashboardLayout.
