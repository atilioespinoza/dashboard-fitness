import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { Check, X } from 'lucide-react';

interface ConsistencyGridProps {
    data: FitnessEntry[];
}

export function ConsistencyGrid({ data }: ConsistencyGridProps) {
    // Last 7 days
    const last7 = data.slice(-7);

    // Logic for HIT vs MISS
    // Calorie Hit: Calories < TDEE
    const PROTEIN_GOAL = 140;

    return (
        <Card className="col-span-12 lg:col-span-6 bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-100">Consistencia Semanal</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-8 gap-2 text-center text-sm">
                    {/* Header Row */}
                    <div className="text-slate-500 font-medium text-left flex items-center">Métrica</div>
                    {last7.map(day => (
                        <div key={day.Date} className="text-slate-400 font-medium">
                            {format(parseISO(day.Date), 'EEE', { locale: es })}
                        </div>
                    ))}

                    {/* Calorie Row */}
                    <div className="text-slate-300 font-medium text-left flex items-center uppercase text-[10px]">Calorías</div>
                    {last7.map(day => {
                        const hit = day.Calories <= day.TDEE;
                        return (
                            <div key={`cal-${day.Date}`} className="flex justify-center">
                                <div className={cn(
                                    "w-8 h-8 rounded-md flex items-center justify-center",
                                    hit ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                                )}>
                                    {hit ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                                </div>
                            </div>
                        );
                    })}

                    {/* Protein Row */}
                    <div className="text-slate-300 font-medium text-left flex items-center uppercase text-[10px]">Proteínas</div>
                    {last7.map(day => {
                        const hit = day.Protein >= PROTEIN_GOAL;
                        return (
                            <div key={`prot-${day.Date}`} className="flex justify-center">
                                <div className={cn(
                                    "w-8 h-8 rounded-md flex items-center justify-center",
                                    hit ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                                )}>
                                    {hit ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
