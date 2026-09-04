import { Platform } from 'react-native';

const getHost = (): string => {
  if (Platform.OS === 'web') {
    return 'localhost';
  }

  try {
    const ConstantsModule = require('expo-constants');
    const Constants = ConstantsModule?.default || ConstantsModule;
    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest2?.extra?.expoClient?.hostUri ||
      Constants?.manifest?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  } catch {
    // Fall back to workstation LAN IP
  }

  // If running in Android emulator without hostUri
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }

  // Default LAN IP of development workstation (active Wi-Fi: 10.55.118.139, Ethernet: 10.201.201.8)
  return '10.55.118.139';
};

const host = getHost();

export const API_BASE_URL = `http://${host}:8000/api/v1`;
export const WS_BASE_URL = `ws://${host}:8000/api/v1/live`;

export const APP_CONFIG = {
  appName: 'SAHASRAKSHA',
  subtitle: 'IMD Automatic Weather Station Health Monitoring',
  pollingIntervalMs: 15000,
  wsReconnectDelayMs: 3000,
};
