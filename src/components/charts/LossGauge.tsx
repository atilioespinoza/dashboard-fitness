import { Card, CardContent } from '../ui/card';

interface LossGaugeProps {
    weeklyRate: number; // e.g., -0.7
    weeklyDeficit: number; // e.g., 600
    totalDeficit: number;
    fatLoss: number;
}

export function LossGauge({ weeklyRate, weeklyDeficit, totalDeficit, fatLoss }: LossGaugeProps) {
    let rateColor = "#10b981"; // green
    let rateText = "Ideal";

    if (weeklyRate < -1.0) {
        rateColor = "#ef4444"; // red/too fast
        rateText = "Muy Rápido";
    } else if (weeklyRate > 0) {
        rateColor = "#ef4444"; // red/gain
        rateText = "Subiendo";
    } else if (weeklyRate > -0.2) {
        rateColor = "#f59e0b"; // yellow/stall
        rateText = "Estancado";
    }

    const isDeficitGoalMet = weeklyDeficit >= 500 && weeklyDeficit <= 700;
    const deficitColor = isDeficitGoalMet ? "#10b981" : "#f59e0b";

    // Milestone calculation for fat loss (theoretical)
    const nextKiloProgress = (fatLoss % 1) * 100;

    return (
        <Card className="col-span-12 md:col-span-6 lg:col-span-4 bg-slate-900 border-slate-800">
            <CardContent className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center border-r border-slate-800 pr-2">
                        <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 mb-1">Ritmo de Peso</span>
                        <span className="text-2xl md:text-3xl font-bold text-white leading-none">{weeklyRate}</span>
                        <span className="text-[9px] md:text-[10px] text-slate-500 mt-1 uppercase">kg / semana</span>
                        <span className="text-[9px] md:text-[10px] uppercase font-bold mt-1" style={{ color: rateColor }}>{rateText}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-2">
                        <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 mb-1">Déficit Promedio</span>
                        <span className="text-2xl md:text-3xl font-bold text-white leading-none">{weeklyDeficit}</span>
                        <span className="text-[9px] md:text-[10px] text-slate-500 mt-1 uppercase">kcal / día</span>
                        <div className="flex flex-col items-center mt-1">
                            <span className="text-[9px] md:text-[10px] uppercase font-bold" style={{ color: deficitColor }}>
                                {weeklyDeficit < 500 ? "Bajo" : weeklyDeficit > 700 ? "Alto" : "En Meta"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cumulative Deficit Row */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 block">Déficit Acumulado</span>
                            <span className="text-xl font-bold text-white">{totalDeficit.toLocaleString()} <span className="text-xs text-slate-500 font-medium tracking-normal lowercase">kcal</span></span>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] md:text-[10px] uppercase font-black text-blue-500 block">Grasa Teórica</span>
                            <span className="text-xl font-black text-blue-400">-{fatLoss} <span className="text-xs font-bold lowercase">kg</span></span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase font-bold text-slate-600">
                            <span>Kilo Actual</span>
                            <span>Próximo Kilo ({nextKiloProgress.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                style={{ width: `${nextKiloProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
