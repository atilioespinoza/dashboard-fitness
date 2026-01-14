import { Achievement } from '../../hooks/useAchievements';
import { Lock } from 'lucide-react';

interface AchievementBadgeProps {
    achievement: Achievement;
}

export const AchievementBadge = ({ achievement }: AchievementBadgeProps) => {
    const { title, description, icon: Icon, color, isUnlocked, progress, goal } = achievement;

    const percentage = Math.min((progress / goal) * 100, 100);

    return (
        <div className={`relative group p-4 rounded-2xl border transition-all duration-500 ${isUnlocked
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none translate-y-0 opacity-100 scale-100 hover:-translate-y-1'
                : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-60 grayscale'
            }`}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl transition-colors duration-500 ${isUnlocked
                        ? `bg-slate-50 dark:bg-slate-800 ${color}`
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600'
                    }`}>
                    <Icon size={24} />
                    {!isUnlocked && (
                        <div className="absolute -top-1 -right-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-full border-2 border-white dark:border-slate-900">
                            <Lock size={10} className="text-slate-500" />
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {description}
                    </p>

                    {!isUnlocked && (
                        <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    )}

                    {isUnlocked && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-green-500 uppercase tracking-wider">
                            Desbloqueado
                        </span>
                    )}
                </div>
            </div>

            {/* Tooltip for larger description on hover if needed */}
            <div className="absolute inset-x-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
                <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg mx-auto w-max shadow-xl">
                    {isUnlocked ? '¡Completado!' : `${progress}/${goal} para completar`}
                </div>
            </div>
        </div>
    );
};
