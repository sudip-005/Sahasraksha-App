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
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeartbeat } from '../../hooks/useHeartbeat';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors, Typography, Spacing } from '../../theme';

interface PressureHeartbeatScreenProps {
  route: any;
  navigation: any;
}

export const PressureHeartbeatScreen: React.FC<PressureHeartbeatScreenProps> = ({
  route,
  navigation,
}) => {
  const { stationId = 'AWS_CHE_02' } = route?.params || {};
  const { data, loading, error, refetch } = useHeartbeat(stationId);
  const [activeTab, setActiveTab] = useState<'actual' | 'heartbeat' | 'combined'>('heartbeat');

  // Compute strength metrics
  const strength = data?.heartbeat_strength ?? 0.49;
  const status = data?.heartbeat_status ?? 'DAMPENED';
  const lossPct = Math.max(0, Math.round((1 - strength) * 100));
  const isDampened = status === 'DAMPENED' || status === 'INVERTED';

  // Construct dynamic SVG path from real series data if available
  const seriesPaths = useMemo(() => {
    if (!data?.series || data.series.length < 4) {
      return null;
    }
    const series = data.series;
    const width = 320;
    const height = 100;

    const rawVals = series.map((s) => s.raw_pressure);
    const minRaw = Math.min(...rawVals);
    const maxRaw = Math.max(...rawVals);
    const rangeRaw = maxRaw - minRaw || 1;

    const rawPath = series
      .map((s, i) => {
        const x = (i / (series.length - 1)) * width;
        const y = height - 15 - ((s.raw_pressure - minRaw) / rangeRaw) * (height - 30);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const tideVals = series.map((s) => s.reconstructed_tide);
    const minTide = Math.min(...tideVals);
    const maxTide = Math.max(...tideVals);
    const rangeTide = maxTide - minTide || 1;

    const tidePath = series
      .map((s, i) => {
        const x = (i / (series.length - 1)) * width;
        const y = height - 20 - ((s.reconstructed_tide - minTide) / rangeTide) * (height - 40);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return { rawPath, tidePath };
  }, [data?.series]);

  return (
    <View style={styles.screen}>
      <AppHeader
        title="SAHASRAKSHA"
        subtitle={`सहस्राक्ष · Diurnal Pressure Heartbeat (${stationId})`}
        showBack={true}
        onBack={() => navigation.goBack()}
        liveBadgeText="LIVE · 64µs"
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Top Navigation & Station Context */}
        <View style={styles.topContextRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.primary} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.contextCenter}>
            <Text style={styles.screenTitle}>Pressure Heartbeat</Text>
            <View style={styles.stationLocationRow}>
              <Text style={styles.stationCodeText}>{stationId}</Text>
              <View style={styles.dotSeparator} />
              <Text style={styles.stationCityText}>
                {stationId === 'AWS_CHE_02' ? 'Sohra High-Precip, Meghalaya' : 'Regional Met Centre'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.tuneBtn} activeOpacity={0.7} onPress={refetch}>
            <MaterialCommunityIcons name="refresh" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Anomaly Insight Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <View style={styles.heroScoreRow}>
                <Text
                  style={[
                    styles.heroLossNum,
                    { color: isDampened ? Colors.serviceNow : Colors.healthy },
                  ]}
                >
                  {isDampened ? `-${lossPct}%` : 'Normal'}
                </Text>
                <View
                  style={[
                    styles.lossBadge,
                    !isDampened && { backgroundColor: 'rgba(16, 185, 129, 0.12)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.lossBadgeText,
                      !isDampened && { color: Colors.healthy },
                    ]}
                  >
                    {isDampened ? 'Heartbeat Strength Loss' : 'S2 Solar Tide Intact'}
                  </Text>
                </View>
              </View>
              <Text style={styles.heroSubhead}>
                {data?.message || 'Detect sensor degradation before the readings look visibly wrong.'}
              </Text>
            </View>

            <View style={styles.troubleshootIconBox}>
              <MaterialCommunityIcons
                name={isDampened ? 'timeline-alert' : 'check-decagram'}
                size={24}
                color={isDampened ? Colors.serviceNow : Colors.healthy}
              />
            </View>
          </View>

          {/* Segmented Filter Control */}
          <View style={styles.segmentedFilter}>
            {(['actual', 'heartbeat', 'combined'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const labels: Record<typeof tab, string> = {
                actual: 'ACTUAL',
                heartbeat: 'HEARTBEAT',
                combined: 'COMBINED',
              };
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.segmentBtn, isActive && styles.activeSegmentBtn]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentBtnText, isActive && styles.activeSegmentBtnText]}>
                    {labels[tab]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Chart 1: Raw Barometric Timeline (Hydrostatic Envelope) */}
        {(activeTab === 'actual' || activeTab === 'combined') && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTagText}>RAW BAROMETRIC PRESSURE</Text>
                <Text style={styles.chartTitle}>Hydrostatic Oscillations</Text>
              </View>
              <View style={styles.falseNegativeBadge}>
                <View style={styles.blueDot} />
                <Text style={styles.falseNegativeText}>
                  {isDampened ? 'QC: FALSE PASS' : 'QC: PASS'}
                </Text>
              </View>
            </View>

            {/* SVG Raw Pressure Sine Wave or Live Series */}
            <View style={styles.svgContainer}>
              <Svg width="100%" height={100} viewBox="0 0 320 80">
                <Line x1="0" y1="15" x2="320" y2="15" stroke="rgba(218, 226, 253, 0.7)" strokeDasharray="3,3" />
                <Line x1="0" y1="40" x2="320" y2="40" stroke="rgba(218, 226, 253, 0.7)" />
                <Line x1="0" y1="65" x2="320" y2="65" stroke="rgba(218, 226, 253, 0.7)" strokeDasharray="3,3" />

                {seriesPaths ? (
                  <Path
                    d={seriesPaths.rawPath}
                    fill="none"
                    stroke={Colors.primary}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                ) : (
                  <Path
                    d="M0,40 Q15,15 30,40 T60,40 T90,40 T120,40 T150,40 T180,40 T210,40 T240,40 T270,40 T300,40 L320,40"
                    fill="none"
                    stroke={Colors.primary}
                    strokeWidth={2.5}
                  />
                )}
                <Circle cx="180" cy="40" r="4.5" fill={Colors.primary} />
              </Svg>

              <View style={styles.timeTicksRow}>
                <Text style={styles.tickLabel}>Window Start</Text>
                <Text style={styles.tickLabel}>12h</Text>
                <Text style={[styles.tickLabel, styles.alertTickLabel]}>24h (Diurnal Peak)</Text>
                <Text style={styles.tickLabel}>48h Live</Text>
              </View>
            </View>

            <Text style={styles.chartFootnote}>
              Surface pressure oscillates within standard meteorological thresholds, but subtle harmonic diaphragm damping cannot be caught by single-threshold sanity checks.
            </Text>
          </View>
        )}

        {/* Chart 2: S2 Solar-Tide Resonance (12h Harmonic Amplitude Response) */}
        {(activeTab === 'heartbeat' || activeTab === 'combined') && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTagText}>S2 SOLAR-TIDE HARMONIC</Text>
                <Text style={styles.chartTitle}>12h Atmospheric Resonance</Text>
              </View>
              <View
                style={[
                  styles.anomalyActiveBadge,
                  !isDampened && { backgroundColor: 'rgba(16, 185, 129, 0.12)' },
                ]}
              >
                <Text
                  style={[
                    styles.anomalyActiveBadgeText,
                    !isDampened && { color: Colors.healthy },
                  ]}
                >
                  {isDampened ? 'ANOMALY ACTIVE' : 'HARMONIC OPTIMAL'}
                </Text>
              </View>
            </View>

            {/* Threshold Zones & Waveform */}
            <View style={styles.resonanceChartWrapper}>
              <View style={styles.thresholdZones}>
                <View style={[styles.zoneBand, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                  <Text style={[styles.zoneLabel, { color: Colors.healthy }]}>
                    Normal Resonance (Q ≥ {data?.normal_threshold ?? 0.7})
                  </Text>
                </View>
                <View style={[styles.zoneBand, { backgroundColor: 'rgba(245, 158, 11, 0.08)' }]}>
                  <Text style={[styles.zoneLabel, { color: '#B45309' }]}>
                    Monitoring Boundary (Q = 0.5)
                  </Text>
                </View>
                <View style={[styles.zoneBand, { backgroundColor: 'rgba(186, 26, 26, 0.08)' }]}>
                  <Text style={[styles.zoneLabel, { color: Colors.serviceNow }]}>
                    Alarm Threshold (Q ≤ {data?.alarm_threshold ?? 0.4})
                  </Text>
                </View>
              </View>

              <Svg width="100%" height={110} viewBox="0 0 320 110">
                {seriesPaths ? (
                  <Path
                    d={seriesPaths.tidePath}
                    fill="none"
                    stroke={isDampened ? Colors.serviceNow : Colors.healthy}
                    strokeWidth={2.8}
                    strokeLinecap="round"
                  />
                ) : (
                  <Path
                    d="M0,35 C30,35 45,75 75,75 C105,75 120,40 150,40 C180,40 195,65 225,65 C255,65 270,55 300,55 L320,55"
                    fill="none"
                    stroke={isDampened ? Colors.serviceNow : Colors.healthy}
                    strokeWidth={2.8}
                  />
                )}
                <Circle cx="225" cy="65" r="4.5" fill={isDampened ? Colors.serviceNow : Colors.healthy} />
              </Svg>
            </View>

            {/* Diagnostic Interpretation Box */}
            <View style={styles.diagBox}>
              <Text style={styles.diagTitle}>DIAGNOSTIC METEOROLOGICAL INSIGHT</Text>
              <Text style={styles.diagText}>
                {isDampened
                  ? `Strength measured at ${strength.toFixed(2)} vs baseline expectation ≥ 0.70. Diurnal S2 tidal oscillation has severely dampened, indicating sensor vent clogging or diaphragm stiffness.`
                  : `Heartbeat strength is robust at ${strength.toFixed(2)} (Threshold: ≥ 0.70). Atmospheric tidal diurnal cycle is intact and validating barometer accuracy.`}
              </Text>
            </View>
          </View>
        )}

        {/* CTA to Full Diagnostic Audit */}
        <TouchableOpacity
          style={styles.fullAuditBtn}
          onPress={() => navigation.navigate('Diagnosis', { stationId })}
          activeOpacity={0.8}
        >
          <Text style={styles.fullAuditBtnText}>View Full Multi-Layer Diagnosis</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>

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
  topContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  contextCenter: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  stationLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  stationCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.outline,
  },
  stationCityText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  tuneBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radius2xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  heroLeft: {
    flex: 1,
  },
  heroScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  heroLossNum: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.serviceNow,
  },
  lossBadge: {
    backgroundColor: 'rgba(186, 26, 26, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Spacing.radiusFull,
  },
  lossBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.serviceNow,
  },
  heroSubhead: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
  },
  troubleshootIconBox: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radiusLg,
    backgroundColor: 'rgba(186, 26, 26, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedFilter: {
    flexDirection: 'row',
    backgroundColor: '#EAEFFF',
    borderRadius: Spacing.radiusFull,
    padding: 3,
    marginTop: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSegmentBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  activeSegmentBtnText: {
    color: Colors.primary,
  },
  chartCard: {
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
    marginBottom: Spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  chartTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  falseNegativeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 97, 148, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Spacing.radiusFull,
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  falseNegativeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  anomalyActiveBadge: {
    backgroundColor: 'rgba(186, 26, 26, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Spacing.radiusFull,
  },
  anomalyActiveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.serviceNow,
  },
  svgContainer: {
    marginVertical: Spacing.xs,
  },
  timeTicksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tickLabel: {
    fontSize: 9.5,
    color: Colors.onSurfaceVariant,
  },
  alertTickLabel: {
    color: Colors.serviceNow,
    fontWeight: '700',
  },
  chartFootnote: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
    marginTop: Spacing.xs,
  },
  resonanceChartWrapper: {
    position: 'relative',
    marginVertical: Spacing.xs,
  },
  thresholdZones: {
    gap: 4,
    marginBottom: 6,
  },
  zoneBand: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  zoneLabel: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  diagBox: {
    backgroundColor: '#F8FAFF',
    borderRadius: Spacing.radiusLg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    marginTop: Spacing.xs,
  },
  diagTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  diagText: {
    fontSize: 11.5,
    color: Colors.onSurface,
    lineHeight: 17,
  },
  fullAuditBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.radiusFull,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  fullAuditBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
