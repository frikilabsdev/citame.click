# Sincronizar D1 remota con el esquema completo

Cuando en producción (D1 remota) faltan tablas o columnas y ves errores como "no such column" o "no such table", aplica esta sincronización.

## Requisitos

- Tener aplicada antes la **migración base** (`migrations/1.sql`) en la D1 remota. Si la base está vacía, ejecuta primero:
  ```bash
  npx wrangler d1 execute mocha-appointments-db --remote --file=migrations/1.sql
  ```
- Estar autenticado: `npx wrangler login` (o variable `CLOUDFLARE_API_TOKEN`).

## Opción 1: Script automático (recomendado)

Desde la raíz del repo:

```bash
chmod +x scripts/apply-sync-d1-remote.sh
./scripts/apply-sync-d1-remote.sh
```

El script ejecuta en orden todos los `.sql` de esta carpeta. Si un paso falla (por ejemplo "duplicate column name"), se continúa con el siguiente. Es seguro ejecutarlo varias veces.

## Opción 2: Manual

Ejecuta cada archivo en orden numérico:

```bash
DB=mocha-appointments-db
for f in migrations/sync-d1-remote/*.sql; do
  npx wrangler d1 execute $DB --remote --file="$f"
done
```

Si uno falla, anota cuál y sigue; "duplicate column" o "table already exists" significa que ya estaba aplicado.

## Qué incluye

| Archivo | Contenido |
|---------|-----------|
| 01 | Tabla `schedule_exceptions` |
| 02 | Tabla `service_variants` |
| 03 | Tablas `employees`, `employee_services`, `employee_schedules`, `employee_time_off` |
| 04-09 | Columnas en `appointments` y `visual_customizations` (migraciones 2, 4) |
| 10 | Columna `services.main_image_url` |
| 11-12 | Columnas `appointments.service_variant_id`, `appointments.employee_id` |
| 13 | Columna `employees.display_order` (por si la tabla se creó sin ella) |

## Desde el dashboard de Cloudflare

Workers & Pages → D1 → **mocha-appointments-db** → **Console**. Puedes pegar y ejecutar el contenido de cada `.sql` en orden. Si uno falla por "duplicate column", pásate al siguiente.
