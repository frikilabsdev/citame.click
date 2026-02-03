# Deploy automático con GitHub Actions

Cada **push a la rama `main`** despliega automáticamente a Cloudflare Workers. El workflow está en `.github/workflows/deploy.yml`.

## Requisitos

El workflow necesita dos valores en GitHub (como **secrets** del Environment `production` o como Repository secrets):

- **`CLOUDFLARE_API_TOKEN`** (obligatorio): token de API de Cloudflare para que GitHub Actions pueda desplegar tu Worker.
- **`CLOUDFLARE_ACCOUNT_ID`** (recomendado): ID de tu cuenta de Cloudflare (evita el error "No account id found").

---

## Guía paso a paso: obtener y configurar los secrets

### Paso 1: Obtener CLOUDFLARE_ACCOUNT_ID

1. Entra a **[Cloudflare Dashboard](https://dash.cloudflare.com)** e inicia sesión.
2. En la **barra lateral derecha** (o en la página principal de tu cuenta) verás **Account ID** (una cadena alfanumérica, p. ej. `a1b2c3d4e5f6...`).
   - Alternativa: ve a **Workers & Pages** → en la vista general también suele aparecer el Account ID.
3. **Cópialo** (clic en el icono de copiar si aparece). Lo pegarás en GitHub en el Paso 3.

### Paso 2: Crear CLOUDFLARE_API_TOKEN

1. En Cloudflare Dashboard, haz clic en tu **icono de perfil** (arriba a la derecha) → **My Profile** (o ve a [dash.cloudflare.com/profile](https://dash.cloudflare.com/profile)).
2. En el menú lateral, entra a **API Tokens**.
3. Pulsa **Create Token**.
4. Usa la plantilla **"Edit Cloudflare Workers"** (o **"Create Custom Token"** si prefieres):
   - Si usas la plantilla "Edit Cloudflare Workers", los permisos ya vienen bien para desplegar Workers.
   - Si creas uno personalizado: permisos **Account** → **Workers Scripts** → **Edit**; y **Account** → **Account Settings** → **Read** (opcional pero recomendado).
5. Elige el **Account** (tu cuenta, p. ej. Frikilabs).
6. Pulsa **Continue to summary** y luego **Create Token**.
7. **Copia el token** en ese momento (solo se muestra una vez). Si lo pierdes, tendrás que crear otro token.
8. Guárdalo en un lugar seguro temporalmente; lo pegarás en GitHub en el Paso 3.

### Paso 3: Pegar los valores en GitHub

Tu workflow usa el **Environment `production`**, así que los secrets deben estar en ese environment:

1. Abre el repositorio en GitHub: **https://github.com/frikilabsdev/citame.click**
2. Ve a **Settings** (pestaña del repo).
3. En el menú izquierdo, en **Code and automation**, entra a **Environments**.
4. Haz clic en el environment **production** (si no existe, pulsa **New environment** y créalo con el nombre `production`).
5. En la sección **Environment secrets** (o **Environment variables**), pulsa **Add secret** (o **Add variable**).
6. **Primer secret:**
   - **Name:** `CLOUDFLARE_ACCOUNT_ID`
   - **Value:** pega el Account ID que copiaste en el Paso 1.
   - Guarda (Add secret / Save).
7. **Segundo secret:**
   - **Name:** `CLOUDFLARE_API_TOKEN`
   - **Value:** pega el token que copiaste en el Paso 2.
   - Guarda (Add secret / Save).

Con eso, el workflow **Deploy to Cloudflare Workers** podrá autenticarse en Cloudflare y desplegar en cada push a `main`.

**Nota:** Si prefieres no usar Environments, puedes usar **Repository secrets**: Settings → Secrets and variables → **Actions** → **Repository secrets** → New repository secret, y crear ahí `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_API_TOKEN`. En ese caso, quita la línea `environment: production` del job `deploy` en `.github/workflows/deploy.yml` para que use los repository secrets.

## Flujo del workflow

1. Checkout del código.
2. Instalación de dependencias (`npm ci`).
3. Build (`npm run build`).
4. Deploy con Wrangler (`wrangler deploy`).

Si algún paso falla, el deploy no se realiza y puedes ver el error en la pestaña Actions del repositorio.

**Importante:** El deploy **solo actualiza el Worker** (código y assets). **No aplica migraciones de D1**. Si añades nuevas tablas o columnas (p. ej. migración 7), debes ejecutarlas tú en la D1 remota (ver sección “Aplicar la migración 7” más abajo). Sin eso, la API puede devolver 500 en producción aunque el código esté desplegado.

## Deploy manual desde GitHub

En el repo: **Actions** → **Deploy to Cloudflare Workers** → **Run workflow** (botón). Ejecuta el mismo flujo sin hacer push.

## Deploy manual desde tu máquina

Si prefieres no usar Actions o necesitas desplegar ya sin esperar al push:

```bash
npm run build
npx wrangler deploy
```

Necesitas tener configurado Wrangler (login previo con `npx wrangler login` o variables de entorno).

## Por qué la versión en producción no se actualizaba

Si la versión desplegada (p. ej. "vcba32555") no cambiaba tras hacer push, es porque **no había ningún pipeline que desplegara al subir a GitHub**. Con este workflow, cada push a `main` genera un nuevo deploy y la versión en https://citame.click se actualiza automáticamente.

## Aplicar la migración 7 (empleados) en producción (D1 remoto)

**El 500 en `/api/employees` en producción** suele deberse a que la migración 7 no está aplicada en la base D1 **remota**. El deploy del Worker no aplica migraciones; hay que ejecutarlas a mano (o con el script) desde tu máquina.

1. Autentícate con Cloudflare (solo hace falta una vez):
   ```bash
   npx wrangler login
   ```

2. Aplica la migración 7 en **remoto** (recomendado; usa SQL idempotente y no falla si las tablas ya existen):
   ```bash
   ./scripts/apply-migration-7-remote.sh
   ```

   Ese script ejecuta `7-idempotent.sql` y luego `7-add-appointments-employee-id.sql` contra la D1 de producción.

**Alternativas:**

- **Migraciones completas** (solo si la D1 remota está vacía o al día con el historial de Wrangler):
  ```bash
  npx wrangler d1 migrations apply mocha-appointments-db --remote
  ```

- **Manual:** ejecutar en remoto los archivos en este orden:
  ```bash
  npx wrangler d1 execute mocha-appointments-db --remote --file=migrations/7-idempotent.sql
  npx wrangler d1 execute mocha-appointments-db --remote --file=migrations/7-add-appointments-employee-id.sql
  ```
  Si el segundo falla con "duplicate column name: employee_id", la columna ya existe; no hace falta repetir.

- **Desde el dashboard de Cloudflare:** Workers & Pages → D1 → tu base → **Console**. Pegar y ejecutar el contenido de `migrations/7-idempotent.sql` y luego el de `migrations/7-add-appointments-employee-id.sql` (por bloques si la consola no admite todo junto).

## Cómo ver el motivo de un 500 en producción

Si un endpoint devuelve 500 (p. ej. `/api/employees`), el cuerpo de la respuesta incluye un campo `message` con el detalle del error. Para verlo: **DevTools → pestaña Network → clic en la petición que devuelve 500 → Response**. Ahí verás el JSON con `error` y `message`. Con eso puedes saber si falta un binding (DB, SESSIONS_KV), si hay un error SQL, etc. Cuando dejes de depurar, se puede quitar la exposición de `message` en producción en el código.

## Errores en la consola del navegador que no son de la app

Si ves en la consola (F12) mensajes como `background.js`, `chrome-extension://`, `utils.js`, `extensionState.js`, `Receiving end does not exist`, `message port closed` o `ERR_FILE_NOT_FOUND` en rutas de extensiones, **son de extensiones del navegador** (Cursor, traductores, bloqueadores, etc.), no de citame.click. Para probar la app sin ese ruido: ventana de incógnito o desactivar extensiones en esa pestaña. Los únicos errores relevantes de la app son los que apuntan a tu dominio (p. ej. `https://citame.click/api/...`).
