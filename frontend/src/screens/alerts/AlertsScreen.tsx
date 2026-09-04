import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlerts } from '../../hooks/useAlerts';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors, Typography, Spacing } from '../../theme';
import { AlertItem, AlertSeverity, AlertStatus } from '../../types';

interface AlertsScreenProps {
  navigation: any;
}

const FALLBACK_ALERTS: AlertItem[] = [
  {
    id: 1,
    station_id: 'AWS_CHE_02',
    station_code: 'VEBI',
    station_name: 'Sohra High-Precip Post',
    sensor_type: 'PRESSURE',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    title: 'Barometric Diurnal Solar Tide Attenuated',
    message: 'Layer 3 analysis identified zero diurnal tidal amplitude (r=0.04). Vent port clogging suspected.',
    evidence_json: { correlation: 0.04, amplitude_hpa: 0.03 },
    created_at: '2026-09-04T08:15:00',
    updated_at: '2026-09-04T08:15:00',
    evidence_bullets: ['Diurnal correlation: 0.04 (Expected >0.70)', 'Amplitude: 0.03 hPa (-51% attenuation)', 'S2 Solar Tide resonance collapsed'],
  },
  {
    id: 2,
    station_id: 'AWS_JAI_01',
    station_code: 'VIJR',
    station_name: 'Jaisalmer Desert Post',
    sensor_type: 'TEMPERATURE',
    severity: 'WARNING',
    status: 'ACTIVE',
    title: 'Cumulative Temperature Drift Detected',
    message: 'Layer 4a CUSUM analysis confirmed positive calibration drift of +0.22°C/day over 48h.',
    evidence_json: { cusum_stat: 6.8, drift_velocity_c_per_day: 0.22 },
    created_at: '2026-09-04T07:30:00',
    updated_at: '2026-09-04T07:30:00',
    evidence_bullets: ['CUSUM Statistic: 6.8σ (Threshold: 4.0σ)', 'Drift velocity: +0.22°C/day', 'Persistent bias across 48h diurnal cycles'],
  },
  {
    id: 3,
    station_id: 'AWS_LEH_01',
    station_code: 'VILH',
    station_name: 'Leh High-Altitude Station',
    sensor_type: 'TEMPERATURE',
    severity: 'WARNING',
    status: 'ACTIVE',
    title: 'Regional Spatial Discordance Detected',
    message: 'Layer 2 spatial cross-validation flagged a 2.7σ temperature divergence from regional network.',
    evidence_json: { z_score: 2.7, neighbours_evaluated: 3 },
    created_at: '2026-09-04T06:00:00',
    updated_at: '2026-09-04T06:00:00',
    evidence_bullets: ['Spatial Z-Score: 2.7σ divergence', 'Neighbours evaluated: 3 stations', 'Topographic lap-rate anomaly detected'],
  },
  {
    id: 4,
    station_id: 'AWS_BHO_01',
    station_code: 'VABP',
    station_name: 'Bhopal Bairagarh Post',
    sensor_type: 'TELEMETRY',
    severity: 'CRITICAL',
    status: 'ACKNOWLEDGED',
    title: 'Telemetry Packet Dropout',
    message: 'Station has not transmitted telemetry packets for over 14 hours.',
    evidence_json: { missing_packets: 28, last_heard: '14 hours ago' },
    created_at: '2026-09-04T02:00:00',
    updated_at: '2026-09-04T08:00:00',
    evidence_bullets: ['Missing Packets: 28 contiguous intervals', 'Last contact: 14 hours ago', 'Dispatched auto-ticket #BHO-281'],
  },
];

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ navigation }) => {
  const {
    alerts: backendAlerts,
    status: alertStatusFilter,
    setStatus: setAlertStatusFilter,
    loading,
    error,
    acknowledgeAlert,
    refetch,
  } = useAlerts('ALL', 50);

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'critical' | 'warning' | 'acknowledged'>('all');
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);

  // Active alerts list from backend or fallback
  const alertsList = useMemo(() => {
    if (backendAlerts && backendAlerts.length > 0) return backendAlerts;
    return FALLBACK_ALERTS;
  }, [backendAlerts]);

  // Filter based on category
  const filteredAlerts = useMemo(() => {
    return alertsList.filter((a) => {
      if (selectedCategory === 'critical') return a.severity === 'CRITICAL' && a.status !== 'ACKNOWLEDGED';
      if (selectedCategory === 'warning') return a.severity === 'WARNING' && a.status !== 'ACKNOWLEDGED';
      if (selectedCategory === 'acknowledged') return a.status === 'ACKNOWLEDGED';
      return true;
    });
  }, [alertsList, selectedCategory]);

  const criticalCount = alertsList.filter((a) => a.severity === 'CRITICAL' && a.status !== 'ACKNOWLEDGED').length;
  const warningCount = alertsList.filter((a) => a.severity === 'WARNING' && a.status !== 'ACKNOWLEDGED').length;
  const acknowledgedCount = alertsList.filter((a) => a.status === 'ACKNOWLEDGED').length;

  const handleAcknowledge = async (id: number) => {
    try {
      setAcknowledgingId(id);
      await acknowledgeAlert(id);
    } finally {
      setAcknowledgingId(null);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="SAHASRAKSHA"
        subtitle="सहस्राक्ष · IMD Diagnostics Engine"
        liveBadgeText="LIVE · INSAT-3DR"
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Banner Section */}
        <View style={styles.banner}>
          <View style={styles.bannerGlow} />
          <View style={styles.bannerTop}>
            <Text style={styles.bannerTagText}>NATIONAL FLEET TELEMETRY</Text>
            <View style={styles.syncCapsule}>
              <View style={styles.greenDot} />
              <Text style={styles.syncCapsuleText}>INSAT-3DR Synced</Text>
            </View>
          </View>
          <Text style={styles.bannerTitle}>Alerts Center</Text>
          <Text style={styles.bannerDesc}>
            {alertsList.length} Active Anomalies Flagged · Multi-layer explainable AI sensor verification
          </Text>
        </View>

        {/* Glanceable 3-Column Status Metrics */}
        <View style={styles.metricsRow}>
          <TouchableOpacity
            style={[styles.metricCard, selectedCategory === 'critical' && styles.activeMetricCard]}
            onPress={() => setSelectedCategory('critical')}
            activeOpacity={0.8}
          >
            <View style={styles.metricTop}>
              <View style={[styles.statusDot, { backgroundColor: Colors.serviceNow }]} />
              <Text style={styles.metricTitle}>CRITICAL</Text>
            </View>
            <Text style={[styles.metricVal, { color: Colors.serviceNow }]}>{criticalCount}</Text>
            <Text style={styles.metricSub}>Service req.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, selectedCategory === 'warning' && styles.activeMetricCard]}
            onPress={() => setSelectedCategory('warning')}
            activeOpacity={0.8}
          >
            <View style={styles.metricTop}>
              <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.metricTitle}>MONITORING</Text>
            </View>
            <Text style={[styles.metricVal, { color: '#B45309' }]}>{warningCount}</Text>
            <Text style={styles.metricSub}>Early drift</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, selectedCategory === 'acknowledged' && styles.activeMetricCard]}
            onPress={() => setSelectedCategory('acknowledged')}
            activeOpacity={0.8}
          >
            <View style={styles.metricTop}>
              <View style={[styles.statusDot, { backgroundColor: Colors.healthy }]} />
              <Text style={styles.metricTitle}>RESOLVING</Text>
            </View>
            <Text style={[styles.metricVal, { color: Colors.healthy }]}>{acknowledgedCount}</Text>
            <Text style={styles.metricSub}>Acknowledged</Text>
          </TouchableOpacity>
        </View>

        {/* Segmented Filter Pills */}
        <View style={styles.segmentedRow}>
          {[
            { id: 'all', label: `All (${alertsList.length})` },
            { id: 'critical', label: `Critical (${criticalCount})` },
            { id: 'warning', label: `Warning (${warningCount})` },
            { id: 'acknowledged', label: `Acknowledged (${acknowledgedCount})` },
          ].map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.segmentBtn, isActive && styles.activeSegmentBtn]}
                onPress={() => setSelectedCategory(tab.id as any)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentBtnText, isActive && styles.activeSegmentBtnText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Alerts Cards List */}
        <View style={styles.alertsList}>
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isAcknowledged = alert.status === 'ACKNOWLEDGED';
            const borderColor = isAcknowledged
              ? Colors.healthy
              : isCritical
              ? Colors.serviceNow
              : '#F59E0B';

            return (
              <View key={alert.id} style={styles.alertCard}>
                {/* Status indicator strip on left */}
                <View style={[styles.cardStrip, { backgroundColor: borderColor }]} />

                <View style={styles.cardContent}>
                  {/* Header Row */}
                  <View style={styles.cardHeader}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('StationDetail', { stationId: alert.station_id })}
                      activeOpacity={0.7}
                      style={styles.stationTitleCol}
                    >
                      <View style={styles.codeCapsuleRow}>
                        <Text style={styles.stationCodeText}>
                          {alert.station_code || alert.station_id}
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.primary} />
                      </View>
                      <Text style={styles.stationNameText}>
                        {alert.station_name || alert.station_id}
                      </Text>
                    </TouchableOpacity>

                    {/* Severity Pill */}
                    <View
                      style={[
                        styles.severityPill,
                        isAcknowledged
                          ? { backgroundColor: 'rgba(16, 185, 129, 0.12)' }
                          : isCritical
                          ? { backgroundColor: 'rgba(186, 26, 26, 0.12)' }
                          : { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
                      ]}
                    >
                      <View
                        style={[
                          styles.miniDot,
                          {
                            backgroundColor: isAcknowledged
                              ? Colors.healthy
                              : isCritical
                              ? Colors.serviceNow
                              : '#F59E0B',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.severityText,
                          {
                            color: isAcknowledged
                              ? Colors.healthy
                              : isCritical
                              ? Colors.serviceNow
                              : '#B45309',
                          },
                        ]}
                      >
                        {isAcknowledged ? 'ACKNOWLEDGED' : alert.severity}
                      </Text>
                    </View>
                  </View>

                  {/* Headline & Sensor */}
                  <View style={styles.headlineContainer}>
                    <Text style={styles.headlineText}>{alert.title}</Text>
                    <Text style={styles.subheadlineText}>{alert.message}</Text>
                  </View>

                  {/* Diagnostic Evidence Bullets */}
                  <View style={styles.evidenceBlock}>
                    <Text style={styles.evidenceTitle}>DIAGNOSTIC EVIDENCE</Text>
                    {alert.evidence_bullets && alert.evidence_bullets.length > 0 ? (
                      alert.evidence_bullets.map((bullet, bIdx) => (
                        <View key={bIdx} style={styles.bulletRow}>
                          <View style={[styles.bulletPoint, { backgroundColor: borderColor }]} />
                          <Text style={styles.bulletText}>{bullet}</Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.bulletRow}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.bulletText}>Sensor transducer drift cross-checked with radar.</Text>
                      </View>
                    )}
                  </View>

                  {/* Footer Action Strip */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.inspectStationBtn}
                      onPress={() => navigation.navigate('StationDetail', { stationId: alert.station_id })}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="microscope" size={15} color={Colors.primary} />
                      <Text style={styles.inspectStationText}>Deep-Dive Telemetry</Text>
                    </TouchableOpacity>

                    {!isAcknowledged && (
                      <TouchableOpacity
                        style={styles.acknowledgeBtn}
                        onPress={() => handleAcknowledge(alert.id)}
                        disabled={acknowledgingId === alert.id}
                        activeOpacity={0.8}
                      >
                        {acknowledgingId === alert.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                            <Text style={styles.acknowledgeBtnText}>Acknowledge</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  banner: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radius2xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  bannerGlow: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(204, 229, 255, 0.5)',
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  syncCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: Spacing.radiusFull,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.healthy,
  },
  syncCapsuleText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  bannerDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: Spacing.xs,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radius2xl,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  activeMetricCard: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
  },
  metricSub: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#EAEFFF',
    borderRadius: Spacing.radiusFull,
    padding: 3,
    marginVertical: Spacing.xs,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSegmentBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  activeSegmentBtnText: {
    color: Colors.primary,
  },
  alertsList: {
    gap: 12,
    marginTop: Spacing.xs,
  },
  alertCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radius2xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 2,
  },
  cardStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardContent: {
    padding: Spacing.md,
    paddingLeft: Spacing.md + 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  stationTitleCol: {
    flex: 1,
  },
  codeCapsuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stationCodeText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  stationNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Spacing.radiusFull,
  },
  miniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  severityText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headlineContainer: {
    marginVertical: 4,
  },
  headlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 19,
  },
  subheadlineText: {
    fontSize: 11.5,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
  evidenceBlock: {
    backgroundColor: '#F8FAFF',
    borderRadius: Spacing.radiusLg,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.6)',
  },
  evidenceTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  bulletText: {
    fontSize: 11,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  inspectStationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
  },
  inspectStationText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  acknowledgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Spacing.radiusFull,
  },
  acknowledgeBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
