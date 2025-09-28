// app/survey.tsx
import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, TextInput, Alert, Pressable, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { format } from 'date-fns';
import YesNoButtons from './components/YesNoButtons';
import TriButtons from './components/TriButtons';
import FourButtons from './components/FourButtons';
import {
  saveSurveyDataAsync,
  exportSurveyDataAsync,
  clearDataAsync,
  type SurveyEntry,
} from './lib/storage';

export default function SurveyScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const [wentToACTC, setWentToACTC] = useState(false);
  const [peerTutoring, setPeerTutoring] = useState(false);
  const [writingCenter, setWritingCenter] = useState(false);
  const [mathCenter, setMathCenter] = useState(false);
  const [trio, setTrio] = useState(false);
  const [facultyOfficeHours, setFacultyOfficeHours] = useState(false);
  const [informalStudyGroup, setInformalStudyGroup] = useState(false);
  const [exercise, setExercise] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [meditation, setMeditation] = useState(false);
  const [sleepHours, setSleepHours] = useState('0');
  const [tao, setTao] = useState(false);
  const [togetherAll, setTogetherAll] = useState(false);
  const [meds, setMeds] = useState<'yes' | 'no' | 'n/a'>('no');
  const [therapy, setTherapy] = useState(false);

  const handleSubmit = async () => {
    if (busy) return;
    // basic validation
    const sleep = Number(sleepHours);
    if (Number.isNaN(sleep) || sleep < 0 || sleep > 24) {
      Alert.alert('Please enter a valid number of sleep hours (0–24).');
      return;
    }

    setBusy(true);
    try {
      const newEntry: SurveyEntry = {
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
        sleepHours: String(sleep),
        tao,
        togetherAll,
        meds,
        therapy,
      };
      await saveSurveyDataAsync(newEntry);
      Alert.alert('Survey saved successfully!');
      router.push('/'); // back to main menu
    } catch (error: any) {
      Alert.alert('Error saving survey data.', error?.message ?? String(error));
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await exportSurveyDataAsync(); // opens native share sheet → pick OneDrive
      // no alert here; the share sheet UX is the confirmation
    } catch (e: any) {
      Alert.alert('Export failed', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await clearDataAsync();
      Alert.alert('All survey data cleared.');
    } catch (e: any) {
      Alert.alert('Clear failed', e?.message ?? String(e));
    } finally {
      setBusy(false);
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
      <YesNoButtons label="TogetherAll?" value={togetherAll} onValueChange={setTogetherAll} />
      <YesNoButtons label="Therapy this week?" value={therapy} onValueChange={setTherapy} />

      <TriButtons
        label="Meds? (yes/no/n/a)"
        options={['yes', 'no', 'n/a']}
        value={meds}
        onValueChange={(v) => setMeds(v as 'yes' | 'no' | 'n/a')}
      />

      <FourButtons
        label="Exercise? (none/low/medium/high)"
        options={['none', 'low', 'medium', 'high']}
        value={exercise}
        onValueChange={(v) => setExercise(v as 'none' | 'low' | 'medium' | 'high')}
      />

      <Text style={styles.subLabel}>Sleep hours?</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={sleepHours}
        onChangeText={setSleepHours}
      />

      {/* Actions */}
      <Pressable onPress={handleSubmit} disabled={busy} style={[styles.button, busy && styles.buttonDisabled]}>
        <Text style={styles.buttonText}>{busy ? 'Saving…' : 'Submit Survey'}</Text>
      </Pressable>

      <View style={{ height: 8 }} />

      <Pressable onPress={handleExport} disabled={busy} style={[styles.buttonAlt, busy && styles.buttonDisabled]}>
        <Text style={styles.buttonText}>Export to OneDrive</Text>
      </Pressable>

      <View style={{ height: 8 }} />

      <Pressable onPress={handleClear} disabled={busy} style={[styles.buttonDanger, busy && styles.buttonDisabled]}>
        <Text style={styles.buttonText}>Clear All Data</Text>
      </Pressable>

      <Link href="/" style={styles.linkBack}>
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
    width: 100,
    borderRadius: 6,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonAlt: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: '#B91C1C',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkBack: {
    marginTop: 10,
    textAlign: 'center',
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});
