import React from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {AuthNavigator, HomeownerNavigator, AdminNavigator} from './src/navigation';
import {colors} from './src/theme';
import { WelcomeNavigator } from './src/navigation';

function RootNavigator() {
  const {user} = useAuth();
  if (!user) return <WelcomeNavigator />;
  return user.role === 'admin' ? <AdminNavigator /> : <HomeownerNavigator />;
}

// function RootNavigator() {
//   const {user} = useAuth();
//   if (!user) return <AuthNavigator />;
//   return user.role === 'admin' ? <AdminNavigator /> : <HomeownerNavigator />;
// }

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={{
        fonts: DefaultTheme.fonts,
        dark: false,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}