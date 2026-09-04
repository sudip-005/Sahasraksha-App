import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';
import { getStatusColor } from '../../utils/statusColor';

interface LiveReadingRowProps {
  data: {
    station_id: string;
    station_name?: string;
    timestamp: string;
    temperature?: number;
    pressure?: number;
    humidity?: number;
    status: string;
    health_score?: number;
  };
}

export const LiveReadingRow: React.FC<LiveReadingRowProps> = ({ data }) => {
  const statusColor = getStatusColor(data.status);
  const timeStr = new Date(data.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <View style={styles.row}>
      <View style={styles.timeCol}>
        <Text style={styles.time}>{timeStr}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      <View style={styles.stationCol}>
        <Text style={styles.stationName} numberOfLines={1}>
          {data.station_name || data.station_id}
        </Text>
        <Text style={styles.stationId}>{data.station_id}</Text>
      </View>

      <View style={styles.metricsCol}>
        <Text style={styles.metricText}>
          {data.temperature !== undefined ? `${data.temperature.toFixed(1)}°C` : '--'}
        </Text>
        <Text style={styles.metricSub}>
          {data.pressure !== undefined ? `${data.pressure.toFixed(0)} hPa` : '--'}
        </Text>
      </View>

      <View style={styles.scoreCol}>
        <Text style={[styles.scoreVal, { color: statusColor }]}>
          {data.health_score !== undefined ? `${data.health_score.toFixed(0)}%` : '--'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.card,
  },
  timeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  time: {
    ...Typography.small,
    color: Colors.paleCyan,
    fontFamily: 'monospace',
  },
  stationCol: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  stationName: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  stationId: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  metricsCol: {
    width: 80,
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  metricText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  metricSub: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  scoreCol: {
    width: 48,
    alignItems: 'flex-end',
  },
  scoreVal: {
    ...Typography.captionBold,
  },
});
