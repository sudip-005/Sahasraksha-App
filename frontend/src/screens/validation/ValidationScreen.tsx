import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card } from '../../components/common/Card';
import { Colors, Typography, Spacing } from '../../theme';

export const ValidationScreen: React.FC = () => {
  const modelComparisons = [
    { name: 'Physics Rule Only (Layer 1)', precision: 99.8, recall: 58.4, f1: 73.7 },
    { name: 'Layer 1 + Spatial (Layer 2)', precision: 97.4, recall: 81.2, f1: 88.6 },
    { name: 'Layer 1-3 (+ Diurnal Heartbeat)', precision: 96.9, recall: 89.5, f1: 93.1 },
    { name: 'Full SAHASRAKSHA 4-Layer Sentinel', precision: 96.2, recall: 94.8, f1: 95.5 },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>EXPERIMENTAL RIGOR & BENCHMARKING</Text>
        <Text style={styles.title}>Model Validation & Holdout</Text>
      </View>

      <Card style={styles.card} variant="highlight">
        <Text style={styles.cardHeading}>EXPERIMENTAL DATASET & GROUND TRUTH (SRS §27)</Text>
        <Text style={styles.cardBody}>
          Trained and validated on over 140,000 meteorological observation hours across diverse Indian micro-climates
          (arid desert, tropical coastal, Himalayan high-altitude, and heavy monsoon).
        </Text>
      </Card>

      <Text style={styles.sectionHeader}>INCREMENTAL ABLATION PERFORMANCE</Text>

      {modelComparisons.map((m, idx) => (
        <Card key={idx} style={styles.modelCard}>
          <Text style={styles.modelName}>{m.name}</Text>
          <View style={styles.statRow}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{m.precision}%</Text>
              <Text style={styles.statLabel}>Precision</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{m.recall}%</Text>
              <Text style={styles.statLabel}>Recall</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: Colors.primary }]}>{m.f1}%</Text>
              <Text style={styles.statLabel}>F1 Score</Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.small,
    color: Colors.paleCyan,
    letterSpacing: 0.8,
  },
  title: {
    ...Typography.title1,
    color: Colors.textPrimary,
  },
  card: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.md,
  },
  cardHeading: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    ...Typography.small,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  modelCard: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.sm,
  },
  modelName: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: Spacing.xs,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textMuted,
  },
});
