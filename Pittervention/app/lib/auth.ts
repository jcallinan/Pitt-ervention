// app/lib/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth:token';
const CURRENT_USER_KEY = 'auth:currentUser';

export async function isLoggedIn() {
  const t = await AsyncStorage.getItem(TOKEN_KEY);
  const u = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return Boolean(t && u);
}

export async function logout() {
  await AsyncStorage.multiRemove([TOKEN_KEY, CURRENT_USER_KEY]);
}
