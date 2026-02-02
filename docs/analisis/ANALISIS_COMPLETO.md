# Análisis Completo del Sistema - Estado Actual vs Requerimientos

## ✅ Lo que ESTÁ implementado

### Infraestructura Base
- ✅ Proyecto PWA con Cloudflare Workers + React + TypeScript
- ✅ Base de datos SQLite (D1) con todas las tablas necesarias
- ✅ Sistema de autenticación con @getmocha/users-service
- ✅ R2 Bucket configurado para almacenamiento de imágenes
- ✅ Routing completo (público y dashboard)
- ✅ Tipos TypeScript definidos

### Backend APIs Implementadas
- ✅ `/api/tenants` - CRUD completo de tenants
- ✅ `/api/services` - CRUD completo de servicios (sin imágenes)
- ✅ `/api/schedules` - CRUD completo de horarios
- ✅ `/api/appointments` - CRUD y cambio de estado (sin WhatsApp)
- ✅ `/api/public/*` - Endpoints públicos para reservas

### Frontend Dashboard Implementado
- ✅ `DashboardServices` - Gestión de servicios (sin carrusel de imágenes)
- ✅ `DashboardSchedules` - Configuración de horarios
- ✅ `DashboardAppointments` - Listado y gestión de citas (sin WhatsApp)
- ✅ `DashboardSettings` - Configuración básica del negocio (sin carga de imágenes)

### Vista Pública
- ✅ `PublicBooking` - Flujo básico de reserva (3 pasos)
- ⚠️ Sin personalización visual
- ⚠️ Sin redes sociales
- ⚠️ Sin imágenes de perfil/cabecera

---

## ❌ Lo que FALTA implementar

### 🔴 CRÍTICO - Funcionalidades Core

#### 1. Integración WhatsApp ⚠️ PRIORITARIO
**Estado:** No implementado
**Ubicación:** `src/worker/api/appointments.ts`
**Requerimientos:**
- Al cambiar estado de cita a "confirmed" o "cancelled", generar mensaje de WhatsApp
- Usar `https://wa.me/{whatsapp}?text={mensaje}` con mensaje prellenado
- Mensajes diferentes según estado:
  - **Confirmada:** "¡Hola {customer_name}! Tu cita para {service} el {date} a las {time} ha sido confirmada."
  - **Cancelada:** "Hola {customer_name}. Lamentamos informarte que tu cita del {date} ha sido cancelada."

**Archivos a modificar:**
- `src/worker/api/appointments.ts` - Agregar lógica de WhatsApp en `PATCH /:id/status`

---

#### 2. Sistema de Múltiples Citas Simultáneas ⚠️ PRIORITARIO
**Estado:** Parcialmente implementado
**Problema:** `max_simultaneous_bookings` está en el modelo pero no se valida en la API pública
**Ubicación:** `src/worker/api/public.ts` - `GET /services/:serviceId/slots`
**Requerimientos:**
- Validar cupos disponibles considerando `max_simultaneous_bookings`
- Contar citas existentes en el mismo horario y comparar con el límite

**Archivos a modificar:**
- `src/worker/api/public.ts` - Lógica de cálculo de slots disponibles

---

#### 3. Gestión de Imágenes de Servicios (Carrusel) ⚠️ PRIORITARIO
**Estado:** Tabla existe, pero sin API ni UI
**Ubicación:** 
- Backend: Nueva API `/api/service-images`
- Frontend: `src/react-app/components/ServiceModal.tsx`
**Requerimientos:**
- Subir múltiples imágenes por servicio a R2
- Orden de visualización (`display_order`)
- Mostrar carrusel en `ServiceModal`
- Mostrar carrusel en vista pública de servicios

**Archivos a crear/modificar:**
- `src/worker/api/service-images.ts` (nuevo)
- `src/react-app/components/ServiceModal.tsx` - Agregar gestión de imágenes
- `src/react-app/pages/PublicBooking.tsx` - Mostrar imágenes en lista de servicios

---

### 🟡 IMPORTANTE - Módulos del Dashboard

