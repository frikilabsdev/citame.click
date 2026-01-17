import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Ban,
} from "lucide-react";
import type { Service, AvailabilitySchedule, Tenant, ScheduleException } from "@/shared/types";

interface ScheduleFormData {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function DashboardSchedulesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [schedules, setSchedules] = useState<AvailabilitySchedule[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingException, setIsSubmittingException] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [showExceptionForm, setShowExceptionForm] = useState(false);

  const [formData, setFormData] = useState<ScheduleFormData>({
    day_of_week: 1,
    start_time: "",
    end_time: "",
  });
  const [allTenantSchedules, setAllTenantSchedules] = useState<AvailabilitySchedule[]>([]);

  const [exceptionFormData, setExceptionFormData] = useState({
    exception_date: "",
    start_time: "",
    end_time: "",
    is_blocked: true,
    reason: "",
    service_id: null as number | null,
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchServices();
    }
  }, [selectedTenant]);

  useEffect(() => {
    if (selectedService) {
      fetchSchedules();
      fetchExceptions();
    }
  }, [selectedService, selectedTenant]);

  useEffect(() => {
    if (selectedTenant && formData.day_of_week !== undefined) {
      fetchAllTenantSchedulesForDay();
    }
  }, [selectedTenant, formData.day_of_week]);

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
        if (data.length > 0) {
          setSelectedService(data[0]);
        } else {
          setSelectedService(null);
        }
      }
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const fetchSchedules = async () => {
    if (!selectedService) return;

    try {
      const response = await fetch(
        `/api/schedules/service/${selectedService.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Error al cargar horarios:", error);
    }
  };

  const fetchExceptions = async () => {
    if (!selectedTenant) return;

    try {
      const url = selectedService
        ? `/api/schedules/exceptions/tenant/${selectedTenant}?service_id=${selectedService.id}`
        : `/api/schedules/exceptions/tenant/${selectedTenant}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setExceptions(data);
      }
    } catch (error) {
      console.error("Error al cargar excepciones:", error);
    }
  };

  const fetchAllTenantSchedulesForDay = async () => {
    if (!selectedTenant || formData.day_of_week === undefined) return;

    try {
      const response = await fetch(
        `/api/schedules/tenant/${selectedTenant}/day/${formData.day_of_week}`
      );
      if (response.ok) {
        const data = await response.json();
        setAllTenantSchedules(data);
      }
    } catch (error) {
      console.error("Error al cargar horarios del tenant:", error);
    }
  };

  // Calculate available time ranges for the selected day
  const getAvailableTimeRanges = (): Array<{ start: string; end: string }> => {
    if (allTenantSchedules.length === 0) {
      // No schedules exist, entire day is available (00:00 - 23:59)
      return [{ start: "00:00", end: "23:59" }];
    }

    // Sort schedules by start_time
    const sorted = [...allTenantSchedules].sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    );

    const available: Array<{ start: string; end: string }> = [];
    let currentStart = "00:00";

    for (const schedule of sorted) {
      if (currentStart < schedule.start_time) {
        available.push({ start: currentStart, end: schedule.start_time });
      }
      // Move currentStart to after this schedule's end_time
      if (schedule.end_time > currentStart) {
        currentStart = schedule.end_time;
      }
    }

    // Add remaining time if any
    if (currentStart < "23:59") {
      available.push({ start: currentStart, end: "23:59" });
    }

    return available;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService.id,
          ...formData,
        }),
      });

      if (response.ok) {
        await fetchSchedules();
        await fetchAllTenantSchedulesForDay();
        setFormData({
          day_of_week: formData.day_of_week,
          start_time: "",
          end_time: "",
        });
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear horario");
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al crear horario:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm("¿Estás seguro de eliminar este horario?")) return;

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchSchedules();
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        alert("Error al eliminar horario");
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al eliminar horario:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const toggleScheduleStatus = async (
    scheduleId: number,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        await fetchSchedules();
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const handleExceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setIsSubmittingException(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/schedules/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: selectedTenant,
          service_id: exceptionFormData.service_id || null,
          exception_date: exceptionFormData.exception_date,
          start_time: exceptionFormData.start_time || null,
          end_time: exceptionFormData.end_time || null,
          is_blocked: exceptionFormData.is_blocked,
          reason: exceptionFormData.reason || null,
        }),
      });

      if (response.ok) {
        await fetchExceptions();
        setExceptionFormData({
          exception_date: "",
          start_time: "",
          end_time: "",
          is_blocked: true,
          reason: "",
          service_id: null,
        });
        setShowExceptionForm(false);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear excepción");
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al crear excepción:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSubmittingException(false);
    }
  };

  const handleDeleteException = async (exceptionId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta excepción?")) return;

    try {
      const response = await fetch(`/api/schedules/exceptions/${exceptionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchExceptions();
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        alert("Error al eliminar excepción");
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al eliminar excepción:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No hay negocios
          </h2>
          <p className="text-slate-600 mb-6">
            Primero necesitas crear un negocio antes de configurar horarios
          </p>
          <a
            href="/dashboard/settings"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Negocio</span>
          </a>
        </div>
      </div>
    );
  }

  if (services.length === 0 && selectedTenant) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No hay servicios
          </h2>
          <p className="text-slate-600 mb-6">
            Primero necesitas crear servicios antes de configurar horarios
          </p>
          <a
            href="/dashboard/services"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Servicio</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Horarios y Disponibilidad
          </h2>
          <p className="text-slate-600 mt-1">
            Configura los días y horarios en que cada servicio está disponible
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Tenant selector */}
          {tenants.length > 1 && (
            <select
              value={selectedTenant || ""}
              onChange={(e) => {
                const tenantId = parseInt(e.target.value);
                setSelectedTenant(tenantId);
                setSelectedService(null);
                setSchedules([]);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all min-w-[200px]"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.slug}
                </option>
              ))}
            </select>
          )}

          {/* Service selector */}
          {services.length > 0 && (
            <select
              value={selectedService?.id || ""}
              onChange={(e) => {
                const service = services.find(
                  (s) => s.id === parseInt(e.target.value)
                );
                setSelectedService(service || null);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all min-w-[200px]"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          )}
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
              ? "Cambios guardados correctamente"
              : "Error al procesar la solicitud"}
          </span>
        </div>
      )}

      {selectedService && (
        <>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add schedule form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Agregar Horario
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Día de la semana
              </label>
              <select
                value={formData.day_of_week}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    day_of_week: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
                {DAYS_OF_WEEK.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Show available time ranges */}
            {allTenantSchedules.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-yellow-900 mb-2">
                  Horarios ya ocupados en este día (todos los servicios):
                </p>
                <div className="flex flex-wrap gap-2">
                  {allTenantSchedules.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                    >
                      {s.start_time} - {s.end_time}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {getAvailableTimeRanges().length === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-red-900">
                  No hay horarios disponibles para este día
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Todos los horarios ya están ocupados
                </p>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-green-900 mb-2">
                    Rangos disponibles:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableTimeRanges().map((range, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                      >
                        {range.start} - {range.end}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Hora de inicio *
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      required
                      min={getAvailableTimeRanges()[0]?.start || "00:00"}
                      max={getAvailableTimeRanges()[getAvailableTimeRanges().length - 1]?.end || "23:59"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Hora de fin *
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      required
                      min={formData.start_time || getAvailableTimeRanges()[0]?.start || "00:00"}
                      max={getAvailableTimeRanges()[getAvailableTimeRanges().length - 1]?.end || "23:59"}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Agregar Horario</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Schedules list */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Horarios Configurados
            </h3>
          </div>

          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                No hay horarios configurados para este servicio
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Agrega el primer horario usando el formulario
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-4 rounded-xl border transition-all ${
                    schedule.is_active
                      ? "border-slate-200 bg-white"
                      : "border-slate-200 bg-slate-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">
                        {DAYS_OF_WEEK[schedule.day_of_week]}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          toggleScheduleStatus(schedule.id, schedule.is_active)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          schedule.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {schedule.is_active ? "Activo" : "Inactivo"}
                      </button>

                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exceptions Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Ban className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900">
                Excepciones y Bloqueos
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Bloquea fechas u horarios específicos (tienen prioridad sobre los horarios regulares)
              </p>
            </div>
          </div>
          {!showExceptionForm && (
            <button
              onClick={() => setShowExceptionForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all flex items-center justify-center space-x-2 w-full sm:w-auto flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Excepción</span>
            </button>
          )}
        </div>

        {showExceptionForm && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">Nueva Excepción</h4>
              <button
                onClick={() => {
                  setShowExceptionForm(false);
                  setExceptionFormData({
                    exception_date: "",
                    start_time: "",
                    end_time: "",
                    is_blocked: true,
                    reason: "",
                    service_id: null,
                  });
                }}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExceptionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={exceptionFormData.exception_date}
                    onChange={(e) =>
                      setExceptionFormData({
                        ...exceptionFormData,
                        exception_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Aplicar a
                  </label>
                  <select
                    value={exceptionFormData.service_id || ""}
                    onChange={(e) =>
                      setExceptionFormData({
                        ...exceptionFormData,
                        service_id: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  >
                    <option value="">Todos los servicios</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Hora de inicio (opcional)
                  </label>
                  <input
                    type="time"
                    value={exceptionFormData.start_time}
                    onChange={(e) =>
                      setExceptionFormData({
                        ...exceptionFormData,
                        start_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                    placeholder="Dejar vacío = todo el día"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Vacío = bloquea todo el día
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Hora de fin (opcional)
                  </label>
                  <input
                    type="time"
                    value={exceptionFormData.end_time}
                    onChange={(e) =>
                      setExceptionFormData({
                        ...exceptionFormData,
                        end_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                    disabled={!exceptionFormData.start_time}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Vacío = solo esa hora
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={exceptionFormData.reason}
                  onChange={(e) =>
                    setExceptionFormData({
                      ...exceptionFormData,
                      reason: e.target.value,
                    })
                  }
                  placeholder="Ej: Día festivo, Mantenimiento, etc."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingException || !exceptionFormData.exception_date}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmittingException ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-5 h-5" />
                    <span>Bloquear Horario</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {exceptions.length === 0 ? (
          <div className="text-center py-12">
            <Ban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No hay excepciones configuradas</p>
            <p className="text-sm text-slate-400 mt-1">
              Agrega excepciones para bloquear fechas u horarios específicos
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {exceptions.map((exception) => {
              const service = services.find((s) => s.id === exception.service_id);
              const date = new Date(exception.exception_date);
              return (
                <div
                  key={exception.id}
                  className="p-4 rounded-xl border border-red-200 bg-red-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 mb-2">
                        {date.toLocaleDateString("es-MX", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 text-sm text-slate-600">
                        {exception.start_time ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {exception.start_time}
                              {exception.end_time ? ` - ${exception.end_time}` : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-red-600">Todo el día bloqueado</span>
                        )}
                        {service && (
                          <div className="text-xs bg-white px-2 py-1 rounded inline-block w-fit">
                            {service.title}
                          </div>
                        )}
                        {!service && (
                          <div className="text-xs bg-white px-2 py-1 rounded inline-block w-fit">
                            Todos los servicios
                          </div>
                        )}
                      </div>
                      {exception.reason && (
                        <div className="text-sm text-slate-500 mt-2">
                          {exception.reason}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteException(exception.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors self-start sm:self-auto flex-shrink-0"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Cómo funciona la disponibilidad
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Puedes configurar múltiples bloques de horario para el mismo
                día
              </li>
              <li>
                • Los clientes solo podrán reservar dentro de estos horarios
              </li>
              <li>
                • Desactiva temporalmente un horario sin eliminarlo si lo
                necesitas
              </li>
              <li>
                • La duración del servicio se usa para calcular los slots
                disponibles
              </li>
              <li>
                • <strong>Las excepciones tienen prioridad:</strong> Si bloqueas una fecha u hora, no se mostrará aunque esté en los horarios regulares
              </li>
            </ul>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
