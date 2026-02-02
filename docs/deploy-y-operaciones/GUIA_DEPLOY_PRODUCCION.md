# 🚀 Guía de Deployment a Producción

Esta guía te llevará paso a paso desde el estado actual hasta producción en Cloudflare.

---

## ✅ Estado Actual

El proyecto está **listo para producción** con:
- ✅ Sesiones persistentes (KV)
- ✅ Rate limiting
- ✅ Error handling global
- ✅ CORS configurado
- ✅ Logging estructurado
- ✅ Health check endpoint

---

## 📋 Checklist Pre-Deployment

### Paso 1: Crear Namespace KV para Producción

**¿Por qué?** Las sesiones se almacenan en KV, necesitamos crear el namespace en Cloudflare.

**Pasos:**

1. Abre tu terminal y ejecuta:
   ```bash
   npx wrangler kv:namespace create "SESSIONS_KV"
   ```

2. Esto mostrará algo como:
   ```
   { binding = "SESSIONS_KV", id = "abc123def456..." }
   ```

3. Copia el `id` que aparece (será un hash largo)

4. Ahora crea el namespace de preview (para desarrollo):
   ```bash
   npx wrangler kv:namespace create "SESSIONS_KV" --preview
   ```

5. Esto mostrará otro `id` (diferente al anterior)

6. Edita `wrangler.json` y actualiza la sección `kv_namespaces`:

   ```json
   "kv_namespaces": [
     {
       "binding": "SESSIONS_KV",
       "id": "PEGA_AQUI_EL_ID_DE_PRODUCCION",  // ← El primer ID (sin --preview)
       "preview_id": "PEGA_AQUI_EL_ID_DE_PREVIEW"  // ← El segundo ID (con --preview)
     }
   ]
   ```

7. **Ejemplo real:**
   ```json
   "kv_namespaces": [
     {
       "binding": "SESSIONS_KV",
       "id": "abc123def4567890123456789012345678",
       "preview_id": "xyz987uvw6543210987654321098765"
     }
   ]
   ```

---

### Paso 2: Configurar CORS para Producción

**¿Por qué?** En producción, solo queremos permitir requests desde tu dominio real, no desde localhost.

**Pasos:**

1. Abre `src/worker/index.ts`

2. Encuentra la sección de CORS (líneas ~19-49)

3. Actualiza la lista `allowedOrigins` con tu dominio de producción:

   ```typescript
   const allowedOrigins = [
     "https://tudominio.com",           // ← Tu dominio de producción
     "https://www.tudominio.com",       // ← Si usas www
     // Mantén localhost solo para desarrollo
     "http://localhost:5173",
     "http://localhost:3000",
     "http://127.0.0.1:5173",
   ];
   ```

4. **IMPORTANTE:** Cambia esta línea (línea ~41):
   ```typescript
   // De esto:
   return origin; // ← Permite cualquier origen
   
   // A esto:
   return null; // ← Niega orígenes desconocidos en producción
   ```

5. **O mejor aún**, usa una variable de entorno para desarrollo:
   ```typescript
   const isProduction = !c.req.url.includes("localhost") && !c.req.url.includes("127.0.0.1");
   
   if (allowedOrigins.includes(origin)) {
     return origin;
   }
   
   // En producción, niega orígenes desconocidos
   if (isProduction) {
     return null;
   }
   
   // En desarrollo, permite todo
   return origin;
   ```

---

### Paso 3: Verificar Configuración de D1 Database

**¿Por qué?** Necesitamos asegurarnos de que la base de datos está configurada correctamente.

**Pasos:**

1. Verifica que `wrangler.json` tiene la configuración correcta de D1:
   ```json
   "d1_databases": [
     {
       "binding": "DB",
       "database_name": "019bcc5c-7e0e-7d85-ad58-b72f3439c49a",
       "database_id": "019bcc5c-7e0e-7d85-ad58-b72f3439c49a"
     }
   ]
   ```

2. Si necesitas crear una nueva base de datos en Cloudflare:
   ```bash
   npx wrangler d1 create citas-database
   ```

3. Esto mostrará un `database_id` - actualiza `wrangler.json` con ese ID

---

### Paso 4: Aplicar Migraciones a Producción

**¿Por qué?** Las migraciones crean las tablas necesarias en la base de datos de producción.

**Pasos:**

1. **Verifica las migraciones locales primero:**
   ```bash
   npx wrangler d1 migrations list 019bcc5c-7e0e-7d85-ad58-b72f3439c49a --local
   ```

2. **Aplica migraciones a producción:**
   ```bash
   npx wrangler d1 migrations apply 019bcc5c-7e0e-7d85-ad58-b72f3439c49a --remote
   ```

3. Te preguntará confirmación - escribe `y` y presiona Enter

4. Verifica que todas las migraciones se aplicaron:
   ```bash
   npx wrangler d1 migrations list 019bcc5c-7e0e-7d85-ad58-b72f3439c49a --remote
   ```

---

### Paso 5: Verificar Configuración de R2 Bucket

**¿Por qué?** Las imágenes se almacenan en R2.

**Pasos:**

1. Verifica que `wrangler.json` tiene la configuración de R2:
   ```json
   "r2_buckets": [
     {
       "binding": "R2_BUCKET",
       "bucket_name": "019bcc5c-7e0e-7d85-ad58-b72f3439c49a"
     }
   ]
   ```

2. Si necesitas crear un nuevo bucket:
   ```bash
   npx wrangler r2 bucket create citas-images
   ```

