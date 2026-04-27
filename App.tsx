import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StoreProvider } from './src/store/notificationStore';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <StoreProvider>
        <AppNavigator />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
