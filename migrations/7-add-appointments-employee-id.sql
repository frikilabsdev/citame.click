-- Añade employee_id a appointments (para migración 7).
-- Ejecutar solo si la columna no existe: npx wrangler d1 execute mocha-appointments-db --remote --file=migrations/7-add-appointments-employee-id.sql
-- Si falla con "duplicate column name", la columna ya existe; no hagas nada.
ALTER TABLE appointments ADD COLUMN employee_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_appointments_employee_id ON appointments(employee_id);
