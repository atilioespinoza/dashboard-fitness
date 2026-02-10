import { useFitnessData } from './hooks/useFitnessData';
import { Auth } from './components/auth/Auth';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { supabase } from './lib/supabase';
import { Activity, Sun, Moon, LogOut, Database, Download, Brain, User, Mic, ChevronRight, Bot, Dumbbell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FadeIn } from './components/ui/FadeIn';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { LogPage } from './pages/LogPage';
import { RoutinePage } from './pages/training/RoutinePage';
import { ProfileModal } from './components/ui/ProfileModal';
import { AnimatePresence, motion } from 'framer-motion';

function AppContent() {
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading, error: profileError, updateProfile } = useProfile(user?.id);
    const { data, loading: dataLoading, refresh: dataRefresh } = useFitnessData(user?.id);
    const location = useLocation();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);
    const [hasDismissedOnboarding, setHasDismissedOnboarding] = useState(() => {
        return localStorage.getItem('has_dismissed_onboarding') === 'true' ||
            localStorage.getItem('has_saved_profile') === 'true';
    });

    useEffect(() => {
        if (!profileLoading && !profile && !profileError && user && !hasDismissedOnboarding) {
            setShowOnboarding(true);
        }
    }, [profile, profileLoading, profileError, user, hasDismissedOnboarding]);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    const handleLogout = () => supabase.auth.signOut();

    const handleExport = () => {
        if (!data || data.length === 0) return;
        const headers = ["Fecha", "Peso", "Cintura", "Grasa", "Calorias", "Proteinas", "Carbos", "Grasas", "Pasos", "TDEE", "Sueño", "Notas", "Entrenamiento"];
        const rows = [...data].sort((a, b) => b.Date.localeCompare(a.Date)).map(d => [
            d.Date, d.Weight, d.Waist, d.BodyFat, d.Calories, d.Protein, d.Carbs, d.Fat, d.Steps, d.TDEE, d.Sleep,
            `"${(d.Notes || '').replace(/"/g, '""')}"`, d.Training || ""
        ]);
        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `fitness_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Auth />;

    if (dataLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Sincronizando Biometría...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-3 md:p-8 font-sans pb-24 md:pb-8 transition-colors duration-300">
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                profile={profile}
                onUpdate={async (updates) => {
                    try {
                        console.log("Iniciando guardado de perfil...", updates);
                        await updateProfile(updates);

                        // Si llegamos aquí, el guardado fue exitoso
                        localStorage.setItem('has_saved_profile', 'true');
                        setHasDismissedOnboarding(true);

                        const hasSeenTour = localStorage.getItem('has_seen_tour_v2');
                        if (showOnboarding && !hasSeenTour) {
                            setShowOnboarding(false);
                            setTourStep(0);
                            setShowTour(true);
                            localStorage.setItem('has_seen_tour_v2', 'true');
                        } else {
                            setShowOnboarding(false);
                        }
                    } catch (err: any) {
                        console.error("ERROR CRÍTICO AL GUARDAR:", err);
                        alert(`❌ ERROR DE BASE DE DATOS:\n\n${err.message || 'Error desconocido'}\n\nVerifica que ejecutaste el SQL en Supabase.`);
                    }
                }}
            />

            <AnimatePresence>
                {showOnboarding && !isProfileOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 md:p-12 max-w-lg w-full shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="p-4 bg-blue-600/10 rounded-3xl text-blue-600">
                                    <Brain size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                                        ¡Bienvenido a <span className="text-blue-600 not-italic">Fitness Pro</span>!
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        Tu viaje hacia la mejor versión de ti mismo comienza hoy. Necesitamos unos datos básicos para configurar tu dashboard inteligente.
                                    </p>
                                </div>
                                <div className="w-full space-y-3">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(true);
                                        }}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                                    >
                                        Comenzar Configuración
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowOnboarding(false);
                                            setHasDismissedOnboarding(true);
                                            localStorage.setItem('has_dismissed_onboarding', 'true');
                                        }}
                                        className="w-full py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                    >
                                        Configurar más tarde
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showTour && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md pointer-events-auto"
                            onClick={() => setShowTour(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden max-w-xl w-full shadow-2xl pointer-events-auto"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-white/5 flex">
                                <motion.div
                                    className="h-full bg-blue-600"
                                    initial={{ width: "33.33%" }}
                                    animate={{ width: tourStep === 0 ? "33.33%" : tourStep === 1 ? "66.66%" : "100%" }}
                                />
                            </div>

                            <div className="p-8 md:p-12">
                                <AnimatePresence mode="wait">
                                    {tourStep === 0 && (
                                        <motion.div
                                            key="tour-0"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-600">
                                                    <Mic size={32} strokeWidth={2.5} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Log Inteligente</h3>
                                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Paso 01 de 03</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                <p>Olvida las aplicaciones complicadas. Aquí puedes simplemente <span className="text-slate-900 dark:text-white font-bold italic">hablarle al micrófono</span> como si fuera un mensaje de WhatsApp.</p>
                                                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 italic text-sm">
                                                    "Anotame un café con leche y una tostada con palta para el desayuno"
                                                </div>
                                                <p>Nuestra IA entenderá las calorías, macros y lo registrará automáticamente por ti.</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {tourStep === 1 && (
                                        <motion.div
                                            key="tour-1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-600">
                                                    <Activity size={32} strokeWidth={2.5} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Visualización Pro</h3>
                                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">Paso 02 de 03</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                <p>Tu Dashboard analiza tendencias reales, no solo números diarios. Verás tu <span className="text-slate-900 dark:text-white font-bold">pérdida de grasa teórica</span> basada en tu déficit acumulado.</p>
                                                <ul className="grid grid-cols-2 gap-3 text-xs">
                                                    <li className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Histórico de Peso
                                                    </li>
                                                    <li className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Metas de Cintura
                                                    </li>
                                                    <li className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Pasos y Actividad
                                                    </li>
                                                    <li className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Macros Semanales
                                                    </li>
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}

                                    {tourStep === 2 && (
                                        <motion.div
                                            key="tour-2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-emerald-600/10 rounded-2xl text-emerald-600">
                                                    <Bot size={32} strokeWidth={2.5} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Coach Personal IA</h3>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Paso 03 de 03</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed font-sans">
                                                <p>Al final del Dashboard encontrarás a tu <span className="text-emerald-600 font-bold uppercase italic tracking-tighter">AI Fitness Coach</span>. Él analiza cada dato para darte reportes detallados y estrategias personalizadas.</p>
                                                <p>No solo te da números, te dice <span className="text-slate-900 dark:text-white font-bold underline decoration-blue-500 underline-offset-4 decoration-2">por qué</span> ocurren tus cambios y cómo acelerar tus resultados.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-12 flex gap-4">
                                    {tourStep > 0 && (
                                        <button
                                            onClick={() => setTourStep(prev => prev - 1)}
                                            className="px-6 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                                        >
                                            Atrás
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (tourStep < 2) setTourStep(prev => prev + 1);
                                            else {
                                                setShowTour(false);
                                                localStorage.setItem('has_seen_tour_v2', 'true');
                                            }
                                        }}
                                        className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-white/5 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                    >
                                        {tourStep < 2 ? (
                                            <>Siguiente <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                        ) : '¡Listo para Transformarme!'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
                {/* Header */}
                <FadeIn>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-4 px-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 text-white">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none">
                                    Fitness Pro <span className="text-blue-600 not-italic">Dashboard</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                        <Database size={10} className="text-emerald-500" />
                                        <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">Supabase Active</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beta v2.0</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Desktop */}
                        <div className="hidden md:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-1.5 rounded-2xl gap-1 shadow-sm">
                            <Link
                                to="/"
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === '/' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                Registro
                            </Link>
                            <Link
                                to="/dashboard"
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === '/dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/training"
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === '/training' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                Entrenamiento
                            </Link>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                                {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                            </span>
                            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
                                <button
                                    onClick={() => setIsProfileOpen(true)}
                                    className="p-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-colors shadow-lg shadow-blue-500/10 flex items-center gap-2"
                                    title="Editar Perfil"
                                >
                                    <User size={18} />
                                    <span className="hidden sm:inline text-[8px] font-black uppercase tracking-widest ml-1">Perfil</span>
                                </button>

                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all font-black text-[10px] uppercase tracking-widest"
                                    title="Exportar historial a CSV"
                                >
                                    <Download size={16} />
                                    <span className="hidden sm:inline">Exportar</span>
                                </button>

                                <button
                                    onClick={toggleTheme}
                                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-red-500 hover:bg-red-500/10 transition-colors shadow-sm"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                <main>
                    <Routes>
                        <Route path="/" element={<LogPage userId={user.id} profile={profile} onUpdate={dataRefresh} />} />
                        <Route path="/dashboard" element={<DashboardPage data={data} profile={profile} />} />
                        <Route path="/training" element={<RoutinePage userId={user.id} profile={profile} onUpdate={dataRefresh} />} />
                    </Routes>
                </main>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-2 rounded-3xl flex items-center gap-2 shadow-2xl">
                    <Link
                        to="/"
                        className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all ${location.pathname === '/' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400'}`}
                    >
                        <Brain size={20} />
                        <span className="text-[7px] font-black uppercase mt-1">Log</span>
                    </Link>
                    <Link
                        to="/dashboard"
                        className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all ${location.pathname === '/dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400'}`}
                    >
                        <Activity size={20} />
                        <span className="text-[7px] font-black uppercase mt-1">Status</span>
                    </Link>
                    <Link
                        to="/training"
                        className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all ${location.pathname === '/training' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30' : 'text-slate-400'}`}
                    >
                        <Dumbbell size={20} />
                        <span className="text-[7px] font-black uppercase mt-1">Train</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
