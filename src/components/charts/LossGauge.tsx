import { Card, CardContent } from '../ui/card';

interface LossGaugeProps {
    weeklyRate: number; // e.g., -0.7
    weeklyDeficit: number; // e.g., 600
}

export function LossGauge({ weeklyRate, weeklyDeficit }: LossGaugeProps) {
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

    return (
        <Card className="col-span-12 md:col-span-6 lg:col-span-4 bg-slate-900 border-slate-800">
            <CardContent className="pt-6 grid grid-cols-2 gap-4 h-full min-h-[160px]">
                <div className="flex flex-col items-center justify-center border-r border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Ritmo de Peso</span>
                    <span className="text-3xl font-bold text-white leading-none">{weeklyRate}</span>
                    <span className="text-[10px] text-slate-500 mt-1">kg / semana</span>
                    <span className="text-[10px] uppercase font-bold mt-1" style={{ color: rateColor }}>{rateText}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Déficit Promedio</span>
                    <span className="text-3xl font-bold text-white leading-none">{weeklyDeficit}</span>
                    <span className="text-[10px] text-slate-500 mt-1">kcal / día</span>
                    <div className="flex flex-col items-center mt-1">
                        <span className="text-[10px] uppercase font-bold" style={{ color: deficitColor }}>
                            {weeklyDeficit < 500 ? "Bajo" : weeklyDeficit > 700 ? "Alto" : "En Meta"}
                        </span>
                        <span className="text-[9px] text-slate-600">Meta: 500-700</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
