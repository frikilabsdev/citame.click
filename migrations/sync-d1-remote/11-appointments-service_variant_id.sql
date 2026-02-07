-- appointments.service_variant_id (migración 6). Si falla "duplicate column", ya existe.
ALTER TABLE appointments ADD COLUMN service_variant_id INTEGER;
