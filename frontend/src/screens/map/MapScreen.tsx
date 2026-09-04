import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, G, Text as SvgText } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStations } from '../../hooks/useStations';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors, Typography, Spacing } from '../../theme';
import { StationMapPoint, StationStatus } from '../../types';

interface MapStationNode {
  id: string;
  code: string;
  name: string;
  city: string;
  status: 'healthy' | 'monitor' | 'service' | 'nodata';
  statusLabel: string;
  temp: string;
  pressure: string;
  humidity: string;
  healthScore: number;
  topPct: number;
  leftPct: number;
}

// Convert GPS coordinates to percentage position on India SVG canvas
function projectGpsToMap(lat: number, lon: number): { topPct: number; leftPct: number } {
  // Calibrated linear projection for the India SVG silhouette in 400x460 viewBox
  const topPct = Math.max(6, Math.min(94, -3.155 * lat + 116.26));
  const leftPct = Math.max(8, Math.min(92, 2.253 * lon - 130.08));
  return { topPct, leftPct };
}

const DEFAULT_STATIONS: MapStationNode[] = [
  {
    id: 'AWS_DEL',
    code: 'AWS_DEL',
    name: 'New Delhi Regional Station',
    city: 'New Delhi (Northern Regional Met Centre)',
    status: 'service',
    statusLabel: 'Critical Barometric Shift',
    temp: '31.2°C',
    pressure: '998.2 hPa',
    humidity: '34%',
    healthScore: 42.1,
    topPct: 26,
    leftPct: 45,
  },
  {
    id: 'AWS_JAI',
    code: 'AWS_JAI',
    name: 'Jaipur Met Station',
    city: 'Jaipur, Rajasthan',
    status: 'healthy',
    statusLabel: 'Optimal',
    temp: '29.1°C',
    pressure: '1010.5 hPa',
    humidity: '42%',
    healthScore: 96.5,
    topPct: 31,
    leftPct: 38,
  },
  {
    id: 'AWS_LKO',
    code: 'AWS_LKO',
    name: 'Lucknow Central',
    city: 'Lucknow, Uttar Pradesh',
    status: 'healthy',
    statusLabel: 'Optimal',
    temp: '28.0°C',
    pressure: '1011.8 hPa',
    humidity: '58%',
    healthScore: 97.2,
    topPct: 29,
    leftPct: 54,
  },
  {
    id: 'AWS_PNQ',
    code: 'AWS_PNQ',
    name: 'Pune Western Met Centre',
    city: 'Pune, Maharashtra (Western Met Centre)',
    status: 'monitor',
    statusLabel: 'Monitor: Barometer Drift',
    temp: '27.4°C',
    pressure: '1008.4 hPa',
    humidity: '68%',
    healthScore: 91.2,
    topPct: 61,
    leftPct: 39,
  },
  {
    id: 'AWS_BOM',
    code: 'AWS_BOM',
    name: 'Colaba Mumbai AWS',
    city: 'Colaba Mumbai, Maharashtra',
    status: 'healthy',
    statusLabel: 'Optimal',
    temp: '29.8°C',
    pressure: '1012.0 hPa',
    humidity: '79%',
    healthScore: 98.4,
    topPct: 58,
    leftPct: 34,
  },
  {
    id: 'AWS_HYD',
    code: 'AWS_HYD',
    name: 'Hyderabad Basin',
    city: 'Hyderabad, Telangana',
    status: 'service',
    statusLabel: 'Solar Sensor Degradation',
    temp: '30.4°C',
    pressure: '1006.1 hPa',
    humidity: '52%',
    healthScore: 61.0,
    topPct: 63,
    leftPct: 49,
  },
  {
    id: 'AWS_BLR',
    code: 'AWS_BLR',
    name: 'Bengaluru Met Observatory',
    city: 'Bengaluru, Karnataka',
    status: 'healthy',
    statusLabel: 'Optimal',
    temp: '24.6°C',
    pressure: '1014.2 hPa',
    humidity: '62%',
    healthScore: 99.1,
    topPct: 74,
    leftPct: 45,
  },
  {
    id: 'AWS_CHN',
    code: 'AWS_CHN',
    name: 'Chennai Coastal Station',
    city: 'Chennai Coastal, Tamil Nadu',
    status: 'monitor',
    statusLabel: 'Monitor: Anemometer Lag',
    temp: '30.1°C',
    pressure: '1009.6 hPa',
    humidity: '82%',
    healthScore: 88.0,
    topPct: 75,
    leftPct: 51,
  },
  {
    id: 'AWS_CCU',
    code: 'AWS_CCU',
    name: 'Alipore Kolkata AWS',
    city: 'Alipore Kolkata, West Bengal',
    status: 'healthy',
    statusLabel: 'Optimal',
    temp: '28.7°C',
    pressure: '1010.9 hPa',
    humidity: '74%',
    healthScore: 95.8,
    topPct: 46,
    leftPct: 69,
  },
  {
    id: 'AWS_GUW',
    code: 'AWS_GUW',
    name: 'Guwahati Northeast Station',
    city: 'Guwahati, Assam',
    status: 'nodata',
    statusLabel: 'Offline / No Signal',
    temp: '--°C',
    pressure: '-- hPa',
    humidity: '--%',
    healthScore: 0.0,
    topPct: 35,
    leftPct: 81,
  },
];

