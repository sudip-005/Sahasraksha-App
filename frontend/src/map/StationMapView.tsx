import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { StationMapPoint } from '../types';
import { Colors, Typography, Spacing } from '../theme';
import { MapLayer, MapLayerControls } from './MapLayerControls';
import { StationMarker } from './StationMarker';

interface StationMapViewProps {
  stations: StationMapPoint[];
  onSelectStation: (station: StationMapPoint) => void;
}

// Bounding box for India visualization
const INDIA_BOUNDS = {
  minLat: 8.0,
  maxLat: 36.0,
  minLon: 68.0,
  maxLon: 98.0,
};

export const StationMapView: React.FC<StationMapViewProps> = ({
  stations,
  onSelectStation,
}) => {
  const [currentLayer, setCurrentLayer] = useState<MapLayer>('HEALTH');
  const screenWidth = Dimensions.get('window').width;
  const mapWidth = Math.min(screenWidth - 32, 600);
  const mapHeight = 440;

  // Converts GPS coordinates to relative percentage coordinates on the India projection canvas
  const getCoordinates = (lat: number, lon: number) => {
    const xPct = (lon - INDIA_BOUNDS.minLon) / (INDIA_BOUNDS.maxLon - INDIA_BOUNDS.minLon);
    // Invert latitude because higher latitudes are higher on screen (smaller y)
    const yPct = 1.0 - (lat - INDIA_BOUNDS.minLat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat);

    const x = Math.max(10, Math.min(mapWidth - 40, xPct * mapWidth));
    const y = Math.max(10, Math.min(mapHeight - 40, yPct * mapHeight));
    return { x, y };
  };

  return (
    <View style={styles.container}>
      {/* Layer selector on top */}
      <View style={styles.layerRow}>
        <MapLayerControls currentLayer={currentLayer} onSelectLayer={setCurrentLayer} />
      </View>

      {/* Map Canvas */}
      <View style={[styles.canvas, { width: mapWidth, height: mapHeight }]}>
        {/* Subtle decorative grid lines representing India lat/long parallels */}
        <View style={styles.gridLineHorizontal1} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical} />

        {/* Region Labels */}
        <Text style={styles.regionNorth}>HIMALAYAS (LEH/SHIMLA)</Text>
        <Text style={styles.regionWest}>THAR (JAISALMER)</Text>
        <Text style={styles.regionEast}>NORTHEAST (CHERRA)</Text>
        <Text style={styles.regionSouth}>SOUTHERN PENINSULA</Text>

        {/* Station Markers */}
        {stations.map((st) => {
          const { x, y } = getCoordinates(st.latitude, st.longitude);
          return (
            <View
              key={st.id}
              style={[
                styles.markerWrapper,
                { left: x - 18, top: y - 18 },
              ]}
            >
              <StationMarker
                station={st}
                layer={currentLayer}
                onPress={() => onSelectStation(st)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  layerRow: {
    marginBottom: Spacing.sm,
    zIndex: 10,
  },
  canvas: {
    backgroundColor: '#0F1A2E',
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  gridLineHorizontal1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  gridLineVertical: {
    position: 'absolute',
    left: '48%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  regionNorth: {
    position: 'absolute',
    top: 14,
    left: 20,
    ...Typography.small,
    fontSize: 8,
    color: 'rgba(148, 163, 184, 0.35)',
    letterSpacing: 1.0,
  },
  regionWest: {
    position: 'absolute',
    top: '36%',
    left: 12,
    ...Typography.small,
    fontSize: 8,
    color: 'rgba(148, 163, 184, 0.35)',
    letterSpacing: 1.0,
  },
  regionEast: {
    position: 'absolute',
    top: '36%',
    right: 12,
    ...Typography.small,
    fontSize: 8,
    color: 'rgba(148, 163, 184, 0.35)',
    letterSpacing: 1.0,
  },
  regionSouth: {
    position: 'absolute',
    bottom: 14,
    left: '30%',
    ...Typography.small,
    fontSize: 8,
    color: 'rgba(148, 163, 184, 0.35)',
    letterSpacing: 1.0,
  },
  markerWrapper: {
    position: 'absolute',
    zIndex: 5,
  },
});
