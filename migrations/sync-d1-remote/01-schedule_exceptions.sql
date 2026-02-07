-- Tabla schedule_exceptions (migración 3). Idempotente.
CREATE TABLE IF NOT EXISTS schedule_exceptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  service_id INTEGER,
  exception_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  is_blocked BOOLEAN DEFAULT 1,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_tenant_id ON schedule_exceptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_service_id ON schedule_exceptions(service_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_date ON schedule_exceptions(exception_date);
