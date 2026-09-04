import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { analyticsApi } from '../../services/analyticsApi';
import { FailureDistributionChart } from '../../charts/FailureDistributionChart';
import { LayerContributionChart } from '../../charts/LayerContributionChart';
import { LineTrendChart } from '../../charts/LineTrendChart';
import { Card } from '../../components/common/Card';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { Colors, Typography, Spacing } from '../../theme';

export const AnalyticsScreen: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAnalytics();
      setData(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <View style={styles.screen}>
        <SkeletonLoader height={280} borderRadius={Spacing.radiusLg} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchAnalytics} tintColor={Colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.subtitle}>METEOROLOGICAL SENSOR INTEGRITY AUDIT</Text>
        <Text style={styles.title}>System Analytics & Metrics</Text>
      </View>

      {/* Summary Stat Grid */}
      {data?.summary && (
        <View style={styles.summaryGrid}>
          <Card style={styles.statBox}>
            <Text style={styles.statVal}>{data.summary.monitored_stations}</Text>
            <Text style={styles.statLabel}>AWS Stations</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statVal}>{data.summary.total_telemetry_points.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Telemetry Records</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.healthy }]}>{data.summary.system_uptime_pct}%</Text>
            <Text style={styles.statLabel}>Sentinel Uptime</Text>
          </Card>
        </View>
      )}

      {/* 4-Layer Diagnostic Contribution */}
      {data?.layer_contribution && (
        <LayerContributionChart data={data.layer_contribution} />
      )}

      {/* Failure Distribution */}
      {data?.failure_distribution && (
        <FailureDistributionChart data={data.failure_distribution} />
      )}

      {/* Throughput & Latency Trend */}
      {data?.throughput_series && (
        <Card style={styles.throughputCard}>
          <LineTrendChart
            title="TELEMETRY INGESTION VELOCITY (READINGS / MIN)"
            data={data.throughput_series.map((t: any) => ({
              label: t.time,
              value: t.readings_per_min,
            }))}
            minVal={220}
            maxVal={280}
            unit=" rpm"
            lineColor={Colors.paleCyan}
          />
        </Card>
      )}

      {/* Validation Performance Specs */}
      {data?.validation_metrics && (
        <Card style={styles.valCard}>
          <Text style={styles.valTitle}>HOLDOUT VALIDATION PERFORMANCE</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.valNum}>{(data.validation_metrics.precision_score * 100).toFixed(1)}%</Text>
              <Text style={styles.valLabel}>Precision</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.valNum}>{(data.validation_metrics.recall_score * 100).toFixed(1)}%</Text>
              <Text style={styles.valLabel}>Recall</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.valNum}>{(data.validation_metrics.f1_score * 100).toFixed(1)}%</Text>
              <Text style={styles.valLabel}>F1 Score</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.valNum, { color: Colors.healthy }]}>
                {data.validation_metrics.false_alarm_rate_pct}%
              </Text>
              <Text style={styles.valLabel}>False Alarm</Text>
            </View>
          </View>
        </Card>
      )}
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
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  statBox: {
    flex: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    borderRadius: Spacing.radiusMd,
  },
  statVal: {
    ...Typography.title3,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
    fontSize: 10,
  },
  throughputCard: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.md,
  },
  valCard: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.md,
  },
  valTitle: {
    ...Typography.small,
    color: Colors.paleCyan,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  valNum: {
    ...Typography.title3,
    color: Colors.textPrimary,
  },
  valLabel: {
    ...Typography.small,
    color: Colors.textMuted,
  },
});
