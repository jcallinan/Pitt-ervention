import React, { useState } from "react";
import { StyleSheet, Text, View } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

type Props = { questionText: string};

export function Question({questionText}: Props ) {
       const [toggleCheckBox, setToggleCheckBox] = useState(false)

    return (
       <Text style={styles.item}>{questionText}</Text>
    )
}


const styles = StyleSheet.create({
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    }
})

