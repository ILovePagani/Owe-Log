import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENCY_KEY = '@owe_log_currency_v1';

export async function loadCurrencySymbol(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(CURRENCY_KEY);
    return raw ?? '$';
  } catch {
    return '$';
  }
}

export async function saveCurrencySymbol(symbol: string): Promise<void> {
  await AsyncStorage.setItem(CURRENCY_KEY, symbol);
}
