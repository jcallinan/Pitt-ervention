// app/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const USERNAME_KEY = 'auth:username';
const PASS_KEY_FOR = (u: string) => `auth:pass:${u}`;

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    const u = username.trim();
    const p = password;

    if (!u || !p) {
      Alert.alert('Please enter a username and password.');
      return;
    }

    try {
      // Optional: prevent overwriting an existing user
      const existingUser = await AsyncStorage.getItem(USERNAME_KEY);
      if (existingUser && existingUser === u) {
        Alert.alert('This username is already registered on this device.');
        return;
      }

      await AsyncStorage.setItem(USERNAME_KEY, u);
      await SecureStore.setItemAsync(PASS_KEY_FOR(u), p, {
        keychainService: 'pittervention.credentials',
      });

      Alert.alert('Registered! Please log in.');
      router.push('/login');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: '#F5F5F5' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: { borderColor: '#CCC', borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: '#FFF' },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 6, alignItems: 'center', marginVertical: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
