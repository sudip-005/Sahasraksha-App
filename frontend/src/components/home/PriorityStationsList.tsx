import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStations } from '../../hooks/useStations';
import { Colors, Typography, Spacing } from '../../theme';
import { StationHealthSummary } from '../../types';

interface StationItem {
  id: string;
  name: string;
  subdivision: string;
  healthPct: number;
  status: 'SERVICE' | 'MONITOR' | 'NOMINAL';
  diagnosis: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconBg: string;
  iconColor: string;
}

interface PriorityStationsListProps {
  onSelectStation: (stationId: string) => void;
  onViewAll?: () => void;
}

const FALLBACK_ITEMS: StationItem[] = [
  {
    id: 'AWS_CHE_02',
    name: 'Sohra High-Precip (VEBI)',
    subdivision: 'East Khasi Hills, Meghalaya',
    healthPct: 48.0,
    status: 'SERVICE',
    diagnosis: 'Pressure tidal heartbeat dampened (-51%)',
    icon: 'wrench',
    iconBg: 'rgba(186, 26, 26, 0.12)',
    iconColor: Colors.serviceNow,
  },
  {
    id: 'AWS_JAI_01',
    name: 'Jaisalmer Desert Post (VIJR)',
    subdivision: 'Rajasthan Desert Circle',
    healthPct: 76.0,
    status: 'MONITOR',
    diagnosis: 'Cumulative temperature drift (+0.22°C/d)',
    icon: 'trending-up',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#D97706',
  },
  {
    id: 'AWS_LEH_01',
    name: 'Leh High-Altitude (VILH)',
    subdivision: 'Ladakh High-Altitude Post',
    healthPct: 72.0,
    status: 'MONITOR',
    diagnosis: 'Spatial discordance (2.7σ divergence)',
    icon: 'eye-outline',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#D97706',
  },
  {
    id: 'AWS_DEL_01',
    name: 'Safdarjung Delhi (VIDD)',
    subdivision: 'Delhi NCR Met Circle',
    healthPct: 98.5,
    status: 'NOMINAL',
    diagnosis: 'All 7 telemetry failure modes nominal',
    icon: 'check-decagram',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    iconColor: Colors.healthy,
  },
];

export const PriorityStationsList: React.FC<PriorityStationsListProps> = ({
  onSelectStation,
  onViewAll,
}) => {
  const { stations: backendStations } = useStations();

  const stations: StationItem[] = useMemo(() => {
    if (backendStations && backendStations.length > 0) {
      // Sort by risk priority: SERVICE_NOW first, then MONITOR, then others
      const sorted = [...backendStations].sort((a, b) => {
        const order: Record<string, number> = { SERVICE_NOW: 0, MONITOR: 1, NO_DATA: 2, HEALTHY: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      });

      return sorted.slice(0, 4).map((st: StationHealthSummary) => {
        const isService = st.status === 'SERVICE_NOW';
        const isMonitor = st.status === 'MONITOR';

        let diagnosis = 'All 7 telemetry failure modes nominal';
        if (st.sensors && st.sensors.length > 0) {
          const faulty = st.sensors.find((s) => s.status === 'FAILED' || s.status === 'DEGRADED');
          if (faulty) {
            diagnosis = `${faulty.sensor} sensor drift flagged (${(faulty.drift_score * 100).toFixed(0)}%)`;
          }
        }

        return {
          id: st.id,
          name: `${st.name} (${st.code || st.id})`,
          subdivision: `${st.district || ''}, ${st.state || 'India'}`,
          healthPct: st.health_score || 0,
          status: isService ? 'SERVICE' : isMonitor ? 'MONITOR' : 'NOMINAL',
          diagnosis,
          icon: isService ? 'wrench' : isMonitor ? 'eye-outline' : 'check-decagram',
          iconBg: isService
            ? 'rgba(186, 26, 26, 0.12)'
            : isMonitor
            ? 'rgba(245, 158, 11, 0.15)'
            : 'rgba(16, 185, 129, 0.12)',
          iconColor: isService ? Colors.serviceNow : isMonitor ? '#D97706' : Colors.healthy,
        };
      });
    }

    return FALLBACK_ITEMS;
  }, [backendStations]);

  const getStatusBadge = (status: StationItem['status']) => {
    switch (status) {
      case 'SERVICE':
        return (
          <View style={[styles.badge, { backgroundColor: Colors.serviceNow }]}>
            <Text style={styles.serviceBadgeText}>SERVICE</Text>
          </View>
        );
      case 'MONITOR':
        return (
          <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Text style={[styles.badgeText, { color: '#B45309' }]}>MONITOR</Text>
          </View>
        );
      case 'NOMINAL':
        return (
          <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Text style={[styles.badgeText, { color: '#059669' }]}>NOMINAL</Text>
          </View>
        );
    }
  };

  const getHealthColor = (status: StationItem['status']) => {
    switch (status) {
      case 'SERVICE':
        return Colors.serviceNow;
      case 'MONITOR':
        return '#D97706';
      case 'NOMINAL':
        return Colors.healthy;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="transmission-tower" size={18} color={Colors.onSurfaceVariant} />
          <Text style={styles.title}>PRIORITY OBSERVATION STATIONS</Text>
        </View>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {stations.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.stationRow}
            onPress={() => onSelectStation(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.leftCol}>
              <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                <MaterialCommunityIcons name={item.icon} size={18} color={item.iconColor} />
              </View>
              <View style={styles.nameCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.stationName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {getStatusBadge(item.status)}
                </View>
                <Text style={styles.diagnosisText} numberOfLines={1}>
                  {item.diagnosis}
                </Text>
              </View>
            </View>

            <View style={styles.rightCol}>
              <Text style={[styles.healthNum, { color: getHealthColor(item.status) }]}>
                {item.healthPct.toFixed(1)}%
              </Text>
              <Text style={styles.healthLabel}>Health</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerTitleRow: {
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
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  list: {
    gap: 8,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: Spacing.radiusMd,
    backgroundColor: 'rgba(242, 243, 255, 0.6)',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  nameCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stationName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Spacing.radiusFull,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  serviceBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: '#FFFFFF',
  },
  diagnosisText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  healthNum: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  healthLabel: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
});
