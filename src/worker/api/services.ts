import { Hono } from "hono";
import { authMiddleware } from "@/worker/api/auth";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const servicesApi = new Hono<{ Bindings: Env; Variables: HonoContextVariables }>();

// Validation schemas
const createServiceSchema = z.object({
  tenant_id: z.number(),
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  price: z.number().nullable().optional(),
  duration_minutes: z.number().nullable().optional(),
  max_simultaneous_bookings: z.number().min(1).default(1),
  is_active: z.boolean().default(true),
  main_image_url: z.string().nullable().optional(),
});

const updateServiceSchema = z.object({
  title: z.string().min(1, "El título es requerido").optional(),
  description: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  duration_minutes: z.number().nullable().optional(),
  max_simultaneous_bookings: z.number().min(1).optional(),
  is_active: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === "boolean") return val;
      if (typeof val === "number") return val === 1;
      if (typeof val === "string") return val === "true" || val === "1";
      return Boolean(val);
    },
    z.boolean().optional()
  ),
  main_image_url: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().nullable().optional()
  ),
});

// Helper to verify tenant ownership
async function verifyTenantOwnership(
  db: D1Database,
  userId: string,
  tenantId: number
): Promise<boolean> {
  const tenant = await db
    .prepare("SELECT id FROM tenants WHERE id = ? AND owner_user_id = ?")
    .bind(tenantId, userId)
    .first();
  return !!tenant;
}

// GET /api/services?tenant_id=X - List all services for a tenant
servicesApi.get("/", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "No autenticado" }, 401);
  }

  const tenantId = c.req.query("tenant_id");

  if (!tenantId) {
    return c.json({ error: "tenant_id es requerido" }, 400);
  }

  const tenantIdNum = parseInt(tenantId);
  const hasAccess = await verifyTenantOwnership(c.env.DB, user.id, tenantIdNum);

  if (!hasAccess) {
    return c.json({ error: "No tienes acceso a este negocio" }, 403);
  }

  const { results: services } = await c.env.DB.prepare(
    "SELECT * FROM services WHERE tenant_id = ? ORDER BY created_at DESC"
  )
    .bind(tenantIdNum)
    .all<Record<string, unknown>>();

  if (!services?.length) {
    return c.json([]);
  }

  let variantsByServiceId: Record<number, Record<string, unknown>[]> = {};
  try {
    const ids = services.map((s) => s.id as number);
    const placeholders = ids.map(() => "?").join(",");
    const { results: variants } = await c.env.DB.prepare(
      `SELECT * FROM service_variants WHERE service_id IN (${placeholders}) ORDER BY service_id, display_order ASC, id ASC`
    )
      .bind(...ids)
      .all<Record<string, unknown>>();
    for (const v of variants || []) {
      const sid = v.service_id as number;
      if (!variantsByServiceId[sid]) variantsByServiceId[sid] = [];
      variantsByServiceId[sid].push(v);
    }
  } catch {
    // Tabla service_variants puede no existir si no se aplicó la migración 6
  }

  const servicesWithVariants = services.map((s) => ({
    ...s,
    variants: variantsByServiceId[s.id as number] || [],
  }));

  return c.json(servicesWithVariants);
});

// GET /api/services/:id - Get a specific service
servicesApi.get("/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "No autenticado" }, 401);
  }

  const serviceId = parseInt(c.req.param("id"));

  const service = await c.env.DB.prepare(
    "SELECT s.*, t.owner_user_id FROM services s JOIN tenants t ON s.tenant_id = t.id WHERE s.id = ?"
  )
    .bind(serviceId)
    .first();

  if (!service) {
    return c.json({ error: "Servicio no encontrado" }, 404);
  }

  if (service.owner_user_id !== user.id) {
    return c.json({ error: "No tienes acceso a este servicio" }, 403);
  }

  let variants: Record<string, unknown>[] | undefined;
  try {
    const r = await c.env.DB.prepare(
      "SELECT * FROM service_variants WHERE service_id = ? ORDER BY display_order ASC, id ASC"
    )
      .bind(serviceId)
      .all<Record<string, unknown>>();
    variants = r.results;
  } catch {
    variants = [];
  }

  return c.json({ ...service, variants: variants || [] });
});

// GET /api/services/:id/variants - List variants for a service
servicesApi.get("/:id/variants", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No autenticado" }, 401);

  const serviceId = parseInt(c.req.param("id"));
  const service = await c.env.DB.prepare(
    "SELECT s.id, s.tenant_id, t.owner_user_id FROM services s JOIN tenants t ON s.tenant_id = t.id WHERE s.id = ?"
  )
    .bind(serviceId)
    .first<{ tenant_id: number; owner_user_id: string }>();

  if (!service || service.owner_user_id !== user.id) {
    return c.json({ error: "Servicio no encontrado" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM service_variants WHERE service_id = ? ORDER BY display_order ASC, id ASC"
  )
    .bind(serviceId)
    .all();

  return c.json(results || []);
});

const createVariantSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().min(0),
  duration_minutes: z.number().nullable().optional(),
  display_order: z.number().optional(),
});

