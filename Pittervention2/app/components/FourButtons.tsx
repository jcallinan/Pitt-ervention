import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface FourProps {
  label: string;
  options: string[];
  value: string;
  onValueChange: (val: string) => void;
}

export default function FourButtons({ label, options, value, onValueChange }: FourProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <Pressable
              key={opt}
              style={[styles.choiceButton, selected && styles.choiceButtonSelected]}
              onPress={() => onValueChange(opt)}
            >
              <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
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
