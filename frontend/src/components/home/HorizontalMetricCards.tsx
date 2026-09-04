import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface FleetCardItem {
  id: string;
  title: string;
  count: number;
  percentage: string;
  subLabel: string;
  statusColor: string;
  pillBg: string;
  pillText: string;
  dotColor: string;
  pulse?: boolean;
}

interface HorizontalMetricCardsProps {
  healthyCount?: number;
  monitoringCount?: number;
  serviceCount?: number;
  offlineCount?: number;
  onPressCard?: (id: string) => void;
}

export const HorizontalMetricCards: React.FC<HorizontalMetricCardsProps> = ({
  healthyCount = 2401,
  monitoringCount = 143,
  serviceCount = 51,
  offlineCount = 15,
  onPressCard,
}) => {
  const cards: FleetCardItem[] = [
    {
      id: 'healthy',
      title: 'Healthy',
      count: healthyCount,
      percentage: '92.5%',
      subLabel: 'Nominal',
      statusColor: Colors.healthy,
      pillBg: 'rgba(16, 185, 129, 0.1)',
      pillText: '#059669',
      dotColor: Colors.healthy,
    },
    {
      id: 'monitoring',
      title: 'Monitoring',
      count: monitoringCount,
      percentage: '5.5%',
      subLabel: 'Watchlist',
      statusColor: '#D97706',
      pillBg: 'rgba(245, 158, 11, 0.15)',
      pillText: '#B45309',
      dotColor: '#F59E0B',
      pulse: true,
    },
    {
      id: 'service',
      title: 'Service Now',
      count: serviceCount,
      percentage: '2.0%',
      subLabel: 'Faulted',
      statusColor: Colors.serviceNow,
      pillBg: 'rgba(186, 26, 26, 0.12)',
      pillText: Colors.serviceNow,
      dotColor: Colors.serviceNow,
      pulse: true,
    },
    {
      id: 'offline',
      title: 'Offline / Silent',
      count: offlineCount,
      percentage: '0.6%',
      subLabel: 'Inactive',
      statusColor: Colors.noData,
      pillBg: Colors.surfaceContainerHighest,
      pillText: Colors.onSurfaceVariant,
      dotColor: Colors.outline,
    },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>CURRENT NETWORK FLEET</Text>
        <Text style={styles.syncText}>Live Sync</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            activeOpacity={0.8}
            onPress={() => onPressCard && onPressCard(card.id)}
            style={styles.card}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardCategory}>{card.title}</Text>
              <View style={[styles.statusDot, { backgroundColor: card.dotColor }]} />
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.countText}>{card.count.toLocaleString()}</Text>
              <View style={[styles.badge, { backgroundColor: card.pillBg }]}>
                <Text style={[styles.badgeText, { color: card.pillText }]}>
                  {card.percentage} {card.subLabel}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  scrollContent: {
    paddingVertical: 4,
    gap: Spacing.sm,
  },
  card: {
    width: 165,
    minHeight: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radiusLg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.7)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 3,
    justifyContent: 'space-between',
    marginRight: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  cardBottom: {
    marginTop: Spacing.sm,
  },
  countText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Spacing.radiusFull,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
