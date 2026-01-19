import { WeightChart } from '../components/charts/WeightChart';
import { WaistCard } from '../components/charts/WaistCard';
import { LossGauge } from '../components/charts/LossGauge';
import { BalanceChart } from '../components/charts/BalanceChart';
import { ConsistencyGrid } from '../components/charts/ConsistencyGrid';
import { StreakCounter } from '../components/charts/StreakCounter';
import { MacroDonut } from '../components/charts/MacroDonut';
import { SleepChart } from '../components/charts/SleepChart';
import { NotesList } from '../components/charts/NotesList';
import { TrainingCalendar } from '../components/charts/TrainingCalendar';
import { StepsChart } from '../components/charts/StepsChart';
import { GoalProjections } from '../components/charts/GoalProjections';
import { AchievementsGallery } from '../components/charts/AchievementsGallery';
import { BodyHeatmap } from '../components/charts/BodyHeatmap';
import { AICoachInsights } from '../components/charts/AICoachInsights';
import { PersonalInfo } from '../components/ui/PersonalInfo';
import { FadeIn, FadeInStagger } from '../components/ui/FadeIn';
import { useMemo } from 'react';
import { differenceInYears } from 'date-fns';
import { parseLocalDate } from '../lib/utils';
import { FitnessEntry } from '../data/mockData';
import { UserProfile } from '../hooks/useProfile';

interface DashboardPageProps {
    data: FitnessEntry[];
    profile: UserProfile | null;
}

export function DashboardPage({ data, profile }: DashboardPageProps) {
    const birthDate = profile?.birth_date || "1984-01-14";
    const age = useMemo(() => differenceInYears(new Date(), parseLocalDate(birthDate)), [birthDate]);

    const sortedData = [...data].sort((a, b) => b.Date.localeCompare(a.Date));
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
    for (const day of sortedData) { if (day.Steps >= (profile?.target_steps || 8000)) stepsStreak++; else break; }

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
                        />
                    </FadeIn>
                </FadeInStagger>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <FadeIn className="col-span-12 lg:col-span-12">
                    <GoalProjections data={data} profile={profile} />
                </FadeIn>
                <FadeIn className="col-span-12 lg:col-span-12">
                    <AchievementsGallery data={data} profile={profile} />
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
                            <StreakCounter label="Pasos" count={stepsStreak} goal={`Min ${(profile?.target_steps || 8000) / 1000}k`} />
                        </FadeIn>
                    </FadeInStagger>
                </div>
            </div>

            <FadeIn className="grid grid-cols-12 gap-6">
                <MacroDonut data={data} />
            </FadeIn>

            <FadeIn className="grid grid-cols-12 gap-6">
                <StepsChart data={data} profile={profile} />
            </FadeIn>

            <div className="grid grid-cols-12 gap-6">
                <FadeIn className="col-span-12 lg:col-span-4">
                    <BodyHeatmap data={data} />
                </FadeIn>
                <FadeIn className="col-span-12 lg:col-span-8">
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
