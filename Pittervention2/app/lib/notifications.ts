// lib/notifications.ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function requestNotificationPermissionsAsync() {
  if (Platform.OS === 'web') {
    console.log('Skipping notification permissions on web.');
    return;
  }
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) {
    console.log('User did not grant notification permissions.');
  }
}

export async function scheduleDailySurveyAsync() {
  if (Platform.OS === 'web') return;
  // cancelAll to avoid duplicates in dev
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Survey',
      body: 'Please fill out your daily survey!',
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}

export async function scheduleWeeklySurveyAsync() {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Weekly Check-in',
      body: 'Don’t forget your weekly journal or support group!',
    },
    trigger: {
      weekday: 2, // Monday
      hour: 10,
      minute: 0,
      repeats: true,
    },
  });
}
// Add a default export
export default {
  requestNotificationPermissionsAsync,
  scheduleDailySurveyAsync,
  scheduleWeeklySurveyAsync,
};