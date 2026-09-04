import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card } from '../../components/common/Card';
import { Colors, Typography, Spacing } from '../../theme';
import { API_BASE_URL, WS_BASE_URL, APP_CONFIG } from '../../utils/constants';

export const SettingsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>SENTINEL SYSTEM CONFIGURATION</Text>
        <Text style={styles.title}>Settings & Endpoints</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>BACKEND SERVICE CONFIG</Text>
        <View style={styles.row}>
          <Text style={styles.label}>REST API Base:</Text>
          <Text style={styles.val}>{API_BASE_URL}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>WebSocket Stream:</Text>
          <Text style={styles.val}>{WS_BASE_URL}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Heartbeat Diurnal Polling:</Text>
          <Text style={styles.val}>30s Continuous</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>PLATFORM ATTRIBUTION</Text>
        <Text style={styles.desc}>
          SAHASRAKSHA (सहस्राक्ष) — Intelligent Automatic Weather Station Health Monitoring Platform.
          Engineered for India Meteorological Department (IMD) sensor fault isolation.
        </Text>
        <Text style={[styles.desc, { marginTop: 8, color: Colors.paleCyan }]}>
          Version 1.0.0 (Production Sentinel Edition)
        </Text>
      </Card>
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
  cardTitle: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  label: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  val: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  desc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
