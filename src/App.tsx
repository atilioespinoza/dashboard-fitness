import { useFitnessData } from './hooks/useFitnessData';
import { WeightChart } from './components/charts/WeightChart';
import { WaistCard } from './components/charts/WaistCard';
import { LossGauge } from './components/charts/LossGauge';
import { BalanceChart } from './components/charts/BalanceChart';
import { ConsistencyGrid } from './components/charts/ConsistencyGrid';
import { StreakCounter } from './components/charts/StreakCounter';
import { MacroDonut } from './components/charts/MacroDonut';
import { CorrelationChart } from './components/charts/CorrelationChart';
import { NotesList } from './components/charts/NotesList';
import { TrainingCalendar } from './components/charts/TrainingCalendar';
import { StepsChart } from './components/charts/StepsChart';
import { GoalProjections } from './components/charts/GoalProjections';
import { AchievementsGallery } from './components/charts/AchievementsGallery';
import { BodyHeatmap } from './components/charts/BodyHeatmap';
import { AICoachInsights } from './components/charts/AICoachInsights';
import { PersonalInfo } from './components/ui/PersonalInfo';
import { QuickLog } from './components/ui/QuickLog';
import { Auth } from './components/auth/Auth';
import { useAuth } from './hooks/useAuth';
import { useMigration } from './hooks/useMigration';
import { supabase } from './lib/supabase';
import { Activity, Sun, Moon, LogOut, Database, CloudUpload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { FadeIn, FadeInStagger } from './components/ui/FadeIn';
import { differenceInYears, parseISO } from 'date-fns';

function App() {
    const { user, loading: authLoading } = useAuth();
    const { data, loading: dataLoading } = useFitnessData(user?.id);
    const { migrate, migrating, progress, error: migrationError } = useMigration();
    const [migrationSuccess, setMigrationSuccess] = useState(false);

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

    const handleMigrate = async () => {
        if (!user) return;
        try {
            await migrate(user.id);
            setMigrationSuccess(true);
            setTimeout(() => setMigrationSuccess(false), 5000);
            window.location.reload(); // Quick way to refresh everything
        } catch (e) {
            console.error(e);
        }
    };

    // Age calculation
    const birthDate = "1984-01-14";
    const age = useMemo(() => differenceInYears(new Date(), parseISO(birthDate)), [birthDate]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Auth />;
    }

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

    const sortedData = [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
    const latest = sortedData[0];
    const weekAgo = sortedData[6] || sortedData[sortedData.length - 1];
    const weeklyRate = latest && weekAgo ? Number((latest.Weight - weekAgo.Weight).toFixed(1)) : 0;
    const last7Days = sortedData.slice(0, 7);
    const weeklyAvgDeficit = last7Days.length > 0 ? Math.round(last7Days.reduce((acc, day) => acc + (day.TDEE - day.Calories), 0) / last7Days.length) : 0;
    const cumulativeDeficit = data.reduce((acc, day) => acc + (day.TDEE - day.Calories), 0);
    const theoreticalFatLoss = Number((cumulativeDeficit / 7700).toFixed(2));

    let calorieStreak = 0;
    let proteinStreak = 0;
    let stepsStreak = 0;
    for (const day of sortedData) { if (day.Calories <= day.TDEE) calorieStreak++; else break; }
    for (const day of sortedData) { if (day.Protein >= 140) proteinStreak++; else break; }
    for (const day of sortedData) { if (day.Steps >= 12000) stepsStreak++; else break; }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-3 md:p-8 font-sans pb-20 md:pb-8 transition-colors duration-300">
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

                        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
                            <button
                                onClick={handleMigrate}
                                disabled={migrating}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${migrating
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                    : "bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20"
                                    }`}
                                title="Migrar datos desde Sheets"
                            >
                                {migrating ? (
                                    <div className="flex items-center gap-2">
                                        <Database className="animate-bounce" size={16} />
                                        <span>{progress}%</span>
                                    </div>
                                ) : (
                                    <>
                                        <CloudUpload size={16} />
                                        <span className="hidden sm:inline">Migrar Historial</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-red-500 hover:bg-red-500/10 transition-colors shadow-sm"
                                title="Salir"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Migration Status Notifications */}
                    {migrationSuccess && (
                        <FadeIn className="mt-4 px-4 py-3 bg-emerald-500 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 size={20} />
                            <span className="text-sm font-black uppercase tracking-widest">Migración completa. Datos sincronizados.</span>
                        </FadeIn>
                    )}
                    {migrationError && (
                        <FadeIn className="mt-4 px-4 py-3 bg-red-500 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-red-500/20">
                            <AlertCircle size={20} />
                            <span className="text-sm font-black uppercase tracking-widest">Error: {migrationError}</span>
                        </FadeIn>
                    )}
                </FadeIn>

                {/* AI Briefing & Quick Log */}
                <div className="grid grid-cols-12 gap-4 md:gap-6">
                    <FadeIn className="col-span-12 lg:col-span-8">
                        <AICoachInsights data={data} />
                    </FadeIn>
                    <FadeIn className="col-span-12 lg:col-span-4">
                        <QuickLog userId={user.id} onUpdate={() => window.location.reload()} />
                    </FadeIn>
                </div>


                <FadeIn>
                    <PersonalInfo age={age} height={179} sex="Masculino" />
                </FadeIn>

                <div className="grid grid-cols-12 gap-4 md:gap-6">
                    <FadeIn className="col-span-12 lg:col-span-8">
                        <WeightChart data={data} />
                    </FadeIn>
                    <FadeInStagger className="col-span-12 lg:col-span-4 flex flex-col gap-4 md:gap-6">
                        <FadeIn>
                            <WaistCard currentWaist={latest?.Waist || 0} data={data} />
                        </FadeIn>
                        <FadeIn delay={0.1}>
                            <LossGauge
                                weeklyRate={weeklyRate}
                                weeklyDeficit={weeklyAvgDeficit}
                                totalDeficit={cumulativeDeficit}
                                fatLoss={theoreticalFatLoss}
                            />
                        </FadeIn>
                    </FadeInStagger>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    <FadeIn className="col-span-12 lg:col-span-12">
                        <GoalProjections data={data} />
                    </FadeIn>
                    <FadeIn className="col-span-12 lg:col-span-12">
                        <AchievementsGallery data={data} />
                    </FadeIn>
                </div>

                <div className="grid grid-cols-12 gap-4 md:gap-6">
                    <FadeIn className="col-span-12 lg:col-span-6">
                        <BalanceChart data={data} />
                    </FadeIn>
                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 md:gap-6">
                        <FadeIn>
                            <ConsistencyGrid data={data} />
                        </FadeIn>
                        <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <FadeIn>
                                <StreakCounter label="Calorías" count={calorieStreak} goal="Bajo TDEE" />
                            </FadeIn>
                            <FadeIn>
                                <StreakCounter label="Proteínas" count={proteinStreak} goal="Min 140g" />
                            </FadeIn>
                            <FadeIn>
                                <StreakCounter label="Pasos" count={stepsStreak} goal="Min 12k" />
                            </FadeIn>
                        </FadeInStagger>
                    </div>
                </div>

                <FadeIn className="grid grid-cols-12 gap-6">
                    <MacroDonut data={data} />
                </FadeIn>

                <FadeIn className="grid grid-cols-12 gap-6">
                    <StepsChart data={data} />
                </FadeIn>

                <div className="grid grid-cols-12 gap-6">
                    <FadeIn className="col-span-12 lg:col-span-4">
                        <BodyHeatmap data={data} />
                    </FadeIn>
                    <FadeIn className="col-span-12 lg:col-span-8">
                        <TrainingCalendar data={data} />
                    </FadeIn>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    <FadeIn className="col-span-12 lg:col-span-8">
                        <CorrelationChart data={data} />
                    </FadeIn>
                    <FadeIn className="col-span-12 lg:col-span-4">
                        <NotesList data={data} />
                    </FadeIn>
                </div>

            </div>
        </div>
    )
}

export default App;
