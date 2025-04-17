// app/register.tsx 
import React, { useState } from 'react'; 
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native'; 
import { useRouter } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
 
const API_URL = 'http://localhost:5000/api'; 
 
export default function RegisterScreen() { 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const router = useRouter(); 
 
  const handleRegister = async () => { 
    try { 
      const response = await fetch(`${API_URL}/auth/register`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
        }, 
        body: JSON.stringify({ username, password }), 
      }); 
 
      const data = await response.json(); 
      if (!response.ok) { 
        throw new Error(data.message || 'Registration failed'); 
      } 

      router.push('/login'); 
    } catch (error) { 
      Alert.alert('Error', error.message); 
    } 
  }; 
 
  return ( 
    <View style={styles.container}> 
      <Text style={styles.title}>Register</Text> 
      <TextInput 
        style={styles.input} 
        placeholder="Username" 
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
        <Text style={styles.buttonText}>Login</Text> 
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
  input: { 
    borderColor: '#CCC', 
    borderWidth: 1, 
    padding: 10, 
    marginBottom: 10, 
    borderRadius: 5, 
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
  




