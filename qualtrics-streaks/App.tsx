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
  ScrollView,
  ImageSourcePropType,
  ImageStyle
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConfettiCannon from "react-native-confetti-cannon"; // ⬅️ pure-JS confetti
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

// ---- Config ----
const LINKS = [
  {
    label: "Daily Survey (Mon–Sat • 9 PM)",
    url: "https://pitt.co1.qualtrics.com/jfe/form/SV_6Fh0FQ2anuAEygu",
    key: "daily"
  },
  {
    label: "Sunday Survey (9 PM)",
    url: "https://pitt.co1.qualtrics.com/jfe/form/SV_4JD6znTZTZiBWx8",
    key: "sunday"
  },
  {
    label: "Weekly Journal (Sunday • 9 AM)",
    url: "https://pitt.co1.qualtrics.com/jfe/form/SV_cAMvPV4molbh9Ay",
    key: "journal"
  }
];

const REMINDERS = [
  {
    key: "daily",
    title: "Daily survey reminder",
    body: "It's 9 PM — complete today's Daily Survey to stay on track!",
    hour: 21,
    minute: 0,
    weekdays: [2, 3, 4, 5, 6, 7] // Monday–Saturday
  },
  {
    key: "sunday",
    title: "Sunday survey reminder",
    body: "It's Sunday 9 PM — finish your Sunday Survey.",
    hour: 21,
    minute: 0,
    weekdays: [1] // Sunday
  },
  {
    key: "journal",
    title: "Weekly journal reminder",
    body: "Sunday 9 AM — time for your weekly journal entry.",
    hour: 9,
    minute: 0,
    weekdays: [1] // Sunday morning
  }
];

const STORAGE_KEYS = {
  STATE: "app_state_v1"
};

type AppState = {
  lastActiveDate: string | null;
  streak: number;
  history: Record<string, string[]>;
  notificationsEnabled: boolean;
};

