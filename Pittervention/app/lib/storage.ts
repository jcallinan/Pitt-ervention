// lib/storage.ts 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import * as FileSystem from 'expo-file-system'; 
//import * as MailComposer from 'expo-mail-composer'; 
 
const API_URL = 'http://localhost:5000/api'; // Replace with your backend URL 
 
// Helper to get the auth token 
const getToken = async () => { 
  return await AsyncStorage.getItem('token'); 
}; 
 
// Save a survey entry 
export async function saveSurveyDataAsync(newEntry: { id: number; date: string; wentToACTC: boolean; peerTutoring: boolean; writingCenter: boolean; mathCenter: boolean; trio: boolean; facultyOfficeHours: boolean; informalStudyGroup: boolean; exercise: string; meditation: boolean; sleepHours: string; tao: boolean; togetherAll: boolean; meds: string; therapy: boolean; }) { 
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
 
// Export entries as CSV (still handled locally for now) 
export async function exportSurveyDataAsync() { 
  const entries = await loadEntriesAsync(); 
  if (!entries.length) throw new Error('No survey data to export.'); 
 
  const headers = [ 
    'id', 'date', 'wentToACTC', 'peerTutoring', 'writingCenter', 'mathCenter', 
    'trio', 'facultyOfficeHours', 'informalStudyGroup', 'exercise', 'meditation', 
    'sleepHours', 'tao', 'togetherAll', 'meds', 'therapy' 
  ]; 
  const csvRows = [headers.join(',')]; 
 
  for (const item of entries) { 

    const row = [ 
      item.EID, 
      item.date, 
      item.ACTC === 'Y', 
      item.tutoring === 'Y', 
      item.writing === 'Y', 
      item.math === 'Y', 
      item.trio === 'Y', 
      item.officeHours === 'Y', 
      item.studyGroup === 'Y', 
      item.exercise, 
      item.meditation === 'Y', 
      item.sleep, 
      item.tao === 'Y', 
      item.togetherAll === 'Y', 
      item.meds, 
      item.therapy === 'Y', 
    ]; 
    csvRows.push(row.join(',')); 
  } 
 
  const csvString = csvRows.join('\n'); 
  const fileUri = FileSystem.documentDirectory + 'surveyData.csv'; 
 
  await FileSystem.writeAsStringAsync(fileUri, csvString, { 
    encoding: FileSystem.EncodingType.UTF8, 
  }); 
 
} 
 
export default { 
  saveSurveyDataAsync, 
  loadEntriesAsync, 
  clearDataAsync, 
  exportSurveyDataAsync, 
}; 
