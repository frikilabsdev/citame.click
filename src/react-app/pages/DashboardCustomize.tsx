import { useState, useEffect, useRef } from "react";
import {
  Save,
  RefreshCw,
  Palette,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
  Eye,
} from "lucide-react";
import type { Tenant, VisualCustomization } from "@/shared/types";

// Colores por defecto
const DEFAULT_COLORS: VisualCustomization = {
  id: 0,
  tenant_id: 0,
  primary_color: "#3b82f6",
  secondary_color: "#8b5cf6",
  accent_color: "#ec4899",
  text_color: "#1f2937",
  background_type: "color",
  background_color: "#ffffff",
  background_gradient_start: null,
  background_gradient_end: null,
  background_image_url: null,
  card_background_color: "#ffffff",
  card_border_color: "#e5e7eb",
  service_title_color: "#111827",
  time_text_color: "#6b7280",
  price_color: "#059669",
  created_at: "",
  updated_at: "",
};

// Paletas predefinidas
const COLOR_PALETTES = [
  {
    name: "Azul Clásico",
    description: "Tono profesional y confiable",
    colors: {
      primary_color: "#3b82f6",
      secondary_color: "#60a5fa",
      accent_color: "#2563eb",
      text_color: "#1e293b",
      background_color: "#f8fafc",
      card_background_color: "#ffffff",
      card_border_color: "#e2e8f0",
      service_title_color: "#0f172a",
      time_text_color: "#475569",
      price_color: "#0284c7",
    },
  },
  {
    name: "Verde Naturaleza",
    description: "Frescura y crecimiento",
    colors: {
      primary_color: "#10b981",
      secondary_color: "#34d399",
      accent_color: "#059669",
      text_color: "#064e3b",
      background_color: "#f0fdf4",
      card_background_color: "#ffffff",
      card_border_color: "#d1fae5",
      service_title_color: "#065f46",
      time_text_color: "#047857",
      price_color: "#047857",
    },
  },
  {
    name: "Morado Creativo",
    description: "Innovación y creatividad",
    colors: {
      primary_color: "#8b5cf6",
      secondary_color: "#a78bfa",
      accent_color: "#7c3aed",
      text_color: "#4c1d95",
      background_color: "#faf5ff",
      card_background_color: "#ffffff",
      card_border_color: "#e9d5ff",
      service_title_color: "#581c87",
      time_text_color: "#6d28d9",
      price_color: "#6d28d9",
    },
  },
  {
    name: "Coral Vibrante",
    description: "Energía y vitalidad",
    colors: {
      primary_color: "#f97316",
      secondary_color: "#fb923c",
      accent_color: "#ea580c",
      text_color: "#7c2d12",
      background_color: "#fff7ed",
      card_background_color: "#ffffff",
      card_border_color: "#fed7aa",
      service_title_color: "#9a3412",
      time_text_color: "#c2410c",
      price_color: "#c2410c",
    },
  },
  {
    name: "Rosa Moderno",
    description: "Elegancia y sofisticación",
    colors: {
      primary_color: "#ec4899",
      secondary_color: "#f472b6",
      accent_color: "#db2777",
      text_color: "#831843",
      background_color: "#fdf2f8",
      card_background_color: "#ffffff",
      card_border_color: "#fce7f3",
      service_title_color: "#9f1239",
      time_text_color: "#be185d",
      price_color: "#be185d",
    },
  },
  {
    name: "Oscuro Profesional",
    description: "Elegancia y minimalismo",
    colors: {
      primary_color: "#6366f1",
      secondary_color: "#818cf8",
      accent_color: "#4f46e5",
      text_color: "#e2e8f0",
      background_color: "#0f172a",
      card_background_color: "#1e293b",
      card_border_color: "#334155",
      service_title_color: "#f1f5f9",
      time_text_color: "#cbd5e1",
      price_color: "#818cf8",
    },
  },
  {
    name: "Vintage",
    description: "Tonalidades cálidas y elegantes",
    colors: {
      primary_color: "#8C7864",
      secondary_color: "#B7A996",
      accent_color: "#4E4034",
      text_color: "#4E4034",
      background_color: "#F5F2EC",
      card_background_color: "#ffffff",
      card_border_color: "#D9D2C6",
      service_title_color: "#4E4034",
      time_text_color: "#5A4A3C",
      price_color: "#8C7864",
    },
  },
];

