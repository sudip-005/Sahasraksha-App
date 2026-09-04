import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../components/common/Card';
import { Colors, Typography, Spacing } from '../theme';
import { HeartbeatData } from '../types';

interface HeartbeatChartProps {
  data: HeartbeatData;
}

export const HeartbeatChart: React.FC<HeartbeatChartProps> = ({ data }) => {
  if (data.heartbeat_status === 'UNAVAILABLE') {
    return (
      <Card style={styles.unavailableCard}>
        <Text style={styles.unavailIcon}>⏳</Text>
        <Text style={styles.unavailTitle}>Diurnal Solar Tide Analysis Unavailable</Text>
        <Text style={styles.unavailMessage}>
          Sampling window has fewer than 24 hours of telemetry data ({data.sampling_window_hours.toFixed(1)}h observed).
          Per SRS §13, the system strictly forbids fabricating synthetic tidal cycles.
        </Text>
      </Card>
    );
  }

  const series = data.series || [];
  const pressures = series.map((s) => s.raw_pressure);
  const minP = Math.min(...pressures, 1000);
  const maxP = Math.max(...pressures, 1020);
  const pRange = Math.max(1, maxP - minP);

  const isAlarm = data.heartbeat_strength < data.alarm_threshold;
  const isMonitor = !isAlarm && data.heartbeat_strength < data.normal_threshold;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.subtitle}>ATMOSPHERIC SOLAR TIDES (S1 24H / S2 12H)</Text>
          <Text style={styles.title}>Diurnal Barometric Heartbeat</Text>
        </View>
        <View
          style={[
            styles.strengthPill,
            {
              backgroundColor: isAlarm
                ? 'rgba(239, 68, 68, 0.2)'
                : isMonitor
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(16, 185, 129, 0.2)',
              borderColor: isAlarm
                ? Colors.serviceNow
                : isMonitor
                ? Colors.monitor
                : Colors.healthy,
            },
          ]}
        >
          <Text
            style={[
              styles.strengthVal,
              {
                color: isAlarm
                  ? Colors.serviceNow
                  : isMonitor
                  ? Colors.monitor
                  : Colors.healthy,
              },
            ]}
          >
            {(data.heartbeat_strength * 100).toFixed(0)}% SYNC
          </Text>
        </View>
      </View>

      {/* Threshold Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Raw Barometer</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.paleCyan, borderStyle: 'dashed' }]} />
          <Text style={styles.legendText}>Ideal Solar Tide</Text>
        </View>
      </View>

      {/* Wave Visualization */}
      <View style={styles.chartArea}>
        {series.slice(-24).map((pt, idx) => {
          const rawHeight = Math.max(10, ((pt.raw_pressure - minP) / pRange) * 110);
          const tideHeight = Math.max(10, ((pt.reconstructed_tide - minP) / pRange) * 110);

          return (
            <View key={idx} style={styles.waveCol}>
              {/* Tide Reference dot */}
              <View
                style={[
                  styles.tideDot,
                  { bottom: tideHeight },
                ]}
              />
              {/* Raw Barometer column */}
              <View
                style={[
                  styles.rawBar,
                  {
                    height: rawHeight,
                    backgroundColor: isAlarm ? Colors.serviceNow : Colors.primary,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <Text style={styles.footerNote}>{data.message}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.md,
  },
  unavailableCard: {
    padding: Spacing.lg,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderColor: Colors.border,
  },
  unavailIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  unavailTitle: {
    ...Typography.title3,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  unavailMessage: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.small,
    color: Colors.paleCyan,
    letterSpacing: 0.5,
  },
  title: {
    ...Typography.title3,
    color: Colors.textPrimary,
  },
  strengthPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Spacing.radiusFull,
    borderWidth: 1,
  },
  strengthVal: {
    ...Typography.small,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  chartArea: {
    height: 130,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 6,
    marginVertical: Spacing.sm,
    position: 'relative',
  },
  waveCol: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  rawBar: {
    width: 6,
    borderRadius: 3,
  },
  tideDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.paleCyan,
    zIndex: 2,
  },
  footerNote: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
