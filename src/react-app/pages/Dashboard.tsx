import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Calendar, Settings, TrendingUp, Share2, Briefcase } from "lucide-react";
import type { Tenant } from "@/shared/types";

export default function DashboardPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [servicesCount, setServicesCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (tenants.length > 0) {
      fetchServicesCount(tenants[0].id);
    } else {
      setServicesCount(null);
    }
  }, [tenants]);

  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/tenants");
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error("Error al cargar negocios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServicesCount = async (tenantId: number) => {
    try {
      const response = await fetch(`/api/services?tenant_id=${tenantId}`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setServicesCount(Array.isArray(data) ? data.length : 0);
      } else {
        setServicesCount(0);
      }
    } catch {
      setServicesCount(0);
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Bienvenido a ReservaApp
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
            Crea tu primer negocio para comenzar a gestionar citas y servicios
          </p>
          <Link
            to="/dashboard/settings"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Crear mi negocio</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Mis Negocios</h2>
          <p className="text-slate-600 mt-1">
            Gestiona tus negocios y reservas
          </p>
        </div>
        <Link
          to="/dashboard/settings"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Negocio</span>
        </Link>
      </div>

      {/* Guía rápida: primera vez sin servicios */}
      {tenants.length > 0 && servicesCount === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Para recibir reservas
          </h3>
          <p className="text-sm text-amber-800 mb-4">
            Sigue estos pasos para que tus clientes puedan agendar citas:
          </p>
          <ol className="space-y-2 text-sm text-amber-900">
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-200 font-semibold">1</span>
              <Link to="/dashboard/services" className="underline font-medium hover:text-amber-700">
                Añade servicios
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-200 font-semibold">2</span>
              <Link to="/dashboard/schedules" className="underline font-medium hover:text-amber-700">
                Configura horarios
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-200 font-semibold">3</span>
              <span className="flex items-center gap-1">
                Comparte tu enlace
                <Share2 className="w-4 h-4" />
              </span>
              <span className="text-amber-700">
                (citame.click/tu-slug)
              </span>
            </li>
          </ol>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Negocios Activos
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {tenants.filter((t) => t.is_active).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Citas Hoy
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Negocios
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {tenants.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tenants list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {tenant.slug[0].toUpperCase()}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tenant.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {tenant.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              /{tenant.slug}
            </h3>

            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-200">
              <Link
                to={`/dashboard/settings`}
                className="flex-1 text-center px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
              >
                Configurar
              </Link>
              <Link
                to={`/${tenant.slug}`}
                target="_blank"
                className="flex-1 text-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
              >
                Ver página
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
