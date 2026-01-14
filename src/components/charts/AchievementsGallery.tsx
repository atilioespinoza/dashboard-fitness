import { useAchievements } from '../../hooks/useAchievements';
import { FitnessEntry } from '../../data/mockData';
import { AchievementBadge } from '../ui/AchievementBadge';
import { Trophy, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

interface AchievementsGalleryProps {
    data: FitnessEntry[];
}

export const AchievementsGallery = ({ data }: AchievementsGalleryProps) => {
    const achievements = useAchievements(data);
    const prevUnlockedCount = useRef<number>(0);

    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    const totalCount = achievements.length;
    const progressPercent = Math.round((unlockedCount / totalCount) * 100);

    useEffect(() => {
        // Trigger confetti if a new achievement was unlocked since last render
        // In a real app, this might be stored in localStorage or a DB
        const currentUnlockedCount = achievements.filter(a => a.isUnlocked).length;

        if (currentUnlockedCount > prevUnlockedCount.current && prevUnlockedCount.current !== 0) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
            });
        }

        prevUnlockedCount.current = currentUnlockedCount;
    }, [achievements]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Trophy className="text-yellow-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Logros y Reconocimientos</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tu camino a la victoria tiene recompensas</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="space-y-1 min-w-[120px]">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                            <span className="text-slate-500">Progreso Total</span>
                            <span className="text-blue-500">{progressPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
                        <CheckCircle2 size={16} className="text-blue-500" />
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                            {unlockedCount}/{totalCount}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
            </div>
        </div>
    );
};
