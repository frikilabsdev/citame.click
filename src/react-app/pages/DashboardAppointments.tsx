import { useState, useEffect } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext";
import {
  Calendar,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  CreditCard,
} from "lucide-react";

interface Appointment {
  id: number;
  tenant_id: number;
  service_id: number;
  service_title: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export default function DashboardAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showUncancelModal, setShowUncancelModal] = useState(false);
  const [uncancelAppointmentId, setUncancelAppointmentId] = useState<number | null>(null);
  const [uncancelReason, setUncancelReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(
        appointments.filter((apt) => apt.status === statusFilter)
      );
    }
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [statusFilter, appointments]);

  const fetchAppointments = async () => {
    setLoadError(null);
    try {
      const response = await fetch("/api/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
        setFilteredAppointments(Array.isArray(data) ? data : []);
      } else {
        const body = await response.json().catch(() => ({}));
        const msg = body?.message || body?.error || `Error ${response.status} al cargar citas`;
        setLoadError(msg);
        setAppointments([]);
        setFilteredAppointments([]);
      }
    } catch (err) {
      console.error("Error al cargar citas:", err);
      setLoadError("No se pudieron cargar las citas. Intenta de nuevo.");
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string, reason?: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: reason || null }),
      });

      if (response.ok) {
        const updated = await response.json();
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? updated : apt))
        );

        // Open WhatsApp if URL is provided (for confirmed or cancelled status)
        if (updated.whatsapp_url && (status === "confirmed" || status === "cancelled")) {
          window.open(updated.whatsapp_url, "_blank");
        }

        // Close uncancel modal if opened
        if (status === "pending" && showUncancelModal) {
          setShowUncancelModal(false);
          setUncancelAppointmentId(null);
          setUncancelReason("");
        }
      } else {
        const error = await response.json();
        alert(error.error || "Error al actualizar estado");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("Error al actualizar estado");
    }
  };

  const handleUncancel = () => {
    if (!uncancelAppointmentId || !uncancelReason.trim()) {
      alert("Por favor, ingresa un motivo de descancelación");
      return;
    }
    updateStatus(uncancelAppointmentId, "pending", uncancelReason);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmada";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupByDate = (appointments: Appointment[]) => {
    const groups: { [key: string]: Appointment[] } = {};
    appointments.forEach((apt) => {
      if (!groups[apt.appointment_date]) {
        groups[apt.appointment_date] = [];
      }
      groups[apt.appointment_date].push(apt);
    });
    return groups;
  };

  // Flatten appointments for pagination (all appointments across all dates)
  const allAppointmentsFlat = filteredAppointments.sort((a, b) => {
    const dateCompare = b.appointment_date.localeCompare(a.appointment_date);
    if (dateCompare !== 0) return dateCompare;
    return a.appointment_time.localeCompare(b.appointment_time);
  });

  // Calculate pagination
  const totalPages = Math.ceil(allAppointmentsFlat.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = allAppointmentsFlat.slice(startIndex, endIndex);

  // Group paginated appointments by date
  const paginatedGrouped = groupByDate(paginatedAppointments);
  const sortedDates = Object.keys(paginatedGrouped).sort(
    (a, b) => b.localeCompare(a)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Citas</h1>
          <p className="text-slate-600 mt-1">
            Gestiona las reservas de tus clientes
          </p>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <p className="text-red-800 text-sm">{loadError}</p>
          <button
            type="button"
            onClick={() => { setIsLoading(true); fetchAppointments(); }}
            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 whitespace-nowrap"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">
                {appointments.length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {appointments.filter((a) => a.status === "pending").length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Confirmadas</p>
              <p className="text-2xl font-bold text-blue-600">
                {appointments.filter((a) => a.status === "confirmed").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter((a) => a.status === "completed").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filter and Pagination Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="all">Todas las citas</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-600">Mostrar:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
              <span className="text-sm text-slate-600">por página</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay citas
          </h3>
          <p className="text-slate-600">
            {statusFilter === "all"
              ? "Aún no tienes citas registradas"
              : `No hay citas con estado: ${getStatusLabel(statusFilter)}`}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => {
            const dateAppointments = paginatedGrouped[date];
            return (
              <div key={date}>
                <h2 className="text-lg font-bold text-slate-900 mb-4 capitalize">
                  {formatDate(date)}
                </h2>
                <div className="space-y-3">
                  {dateAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Header */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-lg font-bold text-slate-900">
                                  {appointment.appointment_time}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${getStatusColor(appointment.status)}`}
                                >
                                  {getStatusIcon(appointment.status)}
                                  <span>{getStatusLabel(appointment.status)}</span>
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-slate-700">
                                {appointment.service_title}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                setExpandedId(
                                  expandedId === appointment.id ? null : appointment.id
                                )
                              }
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <ChevronDown
                                className={`w-5 h-5 text-slate-600 transition-transform ${
                                  expandedId === appointment.id ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>{appointment.customer_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <a
                                href={`tel:${appointment.customer_phone}`}
                                className="hover:text-blue-600"
                              >
                                {appointment.customer_phone}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedId === appointment.id && (
                          <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-4">
                            {appointment.customer_email && (
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Mail className="w-4 h-4" />
                                <a
                                  href={`mailto:${appointment.customer_email}`}
                                  className="hover:text-blue-600"
                                >
                                  {appointment.customer_email}
                                </a>
                              </div>
                            )}

                            {appointment.payment_method && (
                              <div className="bg-white rounded-lg p-3 border border-slate-200">
                                <div className="flex items-start space-x-2">
                                  <CreditCard className="w-4 h-4 text-slate-400 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-1">
                                      Método de Pago
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      {appointment.payment_method === "transfer" && "💳 Transferencia Bancaria"}
                                      {appointment.payment_method === "cash" && "💵 Efectivo"}
                                      {appointment.payment_method === "card" && "💳 Tarjeta de Crédito/Débito"}
                                      {!["transfer", "cash", "card"].includes(appointment.payment_method || "") && 
                                        appointment.payment_method}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {appointment.notes && (
                              <div className="bg-white rounded-lg p-3 border border-slate-200">
                                <div className="flex items-start space-x-2">
                                  <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-1">
                                      Notas
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      {appointment.notes}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {appointment.status === "confirmed" && (
                              <div className="bg-white rounded-lg p-3 border border-slate-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <p className="text-xs font-semibold text-slate-700 mb-1">
                                        Archivo de Calendario
                                      </p>
                                      <p className="text-xs text-slate-600">
                                        Descarga el archivo .ics para agregar la cita al calendario del cliente
                                      </p>
                                    </div>
                                  </div>
                                  <a
                                    href={`/api/appointments/${appointment.id}/ics`}
                                    download
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Descargar .ics</span>
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Status Actions */}
                            <div>
                              {appointment.status === "completed" ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <p className="text-sm font-semibold text-green-900">
                                      Cita completada - No se pueden realizar más cambios
                                    </p>
                                  </div>
                                </div>
                              ) : appointment.status === "cancelled" ? (
                                <div>
                                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <XCircle className="w-5 h-5 text-red-600" />
                                      <p className="text-sm font-semibold text-red-900">
                                        Cita cancelada
                                      </p>
                                    </div>
                                    {appointment.notes && (
                                      <p className="text-xs text-red-700 mt-2">
                                        Motivo de cancelación: {appointment.notes}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setUncancelAppointmentId(appointment.id);
                                      setShowUncancelModal(true);
                                    }}
                                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Descancelar cita</span>
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <p className="text-xs font-semibold text-slate-700 mb-2">
                                    Cambiar estado
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {appointment.status !== "confirmed" && (
                                      <button
                                        onClick={() =>
                                          updateStatus(appointment.id, "confirmed")
                                        }
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Confirmar</span>
                                      </button>
                                    )}

                                    {appointment.status === "pending" || appointment.status === "confirmed" ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            updateStatus(appointment.id, "completed")
                                          }
                                          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                          <span>Completar</span>
                                        </button>
                                        <button
                                          onClick={() =>
                                            updateStatus(appointment.id, "cancelled")
                                          }
                                          className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                                        >
                                          <XCircle className="w-4 h-4" />
                                          <span>Cancelar</span>
                                        </button>
                                      </>
                                    ) : null}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredAppointments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              Mostrando {startIndex + 1} - {Math.min(endIndex, allAppointmentsFlat.length)} de {allAppointmentsFlat.length} citas
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-slate-300 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uncancel Modal */}
      {showUncancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Descancelar cita
              </h3>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Para descancelar esta cita, por favor ingresa el motivo de descancelación.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Motivo de descancelación *
              </label>
              <textarea
                value={uncancelReason}
                onChange={(e) => setUncancelReason(e.target.value)}
                placeholder="Ej: Cliente solicitó reagendar, error en la cancelación, etc."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUncancelModal(false);
                  setUncancelAppointmentId(null);
                  setUncancelReason("");
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUncancel}
                disabled={!uncancelReason.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Descancelar cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
