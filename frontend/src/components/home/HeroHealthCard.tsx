import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface HeroHealthCardProps {
  healthPct: number;
  totalStations: number;
  healthyCount: number;
  criticalCount: number;
  monitoringCount?: number;
}

export const HeroHealthCard: React.FC<HeroHealthCardProps> = ({
  healthPct = 92.4,
  totalStations = 2595,
  healthyCount = 2401,
  criticalCount = 51,
  monitoringCount = 143,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Decorative ambient background glows */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      {/* Top row: Title and system operational status */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.brandTitle}>SAHASRAKSHA</Text>
          <Text style={styles.brandSubtitle}>सहस्राक्ष · India National Network</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.pulseGreen} />
          <Text style={styles.statusPillText}>System Operational</Text>
        </View>
      </View>

      {/* Hero center metric */}
      <View style={styles.heroCenter}>
        <Text style={styles.heroLabel}>NETWORK HEALTH</Text>
        <Text style={styles.heroValue}>{healthPct.toFixed(1)}%</Text>
        <Text style={styles.heroSub}>{totalStations.toLocaleString()} AWS Stations Online</Text>

        {/* Status Breakdown Capsule */}
        <View style={styles.breakdownCapsule}>
          <Text style={styles.nominalText}>{healthyCount.toLocaleString()} Healthy</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.monitorText}>{monitoringCount} Monitoring</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.criticalText}>{criticalCount} Service Now</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radius2xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(204, 229, 255, 0.6)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 4,
    marginVertical: Spacing.sm,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(204, 229, 255, 0.45)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(225, 224, 255, 0.4)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Spacing.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.7)',
  },
  pulseGreen: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.healthy,
    marginRight: 5,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: 0.2,
  },
  heroCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    zIndex: 2,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.primary,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -1,
    lineHeight: 52,
  },
  heroSub: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  breakdownCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 243, 255, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Spacing.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
  },
  nominalText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  dotSeparator: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    marginHorizontal: 8,
  },
  monitorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  criticalText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.serviceNow,
  },
});
