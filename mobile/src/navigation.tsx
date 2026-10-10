import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoginScreen, PackageScreen, RegisterScreen} from './screens/AuthScreens';
import {HomeScreen, PropertyScreen, TicketListScreen, CreateTicketScreen, TicketDetailScreen, ProfileScreen, PaymentScreen} from './screens/HomeownerScreens';
import {AdminHomeScreen, AdminTicketScreen} from './screens/AdminScreens';
import {colors} from './theme';

const Auth = createNativeStackNavigator();
const Home = createNativeStackNavigator();
const Admin = createNativeStackNavigator();

const options = {
  headerStyle: {backgroundColor: colors.surface},
  headerTintColor: colors.text,
  headerTitleStyle: {fontWeight: '800' as const},
};

export function AuthNavigator() {
  return <Auth.Navigator screenOptions={options}>
    <Auth.Screen name="Packages" component={PackageScreen} options={{title: 'Choose a plan'}} />
    <Auth.Screen name="Login" component={LoginScreen} options={{title: 'Welcome back'}} />
    <Auth.Screen name="Register" component={RegisterScreen} options={{title: 'Create account'}} />
  </Auth.Navigator>;
}

export function HomeownerNavigator() {
  return <Home.Navigator screenOptions={options}>
    <Home.Screen name="Home" component={HomeScreen} options={{title: 'LPS Home'}} />
    <Home.Screen name="Property" component={PropertyScreen} options={{title: 'My property'}} />
    <Home.Screen name="Tickets" component={TicketListScreen} options={{title: 'My tickets'}} />
    <Home.Screen name="CreateTicket" component={CreateTicketScreen} options={{title: 'New maintenance request'}} />
    <Home.Screen name="TicketDetail" component={TicketDetailScreen} options={{title: 'Ticket'}} />
    <Home.Screen name="Payment" component={PaymentScreen} options={{title: 'Invoice & payment'}} />
    <Home.Screen name="Profile" component={ProfileScreen} options={{title: 'My account'}} />
  </Home.Navigator>;
}

export function AdminNavigator() {
  return <Admin.Navigator screenOptions={options}>
    <Admin.Screen name="AdminHome" component={AdminHomeScreen} options={{title: 'LPS Operations'}} />
    <Admin.Screen name="AdminTicket" component={AdminTicketScreen} options={{title: 'Ticket management'}} />
  </Admin.Navigator>;
}

export {WelcomeNavigator} from './WelcomeNavigator'
// export type AuthStack = {
//   Welcome: undefined;
//   Packages: undefined;
//   Login: undefined;
//   Register: {
//     plan?: string;
//   }
// }