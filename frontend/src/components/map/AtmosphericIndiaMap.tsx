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

export const DEFAULT_FALLBACK_POINTS: StationMapPoint[] = [];

function mapStatus(status: StationMapPoint['status']): 'ok' | 'monitor' | 'schedule' | 'service' | 'nodata' {
  if (status === 'SERVICE_NOW' || status === 'SERVICE NOW') return 'service';
  if (status === 'SCHEDULE') return 'schedule';
  if (status === 'MONITOR') return 'monitor';
  if (status === 'NO_DATA') return 'nodata';
  return 'ok';
}

function buildLeafletHTML(stations: StationMapPoint[], activeLayer: string, selectedId?: string): string {
  const stationsJson = JSON.stringify(
    stations.map((s) => ({
      id: s.id,
      code: s.code || s.id,
      name: s.name,
      city: s.name,
      status: mapStatus(s.status),
      temp: s.current_temp !== null && s.current_temp !== undefined ? `${s.current_temp.toFixed(1)}°C` : '27.0°C',
      pressure: s.current_pressure !== null && s.current_pressure !== undefined ? `${s.current_pressure.toFixed(1)} hPa` : '1010 hPa',
      humidity: '65%',
      healthScore: s.health_score || 95.0,
      degradation: s.degradation,
      trendPerDay: s.trend_per_day,
      daysToThreshold: s.days_to_threshold,
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
    .station-dot.ok       { background: #10B981; }
    .station-dot.monitor  { background: #F59E0B; }
    .station-dot.schedule { background: #38BDF8; }
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
    .station-label.schedule { color: #0284C7; }
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
    zoom: 5,
    zoomControl: false,
    attributionControl: true,
    minZoom: 3,
    maxZoom: 18,
  });

  // OpenStreetMap's standard tile service provides the geographic base layer;
  // station telemetry remains an application-owned overlay.
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    tileSize: 256,
    updateWhenIdle: true,
  }).addTo(map);

  var selectedId = null;
  var markerMap = {};

  function getBadgeLabel(st) {
    if (activeLayer === 'temp') return st.temp;
    if (activeLayer === 'pressure') return st.pressure.replace(' hPa', '') + ' hPa';
    if (activeLayer === 'reporting') return st.healthScore.toFixed(0) + '%';
    if (st.status === 'nodata') return 'NO DATA';
    if (st.status === 'service') return 'SERVICE NOW';
    if (st.status === 'schedule') return 'SCHEDULE';
    if (st.status === 'monitor') return 'MONITOR';
    return st.code;
  }

  function createMarker(st) {
    var showLabel = activeLayer !== 'health' || st.status !== 'ok';
    var labelClass = 'station-label ' + (st.status !== 'ok' ? st.status : '');

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

  // Keep the whole live network visible instead of relying on a fixed India crop.
  if (stations.length > 1) {
    var stationBounds = L.latLngBounds(stations.map(function(st) { return [st.lat, st.lng]; }));
    map.fitBounds(stationBounds, { padding: [24, 24], maxZoom: 6 });
  }

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
