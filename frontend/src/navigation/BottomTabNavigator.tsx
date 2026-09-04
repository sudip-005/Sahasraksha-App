import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { MapScreen } from '../screens/map/MapScreen';
import { AlertsScreen } from '../screens/alerts/AlertsScreen';
import { StationsScreen } from '../screens/stations/StationsScreen';
import { FloatingTabBar } from '../components/common/FloatingTabBar';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.header,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: Colors.textPrimary,
          fontWeight: '700',
        },
        headerTintColor: Colors.primary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Overview', headerShown: false }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'AWS Map', headerShown: false }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ title: 'Alerts', headerShown: false }}
      />
      <Tab.Screen
        name="Stations"
        component={StationsScreen}
        options={{ title: 'Stations', headerShown: false }}
      />
    </Tab.Navigator>
  );
};
