// app/index.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { clearDataAsync, emailCSVAttachmentAsync } from './lib/storage';

export default function HomeScreen() {
  const router = useRouter();

  const handleClear = async () => {
    await clearDataAsync();
    Alert.alert('Database cleared successfully.');
  };

  const handleEmail = async () => {
    try {
      await emailCSVAttachmentAsync();
      Alert.alert('CSV emailed successfully!');
    } catch (error) {
      Alert.alert('Error exporting CSV', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Menu</Text>

      <Pressable style={styles.button} onPress={() => router.push('/view-entries')}>
        <Text style={styles.buttonText}>View Entries</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => router.push('/survey')}>
        <Text style={styles.buttonText}>Add New Survey Entry</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleClear}>
        <Text style={styles.buttonText}>Clear All Entries</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleEmail}>
        <Text style={styles.buttonText}>Email Entries as CSV</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});