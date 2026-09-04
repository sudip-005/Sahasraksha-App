import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Colors, Typography, Spacing } from '../../theme';
import { AlertItem } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface AlertCardProps {
  alert: AlertItem;
  onViewStation?: (stationId: string) => void;
  onAcknowledge?: (alertId: number) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onViewStation,
  onAcknowledge,
}) => {
  const isCritical = alert.severity === 'CRITICAL';
  const isAcknowledged = alert.status === 'ACKNOWLEDGED';

  return (
    <Card style={styles.card} variant={isCritical ? 'urgent' : 'default'}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.severityBadge,
              {
                backgroundColor: isCritical
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(245, 158, 11, 0.2)',
                borderColor: isCritical ? Colors.serviceNow : Colors.monitor,
              },
            ]}
          >
            <Text
              style={[
                styles.severityText,
                { color: isCritical ? Colors.serviceNow : Colors.monitor },
              ]}
            >
              {alert.severity}
            </Text>
          </View>
          <View style={styles.sensorBadge}>
            <Text style={styles.sensorText}>{alert.sensor_type}</Text>
          </View>
        </View>
        <Text style={styles.timeText}>{formatRelativeTime(alert.created_at)}</Text>
      </View>

      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.message}>{alert.message}</Text>

      {/* Station context */}
      {alert.station_name && (
        <View style={styles.stationTag}>
          <Text style={styles.stationTagText}>
            📡 {alert.station_name} ({alert.station_code || alert.station_id})
          </Text>
        </View>
      )}

      {/* Evidence bullet points */}
      {alert.evidence_bullets && alert.evidence_bullets.length > 0 && (
        <View style={styles.evidenceContainer}>
          <Text style={styles.evidenceTitle}>DIAGNOSTIC EVIDENCE:</Text>
          {alert.evidence_bullets.map((b, i) => (
            <Text key={i} style={styles.evidenceBullet}>
              • {b}
            </Text>
          ))}
        </View>
      )}

      {/* Action Footer */}
      <View style={styles.actionsRow}>
        {onViewStation && (
          <TouchableOpacity
            style={styles.viewStationBtn}
            onPress={() => onViewStation(alert.station_id)}
            activeOpacity={0.8}
          >
            <Text style={styles.viewStationText}>VIEW STATION →</Text>
          </TouchableOpacity>
        )}

        {onAcknowledge && (
          <TouchableOpacity
            style={[
              styles.ackBtn,
              isAcknowledged && styles.ackBtnDisabled,
            ]}
            onPress={() => !isAcknowledged && onAcknowledge(alert.id)}
            disabled={isAcknowledged}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.ackText,
                isAcknowledged && styles.ackTextDisabled,
              ]}
            >
              {isAcknowledged ? 'ACKNOWLEDGED ✓' : 'ACKNOWLEDGE'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 6,
  },
  severityText: {
    ...Typography.small,
    fontWeight: '700',
  },
  sensorBadge: {
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sensorText: {
    ...Typography.small,
    color: Colors.paleCyan,
  },
  timeText: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  title: {
    ...Typography.title3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  message: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  stationTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
  },
  stationTagText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '600',
  },
  evidenceContainer: {
    backgroundColor: Colors.cardSecondary,
    padding: Spacing.sm,
    borderRadius: Spacing.radiusSm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  evidenceTitle: {
    ...Typography.small,
    color: Colors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  evidenceBullet: {
    ...Typography.caption,
    color: Colors.paleCyan,
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  viewStationBtn: {
    paddingVertical: 6,
  },
  viewStationText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  ackBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Spacing.radiusSm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ackBtnDisabled: {
    backgroundColor: 'transparent',
    borderColor: Colors.border,
  },
  ackText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '700',
  },
  ackTextDisabled: {
    color: Colors.textMuted,
  },
});
