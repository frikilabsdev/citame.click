# Modelo de datos

Esquema de la base de datos D1 (SQLite). Definido en `migrations/`.

## Tablas principales

### users

Almacenada y gestionada por el sistema externo Mocha (users-service). En D1 local puede existir para referencia.

- `id` (TEXT PK), `email`, `password_hash`, `created_at`, `updated_at`

### tenants

Negocios; cada uno pertenece a un usuario (`owner_user_id`).

- `id` (INTEGER PK), `slug` (UNIQUE), `owner_user_id`, `is_active`, `created_at`, `updated_at`

### business_configs

Configuración por negocio: nombre, contacto, imágenes.

- `id`, `tenant_id` (FK), `business_name`, `address`, `phone`, `whatsapp`, `google_maps_url`, `profile_image_url`, `header_image_url`, `created_at`, `updated_at`

### services

Servicios ofrecidos por cada tenant.

- `id`, `tenant_id` (FK), `title`, `description`, `price`, `duration_minutes`, `max_simultaneous_bookings`, `is_active`, `main_image_url`, `created_at`, `updated_at`

### service_images

Imágenes por servicio (carrusel); orden por `display_order`.

- `id`, `service_id` (FK), `image_url`, `display_order`, `created_at`, `updated_at`

### social_networks

Redes sociales del tenant.

- `id`, `tenant_id` (FK), `platform`, `url`, `is_active`, `created_at`, `updated_at`

### payment_methods

Métodos de pago del tenant (efectivo, transferencia, tarjeta, etc.).

- `id`, `tenant_id` (FK), `method_type`, `account_number`, `clabe`, `card_number`, `account_holder_name`, `is_active`, `created_at`, `updated_at`

### availability_schedules

Bloques de disponibilidad por servicio (día de la semana, hora inicio/fin).

- `id`, `service_id` (FK), `day_of_week`, `start_time`, `end_time`, `is_active`, `created_at`, `updated_at`

### schedule_exceptions

Excepciones de horario (bloqueos o horarios especiales) por tenant y opcionalmente por servicio.

- `id`, `tenant_id` (FK), `service_id` (FK, nullable), `exception_date`, `start_time`, `end_time`, `is_blocked`, `reason`, `created_at`, `updated_at`

### appointments

Citas; vinculadas a tenant y servicio.

- `id`, `tenant_id` (FK), `service_id` (FK), `customer_name`, `customer_phone`, `customer_email`, `appointment_date`, `appointment_time`, `status`, `notes`, `payment_method`, `created_at`, `updated_at`

### visual_customizations

Personalización visual por tenant (colores, tipo de fondo, etc.).

- `id`, `tenant_id` (FK), `primary_color`, `secondary_color`, `accent_color`, `text_color`, `background_type`, `background_color`, `background_gradient_start`, `background_gradient_end`, `background_image_url`, `card_background_color`, `card_border_color`, `service_title_color`, `time_text_color`, `price_color`, `created_at`, `updated_at`

## Relaciones clave

- **tenant** → business_config (1:1), services (1:N), social_networks (1:N), payment_methods (1:N), appointments (1:N), visual_customizations (1:1).
- **service** → service_images (1:N), availability_schedules (1:N), appointments (1:N).
- **schedule_exceptions** → tenant (N:1), opcionalmente service (N:1).

## Migraciones

| Archivo | Contenido |
|---------|-----------|
| `1.sql` | users, tenants, business_configs, services, service_images, social_networks, payment_methods, availability_schedules, appointments, visual_customizations (base). |
| `2.sql` | Añade `payment_method` a appointments. |
| `3.sql` | Tabla schedule_exceptions. |
| `4.sql` | Columnas extra en visual_customizations (card_*, service_title_color, time_text_color, price_color). |
| `5.sql` | Añade `main_image_url` a services. |

Aplicar en orden con:

```bash
npx wrangler d1 migrations apply <database_name_or_id> --local   # desarrollo
npx wrangler d1 migrations apply <database_name_or_id> --remote  # producción
```

## Tipos TypeScript

Los tipos compartidos están en `src/shared/types.ts`: `Tenant`, `BusinessConfig`, `Service`, `ServiceImage`, `SocialNetwork`, `PaymentMethod`, `AvailabilitySchedule`, `ScheduleException`, `Appointment`, `VisualCustomization`. Deben mantenerse alineados con el esquema D1.
