import { Calendar, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="p-1.5 bg-brand-600 rounded-lg">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">Cítame.click</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            La plataforma más elegante para gestionar reservas y hacer crecer tu negocio sin complicaciones.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Producto</h3>
                        <ul className="space-y-3">
                            <li><a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm">Características</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Precios</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Guías</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">API</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Compañía</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Sobre Nosotros</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Blog</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Carreras</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Contacto</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacidad</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Términos</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Cookies</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center bg-slate-900">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Cítame.click. Todos los derechos reservados.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/login" className="text-sm text-slate-500 hover:text-white">Admin</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
