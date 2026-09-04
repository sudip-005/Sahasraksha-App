import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStations } from '../../hooks/useStations';
import { AppHeader } from '../../components/common/AppHeader';
import {
  AtmosphericIndiaMap,
  MapLayerType,
  DEFAULT_FALLBACK_POINTS,
} from '../../components/map/AtmosphericIndiaMap';
import { Colors, Typography, Spacing } from '../../theme';
import { StationHealthSummary, StationMapPoint, StationStatus } from '../../types';

interface DisplayStationItem {
  id: string;
  code: string;
  city: string;
  subdivision: string;
  healthPct: number;
  status: StationStatus;
  statusBadge: string;
  lastSeen: string;
  daysToService: string;
  anomaly: string;
  urgency: boolean;
}

const FALLBACK_STATIONS: DisplayStationItem[] = [
  {
    id: 'AWS_DEL_01',
    code: 'VIDD',
    city: 'Safdarjung Delhi',
    subdivision: 'Delhi NCR Met Circle',
    healthPct: 98.5,
    status: 'HEALTHY',
    statusBadge: 'Healthy',
    lastSeen: '2 min ago',
    daysToService: '90 days',
    anomaly: 'All 7 telemetry failure modes nominal',
    urgency: false,
  },
  {
    id: 'AWS_CHE_02',
    code: 'VEBI',
    city: 'Sohra High-Precip Post',
    subdivision: 'East Khasi Hills, Meghalaya',
    healthPct: 48.0,
    status: 'SERVICE_NOW',
    statusBadge: 'Service Now',
    lastSeen: '1 min ago',
    daysToService: '0 days (Urgent)',
    anomaly: 'Anomaly: S2 Tidal Heartbeat dampened; Pressure sensor drift',
    urgency: true,
  },
  {
    id: 'AWS_JAI_01',
    code: 'VIJR',
    city: 'Jaisalmer Desert Post',
    subdivision: 'Rajasthan Desert Circle',
    healthPct: 76.0,
    status: 'MONITOR',
    statusBadge: 'Monitor',
    lastSeen: '3 min ago',
    daysToService: '3 days',
    anomaly: 'Anomaly: Cumulative temperature calibration drift (+0.22°C/d)',
    urgency: false,
  },
  {
    id: 'AWS_LEH_01',
    code: 'VILH',
    city: 'Leh High-Altitude',
    subdivision: 'Ladakh High Altitude Post',
    healthPct: 72.0,
    status: 'MONITOR',
    statusBadge: 'Monitor',
    lastSeen: '4 min ago',
    daysToService: '5 days',
    anomaly: 'Anomaly: Regional spatial discordance (2.7σ divergence)',
    urgency: false,
  },
  {
    id: 'AWS_PUN_01',
    code: 'VAPO',
    city: 'Shivajinagar Pune',
    subdivision: 'Maharashtra Met Circle',
    healthPct: 96.5,
    status: 'HEALTHY',
    statusBadge: 'Healthy',
    lastSeen: 'Just now',
    daysToService: '60 days',
    anomaly: 'All 7 telemetry failure modes nominal',
    urgency: false,
  },
  {
    id: 'AWS_MUM_01',
    code: 'VABB',
    city: 'Colaba Mumbai',
    subdivision: 'Konkan Coastal Region',
    healthPct: 96.0,
    status: 'HEALTHY',
    statusBadge: 'Healthy',
    lastSeen: 'Just now',
    daysToService: '120 days',
    anomaly: 'All 7 telemetry failure modes nominal',
    urgency: false,
  },
  {
    id: 'AWS_BHO_01',
    code: 'VABP',
    city: 'Bhopal Bairagarh',
    subdivision: 'Madhya Pradesh Central',
    healthPct: 0.0,
    status: 'NO_DATA',
    statusBadge: 'No Data',
    lastSeen: '14h ago',
    daysToService: '--',
    anomaly: 'Telemetry carrier link disconnected (packet dropout)',
    urgency: true,
  },
];

interface StationsScreenProps {
  navigation: any;
}

