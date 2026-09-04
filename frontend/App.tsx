import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/theme';

const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.textPrimary,
    border: Colors.border,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={appTheme}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.header} />
      <RootNavigator />
    </NavigationContainer>
  );
}
