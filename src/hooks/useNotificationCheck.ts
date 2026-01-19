import { useEffect } from 'react';
import { FitnessEntry } from '../data/mockData';
import { UserProfile } from './useProfile';
import { scheduleProteinReminder } from '../lib/notifications';

export const useNotificationCheck = (data: FitnessEntry[], profile: UserProfile | null) => {
    useEffect(() => {
        if (!profile?.notifications_enabled || data.length === 0) return;

        // Get today's data (last entry in sorted data or latest by date)
        const sortedData = [...data].sort((a, b) => b.Date.localeCompare(a.Date));
        const today = sortedData[0];

        if (today) {
            const currentProtein = today.Protein || 0;
            const targetProtein = 140; // Hardcoded for now, could be in profile later

            scheduleProteinReminder(currentProtein, targetProtein);
        }
    }, [data, profile]);
};
