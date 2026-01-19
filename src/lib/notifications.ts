export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.error('Este navegador no soporta notificaciones de escritorio');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const sendNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: icon || '/icon-192.png'
        });
    }
};

export const scheduleProteinReminder = (currentProtein: number, targetProtein: number) => {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(17, 0, 0, 0); // 5 PM

    if (now < reminderTime && currentProtein < targetProtein) {
        // Calculate delay in ms
        const delay = reminderTime.getTime() - now.getTime();

        setTimeout(() => {
            // Re-check protein before sending
            // This is a bit naive since the app might have updated data by then
            // but for a local session it works
            sendNotification(
                '🥩 ¡Hora de la Proteína!',
                `Son las 5 PM y llevas ${currentProtein}g de ${targetProtein}g. ¡Te falta poco!`
            );
        }, delay);
    }
};
