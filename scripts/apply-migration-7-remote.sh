#!/usr/bin/env bash
# Aplica la migración 7 (empleados) en D1 REMOTO (producción).
# Usa SQL idempotente para no fallar si las tablas ya existen.
#
# Ejecutar desde la raíz del proyecto, con wrangler autenticado:
#   npx wrangler login   # si hace falta
#   ./scripts/apply-migration-7-remote.sh
#
set -e
cd "$(dirname "$0")/.."
echo "Aplicando migración 7 (empleados) en D1 remoto (producción)..."

npx wrangler d1 execute mocha-appointments-db --remote --file=migrations/7-idempotent.sql
echo "Tablas/índices de empleados aplicados."

# Añadir columna employee_id a appointments (puede fallar si ya existe)
set +e
npx wrangler d1 execute mocha-appointments-db --remote --file=migrations/7-add-appointments-employee-id.sql
R=$?
set -e
[ $R -eq 0 ] && echo "Columna employee_id en appointments aplicada." || echo "employee_id ya existía."

# Añadir columna display_order a employees (si la tabla se creó sin ella)
set +e
npx wrangler d1 execute mocha-appointments-db --remote --file=migrations/7-add-employees-display-order.sql
R=$?
set -e
[ $R -eq 0 ] && echo "Columna display_order en employees aplicada." || echo "display_order ya existía."

echo "Listo. Comprueba en producción: https://citame.click/dashboard/employees"
