// Central lightweight state management container for SAHASRAKSHA
export interface RootState {
  networkHealthPct: number;
  activeAlertsCount: number;
  lastUpdated: string;
}

export const initialRootState: RootState = {
  networkHealthPct: 95.0,
  activeAlertsCount: 4,
  lastUpdated: new Date().toISOString(),
};
