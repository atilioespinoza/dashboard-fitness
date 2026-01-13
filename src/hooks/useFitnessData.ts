import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { MOCK_DATA, FitnessEntry } from '../data/mockData';
// No unnecessary imports here

// Configuration
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRk6d9GUWbA6s8aXgW-TP3A0IBRUYVxMDtheCYTHFQpsZos9ddvBMHOxFz7F5_Ce-BOBPSDvSa08cRz/pub?output=csv";
const USE_MOCK = false; // Toggle this to false to try fetching real data

export const useFitnessData = () => {
    const [data, setData] = useState<FitnessEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (USE_MOCK) {
                setTimeout(() => {
                    setData(MOCK_DATA);
                    setLoading(false);
                }, 800);
                return;
            }

            try {
                const response = await fetch(SHEET_URL);
                if (!response.ok) {
                    console.warn("Failed to fetch live data, falling back to mock data.");
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
                                    // Convert DD-MM-YYYY to YYYY-MM-DD for standard parsing
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

                            console.log("Parsed Data:", parsedData);
                            setData(parsedData);
                            setLoading(false);
                        } catch (e) {
                            console.error("Error parsing data:", e);
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
                console.warn("Network error fetching data, using mock.", err);
                setData(MOCK_DATA);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};
