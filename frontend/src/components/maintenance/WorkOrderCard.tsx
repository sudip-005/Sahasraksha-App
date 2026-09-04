import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Colors, Typography, Spacing } from '../../theme';
import { WorkOrder } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface WorkOrderCardProps {
  order: WorkOrder;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ order }) => {
  const isCritical = order.priority === 'CRITICAL';

  return (
    <Card style={styles.card} variant={isCritical ? 'urgent' : 'default'}>
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                borderColor: isCritical ? Colors.serviceNow : Colors.monitor,
              },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: isCritical ? Colors.serviceNow : Colors.monitor },
              ]}
            >
              {order.priority}
            </Text>
          </View>
          <View style={styles.sensorBadge}>
            <Text style={styles.sensorText}>{order.sensor_type}</Text>
          </View>
        </View>
        <Text style={styles.statusText}>{order.status}</Text>
      </View>

      <Text style={styles.stationTitle}>
        {order.station_name || order.station_id} ({order.station_code || order.station_id})
      </Text>
      <Text style={styles.description}>{order.description}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.technician}>
          👤 {order.technician || 'Assigned to Regional Met Officer'}
        </Text>
        <Text style={styles.time}>{formatRelativeTime(order.created_at)}</Text>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  priorityText: {
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
  statusText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  stationTitle: {
    ...Typography.title3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: Spacing.xs,
  },
  technician: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  time: {
    ...Typography.small,
    color: Colors.textMuted,
  },
});
