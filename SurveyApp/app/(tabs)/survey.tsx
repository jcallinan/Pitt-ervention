import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Question } from '@/components/Question';

export default function SurveyScreen() {
  
return (
<View style={styles.container}>
 <FlatList data={[{key: 'Question 1'},
    {key: 'Question 2'},
    {key: 'Question 3'},
    {key: 'Question 4'},
    {key: 'Question 5'},
 ]}
    renderItem={({item}) => <Question questionText={item.key} /> } />
  
</View>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop:22,
    }
})
