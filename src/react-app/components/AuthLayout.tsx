import React from 'react';
import { Sparkles, Calendar, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex w-full bg-slate-50">
            {/* Search side - Branding & Testimonial */}
            <div className="hidden lg:flex w-1/2 bg-brand-600 relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Abstract Background Shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-500/30 blur-3xl"></div>
                    <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-12 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-center space-x-3">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Cítame.click</span>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Gestiona tu negocio con la elegancia que merece.
                    </h2>
                    <div className="space-y-4 text-brand-100">
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-brand-300" />
                            <span className="text-lg">Reservas automáticas 24/7</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-brand-300" />
                            <span className="text-lg">Recordatorios por WhatsApp</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-brand-300" />
                            <span className="text-lg">Gestión de clientes simplificada</span>
                        </div>
                    </div>
                </div>

                {/* Footer/Testimonial */}
                <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-brand-500/50 rounded-full">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium leading-relaxed opacity-90 mb-3">
                                "Desde que usamos Cítame, nuestros clientes están más felices y nosotros tenemos más tiempo. Una herramienta indispensable."
                            </p>
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm">María González</span>
                                <span className="w-1 h-1 bg-brand-300 rounded-full"></span>
                                <span className="text-brand-200 text-sm">CEO, Spa Wellness</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
                        <p className="mt-2 text-slate-600">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
