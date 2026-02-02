# ✅ Checklist Pre-GitHub

Usa este checklist antes de hacer tu primer push a GitHub.

---

## 🔐 Seguridad

- [ ] **Verificar `.gitignore`** incluye todos los archivos sensibles
  ```bash
  cat .gitignore
  ```

- [ ] **Verificar que NO hay archivos sensibles en staging:**
  ```bash
  git status
  git status --ignored
  ```

- [ ] **Verificar `wrangler.json`** no contiene secrets:
  ```bash
  grep -i "token\|secret\|password\|key" wrangler.json
  ```
  ✅ Solo debe tener IDs de recursos (está bien)

- [ ] **Verificar que `.env` o `.dev.vars` NO están en git:**
  ```bash
  git ls-files | grep -E "\.env|\.dev\.vars"
  ```
  ✅ No debe mostrar nada

- [ ] **Verificar `node_modules/` no está en git:**
  ```bash
  git ls-files | grep node_modules
  ```
  ✅ No debe mostrar nada

---

## 📝 Archivos de Configuración

- [ ] **`.env.example` existe** (o está documentado en README)
- [ ] **`README.md` está actualizado** con instrucciones
- [ ] **`package.json`** tiene todas las dependencias necesarias

---

## 🐛 Errores de Build

- [ ] **Build funciona localmente:**
  ```bash
  npm run build
  ```
  ⚠️ Puede haber warnings de TypeScript (no bloquean funcionalidad)

- [ ] **Probar localmente:**
  ```bash
  npm run dev
  ```
  ✅ La app debe funcionar

---

## 📚 Documentación

- [ ] **`README.md`** tiene:
  - Descripción del proyecto
  - Instrucciones de instalación
  - Comandos para desarrollo
  - Link a documentación adicional

- [ ] **Documentación de deployment existe:**
  - `DOKPLOY_CONFIG.md` (para Dokploy)
  - `GUIA_DEPLOY_PRODUCCION.md` (guía general)

---

## 🚀 Git Commands

Cuando todo esté listo:

```bash
# 1. Verificar estado
git status

# 2. Agregar archivos (respeta .gitignore)
git add .

# 3. Verificar qué se agregó
git status

# 4. Commit
git commit -m "Initial commit - Sistema de citas con Cloudflare Workers"

# 5. Agregar remote (si no existe)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# 6. Push
git branch -M main
git push -u origin main
```

---

## ❌ Si Encuentras Problemas

### Archivo sensible en staging:

```bash
# Remover del staging
git reset HEAD <archivo>

# Agregar a .gitignore
echo "<archivo>" >> .gitignore

# Verificar
git status
```

### Secret en wrangler.json:

1. **Edita `wrangler.json`** para remover el secret
2. **Configura el secret en Dokploy** (Environment Variables)
3. **Haz commit** del cambio

---

## ✅ Estado Final

Cuando completes este checklist:

- ✅ Todo listo para GitHub
- ✅ Sin información sensible
- ✅ Documentación completa
- ✅ Build funciona
- ✅ Listo para conectar con Dokploy

---

**¡Listo para GitHub!** 🎉
