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
import { Activity } from 'lucide-react';

function App() {
    const { data, loading, error } = useFitnessData();

    if (loading) {
        return (
            <div className="min-h-screen bg-dashboard-bg text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && data.length === 0) {
        return (
            <div className="min-h-screen bg-dashboard-bg text-white flex items-center justify-center p-4">
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

    return (
        <div className="min-h-screen bg-dashboard-bg text-slate-100 p-3 md:p-8 font-sans pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 px-1">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Activity className="text-blue-500" size={24} />
                            Registro Fitness Pro
                        </h1>
                        <p className="text-xs md:text-sm text-slate-400 mt-0.5 md:mt-1">Panel de Tendencias y Análisis</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-2 py-0.5 md:px-3 md:py-1 bg-slate-900 rounded-full border border-slate-800 text-[10px] md:text-xs text-slate-500 font-mono">
                            Última Actualización: {latest?.Date}
                        </div>
                    </div>
                </div>

                {/* Row 1: Health Trends */}
                <div className="grid grid-cols-12 gap-4 md:gap-6">
                    <WeightChart data={data} />
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 md:gap-6">
                        <WaistCard currentWaist={latest?.Waist || 0} />
                        <LossGauge weeklyRate={weeklyRate} weeklyDeficit={weeklyAvgDeficit} />
                    </div>
                </div>

                {/* Row 2: Nutrition & Activity Consistency */}
                <div className="grid grid-cols-12 gap-4 md:gap-6">
                    <BalanceChart data={data} />
                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 md:gap-6">
                        <ConsistencyGrid data={data} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <StreakCounter label="Calorías" count={calorieStreak} goal="Bajo TDEE" />
                            <StreakCounter label="Proteínas" count={proteinStreak} goal="Min 140g" />
                            <StreakCounter label="Pasos" count={stepsStreak} goal="Min 12k" />
                        </div>
                    </div>
                </div>

                {/* Row 3: Macro Insights (Full Width) */}
                <div className="grid grid-cols-12 gap-6">
                    <MacroDonut data={data} />
                </div>

                {/* Row 4: Activity Analysis (Steps) */}
                <div className="grid grid-cols-12 gap-6">
                    <StepsChart data={data} />
                </div>

                {/* Row 5: Training Calendar (REPLACED CARDS) */}
                <div className="grid grid-cols-12 gap-6">
                    <TrainingCalendar data={data} />
                </div>

                {/* Row 5: Trends & Analysis */}
                <div className="grid grid-cols-12 gap-6">
                    <CorrelationChart data={data} />
                    <NotesList data={data} />
                </div>

            </div>
        </div>
    )
}

export default App;
