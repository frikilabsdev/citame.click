import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Globe,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { Tenant, SocialNetwork } from "@/shared/types";
import {
  YoutubeIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  TikTokIcon,
  LinkedInIcon,
  TwitchIcon,
  GithubIcon,
  OnlyFansIcon,
} from "@/react-app/components/SocialIcons";

interface PlatformIcon {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PLATFORMS: PlatformIcon[] = [
  { value: "youtube", label: "YouTube", icon: YoutubeIcon },
  { value: "facebook", label: "Facebook", icon: FacebookIcon },
  { value: "instagram", label: "Instagram", icon: InstagramIcon },
  { value: "twitter", label: "Twitter/X", icon: TwitterIcon },
  { value: "tiktok", label: "TikTok", icon: TikTokIcon },
  { value: "linkedin", label: "LinkedIn", icon: LinkedInIcon },
  { value: "onlyfans", label: "OnlyFans", icon: OnlyFansIcon },
  { value: "twitch", label: "Twitch", icon: TwitchIcon },
  { value: "github", label: "GitHub", icon: GithubIcon },
];

export default function DashboardSocialPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [formData, setFormData] = useState<{ [key: number]: { url: string; is_active: boolean } }>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchSocialNetworks();
    }
  }, [selectedTenant]);

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

  const fetchSocialNetworks = async () => {
    if (!selectedTenant) return;

    try {
      const response = await fetch(`/api/social?tenant_id=${selectedTenant}`);
      if (response.ok) {
        const data = await response.json();
        setSocialNetworks(data);
        
        // Initialize form data
        const initialFormData: { [key: number]: { url: string; is_active: boolean } } = {};
        data.forEach((network: SocialNetwork) => {
          initialFormData[network.id] = {
            url: network.url,
            is_active: network.is_active,
          };
        });
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error("Error al cargar redes sociales:", error);
    }
  };

  const handleCreate = async () => {
    if (!selectedTenant || !newPlatform || !newUrl) {
      alert("Por favor selecciona una red social e ingresa una URL");
      return;
    }

    try {
      const response = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: selectedTenant,
          platform: newPlatform,
          url: newUrl,
          is_active: true,
        }),
      });

      if (response.ok) {
        setNewPlatform("");
        setNewUrl("");
        await fetchSocialNetworks();
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear red social");
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al crear red social:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData[id]) return;

    try {
      const response = await fetch(`/api/social/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData[id]),
      });

      if (response.ok) {
        setEditingId(null);
        await fetchSocialNetworks();
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al actualizar red social:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta red social?")) {
      return;
    }

    try {
      const response = await fetch(`/api/social/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchSocialNetworks();
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al eliminar red social:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const getPlatformInfo = (platform: string) => {
    return PLATFORMS.find((p) => p.value === platform) || {
      value: platform,
      label: platform,
      icon: Globe,
    };
  };

  const availablePlatforms = PLATFORMS.filter(
    (p) => !socialNetworks.some((sn) => sn.platform === p.value)
  );

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
            Crea un negocio primero para poder agregar redes sociales
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Redes Sociales</h2>
          <p className="text-slate-600 mt-1">
            Gestiona las redes sociales de tu negocio
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
        </div>
      </div>

      {/* Save status */}
      {saveStatus !== "idle" && (
        <div
          className={`rounded-xl p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3 ${
            saveStatus === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {saveStatus === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
          )}
          <span
            className={`text-sm sm:text-base font-medium ${
              saveStatus === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {saveStatus === "success"
              ? "Cambios guardados correctamente"
              : "Error al guardar los cambios"}
          </span>
        </div>
      )}

      {/* Add new platform */}
      {availablePlatforms.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-4 sm:p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Agregar Red Social
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Selecciona una red social
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                {availablePlatforms.map((platform) => {
                  const IconComponent = platform.icon;
                  const isSelected = newPlatform === platform.value;
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => setNewPlatform(platform.value)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-1 sm:space-y-2 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
                      <span className="text-xs font-medium text-slate-700 text-center leading-tight">{platform.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {newPlatform && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  URL de la red social
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 w-full px-4 py-3 sm:py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-base sm:text-sm"
                  />
            <button
              onClick={handleCreate}
                    disabled={!newUrl}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 sm:py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar</span>
            </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social networks list */}
      {socialNetworks.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
            No hay redes sociales configuradas
          </h3>
          <p className="text-sm sm:text-base text-slate-600">
            Comienza agregando tus redes sociales para que tus clientes puedan
            encontrarte
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Plataforma
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    URL
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {socialNetworks.map((network) => {
                  const platformInfo = getPlatformInfo(network.platform);
                  const isEditing = editingId === network.id;

                  return (
                    <tr key={network.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                            {(() => {
                              const IconComponent = platformInfo.icon;
                              return <IconComponent className="w-5 h-5 text-slate-700" />;
                            })()}
                          <span className="font-medium text-slate-900">
                            {platformInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="url"
                            value={formData[network.id]?.url || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [network.id]: {
                                  ...formData[network.id],
                                  url: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                            placeholder="https://..."
                          />
                        ) : (
                          <a
                            href={network.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm truncate max-w-md block"
                          >
                            {network.url || "Sin URL"}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData[network.id]?.is_active || false}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [network.id]: {
                                    ...formData[network.id],
                                    is_active: e.target.checked,
                                  },
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              network.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {network.is_active ? "Activa" : "Inactiva"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdate(network.id)}
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                title="Guardar"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  fetchSocialNetworks();
                                }}
                                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingId(network.id)}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(network.id)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {socialNetworks.map((network) => {
              const platformInfo = getPlatformInfo(network.platform);
              const isEditing = editingId === network.id;
              const IconComponent = platformInfo.icon;

              return (
                <div
                  key={network.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <IconComponent className="w-5 h-5 text-slate-700 flex-shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">
                        {platformInfo.label}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        network.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {network.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </div>

                  <div className="mb-3">
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData[network.id]?.url || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [network.id]: {
                              ...formData[network.id],
                              url: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-base"
                        placeholder="https://..."
                      />
                    ) : (
                      <a
                        href={network.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all block"
                      >
                        {network.url || "Sin URL"}
                      </a>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mb-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[network.id]?.is_active || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [network.id]: {
                                ...formData[network.id],
                                is_active: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-slate-700">
                          Activar/Desactivar
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdate(network.id)}
                          className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Guardar</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            fetchSocialNetworks();
                          }}
                          className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancelar</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(network.id)}
                          className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(network.id)}
                          className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
