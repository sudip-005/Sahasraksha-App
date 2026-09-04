export type RootStackParamList = {
  MainTabs: undefined;
  StationDetail: { stationId: string };
  Diagnosis: { stationId: string };
  PressureHeartbeat: { stationId: string };
  Maintenance: undefined;
  LiveDetection: undefined;
  Analytics: undefined;
  DemoMode: undefined;
  EdgeAI: undefined;
  Validation: undefined;
  Settings: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Map: undefined;
  Alerts: undefined;
  Stations: undefined;
};
