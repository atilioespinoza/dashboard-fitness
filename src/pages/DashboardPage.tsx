import { WeightChart } from '../components/charts/WeightChart';
import { WaistCard } from '../components/charts/WaistCard';
import { LossGauge } from '../components/charts/LossGauge';
import { BalanceChart } from '../components/charts/BalanceChart';
import { ConsistencyGrid } from '../components/charts/ConsistencyGrid';
import { MacroDonut } from '../components/charts/MacroDonut';
import { SleepChart } from '../components/charts/SleepChart';
import { NotesList } from '../components/charts/NotesList';
import { TrainingCalendar } from '../components/charts/TrainingCalendar';
import { StepsChart } from '../components/charts/StepsChart';
import { GoalProjections } from '../components/charts/GoalProjections';
import { BodyHeatmap } from '../components/charts/BodyHeatmap';
import { AICoachInsights } from '../components/charts/AICoachInsights';
import { BMIDistributionChart } from '../components/charts/BMIDistributionChart';
import { TrainingIntensityStats } from '../components/charts/TrainingIntensityStats';
import { TrainingProgressWidget } from '../components/charts/TrainingProgressWidget';
import { PersonalInfo } from '../components/ui/PersonalInfo';
import { FadeIn, FadeInStagger } from '../components/ui/FadeIn';
import { useMemo } from 'react';
import { differenceInYears } from 'date-fns';
import { parseLocalDate } from '../lib/utils';
import { FitnessEntry } from '../data/mockData';
import { UserProfile } from '../hooks/useProfile';
import { Dumbbell } from 'lucide-react';

interface DashboardPageProps {
    data: FitnessEntry[];
    profile: UserProfile | null;
}

