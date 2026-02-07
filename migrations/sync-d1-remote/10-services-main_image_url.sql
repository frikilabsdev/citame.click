-- services.main_image_url (migración 5). Si falla "duplicate column", ya existe.
ALTER TABLE services ADD COLUMN main_image_url TEXT;
