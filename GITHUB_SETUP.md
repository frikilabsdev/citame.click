# 📦 Configuración para GitHub

Esta guía te ayudará a preparar el proyecto para subirlo a GitHub de forma segura.

---

## ✅ Archivos Preparados

### 1. `.gitignore` ✅
- ✅ Actualizado con todas las exclusiones necesarias
- ✅ Protege archivos sensibles (`.env`, `.dev.vars`)
- ✅ Excluye `node_modules/`, `dist/`, `.wrangler/`

### 2. `.env.example` ✅
- ✅ Creado como plantilla para variables de entorno
- ✅ No contiene información sensible
- ✅ Documenta qué variables se necesitan

### 3. Documentación
- ✅ `DOKPLOY_CONFIG.md` - Guía para deployment con Dokploy
- ✅ `GUIA_DEPLOY_PRODUCCION.md` - Guía general de deployment
- ✅ `README.md` - Ya existente

---

## 🔐 Revisión de Seguridad Antes de Push

### ✅ Verificar que NO se suben estos archivos:

```bash
# Verificar archivos que NO deberían estar en git
git status
```

**NUNCA debe aparecer:**
- ❌ `.env`
- ❌ `.dev.vars`
- ❌ `node_modules/`
- ❌ `.wrangler/`
- ❌ `dist/` (opcional, depende de tu workflow)
- ❌ `*.log`

### ✅ Verificar que wrangler.json NO tiene secrets:

Abre `wrangler.json` y verifica que:
- ✅ No tiene API tokens
- ✅ No tiene secrets en texto plano
- ✅ Solo tiene IDs de recursos (está bien)

**Los IDs de D1, R2, KV son públicos y están bien en git.**

---

## 📝 Pasos para Subir a GitHub

### Paso 1: Verificar Estado

```bash
# Ver qué archivos se van a subir
git status

# Ver archivos ignorados
git status --ignored
```

### Paso 2: Agregar Archivos

```bash
# Agregar todos los archivos (respeta .gitignore)
git add .

# Verificar qué se agregó
git status
```

### Paso 3: Verificar Archivos Sensibles

```bash
# Buscar posibles secrets accidentalmente agregados
git diff --cached | grep -i "api\|token\|secret\|password\|key"
```

Si encuentras algo, **NO hagas commit**. Remueve el archivo:
```bash
git reset HEAD <archivo>
# Luego agrega a .gitignore
```

### Paso 4: Commit

```bash
git commit -m "feat: Initial commit - Sistema de citas con Cloudflare Workers

- Sistema de autenticación con sesiones KV
- Rate limiting en endpoints públicos
- Error handling global
- Logging estructurado
- Health check endpoint
- Configuración para Dokploy
"
```

### Paso 5: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Crea un nuevo repositorio
3. **NO inicialices con README** (ya tienes uno)
4. Copia la URL del repositorio

### Paso 6: Push a GitHub

```bash
# Agregar remote
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Push (primera vez)
git branch -M main
git push -u origin main
```

---

## 🔒 Configurar Secrets en GitHub (Opcional)

Si planeas usar GitHub Actions para CI/CD:

### GitHub Secrets

Ve a: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

**Secrets a configurar:**
- `CLOUDFLARE_API_TOKEN` - Token de API de Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` - ID de cuenta de Cloudflare

**NOTA:** Estos secrets solo se necesitan si usas GitHub Actions. Para Dokploy, se configuran directamente en Dokploy.

---

## 📋 Checklist Pre-Push

Antes de hacer `git push`, verifica:

- [ ] `.gitignore` está actualizado
- [ ] No hay archivos `.env` o `.dev.vars` en staging
- [ ] No hay `node_modules/` en staging
- [ ] `wrangler.json` no tiene secrets
- [ ] `.env.example` existe (sin valores reales)
- [ ] README.md está actualizado
- [ ] No hay información sensible en commits anteriores

---

## 🚨 Si Accidentalmente Pusheaste Secrets

### Si fue reciente (< 24 horas):

1. **Remueve el secret del código:**
   ```bash
   # Editar el archivo para remover el secret
   # Luego:
   git add .
   git commit --amend -m "Remove sensitive data"
   git push --force
   ```

2. **Si usas GitHub:**
   - Ve a Settings → Security → Secret scanning
   - GitHub detectará y alertará sobre secrets

### Si fue hace tiempo:

1. **Rota el secret** - Crea uno nuevo y actualiza donde se use
2. **Considera hacer el repo privado** temporalmente
3. **Si es crítico:** Contacta soporte de GitHub

---

## 📚 Estructura del Repositorio

```
Citas/
├── .gitignore              ✅ Configurado
├── .env.example            ✅ Template de variables
├── package.json
├── wrangler.json           ✅ (Sin secrets, solo IDs)
├── tsconfig*.json
├── vite.config.ts
├── README.md
├── DOKPLOY_CONFIG.md       ✅ Guía Dokploy
├── GUIA_DEPLOY_PRODUCCION.md
├── src/
│   ├── worker/            ✅ Backend (Workers)
│   ├── react-app/         ✅ Frontend (React)
│   └── shared/            ✅ Tipos compartidos
├── migrations/            ✅ Migraciones D1
└── docs/                  ✅ Documentación
```

---

## ✅ Estado Actual

### Listo para GitHub:
- ✅ `.gitignore` configurado
- ✅ `.env.example` creado (template)
- ✅ Documentación completa
- ✅ Sin secrets en código
- ✅ Estructura organizada

### Configuración Dokploy:
- ✅ `DOKPLOY_CONFIG.md` con guía completa
- ✅ Instrucciones paso a paso
- ✅ Troubleshooting incluido

---

## 🎯 Próximos Pasos

1. **Revisar estado actual:**
   ```bash
   git status
   ```

2. **Verificar .gitignore:**
   ```bash
   git status --ignored
   ```

3. **Hacer commit inicial:**
   ```bash
   git add .
   git commit -m "Initial commit"
   ```

4. **Push a GitHub:**
   ```bash
   git push -u origin main
   ```

5. **Configurar Dokploy:**
   - Sigue `DOKPLOY_CONFIG.md`

---

**¡Tu proyecto está listo para GitHub!** 🚀
