// app/view-entries.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable, RefreshControl, Alert } from 'react-native';
import { Link } from 'expo-router';
import { loadEntriesAsync, type SurveyEntry } from './lib/storage';

export default function ViewEntriesScreen() {
  const [data, setData] = useState<SurveyEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const entries = await loadEntriesAsync();
      setData(entries);
    } catch (err: any) {
      Alert.alert('Error loading entries', err?.message ?? String(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>All Entries</Text>

      {data.length === 0 ? (
        <Text style={styles.empty}>No entries found.</Text>
      ) : (
        data.map((item, index) => (
          <View key={item.id ?? index} style={styles.entryItem}>
            <Text style={styles.entryTitle}>
              {index + 1}. {item.date}
            </Text>
            <Text>ACTC: {item.wentToACTC ? 'Yes' : 'No'}</Text>
            <Text>Peer Tutoring: {item.peerTutoring ? 'Yes' : 'No'}</Text>
            <Text>Writing Center: {item.writingCenter ? 'Yes' : 'No'}</Text>
            <Text>Math Center: {item.mathCenter ? 'Yes' : 'No'}</Text>
            <Text>TRIO: {item.trio ? 'Yes' : 'No'}</Text>
            <Text>Faculty Office Hours: {item.facultyOfficeHours ? 'Yes' : 'No'}</Text>
            <Text>Study Group: {item.informalStudyGroup ? 'Yes' : 'No'}</Text>
            <Text>Exercise: {item.exercise}</Text>
            <Text>Meditation: {item.meditation ? 'Yes' : 'No'}</Text>
            <Text>Sleep: {item.sleepHours} hours</Text>
            <Text>TAO: {item.tao ? 'Yes' : 'No'}</Text>
            <Text>TogetherAll: {item.togetherAll ? 'Yes' : 'No'}</Text>
            <Text>Meds: {item.meds}</Text>
            <Text>Therapy: {item.therapy ? 'Yes' : 'No'}</Text>
          </View>
        ))
      )}

      <Link href="/" style={styles.button}>
        <Text style={styles.buttonText}>Back to Main Menu</Text>
      </Link>

      <Pressable style={[styles.button, styles.refreshButton]} onPress={onRefresh}>
        <Text style={styles.buttonText}>Refresh</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  entryItem: {
    backgroundColor: '#FFF',
    padding: 12,
    marginVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  entryTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
