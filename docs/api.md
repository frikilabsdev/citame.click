# API

Resumen de endpoints. Base URL: la del Worker en producción o `http://localhost:5173` en desarrollo (Vite proxy si está configurado, o la URL del Worker).

## Salud y sesión global

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | No | Health check; comprueba D1 y KV. |
| GET | `/api/users/me` | Sí (cookie) | Devuelve el usuario actual. |
| POST | `/api/logout` | No | Cierra sesión (borra cookie y sesión en KV). |

## Autenticación (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registro (email, password). Rate limit por IP. |
| POST | `/api/auth/login` | No | Login; crea sesión en KV y cookie. |
| GET | `/api/auth/me` | Cookie | Usuario actual. |
| POST | `/api/auth/logout` | No | Cerrar sesión. |

## Tenants (`/api/tenants`)

Todos requieren autenticación. Operaciones sobre negocios del usuario.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Lista tenants del usuario. |
| GET | `/:slug` | Tenant por slug. |
| POST | `/` | Crear tenant. |
| PUT | `/:slug` | Actualizar tenant. |
| DELETE | `/:slug` | Eliminar tenant. |
| GET | `/:slug/config` | Configuración del negocio (business_config). |
| PUT | `/:slug/config` | Actualizar configuración del negocio. |

## Servicios (`/api/services`)

Requieren auth. Ownership por tenant.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET, POST, PUT, DELETE | (definidos en services.ts) | CRUD de servicios del tenant. |

## Imágenes de servicios (`/api/service-images`)

Requieren auth.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/service/:serviceId` | Lista imágenes de un servicio. |
| POST | `/` | Crear imagen (servicio, url, display_order). |
| PUT | `/:id` | Actualizar imagen. |
| DELETE | `/:id` | Eliminar imagen. |

## Horarios (`/api/schedules`)

Requieren auth.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/service/:serviceId` | Horarios por servicio. |
| GET | `/tenant/:tenantId/day/:dayOfWeek` | Horarios del tenant por día. |
| POST | `/` | Crear horario. |
| PUT | `/:id` | Actualizar horario. |
| DELETE | `/:id` | Eliminar horario. |
| GET | `/exceptions/tenant/:tenantId` | Excepciones del tenant. |
| POST | `/exceptions` | Crear excepción. |
| PUT | `/exceptions/:id` | Actualizar excepción. |
| DELETE | `/exceptions/:id` | Eliminar excepción. |

## Citas (`/api/appointments`)

Requieren auth. Ownership por tenant.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Lista citas del tenant (filtros). |
| GET | `/:id` | Una cita. |
| GET | `/:id/ics` | Descarga ICS de la cita. |
| PATCH | `/:id/status` | Cambiar estado (confirmed, cancelled, etc.). |
| PUT | `/:id` | Actualizar cita. |
| DELETE | `/:id` | Eliminar cita. |

## Público (`/api/public`)

Sin autenticación. Uso por la página de reserva `/:slug`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/tenants/:slug` | Datos del negocio por slug. |
| GET | `/tenants/:slug/services` | Servicios activos del negocio. |
| GET | `/tenants/:slug/payment-methods` | Métodos de pago activos. |
| GET | `/services/:serviceId/images` | Imágenes de un servicio. |
| GET | `/services/:serviceId/available-dates` | Fechas disponibles. |
| GET | `/services/:serviceId/slots` | Slots de hora para una fecha. |
| POST | `/appointments` | Crear cita (reserva pública). Rate limit aplicable. |
| GET | `/appointments/:id/ics` | Descarga ICS de una cita (por id público). |

## Redes sociales (`/api/social`)

Requieren auth.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Lista redes del tenant. |
| POST | `/` | Crear red. |
| PUT | `/:id` | Actualizar red. |
| DELETE | `/:id` | Eliminar red. |

## Métodos de pago (`/api/payments`)

Requieren auth.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Lista métodos del tenant. |
| POST | `/` | Crear método. |
| PUT | `/:id` | Actualizar método. |
| DELETE | `/:id` | Eliminar método. |

## Personalización visual (`/api/customize`)

Requieren auth.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Obtener personalización del tenant. |
| PUT | `/` | Guardar personalización (colores, fondo, etc.). |

## Upload (`/api/upload`)

Requieren auth. Subida de imágenes a R2.

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/image` | Subir imagen (multipart/form-data). |
| GET | `/files/*` | Servir archivo desde R2 (path). |

## Autenticación en requests

- **Endpoints que requieren auth:** envío de la cookie `session_token` (establecida en login). Same-origin o CORS con `credentials: true`.
- **Públicos:** no envían cookie; algunos tienen rate limiting por IP (ej. registro, crear cita pública).