const DEFAULT_STATE: AppState = {
  lastActiveDate: null,
  streak: 0,
  history: {},
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

type PartyArtName = "bee" | "banner" | "balloon" | "cake" | "gift";

const PARTY_ART: Record<PartyArtName, ImageSourcePropType> = {
  bee: require("./assets/party/bee.png"),
  banner: require("./assets/party/banner.png"),
  balloon: require("./assets/party/balloon.png"),
  cake: require("./assets/party/cake.png"),
  gift: require("./assets/party/gift.png")
};

const CHECKIN_ART: Record<string, PartyArtName> = {
  daily: "bee",
  sunday: "balloon",
  journal: "gift"
};

const PROGRESS_ART: Record<string, PartyArtName> = {
  daily: "bee",
  sunday: "balloon",
  journal: "gift"
};

const MILESTONE_ART: Record<number, PartyArtName> = {
  10: "bee",
  25: "balloon",
  50: "cake",
  100: "gift"
};

const PartyArt = ({
  name,
  size = 64,
  accessibilityLabel,
  style
}: {
  name: PartyArtName;
  size?: number;
  accessibilityLabel: string;
  style?: ImageStyle;
}) => (
  <Image
    source={PARTY_ART[name]}
    style={[styles.partyArt, style, { width: size, height: size }]}
    resizeMode="contain"
    accessible
    accessibilityLabel={accessibilityLabel}
  />
);

export default function App() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);

  const loadState = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STATE);
      if (raw) {
        const parsed = JSON.parse(raw);

        const legacyHistory: Record<string, string[]> = (() => {
          if (parsed.history && typeof parsed.history === "object") {
            return Object.keys(parsed.history).reduce<Record<string, string[]>>((acc, key) => {
              const value = parsed.history[key];
              if (Array.isArray(value)) {
                const clean = value.filter((d: unknown) => typeof d === "string");
                if (clean.length > 0) acc[key] = Array.from(new Set(clean));
              }
              return acc;
            }, {});
          }
          if (Array.isArray(parsed.clicks)) {
            const acc: Record<string, string[]> = {};
            parsed.clicks.forEach((item: any) => {
              if (!item || typeof item !== "object") return;
              const key = item.key;
              const ts = item.ts;
              if (typeof key !== "string" || typeof ts !== "number") return;
              const date = toYMD(new Date(ts));
              if (!acc[key]) acc[key] = [];
              if (!acc[key].includes(date)) acc[key].push(date);
            });
            return acc;
          }
          return {};
        })();

        const next: AppState = {
          ...DEFAULT_STATE,
          ...parsed,
          history: legacyHistory,
          notificationsEnabled: parsed.notificationsEnabled ?? DEFAULT_STATE.notificationsEnabled
        };

        setState(next);
      }
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

      await Promise.all(
        REMINDERS.flatMap((reminder) =>
          reminder.weekdays.map((weekday) =>
            Notifications.scheduleNotificationAsync({
              content: {
                title: reminder.title,
                body: reminder.body
              },
              trigger: {
                hour: reminder.hour,
                minute: reminder.minute,
                weekday,
                repeats: true
              }
            })
          )
        )
      );
    };
    ensureScheduled();
  }, [state.notificationsEnabled, loading, saveState]);

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
    if (!loading && milestoneHit) setConfettiTrigger(Date.now()); // update key to re-mount cannon
  }, [milestoneHit, loading]);

  // Shared handlers
  const openLink = useCallback(async (item: { label: string; url: string; key: string }) => {
    await WebBrowser.openBrowserAsync(item.url);

    const today = toYMD(new Date());
    let nextStreak = state.streak;
    let nextLastActive = state.lastActiveDate;

    if (state.lastActiveDate === today) {
      // already counted today
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

    const existingDates = state.history[item.key] || [];
    const alreadyLoggedToday = existingDates.includes(today);
    const nextHistory = alreadyLoggedToday
      ? state.history
      : {
          ...state.history,
          [item.key]: [...existingDates, today]
        };

    const next: AppState = {
      ...state,
      streak: nextStreak,
      lastActiveDate: nextLastActive ?? today,
      history: nextHistory
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
      <PartyArt name="bee" size={108} accessibilityLabel="Bee party icon" style={styles.headerArt} />
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
        <View style={styles.heroNote}>
          <PartyArt
            name="banner"
            size={132}
            accessibilityLabel="Festive celebration banner"
            style={styles.heroBanner}
          />
          <Text style={styles.heroHeadline}>Let's keep the buzz going!</Text>
          <Text style={styles.heroCopy}>Tap a check-in below to stay on your streak.</Text>
        </View>
        {LINKS.map((l) => (
          <Pressable key={l.key} onPress={() => openLink(l)} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
            <View style={styles.cardContent}>
              <PartyArt
                name={CHECKIN_ART[l.key] ?? "bee"}
                size={56}
                accessibilityLabel={`${l.label} celebration icon`}
                style={styles.cardIcon}
              />
              <View style={styles.cardTextGroup}>
                <Text style={styles.cardTitle}>{l.label}</Text>
                <Text style={styles.cardUrl} numberOfLines={1}>{l.url}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  const ScreenReminders = () => (
    <SafeAreaView style={styles.safe}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Reminders</Text>
          <Switch value={state.notificationsEnabled} onValueChange={toggleNotifications} />
        </View>
        <Text style={styles.smallNote}>
          Turn on to receive the following schedule (times shown in your local timezone):
        </Text>
        <View style={styles.reminderList}>
          {REMINDERS.map((reminder) => (
            <View key={reminder.key} style={styles.reminderItem}>
              <Text style={styles.reminderTitle}>{reminder.title}</Text>
              <Text style={styles.reminderBody}>{reminder.body}</Text>
            </View>
          ))}
        </View>
        {Platform.OS === "android" && (
          <Text style={[styles.smallNote, { marginTop: 8 }]}>
            On Android 13+, enable notifications for this app in system settings if prompted.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  const totalUniqueDays = useMemo(() => {
    const set = new Set<string>();
    Object.values(state.history).forEach((dates) => {
      dates.forEach((d) => set.add(d));
    });
    return set.size;
  }, [state.history]);

  const ScreenProgress = () => (
    <SafeAreaView style={styles.safe}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Check-in summary</Text>
        {LINKS.map((link) => {
          const dates = state.history[link.key] || [];
          const last = dates[dates.length - 1];
          return (
            <View key={link.key} style={styles.statCard}>
              <View style={styles.statRow}>
                <PartyArt
                  name={PROGRESS_ART[link.key] ?? "bee"}
                  size={56}
                  accessibilityLabel={`${link.label} progress icon`}
                  style={styles.statIcon}
                />
                <View style={styles.statCopy}>
                  <Text style={styles.statTitle}>{link.label}</Text>
                  <Text style={styles.statValue}>{dates.length} unique day{dates.length === 1 ? "" : "s"}</Text>
                  {last && <Text style={styles.smallNote}>Last completion: {last}</Text>}
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <PartyArt
              name="cake"
              size={56}
              accessibilityLabel="Celebratory cake icon"
              style={styles.statIcon}
            />
            <View style={styles.statCopy}>
              <Text style={styles.statTitle}>Total unique check-in days</Text>
              <Text style={styles.statValue}>{totalUniqueDays}</Text>
              {state.lastActiveDate && (
                <Text style={styles.smallNote}>Most recent day: {state.lastActiveDate}</Text>
              )}
            </View>
          </View>
        </View>

        <Pressable onPress={resetProgress} style={({ pressed }) => [styles.resetBtn, pressed && styles.resetBtnPressed]}>
          <Text style={styles.resetText}>Reset Progress</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );

  const ScreenBadges = () => (
    <SafeAreaView style={styles.safe}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Streak badges</Text>
        {MILESTONES.map((m) => (
          <View key={m} style={styles.milestoneRow}>
            <PartyArt
              name={MILESTONE_ART[m] ?? "gift"}
              size={48}
              accessibilityLabel={`${m}-day streak celebration icon`}
              style={styles.milestoneArt}
            />
            <View style={[styles.badge, state.streak >= m ? styles.badgeActive : styles.badgeInactive]}>
              <Text style={styles.badgeText}>{m}</Text>
            </View>
            <Text style={styles.milestoneText}>
              {state.streak >= m ? "Unlocked!" : "Locked"} — {m}-day streak
            </Text>
          </View>
        ))}
        <Pressable onPress={playEffectsDemo} style={({ pressed }) => [styles.demoBtn, pressed && styles.demoBtnPressed]}>
          <Text style={styles.demoText}>Celebrate with Confetti</Text>
        </Pressable>
      </ScrollView>

      {confettiTrigger > 0 && (
        <ConfettiCannon
          key={confettiTrigger}
          autoStart
          count={120}
          fadeOut
          origin={{ x: 0, y: 0 }}
          fallSpeed={2500}
          explosionSpeed={400}
          onAnimationEnd={() => {}}
        />
      )}
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
            let iconName: keyof typeof Ionicons.glyphMap = "ellipse-outline";
            switch (route.name) {
              case "Check-ins":
                iconName = "link";
                break;
              case "Reminders":
                iconName = "notifications-outline";
                break;
              case "Progress":
                iconName = "stats-chart-outline";
                break;
              case "Badges":
                iconName = "trophy-outline";
                break;
              default:
                iconName = "ellipse-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen name="Check-ins" component={ScreenCheckins} />
        <Tab.Screen name="Reminders" component={ScreenReminders} />
        <Tab.Screen name="Progress" component={ScreenProgress} />
        <Tab.Screen name="Badges" component={ScreenBadges} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220" },
  header: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8, alignItems: "center" },
  headerArt: { marginBottom: 12 },
  partyArt: { shadowColor: "#000", shadowOpacity: 0.25, shadowOffset: { width: 0, height: 8 }, shadowRadius: 12, elevation: 6 },
  title: { fontSize: 22, fontWeight: "700", color: "white", marginBottom: 8, textAlign: "center" },
  streakPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  streakText: { color: "white", fontWeight: "700" },
  muted: { color: "#94a3b8", marginTop: 6 },

  container: { padding: 16, gap: 12 },
  heroNote: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    alignItems: "center"
  },
  heroBanner: { marginBottom: 4 },
  heroHeadline: { color: "#facc15", fontSize: 18, fontWeight: "700" },
  heroCopy: { color: "#e2e8f0", fontSize: 13 },
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937"
  },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 14 },
  cardIcon: { marginRight: 2 },
  cardTextGroup: { flex: 1 },
  cardPressed: { opacity: 0.85 },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 6 },
  cardUrl: { color: "#60a5fa", fontSize: 13 },

  row: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { color: "white", fontSize: 16 },
  smallNote: { color: "#94a3b8", fontSize: 12, marginTop: 4 },

  reminderList: { marginTop: 12, gap: 12 },
  reminderItem: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1f2937"
  },
  reminderTitle: { color: "white", fontWeight: "600", marginBottom: 4 },
  reminderBody: { color: "#cbd5f5", fontSize: 13 },

  sectionTitle: { color: "#cbd5f5", fontSize: 16, fontWeight: "700" },
  statCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937"
  },
  statRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  statIcon: { marginRight: 2 },
  statCopy: { flex: 1 },
  statTitle: { color: "white", fontWeight: "600", marginBottom: 6 },
  statValue: { color: "#60a5fa", fontSize: 18, fontWeight: "700" },

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

  milestoneRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 12 },
  milestoneArt: { marginRight: 2 },
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
