// app/survey.tsx
import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { format } from 'date-fns';
import YesNoButtons from './components/YesNoButtons';
import TriButtons from './components/TriButtons';
import FourButtons from './components/FourButtons';
import { saveSurveyDataAsync } from './lib/storage';

export default function SurveyScreen() {
  const router = useRouter();

  const [wentToACTC, setWentToACTC] = useState(false);
  const [peerTutoring, setPeerTutoring] = useState(false);
  const [writingCenter, setWritingCenter] = useState(false);
  const [mathCenter, setMathCenter] = useState(false);
  const [trio, setTrio] = useState(false);
  const [facultyOfficeHours, setFacultyOfficeHours] = useState(false);
  const [informalStudyGroup, setInformalStudyGroup] = useState(false);
  const [exercise, setExercise] = useState('none'); // 'none','low','medium','high'
  const [meditation, setMeditation] = useState(false);
  const [sleepHours, setSleepHours] = useState('0');
  const [tao, setTao] = useState(false);
  const [togetherAll, setTogetherAll] = useState(false);
  const [meds, setMeds] = useState('no'); // 'yes','no','n/a'
  const [therapy, setTherapy] = useState(false);

  const handleSubmit = async () => {
    try {
      const newEntry = {
        id: Date.now(),
        date: format(new Date(), 'yyyy-MM-dd'),
        wentToACTC,
        peerTutoring,
        writingCenter,
        mathCenter,
        trio,
        facultyOfficeHours,
        informalStudyGroup,
        exercise,
        meditation,
        sleepHours,
        tao,
        togetherAll,
        meds,
        therapy,
      };
      await saveSurveyDataAsync(newEntry);
      Alert.alert('Survey saved successfully!');
      router.push('/'); // back to main menu
    } catch (error) {
      Alert.alert('Error saving survey data.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daily Survey</Text>

      <YesNoButtons label="Went to ACTC?" value={wentToACTC} onValueChange={setWentToACTC} />
      <YesNoButtons label="Peer Tutoring?" value={peerTutoring} onValueChange={setPeerTutoring} />
      <YesNoButtons label="Writing Center?" value={writingCenter} onValueChange={setWritingCenter} />
      <YesNoButtons label="Math Center?" value={mathCenter} onValueChange={setMathCenter} />
      <YesNoButtons label="TRIO?" value={trio} onValueChange={setTrio} />
      <YesNoButtons
        label="Faculty Office Hours?"
        value={facultyOfficeHours}
        onValueChange={setFacultyOfficeHours}
      />
      <YesNoButtons
        label="Informal Study Group?"
        value={informalStudyGroup}
        onValueChange={setInformalStudyGroup}
      />
      <YesNoButtons label="Meditation?" value={meditation} onValueChange={setMeditation} />
      <YesNoButtons label="TAO?" value={tao} onValueChange={setTao} />
      <YesNoButtons
        label="TogetherAll?"
        value={togetherAll}
        onValueChange={setTogetherAll}
      />
      <YesNoButtons
        label="Therapy this week?"
        value={therapy}
        onValueChange={setTherapy}
      />

      <TriButtons
        label="Meds? (yes/no/n/a)"
        options={['yes', 'no', 'n/a']}
        value={meds}
        onValueChange={setMeds}
      />

      <FourButtons
        label="Exercise? (none/low/medium/high)"
        options={['none','low','medium','high']}
        value={exercise}
        onValueChange={setExercise}
      />

      <Text style={styles.subLabel}>Sleep hours?</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={sleepHours}
        onChangeText={setSleepHours}
      />

      {/* A custom clickable text or Pressable for submission */}
      <Text style={styles.submitButton} onPress={handleSubmit}>
        Submit Survey
      </Text>
      <Link href="/" style={styles.submitButton}>
        Cancel / Back
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 22,
    marginVertical: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subLabel: {
    marginTop: 10,
    fontWeight: '600',
  },
  input: {
    borderColor: '#CCC',
    borderWidth: 1,
    padding: 8,
    width: 80,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    marginVertical: 5,
  },
});
