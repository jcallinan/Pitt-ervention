// app/view-entries.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { loadEntriesAsync } from './lib/storage';

export default function ViewEntriesScreen() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Load the stored surveys from AsyncStorage
    loadEntriesAsync().then((entries) => {
      setData(entries);
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>All Entries</Text>
      {data.length === 0 ? (
        <Text>No entries found.</Text>
      ) : (
        data.map((item, index) => (
          <View key={item.id || index} style={styles.entryItem}>
            <Text>
              {index + 1}. Date: {item.date} | ACTC: {item.wentToACTC ? 'Yes' : 'No'} |
              Peer Tutoring: {item.peerTutoring ? 'Yes' : 'No'} 
              {/* Add more fields as needed */}
            </Text>
          </View>
        ))
      )}
      <Link href="/" style={styles.button}>
        <Text style={styles.buttonText}>Back to Main Menu</Text>
      </Link>
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
  entryItem: {
    backgroundColor: '#FFF',
    padding: 10,
    marginVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
