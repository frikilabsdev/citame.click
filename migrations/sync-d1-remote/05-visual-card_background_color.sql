-- visual_customizations (migración 4). Si falla "duplicate column", ya existe.
ALTER TABLE visual_customizations ADD COLUMN card_background_color TEXT DEFAULT '#ffffff';
