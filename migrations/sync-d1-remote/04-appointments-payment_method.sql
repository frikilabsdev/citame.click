-- appointments.payment_method (migración 2). Si falla "duplicate column", ya existe.
ALTER TABLE appointments ADD COLUMN payment_method TEXT;