const updateVariantSchema = createVariantSchema.partial();

// POST /api/services/:id/variants - Create variant
servicesApi.post("/:id/variants", authMiddleware, zValidator("json", createVariantSchema), async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No autenticado" }, 401);

  const serviceId = parseInt(c.req.param("id"));
  const service = await c.env.DB.prepare(
    "SELECT id, tenant_id, t.owner_user_id FROM services s JOIN tenants t ON s.tenant_id = t.id WHERE s.id = ?"
  )
    .bind(serviceId)
    .first<{ owner_user_id: string }>();

  if (!service || service.owner_user_id !== user.id) {
    return c.json({ error: "Servicio no encontrado" }, 404);
  }

  const body = c.req.valid("json");
  const result = await c.env.DB.prepare(
    `INSERT INTO service_variants (service_id, name, price, duration_minutes, display_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  )
    .bind(
      serviceId,
      body.name,
      body.price,
      body.duration_minutes ?? null,
      body.display_order ?? 0
    )
    .run();

  const variant = await c.env.DB.prepare("SELECT * FROM service_variants WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first();

  return c.json(variant, 201);
});

// PUT /api/services/:id/variants/:variantId - Update variant
servicesApi.put("/:id/variants/:variantId", authMiddleware, zValidator("json", updateVariantSchema), async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No autenticado" }, 401);

  const serviceId = parseInt(c.req.param("id"));
  const variantId = parseInt(c.req.param("variantId"));
  const service = await c.env.DB.prepare(
    "SELECT s.id, t.owner_user_id FROM services s JOIN tenants t ON s.tenant_id = t.id WHERE s.id = ?"
  )
    .bind(serviceId)
    .first<{ owner_user_id: string }>();

  if (!service || service.owner_user_id !== user.id) {
    return c.json({ error: "Servicio no encontrado" }, 404);
  }

  const variant = await c.env.DB.prepare(
    "SELECT id FROM service_variants WHERE id = ? AND service_id = ?"
  )
    .bind(variantId, serviceId)
    .first();

  if (!variant) {
    return c.json({ error: "Variante no encontrada" }, 404);
  }

  const body = c.req.valid("json");
  const updates: string[] = [];
  const values: unknown[] = [];
  if (body.name !== undefined) {
    updates.push("name = ?");
    values.push(body.name);
  }
  if (body.price !== undefined) {
    updates.push("price = ?");
    values.push(body.price);
  }
  if (body.duration_minutes !== undefined) {
    updates.push("duration_minutes = ?");
    values.push(body.duration_minutes);
  }
  if (body.display_order !== undefined) {
    updates.push("display_order = ?");
    values.push(body.display_order);
  }
  if (updates.length === 0) {
    const current = await c.env.DB.prepare("SELECT * FROM service_variants WHERE id = ?").bind(variantId).first();
    return c.json(current);
  }
  updates.push("updated_at = datetime('now')");
  values.push(variantId);
  await c.env.DB.prepare(
    `UPDATE service_variants SET ${updates.join(", ")} WHERE id = ?`
  )
    .bind(...values)
    .run();

  const updated = await c.env.DB.prepare("SELECT * FROM service_variants WHERE id = ?").bind(variantId).first();
  return c.json(updated);
});

// DELETE /api/services/:id/variants/:variantId
servicesApi.delete("/:id/variants/:variantId", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "No autenticado" }, 401);

  const serviceId = parseInt(c.req.param("id"));
  const variantId = parseInt(c.req.param("variantId"));
  const service = await c.env.DB.prepare(
    "SELECT s.id, t.owner_user_id FROM services s JOIN tenants t ON s.tenant_id = t.id WHERE s.id = ?"
  )
    .bind(serviceId)
    .first<{ owner_user_id: string }>();

  if (!service || service.owner_user_id !== user.id) {
    return c.json({ error: "Servicio no encontrado" }, 404);
  }

  const variant = await c.env.DB.prepare(
    "SELECT id FROM service_variants WHERE id = ? AND service_id = ?"
  )
    .bind(variantId, serviceId)
    .first();

  if (!variant) {
    return c.json({ error: "Variante no encontrada" }, 404);
  }

  await c.env.DB.prepare("DELETE FROM service_variants WHERE id = ?").bind(variantId).run();
  return c.json({ message: "Variante eliminada" });
});

// POST /api/services - Create a new service
servicesApi.post(
  "/",
  authMiddleware,
  zValidator("json", createServiceSchema),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "No autenticado" }, 401);
    }

    const data = c.req.valid("json");

    const hasAccess = await verifyTenantOwnership(
      c.env.DB,
      user.id,
      data.tenant_id
    );

    if (!hasAccess) {
      return c.json({ error: "No tienes acceso a este negocio" }, 403);
    }

    const result = await c.env.DB.prepare(
      `INSERT INTO services (
        tenant_id, title, description, price, duration_minutes, 
        max_simultaneous_bookings, is_active, main_image_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    )
      .bind(
        data.tenant_id,
        data.title,
        data.description || null,
        data.price ?? null,
        data.duration_minutes ?? null,
        data.max_simultaneous_bookings,
        data.is_active ? 1 : 0,
        data.main_image_url || null
      )
      .run();

    const service = await c.env.DB.prepare(
      "SELECT * FROM services WHERE id = ?"
    )
      .bind(result.meta.last_row_id)
      .first();

    return c.json(service, 201);
  }
);

