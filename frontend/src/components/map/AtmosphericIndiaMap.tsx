import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, G, Text as SvgText } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../../theme';
import { StationMapPoint } from '../../types';

export type MapLayerType = 'health' | 'temp' | 'pressure' | 'reporting';

export interface AtmosphericIndiaMapProps {
  mapPoints: StationMapPoint[];
  selectedStationId?: string;
  onSelectStation: (station: StationMapPoint) => void;
  activeLayer: MapLayerType;
  onChangeLayer?: (layer: MapLayerType) => void;
  height?: number;
  showLayerControl?: boolean;
}

// Calibrated GPS projection for India coordinates onto the 400x460 canvas
export function projectGpsToMap(lat: number, lon: number): { topPct: number; leftPct: number } {
  // Lat range ~8°N to ~37°N; Lon range ~68°E to ~97°E
  const topPct = Math.max(6, Math.min(94, -3.155 * lat + 116.26));
  const leftPct = Math.max(8, Math.min(92, 2.253 * lon - 130.08));
  return { topPct, leftPct };
}

// Built-in fallback points if backend hasn't loaded yet
export const DEFAULT_FALLBACK_POINTS: StationMapPoint[] = [
  { id: 'AWS_DEL_01', name: 'Safdarjung Delhi', code: 'VIDD', latitude: 28.58, longitude: 77.21, status: 'HEALTHY', health_score: 98.5, current_temp: 30.2, current_pressure: 988.8 },
  { id: 'AWS_JAI_01', name: 'Jaisalmer Desert Post', code: 'VIJR', latitude: 26.92, longitude: 70.91, status: 'MONITOR', health_score: 76.0, current_temp: 33.8, current_pressure: 987.7 },
  { id: 'AWS_PUN_01', name: 'Shivajinagar Pune', code: 'VAPO', latitude: 18.53, longitude: 73.85, status: 'HEALTHY', health_score: 96.5, current_temp: 28.0, current_pressure: 949.3 },
  { id: 'AWS_MUM_01', name: 'Colaba Mumbai', code: 'VABB', latitude: 18.90, longitude: 72.81, status: 'HEALTHY', health_score: 96.0, current_temp: 31.6, current_pressure: 1013.0 },
  { id: 'AWS_CHE_02', name: 'Sohra High-Precip', code: 'VEBI', latitude: 25.28, longitude: 91.73, status: 'SERVICE_NOW', health_score: 48.0, current_temp: 22.5, current_pressure: 855.2 },
  { id: 'AWS_BLR_01', name: 'HAL Bengaluru', code: 'VOBG', latitude: 12.95, longitude: 77.67, status: 'HEALTHY', health_score: 99.0, current_temp: 25.9, current_pressure: 913.1 },
  { id: 'AWS_CHE_01', name: 'Chennai Meenambakkam', code: 'VOMM', latitude: 12.98, longitude: 80.18, status: 'HEALTHY', health_score: 97.0, current_temp: 31.4, current_pressure: 1012.6 },
  { id: 'AWS_KOL_01', name: 'Alipore Kolkata', code: 'VECC', latitude: 22.53, longitude: 88.33, status: 'HEALTHY', health_score: 95.0, current_temp: 31.5, current_pressure: 1013.6 },
  { id: 'AWS_LEH_01', name: 'Leh High-Altitude', code: 'VILH', latitude: 34.15, longitude: 77.58, status: 'MONITOR', health_score: 72.0, current_temp: 12.9, current_pressure: 668.2 },
  { id: 'AWS_SHM_01', name: 'Shimla Ridge', code: 'VISM', latitude: 31.10, longitude: 77.17, status: 'HEALTHY', health_score: 94.0, current_temp: 17.2, current_pressure: 781.1 },
  { id: 'AWS_NAG_01', name: 'Nagpur Central Hub', code: 'VANP', latitude: 21.09, longitude: 79.05, status: 'HEALTHY', health_score: 97.2, current_temp: 29.8, current_pressure: 977.8 },
  { id: 'AWS_BHO_01', name: 'Bhopal Bairagarh', code: 'VABP', latitude: 23.29, longitude: 77.35, status: 'NO_DATA', health_score: 0.0, current_temp: null, current_pressure: null },
];