#### 4. Dashboard de Redes Sociales
**Estado:** Página vacía con placeholder
**Ubicación:** `src/react-app/pages/DashboardSocial.tsx`
**Requerimientos:**
- Tabla con redes sociales (YouTube, Facebook, Instagram, Twitter/X, TikTok, LinkedIn, OnlyFans, Twitch, GitHub)
- Campos: Icono, URL, Switch activar/desactivar
- Botones guardar y eliminar

**Archivos a crear/modificar:**
- `src/worker/api/social.ts` (nuevo) - CRUD completo
- `src/react-app/pages/DashboardSocial.tsx` - Implementar UI completa

---

#### 5. Dashboard de Métodos de Pago
**Estado:** Página vacía con placeholder
**Ubicación:** `src/react-app/pages/DashboardPayments.tsx`
**Requerimientos:**
- Gestión de métodos: Efectivo, Transferencia, Tarjeta
- Para transferencia: Número de cuenta, CLABE, Tarjeta, Nombre receptor
- Switch para activar/desactivar métodos

**Archivos a crear/modificar:**
- `src/worker/api/payments.ts` (nuevo) - CRUD completo
- `src/react-app/pages/DashboardPayments.tsx` - Implementar UI completa

---

#### 6. Dashboard de Personalización Visual
**Estado:** Página vacía con placeholder
**Ubicación:** `src/react-app/pages/DashboardCustomize.tsx`
**Requerimientos:**
- Selector de colores (primary, secondary, accent, text)
- Selector de tipo de fondo: Color sólido, Gradiente, Imagen
- Para imagen: Upload a R2 con optimización
- Guardar configuración por tenant

**Archivos a crear/modificar:**
- `src/worker/api/customize.ts` (nuevo) - GET/PUT
- `src/react-app/pages/DashboardCustomize.tsx` - Implementar UI completa

---

#### 7. Carga de Imágenes en Configuración del Negocio
**Estado:** Campos `profile_image_url` y `header_image_url` existen pero no hay UI de upload
**Ubicación:** `src/react-app/pages/DashboardSettings.tsx`
**Requerimientos:**
- Upload de imagen de perfil a R2
- Upload de imagen de cabecera a R2
- Recorte de imagen (cropping)
- Optimización de peso
- Preview antes de guardar

**Archivos a crear/modificar:**
- `src/worker/api/upload.ts` (nuevo) - Endpoint para subir imágenes a R2
- `src/react-app/pages/DashboardSettings.tsx` - Agregar componentes de upload

---

### 🟢 MEJORAS - Vista Pública

#### 8. Integración de Redes Sociales en Vista Pública
**Estado:** No implementado
**Ubicación:** `src/react-app/pages/PublicBooking.tsx`
**Requerimientos:**
- Mostrar solo redes sociales activas
- Iconos de cada plataforma
- Layout tipo Link-in-bio / Linktree
- Obtener datos desde `/api/public/tenants/:slug/social`

**Archivos a modificar:**
- `src/worker/api/public.ts` - Agregar endpoint de redes sociales
- `src/react-app/pages/PublicBooking.tsx` - Agregar sección de redes sociales

---

#### 9. Aplicación de Personalización Visual en Vista Pública
**Estado:** No implementado
**Ubicación:** `src/react-app/pages/PublicBooking.tsx`
**Requerimientos:**
- Cargar `visual_customizations` del tenant
- Aplicar estilos dinámicos (colores, fondo)
- Usar CSS variables o inline styles

**Archivos a modificar:**
- `src/worker/api/public.ts` - Incluir `visual_customizations` en respuesta
- `src/react-app/pages/PublicBooking.tsx` - Aplicar estilos dinámicos

---

#### 10. Mostrar Imágenes del Negocio en Vista Pública
**Estado:** URLs en BD pero no se muestran
**Ubicación:** `src/react-app/pages/PublicBooking.tsx`
**Requerimientos:**
- Mostrar `profile_image_url` como avatar del negocio
- Mostrar `header_image_url` como cabecera/banner

**Archivos a modificar:**
- `src/react-app/pages/PublicBooking.tsx` - Agregar imágenes del negocio

---

### 🔵 PWA - Progressive Web App

