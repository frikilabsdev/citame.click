-- Agregar campos adicionales para personalización visual
ALTER TABLE visual_customizations ADD COLUMN card_background_color TEXT DEFAULT '#ffffff';
ALTER TABLE visual_customizations ADD COLUMN card_border_color TEXT DEFAULT '#e5e7eb';
ALTER TABLE visual_customizations ADD COLUMN service_title_color TEXT DEFAULT '#111827';
ALTER TABLE visual_customizations ADD COLUMN time_text_color TEXT DEFAULT '#6b7280';
ALTER TABLE visual_customizations ADD COLUMN price_color TEXT DEFAULT '#059669';
