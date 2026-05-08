import { useState, useEffect } from 'react';
import { MOCK_DATA, FitnessEntry } from '../data/mockData';
import { supabase } from '../lib/supabase';

export const useFitnessData = (userId?: string) => {
    const [data, setData] = useState<FitnessEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);
    const [dataSource, setDataSource] = useState<'supabase' | 'mock' | null>(null);

    useEffect(() => {
        const cleanupLegacyDefaultWeights = async () => {
            if (!userId || localStorage.getItem(`legacy_weight_cleanup_v1_${userId}`) === 'true') return;

            const explicitWeightPattern = /(peso|pes[eé]|kg|kilos?|weigh|weight)\s*[:=]?\s*\d|\d+(?:[,.]\d+)?\s*(?:kg|kilos?)/i;
            const { data: rows, error: fetchError } = await supabase
                .from('fitness_logs')
                .select('date, notes')
                .eq('user_id', userId)
                .eq('weight', 80);

            if (fetchError) {
                console.error('[useFitnessData] Legacy weight cleanup fetch error:', fetchError);
                return;
            }

            const candidates = (rows || []).filter(row => !explicitWeightPattern.test(row.notes || ''));
            if (candidates.length > 0) {
                const updates = candidates.map(row => supabase
                    .from('fitness_logs')
                    .update({ weight: null })
                    .eq('user_id', userId)
                    .eq('date', row.date)
                );

                const results = await Promise.all(updates);
                const failed = results.find(result => result.error);
                if (failed?.error) {
                    console.error('[useFitnessData] Legacy weight cleanup update error:', failed.error);
                    return;
                }

                console.log(`[useFitnessData] Cleaned ${candidates.length} legacy default weight rows.`);
            }

            localStorage.setItem(`legacy_weight_cleanup_v1_${userId}`, 'true');
        };

        const fetchData = async () => {
            if (data.length === 0) setLoading(true);

            // 1. Try Supabase if userId is present
            if (userId) {
                try {
                    await cleanupLegacyDefaultWeights();
                    console.log(`[useFitnessData] Fetching strictly from Supabase for: ${userId}`);
                    const { data: supabaseData, error: supabaseError } = await supabase
                        .from('fitness_logs')
                        .select('*')
                        .eq('user_id', userId)
                        .order('date', { ascending: true });

                    if (supabaseError) throw supabaseError;

                    if (supabaseData) {
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

                        console.log(`[useFitnessData] Supabase returned ${mappedData.length} rows.`);
                        setData(mappedData);
                        setDataSource('supabase');
                        setLoading(false);
                        return;
                    }
                } catch (err: any) {
                    console.error("[useFitnessData] Supabase error:", err);
                    setError("Error al cargar datos de Supabase");
                    setLoading(false);
                    return;
                }
            }

            // 2. If no userId or no data, use Mock as preview (or empty)
            // If the user is logged in, we should probably show empty if they have no rows
            if (userId) {
                setData([]);
                setDataSource('supabase');
            } else {
                setData(MOCK_DATA);
                setDataSource('mock');
            }
            setLoading(false);
        };

        fetchData();
    }, [userId, refreshTick]);

    useEffect(() => {
        if (!userId) return;

        console.log(`[useFitnessData] Suscribiendo a cambios en tiempo real para: ${userId}`);

        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'fitness_logs',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('[useFitnessData] Cambio detectado en base de datos:', payload);
                    setRefreshTick(t => t + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return { data, loading, error, dataSource, refresh: () => setRefreshTick(t => t + 1) };
};
