import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { EntriesProvider } from '@/context/EntriesContext';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <EntriesProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Owe Log' }} />
        <Stack.Screen
          name="add"
          options={{
            title: 'New tab',
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="person/[key]" options={{ title: '' }} />
      </Stack>
    </EntriesProvider>
  );
}
