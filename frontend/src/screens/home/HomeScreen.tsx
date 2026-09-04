import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNetworkOverview } from '../../hooks/useNetworkOverview';
import { AppHeader } from '../../components/common/AppHeader';
import { HeroHealthCard } from '../../components/home/HeroHealthCard';
import { HorizontalMetricCards } from '../../components/home/HorizontalMetricCards';
import { HourlyDetectionRow } from '../../components/home/HourlyDetectionRow';
import { NetworkTrendCard } from '../../components/home/NetworkTrendCard';
import { HomeBentoGrid } from '../../components/home/HomeBentoGrid';
import { PriorityStationsList } from '../../components/home/PriorityStationsList';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ErrorState } from '../../components/common/ErrorState';
import { Colors, Typography, Spacing } from '../../theme';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { overview, loading, error, refetch } = useNetworkOverview();

  if (error && !overview) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <View style={styles.screen}>
      <AppHeader
        title="SAHASRAKSHA"
        subtitle="सहस्राक्ष · National Network"
        liveBadgeText="LIVE · INSAT-3DR"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.primary} />
        }
      >
        {/* 1. Hero Health % Card */}
        {overview ? (
          <HeroHealthCard
            healthPct={overview.network_health_pct || 92.4}
            totalStations={overview.total_stations || 2595}
            healthyCount={overview.healthy_stations || 2401}
            criticalCount={overview.service_now_stations || 51}
            monitoringCount={overview.monitor_stations || 143}
          />
        ) : (
          <SkeletonLoader height={200} borderRadius={Spacing.radius2xl} />
        )}

        {/* 2. Feature Banner: Nationwide AWS Grid Synchrony */}
        <View style={styles.featureBanner}>
          <View style={styles.featureBannerOverlay}>
            <View style={styles.bannerTagRow}>
              <MaterialCommunityIcons name="satellite-variant" size={16} color="#FFFFFF" />
              <Text style={styles.bannerTagText}>NATIONWIDE AWS GRID</Text>
            </View>
            <Text style={styles.bannerHeadline}>Real-Time Sensor Synchrony: 99.4%</Text>
            <Text style={styles.bannerSubhead}>सहस्राक्ष · India National Network</Text>
          </View>
        </View>

        {/* 3. Current Network Fleet */}
        <HorizontalMetricCards
          healthyCount={overview?.healthy_stations || 2401}
          monitoringCount={overview?.monitor_stations || 143}
          serviceCount={overview?.service_now_stations || 51}
          offlineCount={15}
          onPressCard={(id) => {
            if (id === 'service' || id === 'monitoring') navigation.navigate('Alerts');
            else navigation.navigate('Stations');
          }}
        />

        {/* 4. Hourly Telemetry Anomaly Detections */}
        <HourlyDetectionRow />

        {/* 5. 10-Day Network Health Trend SVG Area Chart */}
        <NetworkTrendCard />

        {/* 6. 2x2 Bento Grid: Heartbeat, Alerts, Degradation, Cadence */}
        <HomeBentoGrid
          onPressHeartbeat={() => navigation.navigate('PressureHeartbeat', { stationId: 'AWS_PNQ' })}
          onPressAlerts={() => navigation.navigate('Alerts')}
          onPressDegradation={() => navigation.navigate('Diagnosis', { stationId: 'AWS_DEL' })}
          onPressCadence={() => navigation.navigate('LiveDetection')}
        />

        {/* 7. Priority Observation Stations */}
        <PriorityStationsList
          onSelectStation={(id) => navigation.navigate('StationDetail', { stationId: id })}
          onViewAll={() => navigation.navigate('Stations')}
        />

        {/* 8. Footer Callout: Auto-recalibration + Action Button */}
        <View style={styles.footerCallout}>
          <View style={styles.footerCalloutLeft}>
            <MaterialCommunityIcons name="tune-variant" size={20} color={Colors.primary} />
            <Text style={styles.footerCalloutText}>Auto-recalibration dispatched</Text>
          </View>
          <TouchableOpacity
            style={styles.footerCtaBtn}
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.8}
          >
            <Text style={styles.footerCtaBtnText}>View Diagnostic Map</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  featureBanner: {
    height: 125,
    borderRadius: Spacing.radiusLg,
    backgroundColor: '#0F1E36',
    marginVertical: Spacing.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(204, 229, 255, 0.5)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  featureBannerOverlay: {
    padding: Spacing.md,
    backgroundColor: 'rgba(5, 20, 36, 0.75)',
  },
  bannerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93CCFF',
    letterSpacing: 1.0,
  },
  bannerHeadline: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  bannerSubhead: {
    fontSize: 11,
    color: '#BAE6FD',
    marginTop: 2,
  },
  footerCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(226, 231, 255, 0.65)',
    borderRadius: Spacing.radiusLg,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
  },
  footerCalloutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  footerCalloutText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
    flexShrink: 1,
  },
  footerCtaBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Spacing.radiusMd,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  footerCtaBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
