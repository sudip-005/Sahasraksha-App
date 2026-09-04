import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../components/common/Card';
import { Colors, Typography, Spacing } from '../theme';

interface LayerItem {
  layer: string;
  share_pct: number;
  anomalies_caught: number;
  color: string;
}

interface LayerContributionChartProps {
  data: LayerItem[];
}

export const LayerContributionChart: React.FC<LayerContributionChartProps> = ({ data }) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.subtitle}>DIAGNOSTIC ARCHITECTURE</Text>
      <Text style={styles.title}>4-Layer Anomaly Attribution</Text>

      <View style={styles.list}>
        {data.map((item) => (
          <View key={item.layer} style={styles.itemContainer}>
            <View style={styles.topRow}>
              <Text style={styles.layerName}>{item.layer}</Text>
              <Text style={[styles.pctText, { color: item.color }]}>
                {item.share_pct.toFixed(0)}%
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${item.share_pct}%`, backgroundColor: item.color },
                ]}
              />
            </View>

            <Text style={styles.caughtText}>
              {item.anomalies_caught} anomalous conditions isolated
            </Text>
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
  list: {
    gap: Spacing.md,
  },
  itemContainer: {
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  layerName: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  pctText: {
    ...Typography.bodyBold,
  },
  barTrack: {
    height: 8,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  caughtText: {
    ...Typography.small,
    color: Colors.textMuted,
  },
});
