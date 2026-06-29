# Owe Log

A lightweight, offline app for tracking who owes who money between friends. No accounts, no sign-in — everything stays on your device.

## Features

- Add tabs with person, amount, note, and direction (they owe me / I owe them)
- Home screen summary per person with net balance
- Person detail with full history
- One-tap settle; archive settled entries (never deleted)
- Share summary text from person screen
- Soft green / terracotta color system

## Requirements

- [Node.js](https://nodejs.org/) 18+ (includes `npm` / `npx`)
- [Expo Go](https://expo.dev/go) on your phone, or Xcode / Android Studio for simulators

## Setup

```bash
cd ~/Projects/owe-log
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Project structure

```
app/           Expo Router screens (home, add, person detail)
components/    UI building blocks
context/       Entries state + AsyncStorage sync
storage/       Persistence layer
utils/         Balance math, ids, formatting
constants/     Theme colors and spacing
```

## Tech

- React Native + Expo SDK 54 (matches current Expo Go)
- Expo Router for navigation
- `@react-native-async-storage/async-storage` for local data
- `expo-haptics` for settle feedback

## Optional next steps

- Swipe to settle (`react-native-gesture-handler`)
- Local notification nudge after 7 days unsettled (`expo-notifications`)
- Copy-to-clipboard on share (`expo-clipboard`)
