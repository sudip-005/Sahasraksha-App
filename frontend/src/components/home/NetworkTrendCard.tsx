import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../theme';

export const NetworkTrendCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="calendar-month-outline" size={18} color={Colors.onSurfaceVariant} />
          <Text style={styles.title}>10-DAY NETWORK HEALTH TREND</Text>
        </View>
        <Text style={styles.trendMetric}>94.0% → 92.4%</Text>
      </View>

      <View style={styles.chartContainer}>
        <Svg width="100%" height={70} viewBox="0 0 340 70">
          <Defs>
            <LinearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#0284C7" />
              <Stop offset="70%" stopColor="#38BDF8" />
              <Stop offset="100%" stopColor="#F59E0B" />
            </LinearGradient>
            <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Area Fill */}
          <Path
            d="M 10 16 C 50 14, 90 20, 130 22 C 170 24, 210 32, 250 30 C 280 28, 305 40, 330 42 L 330 65 L 10 65 Z"
            fill="url(#areaGradient)"
          />

          {/* Trend Line */}
          <Path
            d="M 10 16 C 50 14, 90 20, 130 22 C 170 24, 210 32, 250 30 C 280 28, 305 40, 330 42"
            fill="none"
            stroke="url(#trendGradient)"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Key Trend Points */}
          <Circle cx="10" cy="16" r="3.5" fill="#0284C7" />
          <Circle cx="130" cy="22" r="3.5" fill="#0284C7" />
          <Circle cx="250" cy="30" r="3.5" fill="#38BDF8" />
          <Circle cx="330" cy="42" r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth={2} />
        </Svg>

        <View style={styles.daysRow}>
          <Text style={styles.dayLabel}>Day -10</Text>
          <Text style={styles.dayLabel}>Day -7</Text>
          <Text style={styles.dayLabel}>Day -4</Text>
          <Text style={styles.dayLabel}>Day -2</Text>
          <Text style={[styles.dayLabel, styles.todayLabel]}>Today</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radiusLg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.7)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  trendMetric: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  chartContainer: {
    paddingTop: 6,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  todayLabel: {
    color: Colors.onSurface,
    fontWeight: '800',
  },
});
