export interface LiveStreamState {
  events: any[];
  totalProcessed: number;
  isConnected: boolean;
}

export const initialLiveState: LiveStreamState = {
  events: [],
  totalProcessed: 0,
  isConnected: false,
};
