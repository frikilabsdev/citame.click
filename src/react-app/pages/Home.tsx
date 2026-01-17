import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/react-app/contexts/AuthContext";
import { Calendar, Sparkles, Clock, Shield } from "lucide-react";

export default function HomePage() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isPending) {
      navigate("/dashboard");
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-700 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-indigo-200/50">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">
                Sistema de Reservas Profesional
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Gestiona tus citas
              </span>
              <br />
              <span className="text-slate-900">de forma inteligente</span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-slate-600 leading-relaxed">
              La plataforma completa para administrar tu negocio de servicios. 
              Crea tu página de reservas personalizada en minutos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => redirectToLogin()}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-105"
              >
                Comenzar Gratis
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200"
              >
                Ver Características
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-xl text-slate-600">
            Herramientas profesionales para hacer crecer tu negocio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-6">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Gestión de Citas
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Sistema completo de reservas con calendario intuitivo y notificaciones automáticas por WhatsApp.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg mb-6">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Personalización Total
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Diseña tu página con colores, imágenes y estilos que reflejen la identidad de tu marca.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg mb-6">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Horarios Flexibles
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Configura bloques de tiempo personalizados para cada servicio y gestiona tu disponibilidad fácilmente.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg mb-6">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Sin Registro para Clientes
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Tus clientes pueden reservar sin crear cuenta. Solo necesitan su nombre y teléfono.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg mb-6">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              URL Personalizada
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Comparte tu página única: tuapp.com/tunegocio. Fácil de recordar y profesional.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg mb-6">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Mobile-First
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Diseño optimizado para dispositivos móviles. Tus clientes pueden reservar desde cualquier lugar.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Crea tu cuenta gratis y comienza a gestionar tus citas en minutos
          </p>
          <button
            onClick={() => redirectToLogin()}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
          >
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
