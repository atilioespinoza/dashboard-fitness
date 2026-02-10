import { Card, CardContent } from '../ui/card';
import Counter from '../ui/Counter';

interface LossGaugeProps {
    weeklyRate: number; // e.g., -0.7
    weeklyDeficit: number; // e.g., 600
    totalDeficit: number;
    fatLoss: number;
    isStagnant: boolean;
    isRecomp: boolean;
    fatLossGoal?: number;
}

export function LossGauge({ weeklyRate, weeklyDeficit, totalDeficit, fatLoss, isStagnant, isRecomp, fatLossGoal }: LossGaugeProps) {
    let rateColor = "#10b981"; // green
    let rateText = "Ideal";

    if (isRecomp) {
        rateColor = "#8b5cf6"; // purple for recomposition
        rateText = "Recomposición";
    } else if (isStagnant) {
        rateColor = "#f59e0b"; // yellow
        rateText = "Estancado";
    } else if (weeklyRate < -1.0) {
        rateColor = "#ef4444"; // red/too fast
        rateText = "Muy Rápido";
    } else if (weeklyRate > 0) {
        rateColor = "#ef4444"; // red/gain
        rateText = "Subiendo";
    } else if (weeklyRate > -0.2) {
        rateColor = "#f59e0b"; // yellow/stall
        rateText = "Estable";
    }

    const isDeficitGoalMet = weeklyDeficit >= 500 && weeklyDeficit <= 700;
    const deficitColor = isDeficitGoalMet ? "#10b981" : "#f59e0b";

    // Milestone calculation for fat loss (theoretical)
    const nextKiloProgress = (fatLoss % 1) * 100;

    return (
        <Card className="col-span-12 md:col-span-6 lg:col-span-4 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col justify-center">
            <CardContent className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-2">
                    <div className="flex flex-col items-center justify-center border-r border-slate-200 dark:border-white/5 pr-4">
                        <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2 tracking-widest text-center">Ritmo de Peso</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                                <Counter value={weeklyRate} decimals={1} />
                            </span>
                        </div>
                        <span className="text-[8px] md:text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">kg / semana</span>
                        <div className="mt-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm" style={{ backgroundColor: `${rateColor}20`, color: rateColor, border: `1px solid ${rateColor}30` }}>
                            {rateText}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-4">
                        <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2 tracking-widest text-center">Déficit Diario</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                                <Counter value={weeklyDeficit} />
                            </span>
                        </div>
                        <span className="text-[8px] md:text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">kcal / día</span>
                        <div className="mt-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm" style={{ backgroundColor: `${deficitColor}20`, color: deficitColor, border: `1px solid ${deficitColor}30` }}>
                            {weeklyDeficit < 500 ? "Bajo" : weeklyDeficit > 700 ? "Alto" : "En Meta"}
                        </div>
                    </div>
                </div>

                {/* Cumulative Deficit Row */}
                <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Déficit Acumulado</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    <Counter value={totalDeficit} />
                                </span>
                                <span className="text-[10px] font-black text-slate-500 uppercase">kcal</span>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <span className="text-[9px] md:text-[10px] font-black uppercase text-blue-500 tracking-widest">Grasa Teórica</span>
                            <div className="flex items-baseline justify-end gap-1.5">
                                <span className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                                    -<Counter value={Math.abs(fatLoss)} decimals={2} />
                                </span>
                                <span className="text-[10px] font-black text-blue-500 uppercase">kg</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                <span className="text-slate-400 dark:text-slate-600">Kilo Actual</span>
                                <span className="text-blue-500/80">Próximo Kilo • {nextKiloProgress.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full p-[1px] overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-700 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                                    style={{ width: `${nextKiloProgress}%` }}
                                />
                            </div>
                        </div>

                        {fatLossGoal && fatLossGoal > 0 && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400 dark:text-slate-600">Meta % Grasa</span>
                                    <span className="text-emerald-500">Faltan {Math.max(0, fatLossGoal - fatLoss).toFixed(2)} kg • {Math.max(0, Math.min(100, (fatLoss / fatLossGoal) * 100)).toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full p-[1px] overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                                        style={{ width: `${Math.max(0, Math.min(100, (fatLoss / fatLossGoal) * 100))}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
