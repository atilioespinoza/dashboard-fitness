import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { MOCK_DATA, FitnessEntry } from '../data/mockData';
import { supabase } from '../lib/supabase';

// Configuration
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRk6d9GUWbA6s8aXgW-TP3A0IBRUYVxMDtheCYTHFQpsZos9ddvBMHOxFz7F5_Ce-BOBPSDvSa08cRz/pub?output=csv";
const USE_MOCK = false;

export const useFitnessData = (userId?: string) => {
    const [data, setData] = useState<FitnessEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            if (USE_MOCK) {
                setTimeout(() => {
                    setData(MOCK_DATA);
                    setLoading(false);
                }, 800);
                return;
            }

            // 1. Try Supabase first if userId is present
            if (userId) {
                try {
                    const { data: supabaseData, error: supabaseError } = await supabase
                        .from('fitness_logs')
                        .select('*')
                        .eq('user_id', userId)
                        .order('date', { ascending: true });

                    if (supabaseError) throw supabaseError;

                    if (supabaseData && supabaseData.length > 0) {
                        const mappedData: FitnessEntry[] = supabaseData.map(row => ({
                            Date: row.date,
                            Weight: row.weight,
                            Waist: row.waist,
                            BodyFat: row.body_fat,
                            Calories: row.calories,
                            Protein: row.protein,
                            Carbs: row.carbs,
                            Fat: row.fat,
                            Steps: row.steps,
                            TDEE: row.tdee,
                            Sleep: row.sleep,
                            Notes: row.notes || '',
                            Training: row.training || undefined
                        }));
                        setData(mappedData);
                        setLoading(false);
                        return;
                    }
                } catch (err: any) {
                    console.error("Supabase fetch error:", err);
                    // Fallback to sheets if supabase fails or is empty
                }
            }

            // 2. Fallback to Google Sheets
            try {
                const response = await fetch(SHEET_URL);
                if (!response.ok) {
                    setData(MOCK_DATA);
                    setLoading(false);
                    return;
                }

                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        try {
                            const parsedData: FitnessEntry[] = results.data
                                .filter((row: any) => row['Fecha'] && row['Peso (kg)'])
                                .map((row: any) => {
                                    const parts = String(row['Fecha']).split('-');
                                    if (parts.length !== 3) return null;

                                    const [d, m, y] = parts;
                                    const normalizedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

                                    const entry: FitnessEntry = {
                                        Date: normalizedDate,
                                        Weight: Number(row['Peso (kg)']),
                                        Waist: Number(row['Cintura (cm)']),
                                        BodyFat: Number(row['% Grasa']),
                                        Calories: Number(row['Calorías Ingeridas']),
                                        Protein: Number(row['Proteínas (g)']) || 0,
                                        Carbs: Number(row['Carbos (g)']) || 0,
                                        Fat: Number(row['Grasas (g)']) || 0,
                                        Steps: Number(row['Pasos']),
                                        TDEE: Number(row['TDEE']),
                                        Sleep: Number(row['Sueño (hrs)']),
                                        Notes: String(row['Notas'] || ''),
                                        Training: row['Entrenamiento'] ? String(row['Entrenamiento']) : undefined
                                    };
                                    return entry;
                                })
                                .filter((item): item is FitnessEntry => item !== null);

                            setData(parsedData);
                            setLoading(false);
                        } catch (e) {
                            setError("Error processing data format");
                            setLoading(false);
                        }
                    },
                    error: (err: Error) => {
                        setError(err.message);
                        setLoading(false);
                    }
                });
            } catch (err) {
                setData(MOCK_DATA);
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, refreshTick]);

    return { data, loading, error, refresh: () => setRefreshTick(t => t + 1) };
};
