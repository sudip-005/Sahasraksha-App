import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { StationDetailScreen } from '../screens/stations/StationDetailScreen';
import { DiagnosisScreen } from '../screens/diagnosis/DiagnosisScreen';
import { PressureHeartbeatScreen } from '../screens/heartbeat/PressureHeartbeatScreen';
import { MaintenanceScreen } from '../screens/maintenance/MaintenanceScreen';
import { LiveDetectionScreen } from '../screens/live/LiveDetectionScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { DemoModeScreen } from '../screens/demo/DemoModeScreen';
import { EdgeAIScreen } from '../screens/edge/EdgeAIScreen';
import { ValidationScreen } from '../screens/validation/ValidationScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { Colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.header,
        },
        headerTitleStyle: {
          color: Colors.textPrimary,
          fontWeight: '700',
        },
        headerTintColor: Colors.primary,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StationDetail"
        component={StationDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Diagnosis"
        component={DiagnosisScreen}
        options={{ title: 'Explainable AI Root Cause' }}
      />
      <Stack.Screen
        name="PressureHeartbeat"
        component={PressureHeartbeatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Maintenance"
        component={MaintenanceScreen}
        options={{ title: 'Maintenance & Work Orders' }}
      />
      <Stack.Screen
        name="LiveDetection"
        component={LiveDetectionScreen}
        options={{ title: 'Real-Time Telemetry Stream' }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: 'System Analytics' }}
      />
      <Stack.Screen
        name="DemoMode"
        component={DemoModeScreen}
        options={{ title: 'Demo Fault Injector' }}
      />
      <Stack.Screen
        name="EdgeAI"
        component={EdgeAIScreen}
        options={{ title: 'Edge Hardware Telemetry' }}
      />
      <Stack.Screen
        name="Validation"
        component={ValidationScreen}
        options={{ title: 'Holdout Validation' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
};
