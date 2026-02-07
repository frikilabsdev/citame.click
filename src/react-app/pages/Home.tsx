import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/react-app/contexts/AuthContext";
import {
  Calendar, Clock, Shield, CheckCircle2,
  MessageSquare, ChevronDown,
  ArrowRight, Users, TrendingUp, Link as LinkIcon
} from "lucide-react";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";

export default function HomePage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (user && !isPending) {
      navigate("/dashboard");
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  const faqs = [
    {
      question: "¿Necesito tarjeta de crédito para empezar?",
      answer: "No. Puedes crear tu cuenta y usar las funciones principales para gestionar tu negocio."
    },
    {
      question: "¿Mis clientes necesitan descargar una app?",
      answer: "No. Tus clientes reservan directamente desde un enlace web único (citame.click/tu-negocio) que funciona en cualquier dispositivo sin instalaciones."
    },
    {
      question: "¿Cómo funcionan las notificaciones de WhatsApp?",
      answer: "El sistema puede configurarse para enviar recordatorios automáticos a tus clientes sobre sus citas próximas, ayudando a reducir el ausentismo."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white rounded-b-[3rem] shadow-sm z-10">
        <div className="absolute top-0 left-0 right-0 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-50 via-white to-white -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 shadow-sm mb-8 animate-fade-in-up">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                </span>
                <span className="text-sm font-semibold text-brand-700">Sistema de Reservas Simple y Efectivo</span>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-fade-in-up delay-100">
                Tu agenda llena, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                  tus clientes felices.
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-200">
                La plataforma que centraliza tus citas, servicios y empleados.
                Olvídate del papel y lápiz, y ofrece una experiencia de reserva profesional.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-300">
                <button
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-xl font-bold shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/40 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Crear Cuenta Gratis
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Abstract UI Representation - CSS Only (No fake screenshots) */}
            <div className="lg:w-1/2 relative animate-fade-in-up delay-[400ms] w-full max-w-lg lg:max-w-full">
              <div className="relative z-10 rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 md:p-6 overflow-hidden">
                {/* Mock Header */}
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="h-4 w-24 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 w-16 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                    <div className="w-24 h-8 rounded-lg bg-brand-600"></div>
                  </div>
                </div>

                {/* Mock Calendar Grid */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {/* Time Column */}
                  <div className="col-span-1 space-y-6 pt-4">
                    <div className="text-xs text-slate-400 text-right pr-2">09:00 AM</div>
                    <div className="text-xs text-slate-400 text-right pr-2">10:00 AM</div>
                    <div className="text-xs text-slate-400 text-right pr-2">11:00 AM</div>
                  </div>
                  {/* Appointments */}
                  <div className="col-span-3 space-y-4 relative border-l border-slate-100 pl-4 py-2">
                    <div className="p-3 bg-brand-50 border-l-4 border-brand-500 rounded-r-lg w-full shadow-sm">
                      <div className="h-3 w-32 bg-brand-200 rounded mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-2 w-16 bg-brand-100 rounded"></div>
                        <div className="h-2 w-12 bg-green-100 rounded"></div>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg w-3/4 ml-auto shadow-sm">
                      <div className="h-3 w-24 bg-purple-200 rounded mb-2"></div>
                      <div className="h-2 w-16 bg-purple-100 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Mock Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <div className="text-sm text-slate-400 mb-1">Citas Hoy</div>
                    <div className="text-xl font-bold text-slate-900">8</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-400 mb-1">Confirmadas</div>
                    <div className="text-xl font-bold text-green-600">6</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-400 mb-1">Pendientes</div>
                    <div className="text-xl font-bold text-orange-500">2</div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -right-4 -bottom-4 md:right-8 md:bottom-8 p-4 bg-white rounded-xl shadow-xl border border-slate-100 z-20 flex items-center gap-3 animate-bounce">
                <div className="p-2 bg-green-100 rounded-full">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">Recordatorio Enviado</p>
                  <p className="text-xs text-slate-500">Vía WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-slate-200/50">
            <div>
              <h3 className="text-4xl font-bold text-brand-600 mb-1">24/7</h3>
              <p className="text-slate-600 text-sm font-medium">Disponible Online</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-brand-600 mb-1">Ágil</h3>
              <p className="text-slate-600 text-sm font-medium">Gestión Rápida</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-brand-600 mb-1">Simple</h3>
              <p className="text-slate-600 text-sm font-medium">Sin Curva de Aprendizaje</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-brand-600 mb-1">Seguro</h3>
              <p className="text-slate-600 text-sm font-medium">Tus Datos Protegidos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Split: Public Page */}
      <section id="features" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
            <div className="md:w-1/2 relative order-last md:order-first">
              {/* Abstract Mobile Phone Representation */}
              <div className="mx-auto w-64 h-[500px] border-8 border-slate-900 rounded-[2.5rem] bg-white relative overflow-hidden shadow-2xl">
                <div className="h-full w-full bg-slate-50 overflow-y-auto hide-scrollbar">
                  {/* Mock Mobile UI */}
                  <div className="bg-brand-600 h-32 p-6 flex flex-col justify-end">
                    <div className="w-16 h-16 bg-white rounded-full mb-2 opacity-20"></div>
                  </div>
                  <div className="p-6 -mt-8 relative z-10">
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                      <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-48 bg-slate-100 rounded"></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                      <div className="h-8 w-full bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 text-xs font-bold">Seleccionar Servicio</div>
                      <div className="h-8 w-full bg-slate-50 rounded-lg border border-slate-100"></div>
                      <div className="h-8 w-full bg-slate-50 rounded-lg border border-slate-100"></div>
                      <div className="mt-4 h-10 w-full bg-brand-600 rounded-lg shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold mb-4">
                <LinkIcon className="w-4 h-4" />
                <span>Tu Enlace Personalizado</span>
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Tus clientes reservan solos.</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Crea tu página, comparte tu enlace y deja que las citas lleguen solas. Sin intermediarios y sin llamadas interrupiendo tu trabajo.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Diseño limpio y profesional</h4>
                    <p className="text-slate-600 text-sm">Adaptado a la identidad de cualquier negocio.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Disponible 24 horas</h4>
                    <p className="text-slate-600 text-sm">Recibe reservas incluso mientras duermes.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: Management */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Todo lo que necesitas para operar</h2>
            <p className="text-slate-600 text-lg">Funcionalidades reales pensadas para el día a día de tu negocio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
              <Calendar className="w-10 h-10 text-brand-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Calendario Centralizado</h3>
              <p className="text-slate-600">Visualiza todas tus citas y las de tu equipo en un solo lugar. Arrastra, modifica y cancela con un clic.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
              <Users className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gestión de Empleados</h3>
              <p className="text-slate-600">Registra a tu personal, asigna sus servicios y deja que el sistema organice sus agendas.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
              <Shield className="w-10 h-10 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Administración de Servicios</h3>
              <p className="text-slate-600">Define la duración y costos de cada servicio. El sistema calcula automáticamente los huecos disponibles.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
              <MessageSquare className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Notificaciones</h3>
              <p className="text-slate-600">Mantén a todos informados. Confirmaciones de cita automáticas para reducir malentendidos.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
              <TrendingUp className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enfoque en el Crecimiento</h3>
              <p className="text-slate-600">Al automatizar la agenda, tienes más tiempo para enfocarte en atender mejor a tus clientes.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
              <Clock className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ahorro de Tiempo</h3>
              <p className="text-slate-600">Reduce drásticamente el tiempo dedicado a coordinar horarios por teléfono o mensajes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-800">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-6 pt-0 bg-white text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-700 to-indigo-800 rounded-[2.5rem] p-12 lg:p-24 text-center text-white shadow-2xl relative overflow-hidden isolate">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl -z-10"></div>

            <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight">
              Optimiza tu tiempo hoy.
            </h2>
            <p className="text-brand-100 text-xl mb-10 max-w-2xl mx-auto font-light">
              Únete a los profesionales que ya gestionan sus citas de forma inteligente.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="px-10 py-5 bg-white text-brand-700 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                Crear Cuenta Gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
