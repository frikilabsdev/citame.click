# 🚀 Configuración para Dokploy

Esta guía te ayudará a configurar el proyecto para deployment con Dokploy.

---

## 📋 Prerrequisitos

1. **Dokploy instalado** y funcionando
2. **GitHub repository** configurado
3. **Cloudflare Account** con Workers, D1, R2, y KV habilitados

---

## 🔧 Configuración de Dokploy

### Paso 1: Crear Aplicación en Dokploy

1. Ve a tu instancia de Dokploy
2. Clic en **"New Application"** o **"Nueva Aplicación"**
3. Selecciona **"Cloudflare Workers"** como tipo de aplicación

### Paso 2: Conectar Repositorio

1. Conecta tu repositorio de GitHub
2. Selecciona la rama principal (normalmente `main` o `master`)
3. Dokploy detectará automáticamente que es un proyecto de Cloudflare Workers

### Paso 3: Configurar Build Settings

**Build Command:**
```bash
npm ci && npm run build
```

**Output Directory:**
```
dist
```

**Root Directory:**
```
/
```

### Paso 4: Configurar Variables de Entorno

En Dokploy, ve a **"Environment Variables"** y agrega:

#### Variables de Cloudflare

Necesitarás configurar estas variables en Dokploy:

1. **CLOUDFLARE_ACCOUNT_ID**
   - Encuéntralo en: Cloudflare Dashboard → Right sidebar → Account ID

2. **CLOUDFLARE_API_TOKEN** (Recomendado) O **CLOUDFLARE_API_KEY + CLOUDFLARE_EMAIL**
   - Para crear un API Token:
     - Ve a Cloudflare Dashboard → My Profile → API Tokens
     - Clic en **"Create Token"**
     - Usa el template **"Edit Cloudflare Workers"**
     - Permite acceso a:
       - Account: Workers Scripts (Edit)
       - Account: Account Settings (Read)
       - Zone: Zone Settings (Read)
       - Zone: Zone (Read)

#### Variables Opcionales

```env
NODE_VERSION=20
NPM_CONFIG_LOGLEVEL=warn
```

### Paso 5: Configurar Cloudflare Resources

#### D1 Database

1. Crea la base de datos en Cloudflare si aún no existe:
   ```bash
   npx wrangler d1 create citas-database
   ```

2. Anota el `database_id` y actualízalo en `wrangler.json`

3. Aplica las migraciones:
   ```bash
   npx wrangler d1 migrations apply citas-database --remote
   ```

#### R2 Bucket

1. Crea el bucket si aún no existe:
   ```bash
   npx wrangler r2 bucket create citas-images
   ```

2. Actualiza `bucket_name` en `wrangler.json`

#### KV Namespace

1. Crea el namespace si aún no existe:
   ```bash
   npx wrangler kv:namespace create "SESSIONS_KV"
   npx wrangler kv:namespace create "SESSIONS_KV" --preview
   ```

2. Actualiza los IDs en `wrangler.json`

### Paso 6: Configurar Deploy Script en Dokploy

En Dokploy, configura el **Deploy Command**:

```bash
npx wrangler deploy
```

O si prefieres hacerlo manualmente después del build:

```bash
npx wrangler deploy --compatibility-date 2024-06-17
```

### Paso 7: Configurar Dominio (Opcional)

1. En Dokploy, ve a **"Domain"** o **"Dominio"**
2. Agrega tu dominio personalizado
3. Dokploy configurará automáticamente el DNS si usas Cloudflare DNS

O configura manualmente en Cloudflare:
- Ve a Workers & Pages → Tu Worker → Settings → Triggers
- Agrega Custom Domain

---

## 🔐 Seguridad en Dokploy

### Variables de Entorno Sensibles

**NUNCA** commits estas variables:
- ❌ `CLOUDFLARE_API_TOKEN`
- ❌ `CLOUDFLARE_API_KEY`
- ❌ `CLOUDFLARE_EMAIL`
- ❌ Cualquier secreto o API key

**SÍ** configura estas en Dokploy UI (Environment Variables):
- ✅ Todas las variables sensibles
- ✅ Secrets y tokens

### Verificar .gitignore

Asegúrate de que `.gitignore` incluye:
```
.env
.env.local
.dev.vars
*.env
wrangler.toml.bak
```

---

## 🚀 Workflow de Deployment

### Automatic Deployment (Recomendado)

1. **Push a GitHub** → Dokploy detecta cambios automáticamente
2. **Build automático** → `npm ci && npm run build`
3. **Deploy automático** → `npx wrangler deploy`

### Manual Deployment

Si prefieres deployment manual:

1. En Dokploy, clic en **"Deploy Now"** o **"Desplegar Ahora"**
2. Dokploy ejecutará el build y deploy

---

## 📊 Monitoreo Post-Deployment

### Health Check

Después del deployment, verifica:

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

### Logs

1. En Dokploy, ve a **"Logs"** para ver logs del deployment
2. En Cloudflare Dashboard → Workers & Pages → Tu Worker → **Logs** para ver logs de runtime

---

## 🔄 Actualizar Código

### Push a GitHub

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Dokploy detectará automáticamente los cambios y desplegará.

### Rollback

Si necesitas hacer rollback:

1. En Dokploy, ve a **"Deployments"** o **"Despliegues"**
2. Selecciona una versión anterior
3. Clic en **"Redeploy"** o **"Redesplegar"**

---

## 🐛 Troubleshooting

### Error: "Missing binding DB"

**Solución:** Verifica que `wrangler.json` tiene la configuración correcta de D1 y que la base de datos existe en Cloudflare.

### Error: "KV namespace not found"

**Solución:** Verifica que el KV namespace existe y que el ID en `wrangler.json` es correcto.

### Error: "R2 bucket not found"

**Solución:** Verifica que el R2 bucket existe y que el nombre en `wrangler.json` es correcto.

### Error: "Build failed"

**Solución:**
- Verifica que `package.json` tiene todas las dependencias
- Revisa logs de build en Dokploy
- Asegúrate de que `npm ci` funciona localmente

### Error: "Deploy failed"

**Solución:**
- Verifica que `CLOUDFLARE_API_TOKEN` está configurado en Dokploy
- Revisa que el token tiene los permisos correctos
- Verifica logs de deployment en Dokploy

---

## ✅ Checklist de Deployment con Dokploy

- [ ] Dokploy instalado y funcionando
- [ ] Repositorio GitHub conectado
- [ ] Cloudflare API Token configurado en Dokploy (Environment Variables)
- [ ] D1 Database creado y migraciones aplicadas
- [ ] R2 Bucket creado
- [ ] KV Namespace creado
- [ ] `wrangler.json` actualizado con IDs correctos
- [ ] Build command configurado: `npm ci && npm run build`
- [ ] Deploy command configurado: `npx wrangler deploy`
- [ ] Health check funcionando: `/health`
- [ ] Logs verificados
- [ ] Dominio personalizado configurado (si aplica)

---

## 📚 Recursos Adicionales

- [Dokploy Documentation](https://dokploy.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

**¡Tu proyecto está listo para deployment con Dokploy!** 🎉
