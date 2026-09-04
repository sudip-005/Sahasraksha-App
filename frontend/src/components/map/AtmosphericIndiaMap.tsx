import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
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
  { id: 'AWS_BHO_01', name: 'Bhopal Bairagarh', code: 'VABP', latitude: 23.29, longitude: 77.35, status: 'NO_DATA', health_score: 0.0, current_temp: undefined, current_pressure: undefined },
];

function buildLeafletHTML(stations: StationMapPoint[], activeLayer: string, selectedId?: string): string {
  const stationsJson = JSON.stringify(
    stations.map((s) => ({
      id: s.id,
      code: s.code || s.id,
      name: s.name,
      city: s.name,
      status: s.status === 'SERVICE_NOW' ? 'service' : s.status === 'MONITOR' ? 'monitor' : s.status === 'NO_DATA' ? 'nodata' : 'healthy',
      temp: s.current_temp !== null && s.current_temp !== undefined ? `${s.current_temp.toFixed(1)}°C` : '27.0°C',
      pressure: s.current_pressure !== null && s.current_pressure !== undefined ? `${s.current_pressure.toFixed(1)} hPa` : '1010 hPa',
      humidity: '65%',
      healthScore: s.health_score || 95.0,
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
    html, body, #map { width: 100%; height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #e0f2fe; }
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
    .station-dot.service  { background: #DC2626; box-shadow: 0 0 0 4px rgba(220,38,38,0.25), 0 2px 8px rgba(0,0,0,0.3); }
    .station-dot.nodata   { background: #94A3B8; }
    .station-dot.selected { transform: scale(1.5); border-color: #3B82F6; box-shadow: 0 0 0 5px rgba(59,130,246,0.3), 0 2px 10px rgba(0,0,0,0.4); z-index: 1000 !important; }

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
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var stations = ${stationsJson};
  var activeLayer = "${activeLayer}";
  var initialSelectedId = "${selectedId || ''}";

  var map = L.map('map', {
    center: [22.5, 82.5],
    zoom: 4.5,
    zoomControl: false,
    attributionControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
    var showLabel = activeLayer !== 'health' || st.status === 'nodata' || st.status === 'service';
    var labelClass = 'station-label ' + (st.status === 'service' || st.status === 'nodata' ? st.status : '');

    var html = '<div class="station-marker">' +
      '<div class="station-dot ' + st.status + '" id="dot-' + st.id + '"></div>' +
      (showLabel ? '<div class="' + labelClass + '" id="label-' + st.id + '">' + getBadgeLabel(st) + '</div>' : '') +
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

    return marker;
  }

  function selectStation(id) {
    if (selectedId && markerMap[selectedId]) {
      var prevDot = document.getElementById('dot-' + selectedId);
      if (prevDot) prevDot.classList.remove('selected');
      
      var prevLabel = document.getElementById('label-' + selectedId);
      if (prevLabel && activeLayer === 'health' && stations.find(s => s.id === selectedId).status !== 'service' && stations.find(s => s.id === selectedId).status !== 'nodata') {
          prevLabel.style.display = 'none';
      }
    }
    
    selectedId = id;
    var dot = document.getElementById('dot-' + id);
    if (dot) dot.classList.add('selected');
    
    // Ensure label is visible for selected
    var label = document.getElementById('label-' + id);
    if (label) {
        label.style.display = 'block';
    } else {
        // If label doesn't exist, we'd need to re-render the icon, but we skip that for simplicity here 
        // as the click is passed back to React Native which shows the detailed drawer anyway.
    }
  }

  stations.forEach(function(st) {
    var m = createMarker(st);
    m.addTo(map);
    markerMap[st.id] = m;
  });

  if (initialSelectedId) {
    setTimeout(function() {
      selectStation(initialSelectedId);
    }, 500);
  }
</script>
</body>
</html>`;
}

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

  const leafletHtml = useMemo(
    () => buildLeafletHTML(pointsToRender, activeLayer, selectedStationId),
    [pointsToRender, activeLayer, selectedStationId]
  );

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT') {
        const found = pointsToRender.find((s) => s.id === data.id);
        if (found) onSelectStation(found);
      }
    } catch (_) {}
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

      {/* Leaflet Map Surface */}
      <View style={[styles.mapContainer, { height }]}>
        <WebView
          source={{ html: leafletHtml }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled
          originWhitelist={['*']}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.sm,
  },
  layerSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Spacing.radiusFull,
    padding: 3,
    marginBottom: Spacing.sm,
  },
  layerPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.radiusFull,
  },
  layerPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  layerPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  layerPillTextActive: {
    color: Colors.primary,
  },
  mapContainer: {
    backgroundColor: '#e0f2fe',
    borderRadius: Spacing.radius2xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 4,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
