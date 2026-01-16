import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRk6d9GUWbA6s8aXgW-TP3A0IBRUYVxMDtheCYTHFQpsZos9ddvBMHOxFz7F5_Ce-BOBPSDvSa08cRz/pub?output=csv";

export const useMigration = () => {
    const [migrating, setMigrating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const migrate = async (userId: string) => {
        setMigrating(true);
        setError(null);
        setProgress(0);

        try {
            // 1. Fetch from Google Sheets
            const response = await fetch(SHEET_URL);
            const csvText = await response.text();

            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: async (results) => {
                        try {
                            const entries = results.data
                                .filter((row: any) => row['Fecha'] && row['Peso (kg)'])
                                .map((row: any) => {
                                    const parts = String(row['Fecha']).split('-');
                                    if (parts.length !== 3) return null;
                                    const [d, m, y] = parts;
                                    const date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

                                    return {
                                        user_id: userId,
                                        date: date,
                                        weight: Number(row['Peso (kg)']),
                                        waist: Number(row['Cintura (cm)']),
                                        body_fat: Number(row['% Grasa']),
                                        calories: Number(row['Calorías Ingeridas']),
                                        protein: Number(row['Proteínas (g)']) || 0,
                                        carbs: Number(row['Carbos (g)']) || 0,
                                        fat: Number(row['Grasas (g)']) || 0,
                                        steps: Number(row['Pasos']),
                                        tdee: Number(row['TDEE']),
                                        sleep: Number(row['Sueño (hrs)']),
                                        notes: String(row['Notas'] || ''),
                                        training: row['Entrenamiento'] ? String(row['Entrenamiento']) : null
                                    };
                                })
                                .filter(item => item !== null);

                            // 2. Insert into Supabase in chunks of 50 to avoid limits
                            const chunkSize = 50;
                            for (let i = 0; i < entries.length; i += chunkSize) {
                                const chunk = entries.slice(i, i + chunkSize);
                                const { error: insertError } = await supabase
                                    .from('fitness_logs')
                                    .upsert(chunk, { onConflict: 'user_id, date' });

                                if (insertError) throw insertError;
                                setProgress(Math.round(((i + chunk.length) / entries.length) * 100));
                            }

                            // 3. Initialize Profile if it doesn't exist
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('id')
                                .eq('id', userId)
                                .single();

                            if (!profile) {
                                await supabase.from('profiles').insert({
                                    id: userId,
                                    full_name: 'Atilio Espinoza', // Default for now
                                    birth_date: '1984-01-14',
                                    height: 179,
                                    gender: 'Masculino'
                                });
                            }

                            setMigrating(false);
                            resolve(true);
                        } catch (e: any) {
                            setError(e.message);
                            setMigrating(false);
                            reject(e);
                        }
                    }
                });
            });
        } catch (e: any) {
            setError(e.message);
            setMigrating(false);
        }
    };

    return { migrate, migrating, progress, error };
};
