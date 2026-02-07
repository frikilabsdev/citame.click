-- employees.display_order (por si la tabla se creó sin ella). Si falla "duplicate column", ya existe.
ALTER TABLE employees ADD COLUMN display_order INTEGER DEFAULT 0;
