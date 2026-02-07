#!/usr/bin/env bash
# Aplica todas las migraciones de sincronización en D1 remota.
# Si una columna ya existe ("duplicate column name"), ese paso falla y se sigue con el siguiente.
# Requiere: npx wrangler login (o CLOUDFLARE_API_TOKEN) y que la base mocha-appointments-db exista.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$REPO_ROOT/migrations/sync-d1-remote"
DB_NAME="mocha-appointments-db"

echo "=== Sincronizando D1 remota ($DB_NAME) ==="
echo "Desde: $MIGRATIONS_DIR"
echo ""

echo "Asegúrate de haber aplicado antes la migración base (migrations/1.sql) si la base estaba vacía."
echo ""

for f in "$MIGRATIONS_DIR"/*.sql; do
  [ -f "$f" ] || continue
  name="$(basename "$f")"
  echo "Ejecutando: $name"
  if npx wrangler d1 execute "$DB_NAME" --remote --file="$f"; then
    echo "  OK"
  else
    echo "  (falló o ya aplicado - continuando)"
  fi
  echo ""
done

echo "=== Fin. Si algún paso falló con 'duplicate column' o 'already exists', es normal: ya estaba aplicado. ==="
