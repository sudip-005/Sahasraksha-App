import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStations } from '../../hooks/useStations';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors, Typography, Spacing } from '../../theme';
import { StationMapPoint } from '../../types';

interface MapStationNode {
  id: string;
  code: string;
  name: string;
  city: string;
    status: 'healthy' | 'monitor' | 'schedule' | 'service' | 'nodata';
  statusLabel: string;
  temp: string;
  pressure: string;
  humidity: string;
  healthScore: number;
  latitude: number;
  longitude: number;
  dataQuality?: string | null;
  condition?: string | null;
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
    latitude: 28.61,
    longitude: 77.20,
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
    latitude: 26.92,
    longitude: 75.82,
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
    latitude: 26.85,
    longitude: 80.95,
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
    latitude: 18.52,
    longitude: 73.86,
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
    latitude: 18.90,
    longitude: 72.82,
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
    latitude: 17.38,
    longitude: 78.49,
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
    latitude: 12.97,
    longitude: 77.59,
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
    latitude: 13.08,
    longitude: 80.27,
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
    latitude: 22.57,
    longitude: 88.36,
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
    latitude: 26.14,
    longitude: 91.74,
  },
];

function buildLeafletHTML(stations: MapStationNode[], activeLayer: string): string {
  const stationsJson = JSON.stringify(
    stations.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      city: s.city,
      status: s.status,
      temp: s.temp,
      pressure: s.pressure,
      humidity: s.humidity,
      healthScore: s.healthScore,
      dataQuality: s.dataQuality,
      condition: s.condition,
      lat: s.latitude,
      lng: s.longitude,
    }))
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .leaflet-control-zoom { display: none; }
    .leaflet-control-attribution { font-size: 8px; opacity: 0.5; }

    /* Custom station marker */
    .station-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .station-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2.5px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .station-dot:hover { transform: scale(1.3); }
    .station-dot.healthy  { background: #10B981; }
    .station-dot.monitor  { background: #F59E0B; }
      .station-dot.schedule { background: #38BDF8; }
    .station-dot.service  { background: #DC2626; box-shadow: 0 0 0 4px rgba(220,38,38,0.25), 0 2px 8px rgba(0,0,0,0.3); }
    .station-dot.nodata   { background: #94A3B8; }
    .station-dot.selected { transform: scale(1.5); border-color: #3B82F6; box-shadow: 0 0 0 5px rgba(59,130,246,0.3), 0 2px 10px rgba(0,0,0,0.4); }

    .station-label {
      margin-top: 3px;
      background: rgba(255,255,255,0.95);
      color: #1e293b;
      font-size: 9px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 4px;
      white-space: nowrap;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
      letter-spacing: 0.3px;
    }
    .station-label.service { color: #DC2626; }
    .station-label.nodata  { color: #94A3B8; }

    /* Popup styles */
    .leaflet-popup-content-wrapper {
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      border: 1px solid rgba(218,226,253,0.8);
      padding: 0;
      overflow: hidden;
    }
    .leaflet-popup-content { margin: 0; width: 220px !important; }
    .leaflet-popup-tip-container { display: none; }

    .popup-card {
      padding: 14px;
      background: #fff;
    }
    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .popup-code { font-size: 15px; font-weight: 800; color: #1e293b; }
    .popup-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 99px;
      letter-spacing: 0.4px;
    }
    .popup-badge.healthy { background: rgba(16,185,129,0.12); color: #059669; }
    .popup-badge.monitor { background: rgba(245,158,11,0.15); color: #B45309; }
    .popup-badge.service { background: rgba(220,38,38,0.12); color: #DC2626; }
    .popup-badge.nodata  { background: #f1f5f9; color: #94A3B8; }
    .popup-city { font-size: 11px; color: #64748b; margin-bottom: 10px; }
    .popup-stats {
      display: flex;
      justify-content: space-around;
      background: rgba(242,243,255,0.7);
      border-radius: 8px;
      padding: 8px 4px;
    }
    .popup-stat { text-align: center; }
    .popup-stat-val { font-size: 13px; font-weight: 800; color: #1e293b; }
    .popup-stat-lbl { font-size: 9px; color: #64748b; margin-top: 1px; }
    .popup-divider { width: 1px; background: rgba(218,226,253,0.8); }
    .popup-health {
      font-size: 22px;
      font-weight: 800;
      text-align: center;
      margin: 8px 0 4px;
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var stations = ${stationsJson};
  var activeLayer = "${activeLayer}";

  var colorMap = {
    healthy: '#10B981',
    monitor: '#F59E0B',
      schedule: '#38BDF8',
    service: '#DC2626',
    nodata: '#94A3B8',
  };

  // Initialise Leaflet with CartoDB Positron (clean, premium look)
  var map = L.map('map', {
    center: [22.5, 82.5],
    zoom: 5,
    zoomControl: false,
    attributionControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  var selectedId = null;
  var markerMap = {};

  function getBadgeLabel(st) {
    if (activeLayer === 'temp') return st.temp;
    if (activeLayer === 'pressure') return st.pressure.replace(' hPa', '') + ' hPa';
    if (activeLayer === 'reporting') return st.healthScore.toFixed(0) + '%';
    if (st.status === 'nodata') return 'NO DATA';
    return st.code;
  }

  function createMarker(st) {
    var showLabel = activeLayer !== 'health' || st.status === 'nodata';
    var labelClass = 'station-label ' + (st.status === 'service' || st.status === 'nodata' ? st.status : '');

    var html = '<div class="station-marker">' +
      '<div class="station-dot ' + st.status + '" id="dot-' + st.id + '"></div>' +
      (showLabel ? '<div class="' + labelClass + '">' + getBadgeLabel(st) + '</div>' : '') +
    '</div>';

    var icon = L.divIcon({
      html: html,
      className: '',
      iconSize: [32, 36],
      iconAnchor: [7, 7],
    });

    var marker = L.marker([st.lat, st.lng], { icon: icon });

    marker.on('click', function() {
      selectStation(st.id);
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT', id: st.id }));
    });

    var healthColor = colorMap[st.status];
    var popupContent =
      '<div class="popup-card">' +
        '<div class="popup-header">' +
          '<span class="popup-code">' + st.code + '</span>' +
          '<span class="popup-badge ' + st.status + '">' + st.status.toUpperCase() + '</span>' +
        '</div>' +
        '<div class="popup-city">' + st.city + '</div>' +
        (st.condition ? '<div style="font-size:10px;color:#475569;margin-bottom:8px">' + st.condition + (st.dataQuality ? ' · ' + st.dataQuality : '') + '</div>' : '') +
        '<div class="popup-health" style="color:' + healthColor + '">' +
          (st.healthScore > 0 ? st.healthScore.toFixed(1) + '%' : '--') +
        '</div>' +
        '<div style="font-size:9px;text-align:center;color:#64748b;margin-bottom:8px">Health Score</div>' +
        '<div class="popup-stats">' +
          '<div class="popup-stat"><div class="popup-stat-val">' + st.temp + '</div><div class="popup-stat-lbl">Temp</div></div>' +
          '<div class="popup-divider"></div>' +
          '<div class="popup-stat"><div class="popup-stat-val">' + st.pressure + '</div><div class="popup-stat-lbl">Pressure</div></div>' +
          '<div class="popup-divider"></div>' +
          '<div class="popup-stat"><div class="popup-stat-val">' + st.humidity + '</div><div class="popup-stat-lbl">Humidity</div></div>' +
        '</div>' +
      '</div>';

    marker.bindPopup(popupContent, { maxWidth: 240, minWidth: 220 });

    return marker;
  }

  function selectStation(id) {
    // Reset previous
    if (selectedId && markerMap[selectedId]) {
      var prevDot = document.getElementById('dot-' + selectedId);
      if (prevDot) prevDot.classList.remove('selected');
    }
    selectedId = id;
    var dot = document.getElementById('dot-' + id);
    if (dot) dot.classList.add('selected');
  }

  stations.forEach(function(st) {
    var m = createMarker(st);
    m.addTo(map);
    markerMap[st.id] = m;
  });

  // Auto-select Pune on load
  setTimeout(function() {
    var puneStation = stations.find(function(s) { return s.id === 'AWS_PNQ'; });
    if (puneStation && markerMap['AWS_PNQ']) {
      selectStation('AWS_PNQ');
      markerMap['AWS_PNQ'].openPopup();
    }
  }, 800);
</script>
</body>
</html>`;
}

interface MapScreenProps {
  navigation: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const { mapPoints, stations: backendStations, total, loading, refetchMap } = useStations();
  const [activeLayer, setActiveLayer] = useState<'health' | 'temp' | 'pressure' | 'reporting'>('health');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedStation, setSelectedStation] = useState<MapStationNode>(DEFAULT_STATIONS[3]);
  const webViewRef = useRef<any>(null);

  const displayStations = useMemo((): MapStationNode[] => {
    if (mapPoints && mapPoints.length > 0) {
      return mapPoints.map((pt: StationMapPoint): MapStationNode => {
        let statusKey: MapStationNode['status'] = 'healthy';
        if (pt.status === 'SERVICE_NOW') statusKey = 'service';
        else if (pt.status === 'MONITOR') statusKey = 'monitor';
        else if (pt.status === 'SCHEDULE') statusKey = 'schedule';
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
          dataQuality: pt.data_quality,
          condition: pt.condition,
          latitude: pt.latitude,
          longitude: pt.longitude,
        };
      });
    }
    return DEFAULT_STATIONS;
  }, [mapPoints]);

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

  const nodeColors: Record<MapStationNode['status'], string> = {
    healthy: Colors.healthy,
    monitor: '#F59E0B',
    schedule: '#0284C7',
    service: Colors.serviceNow,
    nodata: Colors.outline,
  };

  const getNodeColor = (status: MapStationNode['status']) => nodeColors[status];

  const leafletHtml = useMemo(
    () => buildLeafletHTML(filteredStations, activeLayer),
    [filteredStations, activeLayer]
  );

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT') {
        const found = displayStations.find((s) => s.id === data.id);
        if (found) setSelectedStation(found);
      }
    } catch (_) {}
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="SAHASRAKSHA"
        subtitle="सहस्राक्ष · Station Network Telemetry"
        liveBadgeText="LIVE · INSAT-3DR"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
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

          {/* Layer Selector */}
          <View style={styles.segmentedControl}>
            {(['health', 'temp', 'pressure', 'reporting'] as const).map((layer) => {
              const labels: Record<typeof layer, string> = {
                health: 'HEALTH',
                temp: 'TEMP',
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

        {/* Leaflet Map WebView */}
        <View style={styles.mapCanvas}>
          <WebView
            ref={webViewRef}
            source={{ html: leafletHtml }}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            originWhitelist={['*']}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />

          {/* Legend overlay */}
          <View style={styles.legendOverlay}>
            {[
              { color: '#10B981', label: 'Healthy' },
              { color: '#F59E0B', label: 'Monitor' },
              { color: '#DC2626', label: 'Service' },
              { color: '#94A3B8', label: 'No Data' },
            ].map((item) => (
              <View key={item.label} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selected Station Drawer */}
        {selectedStation && (
          <View style={styles.drawerCard}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerTitleCol}>
                <View style={styles.drawerCodeRow}>
                  <Text style={styles.drawerCodeText}>{selectedStation.code}</Text>
                  <View
                    style={[
                      styles.drawerStatusBadge,
                      selectedStation.status === 'service' && { backgroundColor: 'rgba(220,38,38,0.12)' },
                      selectedStation.status === 'monitor' && { backgroundColor: 'rgba(245,158,11,0.15)' },
                      selectedStation.status === 'healthy' && { backgroundColor: 'rgba(16,185,129,0.12)' },
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
                  style={[styles.drawerHealthVal, { color: getNodeColor(selectedStation.status) }]}
                >
                  {selectedStation.healthScore > 0 ? `${selectedStation.healthScore.toFixed(1)}%` : '--'}
                </Text>
                <Text style={styles.drawerHealthLbl}>Health</Text>
              </View>
            </View>

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
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  topSection: { marginBottom: Spacing.sm },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: Colors.onSurface, letterSpacing: -0.3 },
  subTitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  bluePulseDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.primary, marginRight: 6,
  },
  stationCountText: { fontSize: 12, color: Colors.onSurfaceVariant, fontWeight: '500' },
  actionBtnsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  circleIconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  activeCircleBtn: { backgroundColor: 'rgba(204,229,255,0.6)' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radiusLg,
    paddingHorizontal: 12, height: 40,
    marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: 'rgba(218,226,253,0.8)', gap: 6,
  },
  searchInput: { flex: 1, fontSize: 12.5, color: Colors.onSurface },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Spacing.radiusFull, padding: 3,
  },
  layerPill: {
    flex: 1, paddingVertical: 7,
    alignItems: 'center', justifyContent: 'center', borderRadius: Spacing.radiusFull,
  },
  activeLayerPill: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  layerPillText: {
    fontSize: 9, fontWeight: '700',
    color: Colors.onSurfaceVariant, letterSpacing: 0.5,
    textAlign: 'center',
  },
  activeLayerPillText: { color: Colors.primary },
  mapCanvas: {
    height: 440,
    borderRadius: Spacing.radius2xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(218,226,253,0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 24, elevation: 4,
    marginVertical: Spacing.xs,
  },
  webView: { flex: 1 },
  legendOverlay: {
    position: 'absolute',
    bottom: 12, left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    padding: 8, gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: '#475569', fontWeight: '600' },
  drawerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radius2xl, padding: Spacing.md,
    marginTop: Spacing.md, borderWidth: 1,
    borderColor: 'rgba(218,226,253,0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 3,
  },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  drawerTitleCol: { flex: 1, marginRight: 10 },
  drawerCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  drawerCodeText: { fontSize: 16, fontWeight: '800', color: Colors.onSurface },
  drawerStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Spacing.radiusFull },
  drawerStatusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  drawerLocationText: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  drawerHealthCol: { alignItems: 'flex-end' },
  drawerHealthVal: { fontSize: 18, fontWeight: '800' },
  drawerHealthLbl: { fontSize: 10, color: Colors.onSurfaceVariant },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(242,243,255,0.7)',
    borderRadius: Spacing.radiusMd,
    padding: Spacing.sm, justifyContent: 'space-around',
    alignItems: 'center', marginVertical: Spacing.md,
  },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '800', color: Colors.onSurface },
  statLbl: { fontSize: 10, color: Colors.onSurfaceVariant, marginTop: 1 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(218,226,253,0.8)' },
  drawerCtaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.primary,
    borderRadius: Spacing.radiusMd, paddingVertical: 11,
  },
  drawerCtaBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});
