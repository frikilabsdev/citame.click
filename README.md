## Citas

Sistema de gestión de citas construido con Cloudflare Workers + React + TypeScript.

**Documentación completa:** [docs/README.md](docs/README.md)

### 🚀 Inicio Rápido (Localhost)

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Aplicar migraciones de base de datos (solo primera vez):**
   ```bash
   npx wrangler d1 migrations apply mocha-appointments-db --local
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   - Local: http://localhost:5173/
   - Registrarse: http://localhost:5173/register
   - Iniciar sesión: http://localhost:5173/login

### 📦 Deployment a Cloudflare

1. **Aplicar migraciones a producción:**
   ```bash
   npx wrangler d1 migrations apply mocha-appointments-db --remote
   ```

2. **Desplegar:**
   ```bash
   npm run build
   npx wrangler deploy
   ```

### ✨ Características

- ✅ Autenticación con email/contraseña
- ✅ Gestión de negocios (tenants)
- ✅ Servicios y horarios
- ✅ Sistema de citas
- ✅ Dashboard completo
- ✅ API REST completa
