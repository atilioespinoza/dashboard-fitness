import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    full_name: string;
    birth_date: string;
    height: number;
    gender: 'Masculino' | 'Femenino' | 'Otro';
    target_weight?: number;
    target_waist?: number;
    target_body_fat?: number;
    target_steps?: number;
}

export const useProfile = (userId?: string) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, birth_date, height, gender, target_weight, target_waist, target_body_fat, target_steps')
                    .eq('id', userId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        console.log("No profile found for user");
                    } else {
                        throw error;
                    }
                }

                if (data) {
                    console.log("Profile fetched successfully for:", userId);
                    setProfile({
                        id: data.id,
                        full_name: data.full_name || '',
                        birth_date: data.birth_date || '1990-01-01',
                        height: data.height || 170,
                        gender: data.gender || 'Masculino',
                        target_weight: data.target_weight,
                        target_waist: data.target_waist,
                        target_body_fat: data.target_body_fat,
                        target_steps: data.target_steps || 8000
                    });
                } else {
                    console.log("No profile record exists in DB for:", userId);
                }
            } catch (err: any) {
                console.error("Error fetching profile from DB:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!userId) return;
        try {
            const payload = {
                id: userId,
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(payload);

            if (error) throw error;

            // Actualizar el estado local inmediatamente
            setProfile(prev => ({
                ...(prev || {
                    id: userId,
                    full_name: '',
                    birth_date: '1990-01-01',
                    height: 170,
                    gender: 'Masculino',
                    target_weight: 85,
                    target_waist: 83,
                    target_body_fat: 13,
                    target_steps: 8000
                }),
                ...updates
            } as UserProfile));

        } catch (err: any) {
            setError(err.message);
            console.error('Error updating profile:', err);
            throw err;
        }
    };

    return { profile, loading, error, updateProfile };
};