// PUT /api/services/:id - Update a service
servicesApi.put(
  "/:id",
  authMiddleware,
  zValidator("json", updateServiceSchema, (result, c) => {
    if (!result.success) {
      const errorDetails = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return c.json(
        {
          error: "Error de validación",
          details: errorDetails,
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "No autenticado" }, 401);
      }

      const serviceId = parseInt(c.req.param("id"));
      if (isNaN(serviceId)) {
        return c.json({ error: "ID de servicio inválido" }, 400);
      }
      
      const data = c.req.valid("json");

    // Check ownership
    const service = await c.env.DB.prepare(
      "SELECT s.tenant_id, t.owner_user_id FROM services s JOIN tenants t ON s.tenant_id = t.id WHERE s.id = ?"
    )
      .bind(serviceId)
      .first();

    if (!service) {
      return c.json({ error: "Servicio no encontrado" }, 404);
    }

    if (service.owner_user_id !== user.id) {
      return c.json({ error: "No tienes acceso a este servicio" }, 403);
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.price !== undefined) {
      updates.push("price = ?");
      values.push(data.price);
    }
    if (data.duration_minutes !== undefined) {
      updates.push("duration_minutes = ?");
      values.push(data.duration_minutes);
    }
    if (data.max_simultaneous_bookings !== undefined) {
      updates.push("max_simultaneous_bookings = ?");
      values.push(data.max_simultaneous_bookings);
    }
    if (data.is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(data.is_active ? 1 : 0);
    }
    if (data.main_image_url !== undefined) {
      updates.push("main_image_url = ?");
      // Handle empty string, null, or valid URL
      values.push(data.main_image_url === "" || !data.main_image_url ? null : data.main_image_url);
    }

    updates.push("updated_at = datetime('now')");
    values.push(serviceId);

    await c.env.DB.prepare(
      `UPDATE services SET ${updates.join(", ")} WHERE id = ?`
    )
      .bind(...values)
      .run();

      const updated = await c.env.DB.prepare(
        "SELECT * FROM services WHERE id = ?"
      )
        .bind(serviceId)
        .first();

      return c.json(updated);
    } catch (error: any) {
      console.error("Error actualizando servicio:", error);
      return c.json(
        {
          error: "Error al actualizar servicio",
          message: error.message || "Error desconocido",
        },
        500
      );
    }
  }
);

// DELETE /api/services/:id - Delete a service
servicesApi.delete("/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "No autenticado" }, 401);
  }

  const serviceId = parseInt(c.req.param("id"));

  // Check ownership
  const service = await c.env.DB.prepare(
    "SELECT s.tenant_id, t.owner_user_id FROM services s JOIN tenants t ON s.tenant_id = t.id WHERE s.id = ?"
  )
    .bind(serviceId)
    .first();

  if (!service) {
    return c.json({ error: "Servicio no encontrado" }, 404);
  }

  if (service.owner_user_id !== user.id) {
    return c.json({ error: "No tienes acceso a este servicio" }, 403);
  }

  // Delete related data first (variants are CASCADE, but explicit for clarity)
  await c.env.DB.prepare("DELETE FROM service_variants WHERE service_id = ?")
    .bind(serviceId)
    .run();
  await c.env.DB.prepare(
    "DELETE FROM availability_schedules WHERE service_id = ?"
  )
    .bind(serviceId)
    .run();
  await c.env.DB.prepare("DELETE FROM service_images WHERE service_id = ?")
    .bind(serviceId)
    .run();

  // Delete the service
  await c.env.DB.prepare("DELETE FROM services WHERE id = ?")
    .bind(serviceId)
    .run();

  return c.json({ message: "Servicio eliminado" });
});

export default servicesApi;
