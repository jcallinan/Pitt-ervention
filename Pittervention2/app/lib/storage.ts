// lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MailComposer from 'expo-mail-composer';

export async function saveSurveyDataAsync(newEntry: any) {
  const existing = await AsyncStorage.getItem('surveys');
  const surveys = existing ? JSON.parse(existing) : [];
  surveys.push(newEntry);
  await AsyncStorage.setItem('surveys', JSON.stringify(surveys));
}

export async function loadEntriesAsync() {
  const existing = await AsyncStorage.getItem('surveys');
  return existing ? JSON.parse(existing) : [];
}

export async function clearDataAsync() {
  await AsyncStorage.removeItem('surveys');
}

export async function emailCSVAttachmentAsync() {
  const existing = await AsyncStorage.getItem('surveys');
  if (!existing) throw new Error('No survey data to export.');
  
  const surveys = JSON.parse(existing);
  if (!surveys.length) throw new Error('No survey data to export.');

  // Build CSV string
  const headers = [
    'id', 'date', 'wentToACTC', 'peerTutoring', 'writingCenter', 'mathCenter',
    'trio', 'facultyOfficeHours', 'informalStudyGroup', 'exercise', 'meditation',
    'sleepHours', 'tao', 'togetherAll', 'meds', 'therapy'
  ];
  const csvRows = [headers.join(',')];

  for (const item of surveys) {
    const row = [
      item.id,
      item.date,
      item.wentToACTC,
      item.peerTutoring,
      item.writingCenter,
      item.mathCenter,
      item.trio,
      item.facultyOfficeHours,
      item.informalStudyGroup,
      item.exercise,
      item.meditation,
      item.sleepHours,
      item.tao,
      item.togetherAll,
      item.meds,
      item.therapy,
    ];
    csvRows.push(row.join(','));
  }

  const csvString = csvRows.join('\n');

  // Write CSV to a temp file
  const fileUri = FileSystem.documentDirectory + 'surveyData.csv';
  await FileSystem.writeAsStringAsync(fileUri, csvString, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // Email with attachment
  await MailComposer.composeAsync({
    recipients: ['someone@example.com'],
    subject: 'Survey Data Export',
    body: 'Attached is the CSV data.\n',
    attachments: [fileUri],
  });
}

// Add a default export
export default {
  saveSurveyDataAsync,
  loadEntriesAsync,
  clearDataAsync,
  emailCSVAttachmentAsync,
};