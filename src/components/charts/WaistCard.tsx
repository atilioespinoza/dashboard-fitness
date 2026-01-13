import { Card, CardContent } from '../ui/card';
import { cn } from "../../lib/utils";

import { FitnessEntry } from '../../data/mockData';
import { format, addDays, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Counter from '../ui/Counter';

interface WaistCardProps {
    currentWaist: number;
    data: FitnessEntry[];
}

export function WaistCard({ currentWaist, data }: WaistCardProps) {
    const goal = 83;
    const intermediateGoal = 91;
    const start = 100;

    // Calculate progress as a percentage from start (100) to goal (80)
    const progress = Math.min(100, Math.max(0, ((start - currentWaist) / (start - goal)) * 100));

    const isHit = currentWaist <= goal;
    const isIntermediateHit = currentWaist <= intermediateGoal;

    // Projection - Global Average
    const sortedData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    const first = sortedData[0];
    const latest = sortedData[sortedData.length - 1];
    const daysDiff = differenceInDays(parseISO(latest.Date), parseISO(first.Date)) || 1;
    const waistRate = (latest.Waist - first.Waist) / daysDiff;

    let estimatedFinalDate = "";
    let estimatedInterDate = "";

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
        <Card className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col justify-center">
            <CardContent className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-wider">Cintura Actual</p>
                        <div className="flex items-baseline mt-0.5 space-x-1.5">
                            <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                                <Counter value={currentWaist} decimals={1} />
                            </span>
                            <span className="text-slate-500 font-medium text-sm">cm</span>
                        </div>
                    </div>
                    <div className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold flex flex-col items-end shadow-sm",
                        isHit ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    )}>
                        <span>{isHit ? "¡MÁXIMA META!" : `${(currentWaist - goal).toFixed(1)}cm para el fin`}</span>
                        {!isHit && (
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] opacity-60 mt-0.5">
                                    Sig: {isIntermediateHit ? "83cm (Meta)" : "91cm (Inter)"}
                                </span>
                                {estimatedFinalDate && (
                                    <span className="text-[8px] font-bold text-blue-500 mt-0.5">
                                        Est: {estimatedFinalDate}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2.5">
                    <div className="flex justify-between text-[9px] uppercase tracking-tighter text-slate-500 font-bold px-0.5">
                        <div className="flex flex-col">
                            <span className="text-slate-400 dark:text-slate-600 opacity-70">Inicio</span>
                            <span className="text-slate-600 dark:text-slate-400">{start}cm</span>
                        </div>
                        <div className={cn("flex flex-col items-center transition-colors duration-500", isIntermediateHit ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600")}>
                            <span className="opacity-70">Intermedia</span>
                            <span>{intermediateGoal}cm</span>
                            {estimatedInterDate && !isIntermediateHit && (
                                <span className="text-[7px] font-bold lowercase opacity-80">{estimatedInterDate}</span>
                            )}
                        </div>
                        <div className={cn("flex flex-col items-end transition-colors duration-500", isHit ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-600")}>
                            <span className="opacity-70">Meta</span>
                            <span>{goal}cm</span>
                            {estimatedFinalDate && !isHit && (
                                <span className="text-[7px] font-bold lowercase opacity-80">{estimatedFinalDate}</span>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/40 rounded-full p-[1.5px] shadow-inner overflow-hidden border border-slate-200 dark:border-slate-800">
                            <div
                                className={cn(
                                    "h-full transition-all duration-1000 rounded-full",
                                    isHit
                                        ? "bg-gradient-to-r from-blue-600 via-emerald-500 to-green-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                                        : isIntermediateHit
                                            ? "bg-gradient-to-r from-blue-600 to-emerald-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                            : "bg-blue-600"
                                )}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        {/* Intermediate Mark */}
                        <div
                            className={cn(
                                "absolute top-0 bottom-0 w-0.5 rounded-full z-10 transition-colors duration-500",
                                isIntermediateHit ? "bg-white/40" : "bg-slate-700"
                            )}
                            style={{ left: '50%', transform: 'translateX(-50%)' }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
