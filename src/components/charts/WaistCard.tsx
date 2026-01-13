import { Card, CardContent } from '../ui/card';
import { cn } from "../../lib/utils";

interface WaistCardProps {
    currentWaist: number;
}

export function WaistCard({ currentWaist }: WaistCardProps) {
    const goal = 83;
    const intermediateGoal = 91;
    const start = 100;

    // Calculate progress as a percentage from start (100) to goal (80)
    const progress = Math.min(100, Math.max(0, ((start - currentWaist) / (start - goal)) * 100));

    const isHit = currentWaist <= goal;
    const isIntermediateHit = currentWaist <= intermediateGoal;

    return (
        <Card className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col justify-center bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-medium text-slate-400">Cintura Actual</p>
                        <div className="flex items-baseline mt-1 space-x-2">
                            <span className="text-4xl font-bold text-white">{currentWaist}</span>
                            <span className="text-slate-500 font-medium">cm</span>
                        </div>
                    </div>
                    <div className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-semibold flex flex-col items-end",
                        isHit ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                    )}>
                        <span>{isHit ? "¡Meta Alcanzada!" : `${(currentWaist - goal).toFixed(1)}cm para la meta`}</span>
                        {!isHit && isIntermediateHit && (
                            <span className="text-[10px] opacity-80">Siguiente: Meta Final</span>
                        )}
                        {!isIntermediateHit && (
                            <span className="text-[10px] opacity-80">Siguiente: {intermediateGoal}cm</span>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 font-bold px-0.5">
                        <div className="flex flex-col">
                            <span className="text-slate-600">Inicio</span>
                            <span>{start}cm</span>
                        </div>
                        <div className={cn("flex flex-col items-center transition-colors duration-500", isIntermediateHit ? "text-blue-400" : "text-slate-500")}>
                            <span className="text-slate-600">Intermedio</span>
                            <span>{intermediateGoal}cm</span>
                        </div>
                        <div className={cn("flex flex-col items-end transition-colors duration-500", isHit ? "text-green-400" : "text-slate-500")}>
                            <span className="text-slate-600">Meta</span>
                            <span>{goal}cm</span>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="h-4 w-full bg-slate-800/50 rounded-full p-[2px] shadow-inner overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-1000 rounded-full shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)]",
                                    isHit
                                        ? "bg-gradient-to-r from-blue-600 via-emerald-500 to-green-400"
                                        : isIntermediateHit
                                            ? "bg-gradient-to-r from-blue-600 to-emerald-400"
                                            : "bg-blue-600"
                                )}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        {/* Intermediate Mark */}
                        <div
                            className={cn(
                                "absolute top-0 bottom-0 w-1 rounded-full z-10 transition-colors duration-500",
                                isIntermediateHit ? "bg-white/50" : "bg-slate-700"
                            )}
                            style={{ left: '50%', transform: 'translateX(-50%)' }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