export function DashboardPage({ data, profile }: DashboardPageProps) {
    const birthDate = profile?.birth_date || "1984-01-14";
    const age = useMemo(() => differenceInYears(new Date(), parseLocalDate(birthDate)), [birthDate]);

    const sortedData = [...data].sort((a, b) => b.Date.localeCompare(a.Date));

    // Multi-week averages for more stable trend analysis
    const getWeekAvg = (data: FitnessEntry[], weeksAgo: number) => {
        const start = weeksAgo * 7;
        const end = start + 7;
        const weekSlice = data.slice(start, end);
        if (weekSlice.length === 0) return null;
        const sum = weekSlice.reduce((acc, d) => acc + d.Weight, 0);
        return sum / weekSlice.length;
    };

    const avgWeek0 = getWeekAvg(sortedData, 0);
    const avgWeek1 = getWeekAvg(sortedData, 1);
    const avgWeek2 = getWeekAvg(sortedData, 2);
    const avgWeek3 = getWeekAvg(sortedData, 3);

    const weeklyRate = (avgWeek0 !== null && avgWeek1 !== null)
        ? Number((avgWeek0 - avgWeek1).toFixed(2))
        : 0;

    // Stagnation logic: if diff is < 0.2kg for 3 weeks
    const diff1 = (avgWeek0 && avgWeek1) ? Math.abs(avgWeek0 - avgWeek1) : null;
    const diff2 = (avgWeek1 && avgWeek2) ? Math.abs(avgWeek1 - avgWeek2) : null;
    const diff3 = (avgWeek2 && avgWeek3) ? Math.abs(avgWeek2 - avgWeek3) : null;

    const isStagnant = diff1 !== null && diff1 < 0.2 &&
        (diff2 === null || diff2 < 0.2) &&
        (diff3 === null || diff3 < 0.2);

    // Recomposition logic: weight stable but waist down
    const latest = sortedData[0];
    const prevWeekData = sortedData.slice(7, 14);
    const avgWaist0 = sortedData.slice(0, 7).reduce((acc, d) => acc + d.Waist, 0) / Math.max(1, sortedData.slice(0, 7).length);
    const avgWaist1 = prevWeekData.length > 0 ? prevWeekData.reduce((acc, d) => acc + d.Waist, 0) / prevWeekData.length : avgWaist0;
    const isRecomp = isStagnant && (avgWaist1 - avgWaist0) > 0.2;

    const last7Days = sortedData.slice(0, 7);
    const weeklyAvgDeficit = last7Days.length > 0 ? Math.round(last7Days.reduce((acc, day) => acc + (day.TDEE - day.Calories), 0) / last7Days.length) : 0;
    const cumulativeDeficit = data.reduce((acc, day) => acc + (day.TDEE - day.Calories), 0);
    const theoreticalFatLoss = Number((cumulativeDeficit / 7700).toFixed(2));

    const firstEntry = sortedData[sortedData.length - 1];
    const initialWeight = firstEntry?.Weight || 0;
    const initialBodyFat = data.find(d => d.BodyFat > 0)?.BodyFat || profile?.target_body_fat || 20;
    const targetBodyFat = profile?.target_body_fat || 15;
    const initialLeanMass = initialWeight * (1 - initialBodyFat / 100);
    const targetWeight = initialLeanMass / (1 - targetBodyFat / 100);
    const fatLossGoal = Math.max(0, initialWeight - targetWeight);


    return (
        <div className="space-y-4 md:space-y-8">
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <FadeIn className="col-span-12">
                    <AICoachInsights data={data} />
                </FadeIn>
            </div>

            <FadeIn>
                <PersonalInfo
                    fullName={profile?.full_name || "Cargando..."}
                    age={age}
                    height={profile?.height || 0}
                    sex={profile?.gender || 'Masculino'}
                />
            </FadeIn>

            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <FadeIn className="col-span-12 lg:col-span-8">
                    <WeightChart data={data} profile={profile} />
                </FadeIn>
                <FadeInStagger className="col-span-12 lg:col-span-4 flex flex-col gap-4 md:gap-6">
                    <FadeIn>
                        <WaistCard currentWaist={latest?.Waist || 0} data={data} profile={profile} />
                    </FadeIn>
                    <FadeIn delay={0.1}>
                        <LossGauge
                            weeklyRate={weeklyRate}
                            weeklyDeficit={weeklyAvgDeficit}
                            totalDeficit={cumulativeDeficit}
                            fatLoss={theoreticalFatLoss}
                            isStagnant={isStagnant}
                            isRecomp={isRecomp}
                            fatLossGoal={fatLossGoal}
                            targetBodyFat={targetBodyFat}
                        />
                    </FadeIn>
                </FadeInStagger>
            </div>

            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <FadeIn className="col-span-12">
                    <BMIDistributionChart data={data} profile={profile} />
                </FadeIn>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <FadeIn className="col-span-12 lg:col-span-12">
                    <GoalProjections data={data} profile={profile} />
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
                </div>
            </div>

            <FadeIn className="grid grid-cols-12 gap-6">
                <MacroDonut data={data} />
            </FadeIn>

            <FadeIn className="grid grid-cols-12 gap-6">
                <StepsChart data={data} profile={profile} />
            </FadeIn>

            {/* --- SECCIÓN DE ENTRENAMIENTO PRO --- */}
            <div className="space-y-6 md:space-y-8 pt-8 border-t border-slate-200 dark:border-white/5">
                <FadeIn>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20 text-white">
                            <Dumbbell size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none">
                                Optimización de <span className="text-emerald-600 not-italic">Entrenamiento</span>
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inteligencia y Progresión de Fuerza</p>
                        </div>
                    </div>
                </FadeIn>

                <FadeIn>
                    <TrainingIntensityStats data={data} />
                </FadeIn>

                <div className="grid grid-cols-12 gap-6">
                    <FadeIn className="col-span-12 lg:col-span-4">
                        <BodyHeatmap data={data} />
                    </FadeIn>
                    <FadeIn className="col-span-12 lg:col-span-8">
                        <TrainingProgressWidget userId={profile?.id || ''} />
                    </FadeIn>
                </div>

                <FadeIn>
                    <TrainingCalendar data={data} profile={profile} />
                </FadeIn>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <FadeIn className="col-span-12 lg:col-span-8">
                    <SleepChart data={data} />
                </FadeIn>
                <FadeIn className="col-span-12 lg:col-span-4">
                    <NotesList data={data} />
                </FadeIn>
            </div>
        </div>
    );
}