#### 11. Manifest.json
**Estado:** No existe
**Requerimientos:**
- `manifest.json` con iconos, nombre, tema
- Configuración para instalación PWA

**Archivos a crear:**
- `public/manifest.json` (nuevo)
- `index.html` - Agregar `<link rel="manifest">`

---

#### 12. Service Worker
**Estado:** No existe
**Requerimientos:**
- Service worker para cacheo offline
- Estrategia de cache (Network First o Cache First)
- Actualización automática

**Archivos a crear:**
- `public/sw.js` o `src/service-worker.ts` (nuevo)
- Registro en `src/react-app/main.tsx`

---

### 🟣 OTRAS MEJORAS MENORES

#### 13. Validación de Cupos en Creación de Cita (API Pública)
**Estado:** Solo valida 1 cita, no múltiples
**Ubicación:** `src/worker/api/public.ts` - `POST /appointments`
**Requerimientos:**
- Contar citas existentes en el mismo horario
- Validar que no exceda `max_simultaneous_bookings`

**Archivos a modificar:**
- `src/worker/api/public.ts` - Validación en creación de cita

---

#### 14. Notificación WhatsApp al Cliente al Crear Cita
**Estado:** No implementado
**Requerimientos:**
- Al crear cita desde vista pública, enviar WhatsApp al cliente
- Mensaje de confirmación de solicitud

**Archivos a modificar:**
- `src/worker/api/public.ts` - `POST /appointments`

---

## 📋 Resumen de Prioridades

### Prioridad ALTA (Bloquea funcionalidad core)
1. ✅ Sistema de múltiples citas simultáneas
2. ✅ Integración WhatsApp en cambio de estado
3. ✅ Gestión de imágenes de servicios

### Prioridad MEDIA (Funcionalidades importantes)
4. Dashboard de Redes Sociales
5. Dashboard de Métodos de Pago  
6. Dashboard de Personalización Visual
7. Carga de imágenes en configuración

### Prioridad BAJA (Mejoras UX)
8. Integración redes sociales en vista pública
9. Aplicación personalización visual en vista pública
10. Mostrar imágenes del negocio en vista pública
11. PWA manifest.json
12. PWA Service Worker

---

## 📁 Archivos Nuevos a Crear

```
src/worker/api/
  - service-images.ts          # CRUD de imágenes de servicios
  - social.ts                   # CRUD de redes sociales
  - payments.ts                 # CRUD de métodos de pago
  - customize.ts                # GET/PUT personalización visual
  - upload.ts                   # Upload de imágenes a R2

public/
  - manifest.json               # PWA manifest
  - sw.js                       # Service worker (opcional, puede ser TS)

src/react-app/components/
  - ImageUploader.tsx           # Componente reutilizable para upload
  - ImageCropper.tsx            # Componente para recorte de imágenes (opcional)
```

---

## 🔍 Notas Técnicas Importantes

1. **R2 Bucket:** Ya está configurado en `wrangler.json` como `R2_BUCKET`
2. **WhatsApp:** Usar `https://wa.me/{numero}?text={mensaje}` (no requiere API externa)
3. **Personalización Visual:** Aplicar con CSS variables o inline styles en tiempo de ejecución
4. **Imágenes:** Necesitarás una librería de cropping (ej: `react-easy-crop`) o implementar propia
5. **Iconos Redes Sociales:** Usar `lucide-react` o similar para iconos
6. **PWA:** Manifest y Service Worker son necesarios para instalación en móviles

---

## ✅ Checklist Final

- [ ] WhatsApp integrado en cambio de estado
- [ ] Validación de cupos simultáneos
- [ ] API y UI de imágenes de servicios
- [ ] API y UI de redes sociales
- [ ] API y UI de métodos de pago
- [ ] API y UI de personalización visual
- [ ] Upload de imágenes de perfil/cabecera
- [ ] Redes sociales en vista pública
- [ ] Personalización visual en vista pública
- [ ] Imágenes del negocio en vista pública
- [ ] Manifest.json
- [ ] Service Worker
- [ ] Validación cupos en creación pública
- [ ] WhatsApp al cliente al crear cita
