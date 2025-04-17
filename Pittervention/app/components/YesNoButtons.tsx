// components/YesNoButtons.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface YesNoProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

export default function YesNoButtons({ label, value, onValueChange }: YesNoProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.choiceButton, value && styles.choiceButtonSelected]}
          onPress={() => onValueChange(true)}
        >
          <Text style={[styles.choiceText, value && styles.choiceTextSelected]}>Yes</Text>
        </Pressable>
        <Pressable
          style={[styles.choiceButton, !value && styles.choiceButtonSelected]}
          onPress={() => onValueChange(false)}
        >
          <Text style={[styles.choiceText, !value && styles.choiceTextSelected]}>No</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  choiceButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  choiceButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  choiceText: {
    fontSize: 16,
    color: '#333',
  },
  choiceTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
});
