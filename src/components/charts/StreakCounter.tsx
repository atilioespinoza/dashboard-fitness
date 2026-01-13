import { Card, CardContent } from '../ui/card';
import { Flame } from 'lucide-react';

interface StreakProps {
    label: string;
    count: number;
    goal?: string;
}

export function StreakCounter({ label, count, goal }: StreakProps) {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-3 md:p-4 flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 rounded-full bg-orange-500/10 text-orange-500 shrink-0">
                    <Flame size={20} className="md:w-6 md:h-6" />
                </div>
                <div className="min-w-0">
                    <div className="text-xl md:text-2xl font-bold text-slate-100 leading-none">{count}</div>
                    <div className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-tight md:tracking-wider mt-1 truncate">Racha {label}</div>
                    {goal && (
                        <div className="text-[8px] md:text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                            Meta: {goal}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
