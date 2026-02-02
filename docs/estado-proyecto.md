# Estado del proyecto

Resumen de lo implementado y lo pendiente. El proyecto está en producción.

## Implementado

### Infraestructura y seguridad

- Cloudflare Workers + Hono, D1, R2, KV.
- Autenticación con Mocha (users-service); sesiones persistentes en KV.
- Rate limiting en registro y en endpoints públicos sensibles.
- CORS, manejo de errores global, logging estructurado, health check (`/health`).

### Backend (APIs)

- Auth: registro, login, logout, `/me`.
- Tenants: CRUD y configuración del negocio (business_config).
- Servicios: CRUD; imágenes de servicios (service-images).
- Horarios: CRUD de availability_schedules y schedule_exceptions.
- Citas: CRUD, cambio de estado, descarga ICS.
- Público: tenant por slug, servicios, métodos de pago, imágenes, fechas/slots disponibles, crear cita, ICS.
- Social, payments, customize, upload (APIs listas).

### Frontend

- Rutas: Home, Login, Register, `/:slug` (reserva pública), Dashboard con layout.
- Dashboard en menú: Inicio, Servicios, Horarios, Citas, Configuración.
- Páginas existentes pero **sin enlace en el menú** del layout: Personalización visual (Customize), Métodos de pago (Payments), Redes sociales (Social). Las rutas y componentes existen; para usarlas hay que añadirlas a `DashboardLayout` y a `App.tsx` si aún no están definidas.
- Vista pública de reserva: flujo de selección de servicio, fecha, hora y datos del cliente.
- Uso de AuthContext, alias `@/`, Tailwind, lucide-react.

### Modelo de datos

- Migraciones 1–5 aplicadas: tablas y columnas descritas en [modelo-datos.md](modelo-datos.md). Tipos en `src/shared/types.ts`.

## Pendiente / mejoras

- **Menú dashboard:** Añadir enlaces a Customize, Payments y Social en `DashboardLayout` (y rutas en `App.tsx` si faltan) para que sean accesibles desde la UI.
- **WhatsApp:** Envío de enlaces/mensajes al confirmar o cancelar cita (según análisis previo).
- **Cupos simultáneos:** Validar `max_simultaneous_bookings` en slots y al crear cita pública.
- **PWA:** manifest.json y service worker (opcional).
- **Vista pública:** Mostrar redes sociales, personalización visual e imágenes del negocio si aún no están enlazadas en la UI.

Para tareas concretas ver [todo.md](todo.md). Para análisis detallado histórico ver [analisis/ANALISIS_COMPLETO.md](analisis/ANALISIS_COMPLETO.md).
