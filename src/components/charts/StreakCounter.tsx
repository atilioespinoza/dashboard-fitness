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
            <CardContent className="p-4 flex items-center space-x-4">
                <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                    <Flame size={24} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-100">{count}</div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Racha de {label}</div>
                    {goal && (
                        <div className="text-[10px] text-slate-500 font-medium mt-1">
                            Meta: {goal}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