export const AtmosphericIndiaMap: React.FC<AtmosphericIndiaMapProps> = ({
  mapPoints,
  selectedStationId,
  onSelectStation,
  activeLayer,
  onChangeLayer,
  height = 420,
  showLayerControl = true,
}) => {
  const pointsToRender = useMemo(() => {
    return mapPoints && mapPoints.length > 0 ? mapPoints : DEFAULT_FALLBACK_POINTS;
  }, [mapPoints]);

  const getNodeColor = (point: StationMapPoint) => {
    if (activeLayer === 'temp') {
      const t = point.current_temp ?? 27;
      if (t > 33) return Colors.serviceNow;
      if (t > 29) return '#F59E0B';
      return Colors.primary;
    }
    if (activeLayer === 'pressure') {
      const p = point.current_pressure ?? 1010;
      if (p < 900) return '#6366F1';
      if (p < 990) return '#F59E0B';
      return Colors.healthy;
    }
    if (activeLayer === 'reporting') {
      return point.status === 'NO_DATA' ? Colors.outline : Colors.healthy;
    }
    // Default: 'health'
    switch (point.status) {
      case 'SERVICE_NOW':
        return Colors.serviceNow;
      case 'MONITOR':
        return '#F59E0B';
      case 'NO_DATA':
        return '#94A3B8';
      case 'HEALTHY':
      default:
        return Colors.healthy;
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Optional Layer Pills Switcher */}
      {showLayerControl && (
        <View style={styles.layerSelector}>
          {(['health', 'temp', 'pressure', 'reporting'] as const).map((layer) => {
            const isActive = activeLayer === layer;
            const labels: Record<typeof layer, string> = {
              health: 'HEALTH',
              temp: 'TEMPERATURE',
              pressure: 'PRESSURE',
              reporting: 'REPORTING',
            };
            return (
              <TouchableOpacity
                key={layer}
                style={[styles.layerPill, isActive && styles.layerPillActive]}
                onPress={() => onChangeLayer && onChangeLayer(layer)}
                activeOpacity={0.8}
              >
                <Text style={[styles.layerPillText, isActive && styles.layerPillTextActive]}>
                  {labels[layer]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Atmospheric SVG India Map Surface */}
      <View style={[styles.mapContainer, { height }]}>
        <Svg width="100%" height="100%" viewBox="0 0 400 460" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="oceanGlow" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.95" />
            </LinearGradient>
            <LinearGradient id="topoHills" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.55" />
            </LinearGradient>
          </Defs>

          {/* Ocean Backdrop */}
          <Rect width="400" height="460" fill="url(#oceanGlow)" />

          {/* Atmospheric Isobars & Pressure Contours */}
          <G stroke="#93ccff" strokeDasharray="3 3" strokeOpacity="0.4" strokeWidth="0.75">
            <Path d="M-10 110 C 80 80, 220 140, 410 70" />
            <Path d="M-10 180 C 110 160, 240 220, 410 170" />
            <Path d="M-10 270 C 130 240, 260 300, 410 240" />
            <Path d="M-10 360 C 100 340, 250 380, 410 330" />
          </G>

          {/* India Landmass Silhouette Shape */}
          <Path
            d="M178 35 
               C190 28, 205 32, 214 44
               C226 56, 238 65, 232 82
               C225 100, 242 110, 262 116
               C290 125, 330 134, 340 148
               C350 160, 360 172, 336 182
               C318 190, 300 186, 286 195
               C275 202, 268 214, 252 225
               C244 231, 235 240, 234 252
               C230 270, 232 290, 226 312
               C220 334, 210 354, 202 376
               C196 392, 192 408, 186 418
               C182 410, 175 392, 168 376
               C158 354, 150 330, 142 305
               C135 285, 126 270, 118 252
               C108 232, 94 225, 86 210
               C74 190, 80 170, 92 152
               C105 135, 120 126, 128 108
               C134 94, 142 80, 152 64
               C160 50, 168 40, 178 35 Z"
            fill="url(#topoHills)"
            stroke="#ffffff"
            strokeWidth="1.8"
          />

          {/* Internal Regional Meteorological Boundaries */}
          <G stroke="#cbd5e1" strokeOpacity="0.65" strokeWidth="0.6">
            <Path d="M165 78 Q190 92 218 84" />
            <Path d="M125 140 Q150 162 180 156" />
            <Path d="M140 210 Q190 205 238 215" />
            <Path d="M150 255 Q195 262 232 250" />
            <Path d="M158 310 Q190 325 214 316" />
            <Path d="M172 360 Q188 375 198 365" />
            <Path d="M260 148 Q284 160 305 152" />
          </G>

          {/* Regional Geography Labels */}
          <SvgText x="142" y="170" fill="#707881" fontSize="7" fontWeight="600" opacity={0.65} letterSpacing={1}>
            RAJASTHAN
          </SvgText>
          <SvgText x="170" y="235" fill="#707881" fontSize="7" fontWeight="600" opacity={0.65} letterSpacing={1}>
            MADHYA PRADESH
          </SvgText>
          <SvgText x="150" y="290" fill="#707881" fontSize="7" fontWeight="600" opacity={0.65} letterSpacing={1}>
            MAHARASHTRA
          </SvgText>
          <SvgText x="160" y="348" fill="#707881" fontSize="7" fontWeight="600" opacity={0.65} letterSpacing={1}>
            KARNATAKA
          </SvgText>
          <SvgText x="208" y="275" fill="#707881" fontSize="7" fontWeight="600" opacity={0.65} letterSpacing={1}>
            ODISHA
          </SvgText>
          <SvgText x="270" y="140" fill="#707881" fontSize="7" fontWeight="600" opacity={0.65} letterSpacing={1}>
            ASSAM
          </SvgText>
        </Svg>

        {/* Dynamic Station Pins Overlay */}
        {pointsToRender.map((point) => {
          const { topPct, leftPct } = projectGpsToMap(point.latitude, point.longitude);
          const isSelected = selectedStationId === point.id || selectedStationId === point.code;
          const nodeColor = getNodeColor(point);
          const isCritical = point.status === 'SERVICE_NOW';

          return (
            <TouchableOpacity
              key={point.id}
              style={[
                styles.nodeTouchTarget,
                {
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  zIndex: isSelected ? 40 : isCritical ? 30 : 20,
                },
              ]}
              onPress={() => onSelectStation(point)}
              activeOpacity={0.7}
            >
              {/* Outer pulsing ring for critical stations or selected */}
              {(isCritical || isSelected) && (
                <View
                  style={[
                    styles.pulseRing,
                    {
                      backgroundColor: `${nodeColor}33`,
                      borderColor: `${nodeColor}66`,
                    },
                  ]}
                />
              )}

              {/* Station Dot */}
              <View
                style={[
                  styles.stationDot,
                  isSelected && styles.selectedDot,
                  { borderColor: isSelected ? Colors.primary : '#FFFFFF' },
                ]}
              >
                <View style={[styles.innerColorCore, { backgroundColor: nodeColor }]} />
              </View>

              {/* Callout Pill Label */}
              {(isSelected || isCritical) && (
                <View style={styles.nodeCodeCapsule}>
                  <Text style={[styles.nodeCodeText, { color: isCritical ? Colors.serviceNow : Colors.primary }]}>
                    {point.code || point.id}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  layerSelector: {
    flexDirection: 'row',
    backgroundColor: '#E2E7FF',
    borderRadius: Spacing.radiusFull,
    padding: 3,
    marginBottom: Spacing.sm,
  },
  layerPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  layerPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  layerPillTextActive: {
    color: Colors.primary,
  },
  mapContainer: {
    width: '100%',
    borderRadius: Spacing.radius2xl,
    overflow: 'hidden',
    backgroundColor: '#F2F3FF',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(204, 229, 255, 0.6)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  nodeTouchTarget: {
    position: 'absolute',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  stationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
  },
  innerColorCore: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  nodeCodeCapsule: {
    position: 'absolute',
    top: -18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(218, 226, 253, 0.8)',
  },
  nodeCodeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
