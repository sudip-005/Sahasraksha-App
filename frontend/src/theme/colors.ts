export const Colors = {
  // Status Colors (from Stitch Design System)
  healthy: '#10B981',       // Emerald green (Nominal)
  monitor: '#F59E0B',       // Amber warning (Watchlist)
  serviceNow: '#BA1A1A',    // Urgent crimson (Service Now)
  noData: '#707881',        // Muted Slate (Inactive / No Data)

  // Primary & Accent Palette (Stitch "sih app" / Apple Weather Atmospheric)
  primary: '#006194',       // Primary IMD Blue
  primaryDark: '#004B73',
  primaryLight: '#CCE5FF',  // Primary fixed
  primaryContainer: '#007BB9',
  primaryFixed: '#CCE5FF',
  primaryFixedDim: '#93CCFF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#FDFCFF',

  // Secondary & Accents
  secondary: '#4648D4',     // Oceanic indigo
  secondaryContainer: '#6063EE',
  secondaryFixed: '#E1E0FF',
  secondaryFixedDim: '#C0C1FF',
  tertiary: '#006387',      // Atmospheric cyan
  tertiaryContainer: '#007DA9',
  tertiaryFixed: '#C4E7FF',
  paleCyan: '#BAE6FD',

  // Surfaces & Backgrounds (Stitch Daylight Light Atmospheric Theme)
  background: '#FAF8FF',    // Root background
  surface: '#FAF8FF',
  surfaceContainerLowest: '#FFFFFF', // Clean white card base
  surfaceContainerLow: '#F2F3FF',    // Section canvas / pill fills
  surfaceContainer: '#EAEDFF',       // Interactive surface
  surfaceContainerHigh: '#E2E7FF',      // High contrast container
  surfaceContainerHighest: '#DAE2FD',   // Highlight container
  surfaceDim: '#D2D9F4',
  surfaceBright: '#FAF8FF',
  surfaceTint: '#006398',

  // Legacy mappings for backwards-compatibility in components
  card: '#FFFFFF',
  cardSecondary: '#F2F3FF',
  header: '#FAF8FF',
  tabBar: 'rgba(255, 255, 255, 0.94)',

  // Typography & Content Colors
  textPrimary: '#131B2E',   // onSurface
  textSecondary: '#3F4850', // onSurfaceVariant
  textMuted: '#707881',     // outline
  textInverted: '#FAF8FF',
  onSurface: '#131B2E',
  onSurfaceVariant: '#3F4850',

  // Borders & Accents
  border: '#DAE2FD',        // surfaceContainerHighest / subtle rim
  borderSubtle: '#F2F3FF',
  borderHighlight: '#006194',
  outline: '#707881',
  outlineVariant: '#BFC7D2',
  shadow: 'rgba(186, 230, 253, 0.45)',

  // Alerts & Errors
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
  onErrorContainer: '#93000A',

  // Gradients
  heroGradientStart: '#CCE5FF',
  heroGradientEnd: '#FFFFFF',
};

export const StatusColors: Record<string, string> = {
  HEALTHY: Colors.healthy,
  MONITOR: Colors.monitor,
  SERVICE_NOW: Colors.serviceNow,
  NO_DATA: Colors.noData,
};
