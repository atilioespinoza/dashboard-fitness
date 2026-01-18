import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface LogEvent {
    id: string;
    user_id: string;
    date: string;
    created_at: string;
    raw_text: string;
    parsed_data: any;
    type: 'voice' | 'text' | 'manual';
}

export const useLogEvents = (userId?: string, date?: string) => {
    const [events, setEvents] = useState<LogEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        if (!userId || !date) return;

        try {
            const { data, error } = await supabase
                .from('log_events')
                .select('*')
                .eq('user_id', userId)
                .eq('date', date)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();

        // Realtime subscription
        if (!userId) return;
        const channel = supabase
            .channel('log-events-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'log_events',
                    filter: `user_id=eq.${userId}`
                },
                () => fetchEvents()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, date]);

    return { events, loading, refresh: fetchEvents };
};
