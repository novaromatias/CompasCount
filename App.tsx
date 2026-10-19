import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/theme/colors';
import { AuthProvider } from './src/context/AuthContext';

// Screens
import { GroupsListScreen } from './src/screens/GroupsListScreen';
import { GroupDetailScreen } from './src/screens/GroupDetailScreen';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { CreateGroupScreen } from './src/screens/CreateGroupScreen';

const Stack = createNativeStackNavigator();

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.textPrimary,
    border: colors.cardBorder,
    notification: colors.primary,
  },
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={DarkTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="GroupsList"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="GroupsList" component={GroupsListScreen} />
          <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
          <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
