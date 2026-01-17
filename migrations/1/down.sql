
DROP INDEX idx_visual_customizations_tenant_id;
DROP TABLE visual_customizations;

DROP INDEX idx_appointments_status;
DROP INDEX idx_appointments_date;
DROP INDEX idx_appointments_service_id;
DROP INDEX idx_appointments_tenant_id;
DROP TABLE appointments;

DROP INDEX idx_availability_schedules_service_id;
DROP TABLE availability_schedules;

DROP INDEX idx_payment_methods_tenant_id;
DROP TABLE payment_methods;

DROP INDEX idx_social_networks_tenant_id;
DROP TABLE social_networks;

DROP INDEX idx_service_images_service_id;
DROP TABLE service_images;

DROP INDEX idx_services_tenant_id;
DROP TABLE services;

DROP INDEX idx_business_configs_tenant_id;
DROP TABLE business_configs;

DROP INDEX idx_tenants_owner_user_id;
DROP INDEX idx_tenants_slug;
DROP TABLE tenants;
