# Desarrollo local

## Requisitos

- **Node.js** >= 20.19.0 (ver `.node-version`)
- **npm** (o pnpm/yarn)
- **Wrangler** (incluido como devDependency): para D1, KV y ejecución del Worker en local
- Cuenta en **Mocha** (getmocha.com) para auth: API URL y API Key

## Instalación

1. Clonar el repositorio y entrar en el directorio del proyecto.

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Copiar variables de entorno de ejemplo:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   Editar `.dev.vars` y completar:
   - `MOCHA_USERS_SERVICE_API_URL` — URL del servicio de usuarios Mocha (ej. https://api.getmocha.com)
   - `MOCHA_USERS_SERVICE_API_KEY` — API Key de tu proyecto Mocha

   El archivo `.dev.vars` no se sube a git (está en `.gitignore`).

## Base de datos (D1) local

Aplicar migraciones solo la primera vez (o tras cambios en migraciones):

```bash
npx wrangler d1 migrations apply 019bcc5c-7e0e-7d85-ad58-b72f3439c49a --local
```

El ID `019bcc5c-7e0e-7d85-ad58-b72f3439c49a` es el nombre del worker/proyecto en `wrangler.json`; si tu proyecto usa otro, usa ese mismo ID/nombre.

## Ejecutar en local

```bash
npm run dev
```

Esto levanta Vite (frontend) y el Worker de Cloudflare en modo desarrollo (puerto típico 5173).

## URLs útiles

- **App:** http://localhost:5173/
- **Registro:** http://localhost:5173/register
- **Login:** http://localhost:5173/login
- **Dashboard:** http://localhost:5173/dashboard (tras iniciar sesión)
- **Reserva pública:** http://localhost:5173/:slug (sustituir `:slug` por el slug de un tenant existente)

## Comandos adicionales

- `npm run build` — Compila TypeScript y build de Vite para producción.
- `npm run lint` — Ejecuta ESLint.
- `npm run check` — TypeScript + build + dry-run de deploy (no despliega).
- `npx wrangler dev` — Solo Worker (si se quiere probar la API sin el flujo completo de Vite).

## Notas

- Las sesiones en desarrollo usan el KV de preview definido en `wrangler.json` (preview_id de SESSIONS_KV).
- D1 en local usa una base SQLite en disco creada por Wrangler en `.wrangler/` (no se versiona).
