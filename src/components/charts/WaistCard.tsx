import { Card, CardContent } from '../ui/card';
import { cn } from "../../lib/utils";

import { FitnessEntry } from '../../data/mockData';
import { format, addDays, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Counter from '../ui/Counter';

interface WaistCardProps {
    currentWaist: number;
    data: FitnessEntry[];
    profile: UserProfile | null;
}

import { UserProfile } from '../../hooks/useProfile';

export function WaistCard({ currentWaist, data, profile }: WaistCardProps) {
    const goal = profile?.target_waist || 83;
    const start = 100;
    const intermediateGoal = Math.round(start - ((start - goal) / 2));

    // Calculate progress as a percentage from start (100) to goal (80)
    const progress = currentWaist > 0 ? Math.min(100, Math.max(0, ((start - currentWaist) / (start - goal)) * 100)) : 0;

    const isHit = currentWaist > 0 && currentWaist <= goal;
    const isIntermediateHit = currentWaist > 0 && currentWaist <= intermediateGoal;

    // Projection - Global Average
    const sortedData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    const first = sortedData[0];
    const latest = sortedData[sortedData.length - 1];

    let waistRate = 0;
    if (first && latest && first.Date !== latest.Date) {
        const daysDiff = differenceInDays(parseISO(latest.Date), parseISO(first.Date)) || 1;
        waistRate = (latest.Waist - first.Waist) / daysDiff;
    }

    let estimatedFinalDate = "";
    let estimatedInterDate = "";

    const waistEntries = sortedData.filter(d => d.Waist > 0);
    const prevWaistEntry = waistEntries.length > 1 ? waistEntries[waistEntries.length - 2] : null;

    if (waistRate < 0) {
        if (!isHit) {
            const remainingFinal = currentWaist - goal;
            const daysToFinal = Math.ceil(remainingFinal / Math.abs(waistRate));
            estimatedFinalDate = format(addDays(parseISO(latest.Date), daysToFinal), "MMM yyyy", { locale: es });
        }

        if (!isIntermediateHit) {
            const remainingInter = currentWaist - intermediateGoal;
            const daysToInter = Math.ceil(remainingInter / Math.abs(waistRate));
            estimatedInterDate = format(addDays(parseISO(latest.Date), daysToInter), "MMM yyyy", { locale: es });
        }
    }

    return (
        <Card className="col-span-12 md:col-span-6 lg:col-span-4 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col justify-center">
            <CardContent className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Cintura Actual</p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                    <Counter value={currentWaist} decimals={1} />
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-lg">cm</span>
                            </div>
                        </div>

                        {prevWaistEntry && (
                            <div className="px-1 py-1 border-l-2 border-slate-100 dark:border-white/5 pl-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Medida Anterior</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-lg font-black text-slate-500 dark:text-slate-400 tracking-tighter">
                                        {prevWaistEntry.Waist.toFixed(1)}cm
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase">
                                        {format(parseISO(prevWaistEntry.Date), "d 'de' MMM", { locale: es })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={cn(
                        "px-3 py-2 rounded-2xl text-[10px] font-black flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-md min-w-[100px]",
                        isHit
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    )}>
                        <span className="uppercase tracking-tight leading-none mb-1">{isHit ? "¡OBJETIVO!" : `${(currentWaist - goal).toFixed(1)}cm`}</span>
                        {!isHit && <span className="text-[8px] opacity-60 uppercase font-black tracking-tighter">para la meta</span>}
                        {estimatedFinalDate && !isHit && (
                            <div className="mt-1.5 pt-1.5 border-t border-blue-500/10 w-full text-[8px] font-black text-blue-500 uppercase tracking-widest">
                                {estimatedFinalDate}
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar Labeling */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Inicio</span>
                            <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">{start}cm</span>
                        </div>
                        <div className={cn("flex flex-col items-center gap-0.5 transition-colors duration-500", isIntermediateHit ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600")}>
                            <span className="text-[8px] font-black opacity-70 uppercase tracking-widest text-center">Intermedia<br />{intermediateGoal}cm</span>
                            {estimatedInterDate && !isIntermediateHit && (
                                <span className="text-[7px] font-black uppercase text-blue-500">{estimatedInterDate}</span>
                            )}
                        </div>
                        <div className={cn("flex flex-col items-end gap-0.5 transition-colors duration-500", isHit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600")}>
                            <span className="text-[8px] font-black opacity-70 uppercase tracking-widest">Meta</span>
                            <span className="text-[11px] font-black">{goal}cm</span>
                        </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="relative pt-1">
                        <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 rounded-full p-[2px] shadow-inner overflow-hidden border border-slate-200 dark:border-white/5">
                            <div
                                className={cn(
                                    "h-full transition-all duration-1000 rounded-full relative group",
                                    isHit
                                        ? "bg-gradient-to-r from-blue-600 via-emerald-500 to-green-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                                        : isIntermediateHit
                                            ? "bg-gradient-to-r from-blue-600 to-emerald-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                                            : "bg-gradient-to-r from-blue-700 to-blue-500"
                                )}
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        {/* Milestone Tick */}
                        <div
                            className={cn(
                                "absolute top-0 bottom-0 w-1 rounded-full z-20 transition-colors duration-500 shadow-sm",
                                isIntermediateHit ? "bg-white/80" : "bg-slate-300 dark:bg-slate-700"
                            )}
                            style={{ left: '50%', transform: 'translateX(-50%)', height: '1.5rem', top: '-0.25rem' }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
