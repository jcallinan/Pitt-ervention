// app/_layout.tsx 
import React from 'react'; 
import { Stack } from 'expo-router'; 
 
export default function Layout() { 
  return ( 
    <Stack> 
      <Stack.Screen name="register" options={{ headerShown: false }} /> 
      <Stack.Screen name="login" options={{ headerShown: false }} /> 
      <Stack.Screen name="index" options={{ headerShown: false }} /> 
      <Stack.Screen name="survey" options={{}} /> 
      <Stack.Screen name="view-entries" options={{}} /> 
    </Stack> 
  ); 
} 