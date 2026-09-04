import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Colors, Typography, Spacing } from '../../theme';
import { EvidenceCardData } from '../../types';

interface EvidenceCardProps {
  data: EvidenceCardData;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ data }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'PASS':
        return Colors.healthy;
      case 'WARN':
        return Colors.monitor;
      case 'FAIL':
        return Colors.serviceNow;
      case 'UNAVAILABLE':
      default:
        return Colors.noData;
    }
  };

  const statusColor = getStatusColor();

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.layerBadge, { borderColor: statusColor }]}>
            <Text style={[styles.layerText, { color: statusColor }]}>
              {data.layer.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.title}>{data.title}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: `${statusColor}20`, borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{data.status}</Text>
        </View>
      </View>

      {/* Observation */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>OBSERVATION:</Text>
        <Text style={styles.observationText}>{data.observation}</Text>
      </View>

      {/* Threshold */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ENGINEERING THRESHOLD:</Text>
        <Text style={styles.thresholdText}>{data.threshold}</Text>
      </View>

      {/* Plain-English Explanation */}
      <View style={styles.explanationBox}>
        <Text style={styles.explanationText}>{data.explanation}</Text>
      </View>

      {/* Key Metrics */}
      {data.key_metrics && Object.keys(data.key_metrics).length > 0 && (
        <View style={styles.metricsRow}>
          {Object.entries(data.key_metrics).slice(0, 3).map(([key, val]) => (
            <View key={key} style={styles.metricItem}>
              <Text style={styles.metricVal}>
                {typeof val === 'number' ? val.toFixed(1) : String(val)}
              </Text>
              <Text style={styles.metricKey}>{key.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.xs,
  },
  layerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
  },
  layerText: {
    ...Typography.small,
    fontWeight: '700',
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Spacing.radiusFull,
    borderWidth: 1,
  },
  statusText: {
    ...Typography.small,
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.xs,
  },
  sectionLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  observationText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  thresholdText: {
    ...Typography.small,
    color: Colors.paleCyan,
  },
  explanationBox: {
    backgroundColor: Colors.cardSecondary,
    padding: Spacing.sm,
    borderRadius: Spacing.radiusSm,
    marginVertical: Spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  explanationText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  metricKey: {
    ...Typography.small,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
});
