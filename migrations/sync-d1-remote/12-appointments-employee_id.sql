-- appointments.employee_id (migración 7). Si falla "duplicate column", ya existe.
ALTER TABLE appointments ADD COLUMN employee_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_appointments_employee_id ON appointments(employee_id);
