import { useFitnessData } from './hooks/useFitnessData';
import { Auth } from './components/auth/Auth';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { supabase } from './lib/supabase';
import { Activity, Sun, Moon, LogOut, Database, Download, Brain, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FadeIn } from './components/ui/FadeIn';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { LogPage } from './pages/LogPage';
import { ProfileModal } from './components/ui/ProfileModal';

function AppContent() {
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id);
    const { data, loading: dataLoading, refresh: dataRefresh } = useFitnessData(user?.id);
    const location = useLocation();

    const [isProfileOpen, setIsProfileOpen] = useState(false);

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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) return <Auth />;

    if (dataLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Sincronizando Biometría...</p>
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
                onUpdate={updateProfile}
            />

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
