import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import WelcomeScreen from './screens/WelcomeScreen';
import {LoginScreen} from './screens/AuthScreens';
import {AuthNavigator} from './navigation';
import GuestTicketScreen from './screens/GuestTicketScreen';


export type WelcomeStackParamList = {
  Welcome: undefined;
  GuestTicket: undefined;
  Login: undefined;
  Packages: undefined;
};

const Stack = createNativeStackNavigator<WelcomeStackParamList>();

export function WelcomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
      />

      <Stack.Screen
        name="GuestTicket"
        component={GuestTicketScreen}
        options={{title: 'Request a Repair'}}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Packages"
        component={AuthNavigator}
      />
    </Stack.Navigator>
  );
}

