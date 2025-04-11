// lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://your-backend-url:5000/api'; // Replace with your backend URL

// Helper to get the auth token
const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

// Save a survey entry
export async function saveSurveyDataAsync(newEntry) {
  const token = await getToken();
  const response = await fetch(`${API_URL}/entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(newEntry),
  });

  if (!response.ok) {
    throw new Error('Failed to save survey data');
  }
}

// Load all entries
export async function loadEntriesAsync() {
  const token = await getToken();
  const response = await fetch(`${API_URL}/entries`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load entries');
  }

  return await response.json();
}

// Clear all entries
export async function clearDataAsync() {
  const token = await getToken();
  const response = await fetch(`${API_URL}/entries`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to clear entries');
  }
}

export default {
  saveSurveyDataAsync,
  loadEntriesAsync,
  clearDataAsync,
};