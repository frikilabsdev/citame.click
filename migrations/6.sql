-- Variantes de servicio (ej. Corte mujer/hombre/niño con precios distintos)
CREATE TABLE service_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  duration_minutes INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE INDEX idx_service_variants_service_id ON service_variants(service_id);

-- Citas pueden asociarse a una variante (opcional; null = servicio sin variante)
ALTER TABLE appointments ADD COLUMN service_variant_id INTEGER REFERENCES service_variants(id);
