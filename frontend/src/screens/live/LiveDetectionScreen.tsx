import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLiveDetection } from '../../hooks/useLiveDetection';
import { LiveReadingRow } from '../../components/live/LiveReadingRow';
import { Card } from '../../components/common/Card';
import { Colors, Typography, Spacing } from '../../theme';

export const LiveDetectionScreen: React.FC = () => {
  const { stream, throughputCount, isConnected, lastAnomaly } = useLiveDetection();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Telemetry Stream</Text>
          <Text style={styles.subtitle}>WebSocket /api/v1/live</Text>
        </View>

        <View style={styles.statusPill}>
          <View
            style={[
              styles.pulseDot,
              { backgroundColor: isConnected ? Colors.healthy : Colors.serviceNow },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'LIVE FEED' : 'RECONNECTING'}
          </Text>
        </View>
      </View>

      {/* Real-Time Throughput Counter Banner */}
      <Card style={styles.counterCard}>
        <View style={styles.counterItem}>
          <Text style={styles.counterVal}>{throughputCount}</Text>
          <Text style={styles.counterLabel}>Stream Packets Ingested</Text>
        </View>
        <View style={styles.counterDivider} />
        <View style={styles.counterItem}>
          <Text style={[styles.counterVal, { color: Colors.primary }]}>~42 ms</Text>
          <Text style={styles.counterLabel}>Pipeline Latency</Text>
        </View>
      </Card>

      {/* Latest Anomaly Toast Alert if any */}
      {lastAnomaly && (
        <Card style={styles.anomalyCard} variant="urgent">
          <Text style={styles.anomalyHeader}>⚠️ REAL-TIME ANOMALY DETECTED</Text>
          <Text style={styles.anomalyMsg}>
            Station {lastAnomaly.station_id}: {lastAnomaly.message || lastAnomaly.fault_type}
          </Text>
        </Card>
      )}

      {/* Table Headers */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.th, { width: 80 }]}>TIME</Text>
        <Text style={[styles.th, { flex: 1 }]}>STATION</Text>
        <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>READINGS</Text>
        <Text style={[styles.th, { width: 48, textAlign: 'right' }]}>HEALTH</Text>
      </View>

      {/* Live Stream List */}
      <ScrollView contentContainerStyle={styles.streamList}>
        {stream.map((item, idx) => (
          <LiveReadingRow key={`${item.station_id}-${idx}`} data={item} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.title1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Spacing.radiusFull,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...Typography.small,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  counterCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  counterItem: {
    alignItems: 'center',
  },
  counterVal: {
    ...Typography.title2,
    color: Colors.textPrimary,
  },
  counterLabel: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  counterDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  anomalyCard: {
    padding: Spacing.sm,
    borderRadius: Spacing.radiusSm,
    marginBottom: Spacing.sm,
  },
  anomalyHeader: {
    ...Typography.small,
    color: Colors.serviceNow,
    fontWeight: '700',
  },
  anomalyMsg: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.cardSecondary,
    borderTopLeftRadius: Spacing.radiusSm,
    borderTopRightRadius: Spacing.radiusSm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  th: {
    ...Typography.small,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  streamList: {
    paddingBottom: 100,
  },
});
