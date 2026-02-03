-- Añade service_variant_id a appointments (migración 6).
-- Ejecutar en remoto: npx wrangler d1 execute mocha-appointments-db --remote --file=migrations/6-add-appointments-service-variant-id.sql
-- Si falla con "duplicate column name: service_variant_id", la columna ya existe.
ALTER TABLE appointments ADD COLUMN service_variant_id INTEGER;
