import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Colors, Typography, Spacing } from '../../theme';
import { StationHealthSummary } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface StationListCardProps {
  station: StationHealthSummary;
  onPress: () => void;
}

export const StationListCard: React.FC<StationListCardProps> = ({ station, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.infoCol}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>{station.name}</Text>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{station.code}</Text>
              </View>
            </View>
            <Text style={styles.location}>
              {station.district}, {station.state} • Elev: {station.elevation_m.toFixed(0)}m
            </Text>
          </View>
          <StatusBadge status={station.status} size="sm" />
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Health Score:</Text>
            <Text
              style={[
                styles.scoreVal,
                {
                  color:
                    station.health_score >= 85
                      ? Colors.healthy
                      : station.health_score >= 60
                      ? Colors.monitor
                      : Colors.serviceNow,
                },
              ]}
            >
              {station.health_score.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.metaRow}>
            {station.active_alerts_count > 0 && (
              <View style={styles.alertChip}>
                <Text style={styles.alertChipText}>⚠️ {station.active_alerts_count} alert(s)</Text>
              </View>
            )}
            <Text style={styles.lastSeen}>Seen: {formatRelativeTime(station.last_seen)}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    ...Typography.title3,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  codeBadge: {
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeText: {
    ...Typography.small,
    color: Colors.paleCyan,
  },
  location: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginRight: 4,
  },
  scoreVal: {
    ...Typography.bodyBold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  alertChipText: {
    ...Typography.small,
    color: Colors.serviceNow,
    fontWeight: '600',
  },
  lastSeen: {
    ...Typography.small,
    color: Colors.textMuted,
  },
});
