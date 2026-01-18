import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Clock, DollarSign, Users } from "lucide-react";
import ServiceModal from "@/react-app/components/ServiceModal";
import type { Service, Tenant } from "@/shared/types";

export default function DashboardServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchServices();
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

  const fetchServices = async () => {
    if (!selectedTenant) return;

    try {
      const response = await fetch(
        `/api/services?tenant_id=${selectedTenant}`
      );
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const handleCreateService = async (serviceData: Partial<Service>) => {
    const response = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) {
      throw new Error("Error al crear servicio");
    }

    await fetchServices();
  };

  const handleUpdateService = async (serviceData: Partial<Service>) => {
    if (!editingService) return;

    const response = await fetch(`/api/services/${editingService.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
      const errorMessage = errorData.details 
        ? `Error de validación: ${errorData.details.map((d: any) => d.message).join(", ")}`
        : errorData.error || "Error al actualizar servicio";
      throw new Error(errorMessage);
    }

    await fetchServices();
    setEditingService(null);
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm("¿Estás seguro de eliminar este servicio?")) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      alert("Error al eliminar el servicio");
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
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
            Crea un negocio primero para poder agregar servicios
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Servicios</h2>
          <p className="text-slate-600 mt-1">
            Gestiona los servicios de tu negocio
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
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Servicio</span>
          </button>
        </div>
      </div>

      {/* Services grid */}
      {services.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No tienes servicios
          </h3>
          <p className="text-slate-600 mb-6">
            Comienza creando tu primer servicio
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Servicio</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 flex-1 pr-2">
                  {service.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    service.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {service.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>

              {service.description && (
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                {service.price && (
                  <div className="flex items-center space-x-2 text-slate-700">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      ${service.price.toFixed(2)}
                    </span>
                  </div>
                )}

                {service.duration_minutes && (
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      {service.duration_minutes} minutos
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-slate-700">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    {service.max_simultaneous_bookings} cupo
                    {service.max_simultaneous_bookings !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => openEditModal(service)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedTenant && (
        <ServiceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }}
          onSave={editingService ? handleUpdateService : handleCreateService}
          service={editingService}
          tenantId={selectedTenant}
        />
      )}
    </div>
  );
}
