import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../components/common/Card';
import { Colors, Typography, Spacing } from '../theme';

interface FailureItem {
  type: string;
  count: number;
  pct: number;
  color: string;
}

interface FailureDistributionChartProps {
  data: FailureItem[];
}

export const FailureDistributionChart: React.FC<FailureDistributionChartProps> = ({ data }) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.subtitle}>ANOMALY CLASSIFICATION</Text>
      <Text style={styles.title}>Failure Mode Distribution</Text>

      {/* Progress stack */}
      <View style={styles.stackedBar}>
        {data.map((item) => (
          <View
            key={item.type}
            style={[styles.stackSegment, { width: `${item.pct}%`, backgroundColor: item.color }]}
          />
        ))}
      </View>

      {/* Item rows */}
      <View style={styles.list}>
        {data.map((item) => (
          <View key={item.type} style={styles.row}>
            <View style={styles.typeCol}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.typeName}>{item.type}</Text>
            </View>
            <View style={styles.valCol}>
              <Text style={styles.countText}>{item.count} events</Text>
              <Text style={styles.pctText}>{item.pct.toFixed(1)}%</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.small,
    color: Colors.paleCyan,
    letterSpacing: 0.8,
  },
  title: {
    ...Typography.title3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  stackedBar: {
    height: 12,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.cardSecondary,
    marginBottom: Spacing.md,
  },
  stackSegment: {
    height: '100%',
  },
  list: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  typeCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  typeName: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  valCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  countText: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  pctText: {
    ...Typography.captionBold,
    color: Colors.primary,
    minWidth: 44,
    textAlign: 'right',
  },
});
