import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FitnessEntry } from '../../data/mockData';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquareText } from 'lucide-react';

interface NotesListProps {
    data: FitnessEntry[];
}

export function NotesList({ data }: NotesListProps) {
    // Last 5 entries with notes
    const notes = data
        .slice()
        .reverse()
        .filter(d => d.Notes && d.Notes.length > 0)
        .slice(0, 5);

    return (
        <Card className="col-span-12 lg:col-span-4">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Notas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {notes.map((entry, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <MessageSquareText size={16} className="text-slate-400 dark:text-slate-500 mt-1 shrink-0" />
                            <div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mb-0.5 uppercase">{format(parseISO(entry.Date), 'dd MMM', { locale: es })}</div>
                                <div className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{entry.Notes}</div>
                            </div>
                        </div>
                    ))}
                    {notes.length === 0 && (
                        <div className="text-center text-slate-500 py-8 text-sm">No se encontraron notas recientes.</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
