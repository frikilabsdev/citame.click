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
