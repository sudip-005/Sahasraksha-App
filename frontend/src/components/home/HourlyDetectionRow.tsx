import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../theme';

interface HourItem {
  time: string;
  status: 'normal' | 'watch' | 'alert';
  label: string;
  count: number;
  highlighted?: boolean;
}

interface HourlyDetectionRowProps {
  processedCount?: number;
  anomaliesDetected?: number;
  avgLatencyMs?: number;
}

export const HourlyDetectionRow: React.FC<HourlyDetectionRowProps> = () => {
  const hours: HourItem[] = [
    { time: '10 AM', status: 'normal', label: 'Normal', count: 2595 },
    { time: '11 AM', status: 'watch', label: 'Watch', count: 2595 },
    { time: '12 PM', status: 'alert', label: 'Alert', count: 2595, highlighted: true },
    { time: '1 PM', status: 'watch', label: 'Watch', count: 2595 },
    { time: '2 PM', status: 'alert', label: 'Alert', count: 2595 },
    { time: '3 PM', status: 'watch', label: 'Watch', count: 2595 },
  ];

  const getStatusIcon = (status: HourItem['status']) => {
    switch (status) {
      case 'normal':
        return <MaterialCommunityIcons name="check-circle" size={18} color={Colors.healthy} />;
      case 'watch':
        return <MaterialCommunityIcons name="alert-circle" size={18} color="#D97706" />;
      case 'alert':
        return <MaterialCommunityIcons name="alert" size={18} color={Colors.serviceNow} />;
    }
  };

  const getStatusColor = (status: HourItem['status']) => {
    switch (status) {
      case 'normal':
        return Colors.healthy;
      case 'watch':
        return '#D97706';
      case 'alert':
        return Colors.serviceNow;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.onSurfaceVariant} />
        <Text style={styles.title}>HOURLY TELEMETRY ANOMALY DETECTIONS</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {hours.map((item, index) => (
          <View
            key={index}
            style={[
              styles.hourCol,
              item.highlighted && styles.highlightedCol,
            ]}
          >
            <Text style={[styles.timeText, item.highlighted && styles.highlightedText]}>
              {item.time}
            </Text>
            <View style={styles.iconBox}>{getStatusIcon(item.status)}</View>
            <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
              {item.label}
            </Text>
            <Text style={styles.stationCount}>{item.count.toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radiusLg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.7)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    gap: 10,
  },
  hourCol: {
    alignItems: 'center',
    minWidth: 54,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: Spacing.radiusMd,
    gap: 3,
  },
  highlightedCol: {
    backgroundColor: 'rgba(242, 243, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(204, 229, 255, 0.9)',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  highlightedText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  iconBox: {
    marginVertical: 2,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  stationCount: {
    fontSize: 9,
    color: Colors.onSurfaceVariant,
  },
});
