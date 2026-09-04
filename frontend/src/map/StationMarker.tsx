import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme';
import { StationMapPoint } from '../types';
import { getStatusColor } from '../utils/statusColor';
import { MapLayer } from './MapLayerControls';

interface StationMarkerProps {
  station: StationMapPoint;
  layer: MapLayer;
  onPress: () => void;
}

export const StationMarker: React.FC<StationMarkerProps> = ({
  station,
  layer,
  onPress,
}) => {
  const statusColor = getStatusColor(station.status);

  const getMarkerBadgeText = () => {
    switch (layer) {
      case 'TEMPERATURE':
        return station.current_temp !== undefined && station.current_temp !== null
          ? `${station.current_temp.toFixed(0)}°`
          : '--';
      case 'PRESSURE':
        return station.current_pressure !== undefined && station.current_pressure !== null
          ? `${station.current_pressure.toFixed(0)}`
          : '--';
      case 'REPORTING':
        return station.status === 'NO_DATA' ? 'OFF' : 'ON';
      case 'HEALTH':
      default:
        return `${station.health_score.toFixed(0)}%`;
    }
  };

  return (
    <TouchableOpacity
      style={styles.markerContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.outerGlow, { backgroundColor: `${statusColor}30` }]}>
        <View style={[styles.innerCircle, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{getMarkerBadgeText()}</Text>
        </View>
      </View>
      <Text style={styles.stationCode}>{station.code}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  outerGlow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    ...Typography.small,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stationCode: {
    ...Typography.small,
    fontSize: 9,
    color: Colors.textSecondary,
    backgroundColor: 'rgba(11, 17, 30, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
});
