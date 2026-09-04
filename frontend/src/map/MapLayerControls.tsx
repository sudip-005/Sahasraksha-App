import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

export type MapLayer = 'HEALTH' | 'TEMPERATURE' | 'PRESSURE' | 'REPORTING';

interface MapLayerControlsProps {
  currentLayer: MapLayer;
  onSelectLayer: (layer: MapLayer) => void;
}

export const MapLayerControls: React.FC<MapLayerControlsProps> = ({
  currentLayer,
  onSelectLayer,
}) => {
  const layers: { key: MapLayer; label: string; icon: string }[] = [
    { key: 'HEALTH', label: 'Health', icon: '🛡️' },
    { key: 'TEMPERATURE', label: 'Temp', icon: '🌡️' },
    { key: 'PRESSURE', label: 'Pressure', icon: '⏱️' },
    { key: 'REPORTING', label: 'Reporting', icon: '📡' },
  ];

  return (
    <View style={styles.container}>
      {layers.map((l) => {
        const isSelected = currentLayer === l.key;
        return (
          <TouchableOpacity
            key={l.key}
            style={[styles.btn, isSelected && styles.activeBtn]}
            onPress={() => onSelectLayer(l.key)}
            activeOpacity={0.8}
          >
            <Text style={styles.icon}>{l.icon}</Text>
            <Text style={[styles.label, isSelected && styles.activeLabel]}>
              {l.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusFull,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'center',
    gap: 4,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Spacing.radiusFull,
  },
  activeBtn: {
    backgroundColor: Colors.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  label: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  activeLabel: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
