// Notification service for bill reminders

export const isNotificationSupported = () => {
    return 'Notification' in window;
};

export const requestNotificationPermission = async () => {
    if (!isNotificationSupported()) {
        console.warn('Notifications not supported');
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const hasNotificationPermission = () => {
    if (!isNotificationSupported()) return false;
    return Notification.permission === 'granted';
};

export const showNotification = (title, options = {}) => {
    if (!hasNotificationPermission()) {
        console.warn('Notification permission not granted');
        return null;
    }

    return new Notification(title, {
        icon: '/kharadhu/icon-192.png',
        badge: '/kharadhu/icon-192.png',
        vibrate: [200, 100, 200],
        ...options,
    });
};

export const showReminderNotification = (reminder) => {
    return showNotification(`💰 ${reminder.title}`, {
        body: `Amount: ${reminder.amount ? `MVR ${reminder.amount}` : 'Not specified'}\nDue: Today`,
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
    });
};

// Check for due reminders and show notifications
export const checkDueReminders = (reminders) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueReminders = reminders.filter(r => {
        if (!r.isActive) return false;
        const dueDate = new Date(r.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
    });

    dueReminders.forEach(reminder => {
        showReminderNotification(reminder);
    });

    return dueReminders;
};

// Calculate next due date for recurring reminders
export const getNextDueDate = (currentDueDate, frequency) => {
    const date = new Date(currentDueDate);

    switch (frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
        default:
            return null; // One-time reminder
    }

    return date.toISOString();
};
