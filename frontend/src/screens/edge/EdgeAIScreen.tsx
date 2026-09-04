import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card } from '../../components/common/Card';
import { Colors, Typography, Spacing } from '../../theme';

export const EdgeAIScreen: React.FC = () => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>HARDWARE DEPLOYMENT ARCHITECTURE</Text>
        <Text style={styles.title}>Edge AI & ESP32 Micro-Sentinel</Text>
      </View>

      <Card style={styles.card} variant="highlight">
        <Text style={styles.cardHeading}>ON-DEVICE LAYER 1 EXECUTION (SRS §26)</Text>
        <Text style={styles.cardBody}>
          In remote Indian terrains (Western Ghats, Ladakh, Thar desert), cellular telemetry can be intermittent.
          SAHASRAKSHA deploys a lightweight C++ Micro-Sentinel firmware directly onto ESP32-S3 microcontrollers
          interfacing with Bosch BME280 / PT100 RTD sensor buses.
        </Text>
      </Card>

      <Card style={styles.specCard}>
        <Text style={styles.specTitle}>HARDWARE ARCHITECTURE SPECIFICATIONS</Text>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Microcontroller:</Text>
          <Text style={styles.specVal}>ESP32-S3 Dual-Core Xtensa LX7 (240 MHz)</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Sensor Array:</Text>
          <Text style={styles.specVal}>BME280 (P, T, RH) + Ultrasonic 2D Wind</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Edge Firmware Footprint:</Text>
          <Text style={styles.specVal}>14.2 KB SRAM (Runs in 1.2 ms per tick)</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Edge Layer 1 Bounds:</Text>
          <Text style={styles.specVal}>Thermodynamic Dew Point + Acoustic ΔP</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Storage Buffer:</Text>
          <Text style={styles.specVal}>SPIFFS Ring Buffer (Stores 7 days offline)</Text>
        </View>
      </Card>

      <Card style={styles.specCard}>
        <Text style={styles.specTitle}>FAIL-SAFE PACKET TELEMETRY PROTOCOL</Text>
        <Text style={styles.cardBody}>
          If an unphysical spike or ADC freeze occurs, the ESP32 attaches a 1-byte bitmask flag to the MQTT/LoRaWAN packet.
          The central backend validates the flag and routes the event directly into the Layer 1 exception pipeline,
          bypassing network transmission delays.
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
  specCard: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.md,
  },
  specTitle: {
    ...Typography.small,
    color: Colors.paleCyan,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  specLabel: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  specVal: {
    ...Typography.caption,
    color: Colors.textSecondary,
    maxWidth: '55%',
    textAlign: 'right',
  },
});
