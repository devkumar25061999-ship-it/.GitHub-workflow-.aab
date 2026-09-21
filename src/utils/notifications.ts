import { LocalNotifications } from '@capacitor/local-notifications';

const NOTIFICATION_CHANNEL_ID = 'hourly-alerts';

const alertMessages = [
  { title: 'Papaa ka call 📞', body: 'Dekho 👀 Kya hua jaldi check karo!' },
  { title: 'Mummy ki aawaz 👵', body: 'Dhyaan kidhar hai? Chalo padhai karo! 📚' },
  { title: 'Dekho 👀', body: 'Kahin aap important MCQ notes likhna toh nahi bhoole? 📝' },
  { title: 'Kya hua ❓', body: 'Koi naya quiz try karna hai? App open karo! 🧠' },
  { title: 'Dost ka message 💬', body: 'Bhai! Naya test set complete kiya kya? 🎯' },
  { title: 'Attention Please! 🚨', body: 'Revision time! Chalo notes check karein. 🔍' },
  { title: 'Urgent Alert 🔔', body: 'Kuch naya dimaag mein aaya? Likh lo jaldi! 💡' },
  { title: 'Papaa ka message ✉️', body: 'Ghar kab aaoge? Pehle MCQ quiz complete karo! 🎒' }
];

// Initialize and register notification channel
export async function initNotifications() {
  try {
    const isSupported = await LocalNotifications.checkPermissions();
    if (isSupported.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // Create custom high-priority notification channel with default ringtone
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'Hourly Alerts & Tones',
      description: 'Chime sound and hourly alerts with ringtones',
      importance: 5,
      visibility: 1,
      sound: 'notification_tone' // default system tone or custom sound
    });

    await scheduleHourlyAlerts();
  } catch (error) {
    console.error('Error in initNotifications:', error);
  }
}

// Clear old and schedule new hourly reminders for daytime hours (8 AM to 10 PM)
export async function scheduleHourlyAlerts() {
  try {
    // 1. Cancel existing pending notifications first to avoid duplication
    const pending = await LocalNotifications.getPending();
    if (pending.notifications && pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id }))
      });
    }

    const scheduledList = [];
    let idCounter = 100;

    // Schedule active daytime hours (8 AM to 10 PM)
    for (let hour = 8; hour <= 22; hour++) {
      // Pick message based on hour index to distribute variety
      const msg = alertMessages[hour % alertMessages.length];

      scheduledList.push({
        id: idCounter++,
        title: msg.title,
        body: msg.body,
        largeBody: msg.body,
        channelId: NOTIFICATION_CHANNEL_ID,
        schedule: {
          on: {
            hour: hour,
            minute: 0
          },
          repeats: true,
          allowWhileIdle: true
        },
        sound: 'notification_tone'
      });
    }

    if (scheduledList.length > 0) {
      await LocalNotifications.schedule({
        notifications: scheduledList
      });
      console.log('Successfully scheduled hourly alerts:', scheduledList.length);
    }
  } catch (error) {
    console.error('Failed to schedule alerts:', error);
  }
}

// Helper to manually trigger a test notification instantly
export async function triggerTestNotification() {
  try {
    const msg = alertMessages[Math.floor(Math.random() * alertMessages.length)];
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 999,
          title: msg.title,
          body: msg.body,
          channelId: NOTIFICATION_CHANNEL_ID,
          schedule: { at: new Date(Date.now() + 1000) }, // Trigger after 1 second
          sound: 'notification_tone'
        }
      ]
    });
  } catch (error) {
    console.error('Test notification trigger failed:', error);
  }
}
