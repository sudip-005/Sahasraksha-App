import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { demoApi } from '../../services/demoApi';
import { Card } from '../../components/common/Card';
import { Colors, Typography, Spacing } from '../../theme';

export const DemoModeScreen: React.FC = () => {
  const [stationId, setStationId] = useState('AWS_DEL_01');
  const [sensorType, setSensorType] = useState('TEMPERATURE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const failureTypes = [
    { key: 'SPIKE', name: '1. Spike Transient', icon: '⚡', desc: 'Single-sample thermodynamic limit violation (>58°C, Tdew > T)' },
    { key: 'FREEZE', name: '2. Sensor ADC Freeze', icon: '❄️', desc: 'Frozen bitstream / stuck identical value across 5 intervals' },
    { key: 'DRIFT', name: '3. Cumulative Drift', icon: '📈', desc: 'Gradual linear calibration bias (+3.5°C) caught by CUSUM' },
    { key: 'STEP', name: '4. Abrupt Step Jump', icon: '🪜', desc: 'Sudden +9.5°C offset violating temporal acoustic rate limits' },
    { key: 'NOISE', name: '5. High-Freq Noise', icon: '〰️', desc: 'Degraded analog amplifier variance and SNR decay' },
    { key: 'DROPOUT', name: '6. Telemetry Dropout', icon: '🕳️', desc: 'Complete loss of transmission packets (silent station)' },
    { key: 'SLUGGISH', name: '7. Sluggish / Clogged', icon: '🐌', desc: 'Attenuated diurnal solar tidal wave (clogged pressure vent)' },
  ];

  const handleInject = async (type: string) => {
    try {
      setLoading(true);
      const res = await demoApi.injectFault({
        station_id: stationId,
        sensor_type: type === 'SLUGGISH' ? 'PRESSURE' : sensorType,
        fault_type: type,
        intensity: 1.5,
      });
      setResult(res);
    } catch (e: any) {
      alert(e.message || 'Injection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const res = await demoApi.resetDemo();
      setResult({ reset: true, message: res.message });
    } catch (e: any) {
      alert(e.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>EVALUATOR INTERACTIVE CONTROL PANEL</Text>
          <Text style={styles.title}>Demo Fault Injection</Text>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetText}>↺ RESET ALL</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.targetCard}>
        <Text style={styles.targetLabel}>TARGET AWS OBSERVATORY:</Text>
        <Text style={styles.targetName}>New Delhi Safdarjung (VIDD • AWS_DEL_01)</Text>
      </Card>

      {/* Result feedback banner */}
      {result && (
        <Card style={styles.resultCard} variant={result.reset ? 'default' : 'urgent'}>
          <Text style={styles.resTitle}>
            {result.reset ? '✅ BASELINE RESTORED' : `⚠️ FAULT INJECTED: ${result.fault_type}`}
          </Text>
          <Text style={styles.resMsg}>{result.message}</Text>
          {!result.reset && (
            <View style={styles.resScoreRow}>
              <Text style={styles.resScoreText}>
                Previous Score: {result.previous_health_score}% ➔ New Score: {result.new_health_score}%
              </Text>
              <Text style={styles.resStatusText}>Status: {result.new_status}</Text>
            </View>
          )}
        </Card>
      )}

      {loading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 10 }} />}

      <Text style={styles.sectionTitle}>SELECT ONE OF 7 SENSOR FAILURE MODES:</Text>

      {failureTypes.map((ft) => (
        <TouchableOpacity
          key={ft.key}
          style={styles.faultCardTouch}
          onPress={() => handleInject(ft.key)}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Card style={styles.faultCard}>
            <View style={styles.faultTop}>
              <Text style={styles.faultIcon}>{ft.icon}</Text>
              <View style={styles.faultInfo}>
                <Text style={styles.faultName}>{ft.name}</Text>
                <Text style={styles.faultDesc}>{ft.desc}</Text>
              </View>
            </View>
            <View style={styles.injectBadge}>
              <Text style={styles.injectText}>INJECT FAULT ➔</Text>
            </View>
          </Card>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  resetBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: Colors.serviceNow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Spacing.radiusSm,
  },
  resetText: {
    ...Typography.small,
    color: Colors.serviceNow,
    fontWeight: '700',
  },
  targetCard: {
    padding: Spacing.sm,
    borderRadius: Spacing.radiusSm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.cardSecondary,
  },
  targetLabel: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  targetName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  resultCard: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.md,
  },
  resTitle: {
    ...Typography.title3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  resMsg: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  resScoreRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: 6,
  },
  resScoreText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  resStatusText: {
    ...Typography.captionBold,
    color: Colors.serviceNow,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.small,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  faultCardTouch: {
    marginBottom: Spacing.sm,
  },
  faultCard: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
  },
  faultTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faultIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  faultInfo: {
    flex: 1,
  },
  faultName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  faultDesc: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  injectBadge: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  injectText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '700',
  },
});
