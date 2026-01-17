-- Tabla para excepciones de horarios (bloqueos o horarios especiales)
CREATE TABLE schedule_exceptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  service_id INTEGER, -- NULL = aplica a todos los servicios del tenant
  exception_date DATE NOT NULL,
  start_time TEXT, -- NULL = todo el día
  end_time TEXT, -- NULL = solo la hora específica de start_time
  is_blocked BOOLEAN DEFAULT 1, -- 1 = bloqueado, 0 = permitido (para horarios especiales)
  reason TEXT, -- Motivo del bloqueo/permitido
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedule_exceptions_tenant_id ON schedule_exceptions(tenant_id);
CREATE INDEX idx_schedule_exceptions_service_id ON schedule_exceptions(service_id);
CREATE INDEX idx_schedule_exceptions_date ON schedule_exceptions(exception_date);