// Función para comprimir imagen usando Canvas API
async function compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener contexto del canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Error al comprimir imagen"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Error al cargar imagen"));
    };
    reader.onerror = () => reject(new Error("Error al leer archivo"));
  });
}

export default function DashboardCustomizePage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [customization, setCustomization] = useState<VisualCustomization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [showPreview, setShowPreview] = useState(false);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<VisualCustomization>>({
    primary_color: DEFAULT_COLORS.primary_color,
    secondary_color: DEFAULT_COLORS.secondary_color,
    accent_color: DEFAULT_COLORS.accent_color,
    text_color: DEFAULT_COLORS.text_color,
    background_type: DEFAULT_COLORS.background_type,
    background_color: DEFAULT_COLORS.background_color,
    background_gradient_start: DEFAULT_COLORS.background_gradient_start,
    background_gradient_end: DEFAULT_COLORS.background_gradient_end,
    background_image_url: DEFAULT_COLORS.background_image_url,
    card_background_color: DEFAULT_COLORS.card_background_color,
    card_border_color: DEFAULT_COLORS.card_border_color,
    service_title_color: DEFAULT_COLORS.service_title_color,
    time_text_color: DEFAULT_COLORS.time_text_color,
    price_color: DEFAULT_COLORS.price_color,
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchCustomization();
    }
  }, [selectedTenant]);

  useEffect(() => {
    if (customization) {
      setFormData({
        primary_color: customization.primary_color || DEFAULT_COLORS.primary_color,
        secondary_color: customization.secondary_color || DEFAULT_COLORS.secondary_color,
        accent_color: customization.accent_color || DEFAULT_COLORS.accent_color,
        text_color: customization.text_color || DEFAULT_COLORS.text_color,
        background_type: customization.background_type || DEFAULT_COLORS.background_type,
        background_color: customization.background_color || DEFAULT_COLORS.background_color,
        background_gradient_start: customization.background_gradient_start || DEFAULT_COLORS.background_gradient_start,
        background_gradient_end: customization.background_gradient_end || DEFAULT_COLORS.background_gradient_end,
        background_image_url: customization.background_image_url || DEFAULT_COLORS.background_image_url,
        card_background_color: customization.card_background_color || DEFAULT_COLORS.card_background_color,
        card_border_color: customization.card_border_color || DEFAULT_COLORS.card_border_color,
        service_title_color: customization.service_title_color || DEFAULT_COLORS.service_title_color,
        time_text_color: customization.time_text_color || DEFAULT_COLORS.time_text_color,
        price_color: customization.price_color || DEFAULT_COLORS.price_color,
      });
    }
  }, [customization]);

  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/tenants");
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
        if (data.length > 0) {
          setSelectedTenant(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error al cargar negocios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomization = async () => {
    if (!selectedTenant) return;

    try {
      const response = await fetch(`/api/customize?tenant_id=${selectedTenant}`);
      if (response.ok) {
        const data = await response.json();
        setCustomization(data);
      } else if (response.status === 404) {
        // No existe personalización, usar valores por defecto
        setCustomization(null);
      }
    } catch (error) {
      console.error("Error al cargar personalización:", error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!selectedTenant) {
      alert("Por favor selecciona un negocio primero");
      return;
    }

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Tipo de archivo no válido. Solo se permiten JPEG, PNG o WebP");
      return;
    }

    // Validar tamaño (máx 10MB antes de comprimir)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. Máximo 10MB");
      return;
    }

    setUploadingBackground(true);

    try {
      // Comprimir imagen
      const compressedBlob = await compressImage(file, 1920, 1080, 0.85);
      const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });

      console.log(`Imagen comprimida: ${file.size} bytes -> ${compressedBlob.size} bytes (${Math.round((1 - compressedBlob.size / file.size) * 100)}% reducción)`);

      // Subir imagen comprimida
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", compressedFile);

      const uploadResponse = await fetch("/api/upload/image", {
        method: "POST",
        body: formDataToUpload,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(errorData.error || "Error al subir la imagen");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url;

      // Actualizar formData
      setFormData((prev) => ({
        ...prev,
        background_type: "image",
        background_image_url: imageUrl,
      }));

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Error al subir imagen:", error);
      alert(error.message || "Error al subir la imagen");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setUploadingBackground(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!selectedTenant) return;

    setFormData((prev) => ({
      ...prev,
      background_type: "color",
      background_image_url: null,
    }));
  };

  const handleSave = async () => {
    if (!selectedTenant) return;

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/customize", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: selectedTenant,
          ...formData,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCustomization(updated);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm("¿Estás seguro de restaurar todos los colores a sus valores originales?")) {
      return;
    }

    setFormData({
      primary_color: DEFAULT_COLORS.primary_color,
      secondary_color: DEFAULT_COLORS.secondary_color,
      accent_color: DEFAULT_COLORS.accent_color,
      text_color: DEFAULT_COLORS.text_color,
      background_type: DEFAULT_COLORS.background_type,
      background_color: DEFAULT_COLORS.background_color,
      background_gradient_start: DEFAULT_COLORS.background_gradient_start,
      background_gradient_end: DEFAULT_COLORS.background_gradient_end,
      background_image_url: DEFAULT_COLORS.background_image_url,
      card_background_color: DEFAULT_COLORS.card_background_color,
      card_border_color: DEFAULT_COLORS.card_border_color,
      service_title_color: DEFAULT_COLORS.service_title_color,
      time_text_color: DEFAULT_COLORS.time_text_color,
      price_color: DEFAULT_COLORS.price_color,
    });
  };

  const handlePaletteSelect = (palette: typeof COLOR_PALETTES[0]) => {
    setFormData((prev) => ({
      ...prev,
      ...palette.colors,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tenants.length === 0) {
  return (
      <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
            No tienes negocios creados
        </h2>
          <p className="text-slate-600 mb-6">
            Crea un negocio primero para poder personalizar la apariencia
          </p>
        </div>
      </div>
    );
  }

  // Generar estilos CSS dinámicos para vista previa
  const previewStyles: React.CSSProperties = {
    background:
      formData.background_type === "gradient"
        ? `linear-gradient(135deg, ${formData.background_gradient_start || "#ffffff"} 0%, ${formData.background_gradient_end || "#ffffff"} 100%)`
        : formData.background_type === "image"
        ? `url(${formData.background_image_url}) center/cover no-repeat`
        : formData.background_color || "#ffffff",
    color: formData.text_color || "#1f2937",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Personalización Visual</h2>
          <p className="text-slate-600 mt-1">
            Personaliza los colores y estilos de tu página de reservas
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tenants.length > 1 && (
            <select
              value={selectedTenant || ""}
              onChange={(e) => setSelectedTenant(parseInt(e.target.value))}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  /{tenant.slug}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restaurar</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save status */}
      {saveStatus !== "idle" && (
        <div
          className={`rounded-xl p-4 flex items-center space-x-3 ${
            saveStatus === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {saveStatus === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span
            className={`font-medium ${
              saveStatus === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {saveStatus === "success"
              ? "Personalización guardada correctamente"
              : "Error al guardar la personalización"}
          </span>
        </div>
      )}

      {/* Paletas predefinidas */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Paletas de Colores Predefinidas
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Selecciona una paleta para aplicarla automáticamente a todos los elementos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLOR_PALETTES.map((palette, index) => (
            <button
              key={index}
              onClick={() => handlePaletteSelect(palette)}
              className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 bg-white transition-all text-left group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex space-x-1">
                  <div
                    className="w-6 h-6 rounded-full border border-slate-200"
                    style={{ backgroundColor: palette.colors.primary_color }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-slate-200"
                    style={{ backgroundColor: palette.colors.secondary_color }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-slate-200"
                    style={{ backgroundColor: palette.colors.accent_color }}
                  />
                </div>
                <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {palette.name}
                </h4>
              </div>
              <p className="text-xs text-slate-600">{palette.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal - Configuración */}
        <div className="lg:col-span-2 space-y-6">
          {/* Background */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <span>Fondo de la Página</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tipo de Fondo
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, background_type: "color" }))}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.background_type === "color"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    Color
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, background_type: "gradient" }))}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.background_type === "gradient"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    Degradado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, background_type: "image" }))}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.background_type === "image"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    Imagen
                  </button>
                </div>
              </div>

              {formData.background_type === "color" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Color de Fondo
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.background_color || "#ffffff"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, background_color: e.target.value }))}
                      className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.background_color || "#ffffff"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, background_color: e.target.value }))}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              )}

              {formData.background_type === "gradient" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Color Inicial del Degradado
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.background_gradient_start || "#ffffff"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, background_gradient_start: e.target.value }))}
                        className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.background_gradient_start || "#ffffff"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, background_gradient_start: e.target.value }))}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Color Final del Degradado
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.background_gradient_end || "#ffffff"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, background_gradient_end: e.target.value }))}
                        className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.background_gradient_end || "#ffffff"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, background_gradient_end: e.target.value }))}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.background_type === "image" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Imagen de Fondo
                  </label>
                  {formData.background_image_url ? (
                    <div className="space-y-4">
                      <div className="relative group">
                        <img
                          src={formData.background_image_url}
                          alt="Fondo"
                          className="w-full h-48 rounded-xl object-cover border border-slate-200 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        ref={backgroundInputRef}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => backgroundInputRef.current?.click()}
                        disabled={uploadingBackground}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {uploadingBackground ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Comprimiendo y subiendo...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Subir Imagen de Fondo</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 mt-2">
                        La imagen se comprimirá automáticamente para optimizar el rendimiento (máx. 10MB)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Colores de Tarjetas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Colores de Tarjetas</span>
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Personaliza el fondo y borde de las tarjetas de servicios
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color de Fondo de Tarjetas
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.card_background_color || "#ffffff"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, card_background_color: e.target.value }))}
                    className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.card_background_color || "#ffffff"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, card_background_color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color de Borde de Tarjetas
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.card_border_color || "#e5e7eb"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, card_border_color: e.target.value }))}
                    className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.card_border_color || "#e5e7eb"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, card_border_color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="#e5e7eb"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colores de Textos */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Palette className="w-5 h-5 text-blue-600" />
              <span>Colores de Textos</span>
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Personaliza los colores de los textos en tu página
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color del Título de Servicios
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.service_title_color || "#111827"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, service_title_color: e.target.value }))}
                    className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.service_title_color || "#111827"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, service_title_color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="#111827"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color del Texto de Tiempo
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.time_text_color || "#6b7280"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, time_text_color: e.target.value }))}
                    className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.time_text_color || "#6b7280"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, time_text_color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="#6b7280"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color del Precio
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.price_color || "#059669"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price_color: e.target.value }))}
                    className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.price_color || "#059669"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price_color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="#059669"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color de Texto General
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.text_color || "#1f2937"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, text_color: e.target.value }))}
                    className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.text_color || "#1f2937"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, text_color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="#1f2937"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colores Generales */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Palette className="w-5 h-5 text-blue-600" />
              <span>Colores Generales</span>
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Colores principales que se aplicarán a botones, enlaces y elementos destacados
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color Primario
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.primary_color || "#3b82f6"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primary_color: e.target.value }))}
                    className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_color || "#3b82f6"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primary_color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color Secundario
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.secondary_color || "#8b5cf6"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color || "#8b5cf6"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, secondary_color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color de Acento
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.accent_color || "#ec4899"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accent_color: e.target.value }))}
                    className="w-16 h-12 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accent_color || "#ec4899"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accent_color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="#ec4899"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna lateral - Vista Previa */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>Vista Previa</span>
              </h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showPreview ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {showPreview && (
              <div className="space-y-4">
                <div
                  className="rounded-xl p-6 border-2 transition-all"
                  style={{
                    ...previewStyles,
                    borderColor: formData.card_border_color || "#e5e7eb",
                    backgroundColor: formData.card_background_color || "#ffffff",
                  }}
                >
                  <h4
                    className="text-xl font-bold mb-2"
                    style={{ color: formData.service_title_color || "#111827" }}
                  >
                    Título del Servicio
                  </h4>
                  <p className="text-sm mb-3" style={{ color: formData.time_text_color || "#6b7280" }}>
                    Duración: 60 minutos
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: formData.price_color || "#059669" }}
                  >
                    $100.00 MXN
                  </p>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>✓ Los colores se aplicarán en toda tu página</p>
                  <p>✓ Incluye calendario, horarios y formularios</p>
                  <p>✓ La vista previa es aproximada</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