3. Actualiza `bucket_name` en `wrangler.json` si creaste uno nuevo

---

### Paso 6: Build y Deploy

**Pasos:**

1. **Compila el proyecto:**
   ```bash
   npm run build
   ```

2. Si hay errores, corrígelos antes de continuar

3. **Deploy a Cloudflare:**
   ```bash
   npx wrangler deploy
   ```

4. Esto subirá el Worker a Cloudflare y te dará una URL como:
   ```
   https://tu-worker.tu-account.workers.dev
   ```

---

### Paso 7: Configurar Dominio Personalizado (Opcional pero Recomendado)

**¿Por qué?** Una URL personalizada es más profesional que `workers.dev`.

**Pasos:**

1. Ve al dashboard de Cloudflare: https://dash.cloudflare.com

2. Selecciona tu cuenta

3. Ve a **Workers & Pages** → Tu Worker → **Settings** → **Triggers**

4. En **Custom Domains**, haz clic en **Add Custom Domain**

5. Ingresa tu dominio (ej: `api.tudominio.com`)

6. Cloudflare configurará automáticamente el DNS

7. Actualiza CORS en `src/worker/index.ts` para incluir tu dominio personalizado

8. Vuelve a hacer deploy:
   ```bash
   npm run build
   npx wrangler deploy
   ```

---

### Paso 8: Verificar que Todo Funciona

**Pasos:**

1. **Prueba el health check:**
   ```bash
   curl https://tu-worker.workers.dev/health
   ```

   Deberías ver:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-01-XX...",
     "services": {
       "database": "ok",
       "kv": "ok"
     }
   }
   ```

2. **Prueba registro de usuario:**
   - Ve a tu aplicación en producción
   - Intenta crear una cuenta
   - Verifica que funcione

3. **Prueba crear una cita:**
   - Inicia sesión
   - Crea un servicio
   - Configura horarios
   - Crea una cita desde la vista pública

4. **Verifica logs:**
   - En Cloudflare Dashboard → Workers & Pages → Tu Worker → **Logs**
   - Deberías ver logs estructurados de todas las requests

---

## 🔧 Configuración de Variables de Entorno (Opcional)

Si necesitas variables de entorno en producción:

1. En Cloudflare Dashboard → Workers & Pages → Tu Worker → **Settings** → **Variables**

2. Agrega variables como:
   - `ENVIRONMENT=production`
   - `LOG_LEVEL=info`

3. En tu código, accede con `c.env.VARIABLE_NAME`

---

## 📊 Monitoreo Post-Deployment

### Health Check Endpoint

Configura un servicio de monitoreo (como UptimeRobot o Pingdom) para verificar:
- URL: `https://tu-worker.workers.dev/health`
- Intervalo: Cada 5 minutos
- Alerta si no responde `200` o `status: "healthy"`

### Logs

- **Cloudflare Dashboard** → Workers & Pages → Tu Worker → **Logs**
- Los logs están estructurados en JSON para fácil análisis
- Puedes filtrar por nivel, path, status code, etc.

### Rate Limiting

El rate limiting está activo automáticamente. Si ves muchos errores `429`:
- Revisa si necesitas ajustar los límites en `src/worker/api/auth.ts` y `src/worker/api/public.ts`
- Los límites actuales son conservadores y pueden ajustarse según necesidad

---

## 🐛 Troubleshooting

### Error: "KV namespace not found"
- **Solución:** Asegúrate de que el `id` en `wrangler.json` es correcto
- Verifica ejecutando: `npx wrangler kv:namespace list`

### Error: "D1 database not found"
- **Solución:** Verifica el `database_id` en `wrangler.json`
- Lista tus bases de datos: `npx wrangler d1 list`

### Error: CORS bloqueando requests
- **Solución:** Verifica que tu dominio esté en `allowedOrigins` en `src/worker/index.ts`
- Asegúrate de que `return null` solo se ejecute en producción

### Error: Sesiones no persisten
- **Solución:** Verifica que el KV namespace esté correctamente configurado
- Revisa logs para errores de KV

### Health check falla
- **Solución:** 
  - Verifica que D1 database existe: `npx wrangler d1 list`
  - Verifica que KV namespace existe: `npx wrangler kv:namespace list`
  - Revisa logs en Cloudflare Dashboard

---

## ✅ Checklist Final

Antes de considerar el deployment completo:

- [ ] KV namespace creado y configurado en `wrangler.json`
- [ ] CORS configurado para producción (orígenes permitidos actualizados)
- [ ] Migraciones aplicadas a producción (`--remote`)
- [ ] Build sin errores
- [ ] Deploy exitoso a Cloudflare
- [ ] Health check responde `200 OK`
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Creación de citas funciona
- [ ] Logs aparecen en Cloudflare Dashboard
- [ ] Dominio personalizado configurado (si aplica)

---

## 📞 Próximos Pasos Recomendados

1. **Backups de D1:** Configura backups automáticos desde Cloudflare Dashboard
2. **Monitoreo:** Configura alertas para el health check
3. **Analytics:** Considera usar Cloudflare Analytics Engine para métricas avanzadas
4. **Documentación:** Documenta tu API con Swagger/OpenAPI si planeas APIs públicas
5. **Testing:** Agrega tests automatizados antes del próximo deploy

---

**¡Felicitaciones! Tu aplicación está lista para producción.** 🎉

Si encuentras algún problema durante el deployment, revisa la sección de Troubleshooting o los logs en Cloudflare Dashboard.