export const StationsScreen: React.FC<StationsScreenProps> = ({ navigation }) => {
  const {
    stations: backendStations,
    mapPoints,
    total,
    search,
    setSearch,
    status: filterStatus,
    setStatus: setFilterStatus,
    sortBy,
    setSortBy,
    loading,
    refetch,
    refetchMap,
  } = useStations();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('health');
  const [selectedStation, setSelectedStation] = useState<StationMapPoint | null>(null);

  // Map backend stations to display format or fallback
  const displayItems: DisplayStationItem[] = useMemo(() => {
    if (backendStations && backendStations.length > 0) {
      return backendStations.map((st: StationHealthSummary) => {
        const isUrgent = st.status === 'SERVICE_NOW';
        let statusBadge = 'Healthy';
        if (st.status === 'SERVICE_NOW') statusBadge = 'Service Now';
        else if (st.status === 'MONITOR') statusBadge = 'Monitor';
        else if (st.status === 'NO_DATA') statusBadge = 'No Data';

        // Find primary anomaly from flags or default
        let anomalyText = 'All 7 telemetry failure modes nominal';
        if (st.sensors && st.sensors.length > 0) {
          const faultySensor = st.sensors.find((s) => s.status === 'FAILED' || s.status === 'DEGRADED');
          if (faultySensor) {
            anomalyText = `Anomaly: ${faultySensor.sensor} flagged (${(faultySensor.drift_score * 100).toFixed(0)}% drift)`;
          }
        }

        return {
          id: st.id,
          code: st.code || st.id,
          city: st.name || st.district || 'Station Node',
          subdivision: `${st.district || ''}, ${st.state || 'India'}`,
          healthPct: st.health_score || 0,
          status: st.status,
          statusBadge,
          lastSeen: st.last_seen ? `${st.last_seen.split('T')[0]}` : 'Recently',
          daysToService: isUrgent ? '0 days (Urgent)' : '45 days',
          anomaly: anomalyText,
          urgency: isUrgent,
        };
      });
    }

    // Fallback if backend is empty
    return FALLBACK_STATIONS.filter((s) => {
      if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s.code.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.anomaly.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [backendStations, filterStatus, search]);

  // Handle station selection on the map
  const handleSelectMapPoint = (point: StationMapPoint) => {
    setSelectedStation(point);
  };

  // Current active map points
  const activeMapPoints = useMemo(() => {
    if (mapPoints && mapPoints.length > 0) return mapPoints;
    return DEFAULT_FALLBACK_POINTS;
  }, [mapPoints]);

  // Selected station fallback to first critical or first point
  const currentSelectedPoint = useMemo(() => {
    if (selectedStation) return selectedStation;
    const critical = activeMapPoints.find((p) => p.status === 'SERVICE_NOW');
    return critical || activeMapPoints[0] || null;
  }, [selectedStation, activeMapPoints]);

  const getStatusBorderColor = (status: StationStatus) => {
    switch (status) {
      case 'SERVICE_NOW':
        return Colors.serviceNow;
      case 'MONITOR':
        return '#F59E0B';
      case 'HEALTHY':
        return Colors.healthy;
      case 'NO_DATA':
        return Colors.outline;
    }
  };

  const getStatusBadgeStyle = (status: StationStatus) => {
    switch (status) {
      case 'SERVICE_NOW':
        return { bg: 'rgba(186, 26, 26, 0.12)', text: Colors.serviceNow };
      case 'MONITOR':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#B45309' };
      case 'HEALTHY':
        return { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669' };
      case 'NO_DATA':
        return { bg: Colors.surfaceContainerHighest, text: Colors.onSurfaceVariant };
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchMap();
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="SAHASRAKSHA"
        subtitle="सहस्राक्ष · Station Network Telemetry"
        liveBadgeText="LIVE · INSAT-3DR"
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      >
        {/* Dynamic Summary Banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.bannerTop}>
            <View style={styles.bannerTagRow}>
              <View style={styles.bluePulseDot} />
              <Text style={styles.bannerTagText}>IMD NATIONAL AWS NETWORK</Text>
            </View>
            <View style={styles.syncCapsule}>
              <Text style={styles.syncCapsuleText}>INSAT-3DR Synced</Text>
            </View>
          </View>

          <View style={styles.bannerCenter}>
            <View>
              <Text style={styles.bannerTitle}>Station Network</Text>
              <Text style={styles.bannerDesc}>
                {total > 0 ? `${total.toLocaleString()} Stations Active` : '2,595 Stations Monitored across 36 meteorological subdivisions'}
              </Text>
            </View>
            <View style={styles.satelliteIconBox}>
              <MaterialCommunityIcons name="satellite-variant" size={24} color={Colors.primary} />
            </View>
          </View>

          {/* View Mode Pill Switcher */}
          <View style={styles.viewModeSwitcher}>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'map' && styles.viewModeBtnActive]}
              onPress={() => setViewMode('map')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="map"
                size={16}
                color={viewMode === 'map' ? Colors.primary : Colors.onSurfaceVariant}
              />
              <Text style={[styles.viewModeText, viewMode === 'map' && styles.viewModeTextActive]}>
                Diagnostic Map
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'list' && styles.viewModeBtnActive]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={16}
                color={viewMode === 'list' ? Colors.primary : Colors.onSurfaceVariant}
              />
              <Text style={[styles.viewModeText, viewMode === 'list' && styles.viewModeTextActive]}>
                Directory List ({displayItems.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 1: Integrated Atmospheric Map (when viewMode is 'map') */}
        {viewMode === 'map' && (
          <View style={styles.mapSection}>
            <View style={styles.mapHeaderRow}>
              <View>
                <Text style={styles.mapSectionTitle}>Subdivision Sensor Topology</Text>
                <Text style={styles.mapSectionSubtitle}>
                  Spatial coherence & isobar contours from live AWS telemetry
                </Text>
              </View>
              <TouchableOpacity
                style={styles.fullScreenMapBtn}
                onPress={() => navigation.navigate('Map')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="arrow-top-right" size={16} color={Colors.primary} />
                <Text style={styles.fullScreenMapText}>Full Map</Text>
              </TouchableOpacity>
            </View>

            {/* Reusable High-Fidelity India Map */}
            <AtmosphericIndiaMap
              mapPoints={activeMapPoints}
              selectedStationId={currentSelectedPoint?.id}
              onSelectStation={handleSelectMapPoint}
              activeLayer={activeLayer}
              onChangeLayer={setActiveLayer}
              height={380}
              showLayerControl={true}
            />

            {/* Selected Station Telemetry Drawer Card */}
            {currentSelectedPoint && (
              <View style={styles.selectedStationCard}>
                <View style={styles.selectedCardHeader}>
                  <View style={styles.selectedCardInfo}>
                    <View style={styles.selectedCodeRow}>
                      <Text style={styles.selectedStationCode}>
                        {currentSelectedPoint.code || currentSelectedPoint.id}
                      </Text>
                      <View
                        style={[
                          styles.statusCapsuleSmall,
                          { backgroundColor: getStatusBadgeStyle(currentSelectedPoint.status).bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusCapsuleSmallText,
                            { color: getStatusBadgeStyle(currentSelectedPoint.status).text },
                          ]}
                        >
                          {currentSelectedPoint.status.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.selectedStationName}>{currentSelectedPoint.name}</Text>
                  </View>

                  <View style={styles.selectedHealthBox}>
                    <Text
                      style={[
                        styles.selectedHealthNum,
                        { color: getStatusBorderColor(currentSelectedPoint.status) },
                      ]}
                    >
                      {currentSelectedPoint.health_score.toFixed(1)}%
                    </Text>
                    <Text style={styles.selectedHealthLbl}>Health</Text>
                  </View>
                </View>

                {/* Quick Telemetry Strip */}
                <View style={styles.selectedTelemetryStrip}>
                  <View style={styles.telemetryMiniItem}>
                    <MaterialCommunityIcons name="thermometer" size={15} color={Colors.primary} />
                    <Text style={styles.telemetryMiniVal}>
                      {currentSelectedPoint.current_temp !== null && currentSelectedPoint.current_temp !== undefined
                        ? `${currentSelectedPoint.current_temp.toFixed(1)}°C`
                        : '27.4°C'}
                    </Text>
                  </View>

                  <View style={styles.telemetryMiniItem}>
                    <MaterialCommunityIcons name="speedometer" size={15} color={Colors.secondary} />
                    <Text style={styles.telemetryMiniVal}>
                      {currentSelectedPoint.current_pressure !== null && currentSelectedPoint.current_pressure !== undefined
                        ? `${currentSelectedPoint.current_pressure.toFixed(1)} hPa`
                        : '1008 hPa'}
                    </Text>
                  </View>

                  <View style={styles.telemetryMiniItem}>
                    <MaterialCommunityIcons name="radar" size={15} color={Colors.healthy} />
                    <Text style={styles.telemetryMiniVal}>
                      Lat {currentSelectedPoint.latitude.toFixed(2)}°
                    </Text>
                  </View>
                </View>

                {/* Action CTA Button */}
                <TouchableOpacity
                  style={styles.inspectBtn}
                  onPress={() =>
                    navigation.navigate('StationDetail', { stationId: currentSelectedPoint.id })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.inspectBtnText}>Examine Station Deep-Dive</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* SECTION 2: Search Bar & Station Directory */}
        <View style={styles.directorySection}>
          <View style={styles.directoryHeaderRow}>
            <Text style={styles.directorySectionTitle}>
              {viewMode === 'map' ? 'All Monitored Stations' : 'Station Directory'}
            </Text>
            <Text style={styles.directoryCountText}>{displayItems.length} Stations</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.outline} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search station or code (e.g. Pune, VIDD, AWS_CHE_02)..."
              placeholderTextColor={Colors.outline}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close-circle" size={18} color={Colors.outline} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Chips Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
            {[
              { id: 'ALL', label: 'All', count: total > 0 ? total.toString() : '12' },
              { id: 'HEALTHY', label: 'Healthy', count: '8', dot: Colors.primary },
              { id: 'MONITOR', label: 'Monitor', count: '2', dot: '#F59E0B' },
              { id: 'SERVICE_NOW', label: 'Service', count: '1', dot: Colors.serviceNow },
              { id: 'NO_DATA', label: 'No Data', count: '1', dot: Colors.outline },
            ].map((chip) => {
              const isActive = filterStatus === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.filterChip, isActive && styles.activeFilterChip]}
                  onPress={() => setFilterStatus(chip.id)}
                  activeOpacity={0.8}
                >
                  {chip.dot && <View style={[styles.chipDot, { backgroundColor: chip.dot }]} />}
                  <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>
                    {chip.label}
                  </Text>
                  <View style={[styles.chipCountBadge, isActive && styles.activeChipCountBadge]}>
                    <Text style={[styles.chipCountText, isActive && styles.activeChipCountText]}>
                      {chip.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sort Controls Bar */}
          <View style={styles.sortBar}>
            <View style={styles.sortBarLeft}>
              <MaterialCommunityIcons name="tune-variant" size={16} color={Colors.onSurfaceVariant} />
              <Text style={styles.resultsCountText}>Showing {displayItems.length} stations</Text>
              {loading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 6 }} />}
            </View>

            <TouchableOpacity
              style={styles.sortDropdownTrigger}
              onPress={() => {
                const nextSort = sortBy === 'health_score' ? 'name' : sortBy === 'name' ? 'last_seen' : 'health_score';
                setSortBy(nextSort);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.sortDropdownTriggerText}>
                Sort: {sortBy === 'health_score' ? 'Risk Priority' : sortBy === 'name' ? 'Station Name' : 'Last Seen'}
              </Text>
              <MaterialCommunityIcons name="swap-vertical" size={16} color={Colors.outline} />
            </TouchableOpacity>
          </View>

          {/* Station Cards List */}
          <View style={styles.cardsList}>
            {displayItems.map((st) => {
              const badgeStyle = getStatusBadgeStyle(st.status);
              const borderColor = getStatusBorderColor(st.status);

              return (
                <TouchableOpacity
                  key={st.id}
                  style={styles.stationCard}
                  onPress={() => navigation.navigate('StationDetail', { stationId: st.id })}
                  activeOpacity={0.8}
                >
                  {/* Left vertical status indicator strip */}
                  <View style={[styles.cardLeftStrip, { backgroundColor: borderColor }]} />

                  <View style={styles.cardMain}>
                    <View style={styles.cardHeader}>
                      <View style={styles.stationCodeCol}>
                        <View style={styles.stationCodeRow}>
                          <Text style={styles.stationCode}>{st.code}</Text>
                          <Text style={styles.separatorDot}>•</Text>
                          <Text style={styles.stationCity}>{st.city}</Text>
                        </View>
                        <View style={styles.metaRow}>
                          <MaterialCommunityIcons name="clock-outline" size={13} color={Colors.onSurfaceVariant} />
                          <Text style={styles.metaText}>Last seen: {st.lastSeen}</Text>
                          <Text style={styles.separatorDot}>•</Text>
                          <Text style={[styles.metaText, st.urgency && styles.urgentText]}>
                            {st.daysToService}
                          </Text>
                        </View>
                      </View>

                      {/* Health & Status Badge */}
                      <View style={styles.healthCol}>
                        <Text style={[styles.healthVal, { color: borderColor }]}>
                          {st.healthPct.toFixed(1)}%
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>
                            {st.statusBadge}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Subdivision context */}
                    <Text style={styles.subdivisionText}>{st.subdivision}</Text>

                    {/* Failure mode anomaly callout */}
                    <View style={styles.anomalyBox}>
                      <MaterialCommunityIcons
                        name={st.urgency ? 'alert' : 'information-outline'}
                        size={14}
                        color={st.urgency ? Colors.serviceNow : Colors.onSurfaceVariant}
                      />
                      <Text style={styles.anomalyText} numberOfLines={1}>
                        {st.anomaly}
                      </Text>
                      <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.outline} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  summaryBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radius2xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  bannerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bluePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  syncCapsule: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Spacing.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
  },
  syncCapsuleText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  bannerCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  satelliteIconBox: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radiusLg,
    backgroundColor: 'rgba(0, 97, 148, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EAEFFF',
    borderRadius: Spacing.radiusFull,
    padding: 3,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Spacing.radiusFull,
  },
  viewModeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  viewModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  viewModeTextActive: {
    color: Colors.primary,
  },
  mapSection: {
    marginBottom: Spacing.lg,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mapSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  mapSectionSubtitle: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  fullScreenMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 97, 148, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Spacing.radiusFull,
  },
  fullScreenMapText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  selectedStationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radius2xl,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(204, 229, 255, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  selectedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  selectedCardInfo: {
    flex: 1,
  },
  selectedCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  selectedStationCode: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  statusCapsuleSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Spacing.radiusFull,
  },
  statusCapsuleSmallText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  selectedStationName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  selectedHealthBox: {
    alignItems: 'flex-end',
  },
  selectedHealthNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  selectedHealthLbl: {
    fontSize: 9.5,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  selectedTelemetryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFF',
    borderRadius: Spacing.radiusLg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: Spacing.sm,
  },
  telemetryMiniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  telemetryMiniVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  inspectBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.radiusFull,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  inspectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  directorySection: {
    marginTop: Spacing.xs,
  },
  directoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  directorySectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  directoryCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radiusFull,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.onSurface,
    padding: 0,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Spacing.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.7)',
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  chipCountBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Spacing.radiusFull,
  },
  activeChipCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  chipCountText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  activeChipCountText: {
    color: '#FFFFFF',
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  sortBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultsCountText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  sortDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Spacing.radiusFull,
  },
  sortDropdownTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  cardsList: {
    gap: 10,
    marginTop: Spacing.xs,
  },
  stationCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.radius2xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 2,
  },
  cardLeftStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardMain: {
    padding: Spacing.md,
    paddingLeft: Spacing.md + 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  stationCodeCol: {
    flex: 1,
  },
  stationCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stationCode: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  separatorDot: {
    fontSize: 12,
    color: Colors.outline,
  },
  stationCity: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  metaText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  urgentText: {
    color: Colors.serviceNow,
    fontWeight: '700',
  },
  healthCol: {
    alignItems: 'flex-end',
  },
  healthVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Spacing.radiusFull,
    marginTop: 2,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subdivisionText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
  },
  anomalyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(242, 243, 255, 0.7)',
    borderRadius: Spacing.radiusMd,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  anomalyText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
    flex: 1,
  },
});
