import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text } from 'react-native';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { EntriesProvider } from '@/context/EntriesContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function ThemedStack() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Owe Log',
            headerRight: () => (
              <Pressable onPress={() => router.push('/settings')} hitSlop={12}>
                <Text style={{ fontSize: 20 }}>⚙️</Text>
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="add"
          options={{
            title: 'New tab',
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="person/[key]" options={{ title: '' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings', presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <EntriesProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <ThemedStack />
        </CurrencyProvider>
      </ThemeProvider>
    </EntriesProvider>
  );
}
