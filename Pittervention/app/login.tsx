// app/login.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const USERNAME_KEY = 'auth:username';
const PASS_KEY_FOR = (u: string) => `auth:pass:${u}`;
const TOKEN_KEY = 'auth:token';
const CURRENT_USER_KEY = 'auth:currentUser';

// simple token generator
const genToken = () => 'tok_' + Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Prefill username if registered already
  useEffect(() => {
    (async () => {
      const savedU = await AsyncStorage.getItem(USERNAME_KEY);
      if (savedU) setUsername(savedU);
    })();
  }, []);

  const handleLogin = async () => {
    const u = username.trim();
    const p = password;

    if (!u || !p) {
      Alert.alert('Please enter a username and password.');
      return;
    }

    try {
      const registeredUser = await AsyncStorage.getItem(USERNAME_KEY);
      if (!registeredUser || registeredUser !== u) {
        Alert.alert('No such user registered on this device. Please register first.');
        return;
      }

      const storedPass = await SecureStore.getItemAsync(PASS_KEY_FOR(u));
      if (!storedPass || storedPass !== p) {
        Alert.alert('Invalid credentials.');
        return;
      }

      // “Log in”: set a simple token + current user
      const token = genToken();
      await AsyncStorage.multiSet([
        [TOKEN_KEY, token],
        [CURRENT_USER_KEY, u],
      ]);

      // If you used lid elsewhere, you can set a placeholder
      // await AsyncStorage.setItem('lid', '1');

      router.push('/');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
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
