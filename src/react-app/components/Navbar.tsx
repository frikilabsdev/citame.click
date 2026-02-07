import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Calendar, Menu, X } from "lucide-react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white/90 backdrop-blur-md shadow-sm py-4"
                    : "bg-transparent py-6"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
                        <div className={`p-2 rounded-xl ${isScrolled ? 'bg-brand-600 text-white' : 'bg-white text-brand-600'}`}>
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className={`text-xl font-bold ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                            Cítame<span className="text-brand-600">.click</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                            Características
                        </a>
                        <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                            Testimonios
                        </a>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-sm font-medium text-slate-900 hover:text-brand-600 transition-colors">
                                Iniciar Sesión
                            </Link>
                            <button
                                onClick={() => navigate("/register")}
                                className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Comenzar Gratis
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-slate-600 hover:text-brand-600 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg md:hidden p-4 flex flex-col space-y-4 animate-fade-in-up">
                    <a href="#features" className="text-base font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>
                        Características
                    </a>
                    <a href="#testimonials" className="text-base font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>
                        Testimonios
                    </a>
                    <hr className="border-slate-100" />
                    <Link to="/login" className="text-base font-medium text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>
                        Iniciar Sesión
                    </Link>
                    <button
                        onClick={() => {
                            navigate("/register");
                            setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/20"
                    >
                        Comenzar Gratis
                    </button>
                </div>
            )}
        </nav>
    );
}
