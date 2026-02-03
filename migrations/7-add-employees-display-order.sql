-- Añade la columna display_order a employees (si la tabla se creó sin ella).
-- Ejecutar: npx wrangler d1 execute mocha-appointments-db --remote --file=migrations/7-add-employees-display-order.sql
-- Si falla con "duplicate column name: display_order", la columna ya existe.
ALTER TABLE employees ADD COLUMN display_order INTEGER DEFAULT 0;
