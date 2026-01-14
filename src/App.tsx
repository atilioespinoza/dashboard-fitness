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
import { PersonalInfo } from './components/ui/PersonalInfo';
import { Activity, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FadeIn, FadeInStagger } from './components/ui/FadeIn';

function App() {
    const { data, loading, error } = useFitnessData();
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && data.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg max-w-md">
                    <h2 className="text-lg font-bold mb-2">Error al Cargar Datos</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Calculate top-level metrics for Streaks
    // Simple logic for streak: consecutive days meeting criteria working backwards from latest
    let calorieStreak = 0;
    let proteinStreak = 0;
    let stepsStreak = 0;

    // Sort descending for streak calc
    const sortedData = [...data].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

    for (const day of sortedData) {
        if (day.Calories <= day.TDEE) calorieStreak++;
        else break;
    }

    for (const day of sortedData) {
        if (day.Protein >= 140) proteinStreak++;
        else break;
    }

    for (const day of sortedData) {
        if (day.Steps >= 12000) stepsStreak++;
        else break;
    }

    // Weekly Rate for Gauge (Last 7 days avg loss or simple diff)
    const latest = sortedData[0];
    const weekAgo = sortedData[6] || sortedData[sortedData.length - 1];
    const weeklyRate = latest && weekAgo ? Number((latest.Weight - weekAgo.Weight).toFixed(1)) : 0;

    // Weekly Average Deficit
    const last7Days = sortedData.slice(0, 7);
    const weeklyAvgDeficit = last7Days.length > 0
        ? Math.round(last7Days.reduce((acc, day) => acc + (day.TDEE - day.Calories), 0) / last7Days.length)
        : 0;

    // Cumulative Deficit and Theoretical Fat Loss (7700 kcal = 1kg fat)
    const cumulativeDeficit = data.reduce((acc, day) => acc + (day.TDEE - day.Calories), 0);
    const theoreticalFatLoss = Number((cumulativeDeficit / 7700).toFixed(2));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-3 md:p-8 font-sans pb-20 md:pb-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">

                {/* Header */}
                <FadeIn>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-4 px-1">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity className="text-blue-500" size={24} />
                                Registro Fitness Pro
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1">Panel de Tendencias y Análisis</p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                            <div className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] md:text-xs text-slate-500 dark:text-slate-500 font-mono shadow-sm">
                                Última Actualización: {latest?.Date}
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Personal Info Bar */}
                <FadeIn>
                    <PersonalInfo age={42} height={179} sex="Masculino" />
                </FadeIn>

                {/* Row 1: Health Trends */}
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

                {/* Row 1.5: Projections & Achievements */}
                <div className="grid grid-cols-12 gap-6">
                    <FadeIn className="col-span-12 lg:col-span-12">
                        <GoalProjections data={data} />
                    </FadeIn>
                    <FadeIn className="col-span-12 lg:col-span-12">
                        <AchievementsGallery data={data} />
                    </FadeIn>
                </div>

                {/* Row 2: Nutrition & Activity Consistency */}
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

                {/* Row 3: Macro Insights (Full Width) */}
                <FadeIn className="grid grid-cols-12 gap-6">
                    <MacroDonut data={data} />
                </FadeIn>

                {/* Row 4: Activity Analysis (Steps) */}
                <FadeIn className="grid grid-cols-12 gap-6">
                    <StepsChart data={data} />
                </FadeIn>

                {/* Row 5: Training Activity & Map */}
                <div className="grid grid-cols-12 gap-6">
                    <FadeIn className="col-span-12 lg:col-span-4">
                        <BodyHeatmap data={data} />
                    </FadeIn>
                    <FadeIn className="col-span-12 lg:col-span-8">
                        <TrainingCalendar data={data} />
                    </FadeIn>
                </div>

                {/* Row 5: Trends & Analysis */}
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
