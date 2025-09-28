import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  Switch,
  Image,
  ScrollView
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Confetti } from "expo-confetti";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

// ---- Config ----
const LINKS = [
  {
    label: "Daily Survey – Qualtrics",
    url: "https://pitt.co1.qualtrics.com/jfe/form/SV_aeZQnmhtxCA419Q",
    key: "daily"
  },
  {
    label: "Journal Entry – Qualtrics",
    url: "https://pitt.co1.qualtrics.com/jfe/form/SV_cFSR1cwZgP4scse",
    key: "journal"
  }
];

const REMINDER_HOUR = 19; // 7 PM
const REMINDER_MINUTE = 0;

const STORAGE_KEYS = {
  STATE: "app_state_v1"
};

type ClickItem = { ts: number; key: string };

type AppState = {
  lastActiveDate: string | null;
  streak: number;
  clicks: ClickItem[];
  notificationsEnabled: boolean;
};

const DEFAULT_STATE: AppState = {
  lastActiveDate: null,
  streak: 0,
  clicks: [],
  notificationsEnabled: true
};

const MILESTONES = [10, 25, 50, 100];

// Notifications behavior (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

// ---- Date helpers ----
const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const dateDiffInDays = (from: string, to: string) => {
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  const a = new Date(y1, m1 - 1, d1, 0, 0, 0, 0);
  const b = new Date(y2, m2 - 1, d2, 0, 0, 0, 0);
  const diffMs = b.getTime() - a.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

// ---- App Root ----
const Tab = createBottomTabNavigator();

export default function App() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);

  const loadState = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STATE);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const saveState = useCallback(async (next: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(next));
    } catch {}
  }, []);

  useEffect(() => { loadState(); }, [loadState]);

  // Schedule / cancel notifications when toggled
  useEffect(() => {
    if (loading) return;
    const ensureScheduled = async () => {
      if (!state.notificationsEnabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        return;
      }
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Notifications disabled", "Enable notifications in Settings to get daily reminders.");
        const next = { ...state, notificationsEnabled: false };
        setState(next);
        await saveState(next);
        return;
      }
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily check-in",
        body: "Complete your Daily Survey or Journal Entry to keep your streak alive."
        },
        trigger: { hour: REMINDER_HOUR, minute: REMINDER_MINUTE, repeats: true }
      });
    };
    ensureScheduled();
  }, [state.notificationsEnabled, loading, saveState, state]);

  // Streak color + milestone confetti
  const streakColor = useMemo(() => {
    const n = state.streak;
    if (n >= 100) return "#7c3aed";
    if (n >= 50) return "#0ea5e9";
    if (n >= 25) return "#10b981";
    if (n >= 10) return "#f59e0b";
    return "#6b7280";
  }, [state.streak]);

  const milestoneHit = useMemo(() => MILESTONES.includes(state.streak), [state.streak]);
  useEffect(() => {
    if (!loading && milestoneHit) setConfettiTrigger(Date.now());
  }, [milestoneHit, loading]);

  // Shared handlers
  const openLink = useCallback(async (item: { label: string; url: string; key: string }) => {
    await WebBrowser.openBrowserAsync(item.url);

    const today = toYMD(new Date());
    let nextStreak = state.streak;
    let nextLastActive = state.lastActiveDate;

    if (state.lastActiveDate === today) {
      // already counted
    } else if (state.lastActiveDate == null) {
      nextStreak = 1;
      nextLastActive = today;
    } else {
      const gap = dateDiffInDays(state.lastActiveDate, today);
      if (gap === 1) {
        nextStreak = state.streak + 1;
        nextLastActive = today;
      } else if (gap <= 0) {
        nextLastActive = today;
      } else {
        nextStreak = 1;
        nextLastActive = today;
      }
    }

    const next: AppState = {
      ...state,
      streak: nextStreak,
      lastActiveDate: nextLastActive!,
      clicks: [...state.clicks, { ts: Date.now(), key: item.key }]
    };
    setState(next);
    await saveState(next);
  }, [state, saveState]);

  const toggleNotifications = useCallback(async (value: boolean) => {
    const next = { ...state, notificationsEnabled: value };
    setState(next);
    await saveState(next);
  }, [state, saveState]);

  const resetProgress = useCallback(() => {
    Alert.alert("Reset progress?", "This will reset your streak and local click history.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset", style: "destructive", onPress: async () => {
          setState(DEFAULT_STATE);
          await saveState(DEFAULT_STATE);
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
      }
    ]);
  }, [saveState]);

  const playEffectsDemo = useCallback(() => setConfettiTrigger(Date.now()), []);

  // Header (logo + streak pill)
  const Header = () => (
    <View style={styles.header}>
      <Image source={require("./assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>UPB Wellness Check-ins</Text>
      <View style={[styles.streakPill, { backgroundColor: streakColor }]}>
        <Text style={styles.streakText}>🔥 Streak: {state.streak} day{state.streak === 1 ? "" : "s"}</Text>
      </View>
      {state.lastActiveDate && <Text style={styles.muted}>Last check-in: {state.lastActiveDate}</Text>}
    </View>
  );

  // Screens
  const ScreenCheckins = () => (
    <SafeAreaView style={styles.safe}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        {LINKS.map((l) => (
          <Pressable key={l.key} onPress={() => openLink(l)} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
            <Text style={styles.cardTitle}>{l.label}</Text>
            <Text style={styles.cardUrl} numberOfLines={1}>{l.url}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  const ScreenReminders = () => (
    <SafeAreaView style={styles.safe}>
      <Header />
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Daily reminder</Text>
          <Switch value={state.notificationsEnabled} onValueChange={toggleNotifications} />
        </View>
        <Text style={styles.smallNote}>
          Reminder at {String(REMINDER_HOUR).padStart(2, "0")}:{String(REMINDER_MINUTE).padStart(2, "0")} daily. (Local time)
        </Text>
        {Platform.OS === "android" && (
          <Text style={[styles.smallNote, { marginTop: 8 }]}>
            On Android 13+, enable notifications for this app in system settings if prompted.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );

  const ScreenProgress = () => (
    <SafeAreaView style={styles.safe}>
      <Header />
      <View style={styles.container}>
        <Pressable onPress={playEffectsDemo} style={({ pressed }) => [styles.demoBtn, pressed && styles.demoBtnPressed]}>
          <Text style={styles.demoText}>Play Effects Demo</Text>
        </Pressable>

        <Pressable onPress={resetProgress} style={({ pressed }) => [styles.resetBtn, pressed && styles.resetBtnPressed]}>
          <Text style={styles.resetText}>Reset Progress</Text>
        </Pressable>

        {MILESTONES.map((m) => (
          <View key={m} style={styles.milestoneRow}>
            <View style={[styles.badge, state.streak >= m ? styles.badgeActive : styles.badgeInactive]}>
              <Text style={styles.badgeText}>{m}</Text>
            </View>
            <Text style={styles.milestoneText}>
              {state.streak >= m ? "Unlocked!" : "Locked"} — milestone {m}
            </Text>
          </View>
        ))}
      </View>

      {/* Confetti for milestones & demo */}
      {confettiTrigger > 0 && <Confetti count={120} fadeOut duration={3000} />}
    </SafeAreaView>
  );

  const navTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: "#0b1220", card: "#0b1220", text: "#fff", border: "#1f2937" }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Text style={styles.muted}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: "#0b1220", borderTopColor: "#1f2937" },
          tabBarActiveTintColor: "#60a5fa",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarIcon: ({ color, size }) => {
            const name =
              route.name === "Check-ins" ? "link" :
              route.name === "Reminders" ? "notifications-outline" :
              "trophy-outline";
            return <Ionicons name={name as any} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen name="Check-ins" component={ScreenCheckins} />
        <Tab.Screen name="Reminders" component={ScreenReminders} />
        <Tab.Screen name="Progress" component={ScreenProgress} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220" },
  header: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8, alignItems: "center" },
  logo: { width: 108, height: 108, marginBottom: 8, borderRadius: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "white", marginBottom: 8, textAlign: "center" },
  streakPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  streakText: { color: "white", fontWeight: "700" },
  muted: { color: "#94a3b8", marginTop: 6 },

  container: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937"
  },
  cardPressed: { opacity: 0.85 },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 6 },
  cardUrl: { color: "#60a5fa", fontSize: 13 },

  row: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { color: "white", fontSize: 16 },
  smallNote: { color: "#94a3b8", fontSize: 12, marginTop: 4 },

  demoBtn: {
    marginTop: 6,
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#2563eb"
  },
  demoBtnPressed: { opacity: 0.9 },
  demoText: { color: "white", fontWeight: "700" },

  resetBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#b91c1c"
  },
  resetBtnPressed: { opacity: 0.9 },
  resetText: { color: "white", fontWeight: "700" },

  milestoneRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 10 },
  badge: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center"
  },
  badgeActive: { backgroundColor: "#16a34a" },
  badgeInactive: { backgroundColor: "#374151" },
  badgeText: { color: "white", fontWeight: "800" },
  milestoneText: { color: "white" },

  center: { alignItems: "center", justifyContent: "center" }
});
