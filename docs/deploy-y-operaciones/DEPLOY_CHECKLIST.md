# ✅ Checklist de Deployment

Usa este checklist para asegurarte de que todo está listo antes de hacer deploy.

## Pre-Deployment

- [ ] **KV Namespace:** Crear y configurar en `wrangler.json`
  ```bash
  npx wrangler kv:namespace create "SESSIONS_KV"
  npx wrangler kv:namespace create "SESSIONS_KV" --preview
  ```

- [ ] **CORS:** Actualizar dominios permitidos en `src/worker/index.ts`
  - Agregar dominio de producción
  - Cambiar `return origin` a `return null` en producción

- [ ] **D1 Database:** Verificar configuración en `wrangler.json`
  - Si necesitas crear nueva: `npx wrangler d1 create citas-database`

- [ ] **R2 Bucket:** Verificar configuración en `wrangler.json`
  - Si necesitas crear nuevo: `npx wrangler r2 bucket create citas-images`

## Deployment

- [ ] **Build:** Compilar sin errores
  ```bash
  npm run build
  ```

- [ ] **Migraciones:** Aplicar a producción
  ```bash
  npx wrangler d1 migrations apply mocha-appointments-db --remote
  ```

- [ ] **Deploy:** Subir a Cloudflare
  ```bash
  npx wrangler deploy
  ```

## Post-Deployment

- [ ] **Health Check:** Verificar endpoint `/health`
  ```bash
  curl https://tu-worker.workers.dev/health
  ```

- [ ] **Registro:** Probar crear cuenta

- [ ] **Login:** Probar iniciar sesión

- [ ] **Servicios:** Probar crear servicio

- [ ] **Citas:** Probar crear cita desde vista pública

- [ ] **Logs:** Verificar logs en Cloudflare Dashboard

- [ ] **Imágenes:** Probar subir imagen de perfil/servicio

## Opcional

- [ ] **Dominio Personalizado:** Configurar en Cloudflare Dashboard
- [ ] **Monitoreo:** Configurar alertas para health check
- [ ] **Backups:** Configurar backups automáticos de D1

---

**Fecha de Deployment:** ___________

**URL de Producción:** ___________

**Notas:** 
_________________________________
