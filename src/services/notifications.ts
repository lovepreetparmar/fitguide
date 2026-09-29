import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';
import { canSyncUserToSupabase } from '@/utils/userId';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPrefs {
  workout_reminder: boolean;
  water_reminder: boolean;
  weekly_progress: boolean;
  reminder_time: string;
}

const DEFAULT_PREFS: NotificationPrefs = {
  workout_reminder: true,
  water_reminder: true,
  weekly_progress: true,
  reminder_time: '08:00',
};

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async getPreferences(userId: string): Promise<NotificationPrefs> {
    if (!canSyncUserToSupabase(userId)) return DEFAULT_PREFS;
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('workout_reminder, water_reminder, weekly_progress, reminder_time')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return DEFAULT_PREFS;
    return {
      workout_reminder: data.workout_reminder ?? true,
      water_reminder: data.water_reminder ?? true,
      weekly_progress: data.weekly_progress ?? true,
      reminder_time: data.reminder_time ?? '08:00',
    };
  },

  async savePreferences(userId: string, prefs: Partial<NotificationPrefs>) {
    if (!canSyncUserToSupabase(userId)) {
      throw new Error('Sign in to save notification preferences.');
    }
    const { error } = await supabase.from('notification_preferences').upsert(
      {
        user_id: userId,
        ...DEFAULT_PREFS,
        ...prefs,
      },
      { onConflict: 'user_id' }
    );
    if (error) throw error;
  },

  async scheduleWorkoutReminder(hour = 8, minute = 0) {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to train',
        body: 'Your muscles are recovered — start today’s workout.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  },
};
