import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../theme';

interface HomeBentoGridProps {
  onPressHeartbeat?: () => void;
  onPressAlerts?: () => void;
  onPressDegradation?: () => void;
  onPressCadence?: () => void;
}

export const HomeBentoGrid: React.FC<HomeBentoGridProps> = ({
  onPressHeartbeat,
  onPressAlerts,
  onPressDegradation,
  onPressCadence,
}) => {
  return (
    <View style={styles.grid}>
      {/* 1. Pressure Heartbeat Bento Box */}
      <TouchableOpacity
        style={styles.bentoCard}
        onPress={onPressHeartbeat}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="heart-pulse" size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.cardHeaderLabel}>PRESSURE HEARTBEAT</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.heartbeatLossText}>-51% Loss</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            S2 waveform decay isolated in AWS_DEL & AWS_PNQ
          </Text>
        </View>

        {/* Mini sparkline pulse bars */}
        <View style={styles.sparklineRow}>
          <View style={[styles.sparkBar, { height: 12, backgroundColor: Colors.primary }]} />
          <View style={[styles.sparkBar, { height: 16, backgroundColor: Colors.primary }]} />
          <View style={[styles.sparkBar, { height: 8, backgroundColor: Colors.primary }]} />
          <View style={[styles.sparkBar, { height: 20, backgroundColor: Colors.serviceNow }]} />
          <View style={[styles.sparkBar, { height: 6, backgroundColor: 'rgba(186, 26, 26, 0.7)' }]} />
        </View>
      </TouchableOpacity>

      {/* 2. Active Alerts Bento Box */}
      <TouchableOpacity
        style={styles.bentoCard}
        onPress={onPressAlerts}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.cardHeaderLabel}>ACTIVE ALERTS</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.alertsCountText}>12 Actionable</Text>
          <View style={styles.badgesRow}>
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalBadgeText}>3 Critical</Text>
            </View>
            <View style={styles.monitorBadge}>
              <Text style={styles.monitorBadgeText}>9 Monitor</Text>
            </View>
          </View>
        </View>

        <Text style={styles.actionLinkText}>View Diagnosis →</Text>
      </TouchableOpacity>

      {/* 3. Degradation Bento Box */}
      <TouchableOpacity
        style={styles.bentoCard}
        onPress={onPressDegradation}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="wrench-outline" size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.cardHeaderLabel}>DEGRADATION</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.normalMetricText}>4 Nodes Affected</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            Aspirator & diaphragm wear verified
          </Text>
        </View>

        {/* Mini progress track */}
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </TouchableOpacity>

      {/* 4. Cadence Bento Box */}
      <TouchableOpacity
        style={styles.bentoCard}
        onPress={onPressCadence}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="wifi-check" size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.cardHeaderLabel}>CADENCE</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.normalMetricText}>99.4%</Text>
          <Text style={styles.latencyText}>64μs latency</Text>
        </View>

        <Text style={styles.syncedText}>All systems synced</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  bentoCard: {
    width: '48%',
    minHeight: 145,
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radiusLg,
    padding: Spacing.md,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.7)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardHeaderLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  cardBody: {
    marginVertical: 4,
  },
  heartbeatLossText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.serviceNow,
    lineHeight: 24,
  },
  alertsCountText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
    lineHeight: 22,
  },
  normalMetricText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
    lineHeight: 22,
  },
  cardDesc: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 3,
    lineHeight: 14,
  },
  sparklineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 20,
  },
  sparkBar: {
    width: 6,
    borderRadius: 3,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  criticalBadge: {
    backgroundColor: 'rgba(186, 26, 26, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  criticalBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.serviceNow,
  },
  monitorBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  monitorBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
  },
  actionLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    width: '66%',
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  latencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.healthy,
    marginTop: 2,
  },
  syncedText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
});