interface MapScreenProps {
  navigation: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const { mapPoints, stations: backendStations, total, loading, refetchMap } = useStations();
  const [activeLayer, setActiveLayer] = useState<'health' | 'temp' | 'pressure' | 'reporting'>('health');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedStation, setSelectedStation] = useState<MapStationNode>(DEFAULT_STATIONS[3]); // default AWS_PNQ

  // Convert backend map points to MapStationNode items using GPS coordinates
  const displayStations = useMemo(() => {
    if (mapPoints && mapPoints.length > 0) {
      return mapPoints.map((pt: StationMapPoint) => {
        const { topPct, leftPct } = projectGpsToMap(pt.latitude, pt.longitude);

        let statusKey: MapStationNode['status'] = 'healthy';
        if (pt.status === 'SERVICE_NOW') statusKey = 'service';
        else if (pt.status === 'MONITOR') statusKey = 'monitor';
        else if (pt.status === 'NO_DATA') statusKey = 'nodata';

        return {
          id: pt.id,
          code: pt.code,
          name: pt.name,
          city: pt.name,
          status: statusKey,
          statusLabel:
            statusKey === 'service'
              ? 'Critical Anomaly Detected'
              : statusKey === 'monitor'
              ? 'Warning: Parameter Drift'
              : statusKey === 'nodata'
              ? 'Offline / Silent'
              : 'Optimal Health',
          temp: pt.current_temp !== null && pt.current_temp !== undefined ? `${pt.current_temp.toFixed(1)}°C` : '27.0°C',
          pressure: pt.current_pressure !== null && pt.current_pressure !== undefined ? `${pt.current_pressure.toFixed(1)} hPa` : '1010 hPa',
          humidity: '65%',
          healthScore: pt.health_score || 95.0,
          topPct,
          leftPct,
        };
      });
    }

    // Fallback to default stations if backend has no points yet
    return DEFAULT_STATIONS;
  }, [mapPoints]);

  // Filter stations based on search query
  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return displayStations;
    const q = searchQuery.toLowerCase();
    return displayStations.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    );
  }, [displayStations, searchQuery]);

  const getNodeColor = (status: MapStationNode['status']) => {
    switch (status) {
      case 'healthy':
        return Colors.healthy;
      case 'monitor':
        return '#F59E0B';
      case 'service':
        return Colors.serviceNow;
      case 'nodata':
        return Colors.outline;
    }
  };

  const getLayerBadgeContent = (st: MapStationNode) => {
    if (activeLayer === 'temp') return st.temp;
    if (activeLayer === 'pressure') return st.pressure.replace(' hPa', '');
    if (activeLayer === 'reporting') return `${st.healthScore.toFixed(0)}%`;
    return st.status === 'nodata' ? 'NO DATA' : st.code;
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="SAHASRAKSHA"
        subtitle="सहस्राक्ष · Station Network Telemetry"
        liveBadgeText="LIVE · INSAT-3DR"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Bar Header */}
        <View style={styles.topSection}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.sectionTitle}>Station Network</Text>
              <View style={styles.subTitleRow}>
                <View style={styles.bluePulseDot} />
                <Text style={styles.stationCountText}>
                  {total > 0 ? `${total.toLocaleString()} Stations Monitored` : '2,595 Stations Monitored'}
                </Text>
                {loading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 6 }} />}
              </View>
            </View>

            <View style={styles.actionBtnsRow}>
              <TouchableOpacity
                style={[styles.circleIconBtn, showSearch && styles.activeCircleBtn]}
                onPress={() => setShowSearch(!showSearch)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color={showSearch ? Colors.primary : Colors.onSurface}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.circleIconBtn}
                onPress={() => refetchMap && refetchMap()}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="refresh" size={20} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search bar when toggled */}
          {showSearch && (
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={18} color={Colors.outline} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search station or city (e.g. Pune, Delhi)..."
                placeholderTextColor={Colors.outline}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={Colors.outline} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Apple Weather Segmented Control Pill */}
          <View style={styles.segmentedControl}>
            {(['health', 'temp', 'pressure', 'reporting'] as const).map((layer) => {
              const labels: Record<typeof layer, string> = {
                health: 'HEALTH',
                temp: 'TEMPERATURE',
                pressure: 'PRESSURE',
                reporting: 'REPORTING',
              };
              const isActive = activeLayer === layer;

              return (
                <TouchableOpacity
                  key={layer}
                  style={[styles.layerPill, isActive && styles.activeLayerPill]}
                  onPress={() => setActiveLayer(layer)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.layerPillText, isActive && styles.activeLayerPillText]}>
                    {labels[layer]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Map Surface Canvas matching Stitch UI */}
        <View style={styles.mapCanvas}>
          {/* High-Fidelity Apple Maps / Atmospheric Stylized India Map Canvas with Topo & Isobars */}
          <Svg width="100%" height={440} viewBox="0 0 400 460" preserveAspectRatio="xMidYMid slice">
            <Defs>
              <LinearGradient id="oceanGlow" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#F0F9FF" stopOpacity="0.85" />
                <Stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.95" />
              </LinearGradient>
              <LinearGradient id="topoHills" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <Stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.5" />
              </LinearGradient>
            </Defs>

            {/* Ocean backdrop */}
            <Rect width="400" height="460" fill="url(#oceanGlow)" />

            {/* Atmospheric Isobars & Topographic Contours */}
            <G stroke="#93CCFF" strokeDasharray="3,3" strokeOpacity="0.45" strokeWidth="0.8">
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
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            {/* Delicate Inner State / Territorial Boundary Paths */}
            <G stroke="#CBD5E1" strokeOpacity="0.7" strokeWidth="0.6" fill="none">
              <Path d="M165 78 Q190 92 218 84" />
              <Path d="M125 140 Q150 162 180 156" />
              <Path d="M140 210 Q190 205 238 215" />
              <Path d="M150 255 Q195 262 232 250" />
              <Path d="M158 310 Q190 325 214 316" />
              <Path d="M172 360 Q188 375 198 365" />
              <Path d="M260 148 Q284 160 305 152" />
            </G>

            {/* Ambient Regional Labels */}
            <SvgText x="145" y="172" fill="#707881" fontSize="7" fontWeight="600" opacity="0.6" letterSpacing={1}>
              RAJASTHAN
            </SvgText>
            <SvgText x="175" y="235" fill="#707881" fontSize="7" fontWeight="600" opacity="0.6" letterSpacing={1}>
              MADHYA PRADESH
            </SvgText>
            <SvgText x="156" y="288" fill="#707881" fontSize="7" fontWeight="600" opacity="0.6" letterSpacing={1}>
              MAHARASHTRA
            </SvgText>
            <SvgText x="165" y="348" fill="#707881" fontSize="7" fontWeight="600" opacity="0.6" letterSpacing={1}>
              KARNATAKA
            </SvgText>
            <SvgText x="210" y="275" fill="#707881" fontSize="7" fontWeight="600" opacity="0.6" letterSpacing={1}>
              ODISHA
            </SvgText>
          </Svg>

          {/* Dynamic Station Pins Layer */}
          {filteredStations.map((st) => {
            const isSelected = selectedStation?.id === st.id;
            const nodeColor = getNodeColor(st.status);
            const badgeText = getLayerBadgeContent(st);

            return (
              <TouchableOpacity
                key={st.id}
                style={[
                  styles.stationPin,
                  { top: `${st.topPct}%`, left: `${st.leftPct}%` },
                  isSelected && styles.selectedPinZIndex,
                ]}
                onPress={() => setSelectedStation(st)}
                activeOpacity={0.8}
              >
                {/* Glow rings for alerts/selected */}
                {(st.status === 'service' || isSelected) && (
                  <View
                    style={[
                      styles.haloRing,
                      {
                        backgroundColor:
                          st.status === 'service' ? 'rgba(186, 26, 26, 0.22)' : 'rgba(0, 97, 148, 0.22)',
                      },
                    ]}
                  />
                )}

                <View style={[styles.nodeDisc, isSelected && styles.selectedNodeDisc]}>
                  <View style={[styles.innerDot, { backgroundColor: nodeColor }]} />
                </View>

                {/* Layer or Station Label */}
                {(isSelected || activeLayer !== 'health' || st.id === 'AWS_DEL' || st.id === 'AWS_PNQ' || st.status === 'nodata') && (
                  <View style={styles.pinLabel}>
                    <Text
                      style={[
                        styles.pinLabelText,
                        st.status === 'service' && { color: Colors.serviceNow },
                        st.status === 'nodata' && { color: Colors.outline },
                      ]}
                      numberOfLines={1}
                    >
                      {badgeText}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Floating Map Utilities (Top Right) */}
          <View style={styles.floatingControls}>
            <TouchableOpacity
              style={styles.mapToolBtn}
              onPress={() => setSelectedStation(displayStations[3] || DEFAULT_STATIONS[3])}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={18} color={Colors.primary} />
            </TouchableOpacity>

            <View style={styles.zoomPill}>
              <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons name="plus" size={18} color={Colors.onSurface} />
              </TouchableOpacity>
              <View style={styles.zoomDivider} />
              <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons name="minus" size={18} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Selected Station Drawer Preview */}
        {selectedStation && (
          <View style={styles.drawerCard}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerTitleCol}>
                <View style={styles.drawerCodeRow}>
                  <Text style={styles.drawerCodeText}>{selectedStation.code}</Text>
                  <View
                    style={[
                      styles.drawerStatusBadge,
                      selectedStation.status === 'service' && { backgroundColor: 'rgba(186, 26, 26, 0.12)' },
                      selectedStation.status === 'monitor' && { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
                      selectedStation.status === 'healthy' && { backgroundColor: 'rgba(16, 185, 129, 0.12)' },
                      selectedStation.status === 'nodata' && { backgroundColor: Colors.surfaceContainerHighest },
                    ]}
                  >
                    <Text
                      style={[
                        styles.drawerStatusBadgeText,
                        selectedStation.status === 'service' && { color: Colors.serviceNow },
                        selectedStation.status === 'monitor' && { color: '#B45309' },
                        selectedStation.status === 'healthy' && { color: '#059669' },
                        selectedStation.status === 'nodata' && { color: Colors.outline },
                      ]}
                    >
                      {selectedStation.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.drawerLocationText} numberOfLines={1}>
                  {selectedStation.city}
                </Text>
              </View>

              <View style={styles.drawerHealthCol}>
                <Text
                  style={[
                    styles.drawerHealthVal,
                    { color: getNodeColor(selectedStation.status) },
                  ]}
                >
                  {selectedStation.healthScore > 0 ? `${selectedStation.healthScore.toFixed(1)}%` : '--'}
                </Text>
                <Text style={styles.drawerHealthLbl}>Health</Text>
              </View>
            </View>

            {/* Tri-stat row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{selectedStation.temp}</Text>
                <Text style={styles.statLbl}>Temperature</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{selectedStation.pressure}</Text>
                <Text style={styles.statLbl}>Barometer</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{selectedStation.humidity}</Text>
                <Text style={styles.statLbl}>Humidity</Text>
              </View>
            </View>

            {/* Audit CTA button */}
            <TouchableOpacity
              style={styles.drawerCtaBtn}
              onPress={() => navigation.navigate('StationDetail', { stationId: selectedStation.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.drawerCtaBtnText}>View Full Station Audit</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  topSection: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  subTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  bluePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  stationCountText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  actionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircleBtn: {
    backgroundColor: 'rgba(204, 229, 255, 0.6)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radiusLg,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.onSurface,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Spacing.radiusFull,
    padding: 3,
  },
  layerPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: Spacing.radiusFull,
  },
  activeLayerPill: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  layerPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  activeLayerPillText: {
    color: Colors.primary,
  },
  mapCanvas: {
    position: 'relative',
    height: 440,
    borderRadius: Spacing.radius2xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 4,
    marginVertical: Spacing.xs,
  },
  stationPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 10,
  },
  selectedPinZIndex: {
    zIndex: 30,
  },
  haloRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  nodeDisc: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedNodeDisc: {
    borderWidth: 2,
    borderColor: Colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pinLabel: {
    position: 'absolute',
    top: -18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pinLabelText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  floatingControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
    zIndex: 25,
  },
  mapToolBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  zoomPill: {
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  zoomBtn: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: 'rgba(218, 226, 253, 0.8)',
  },
  drawerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radius2xl,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 3,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  drawerTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  drawerCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerCodeText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  drawerStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Spacing.radiusFull,
  },
  drawerStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  drawerLocationText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  drawerHealthCol: {
    alignItems: 'flex-end',
  },
  drawerHealthVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  drawerHealthLbl: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(242, 243, 255, 0.7)',
    borderRadius: Spacing.radiusMd,
    padding: Spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  statLbl: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(218, 226, 253, 0.8)',
  },
  drawerCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.radiusMd,
    paddingVertical: 11,
  },
  drawerCtaBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
