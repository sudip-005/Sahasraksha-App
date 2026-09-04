import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useStationDetail } from '../../hooks/useStationDetail';
import { Card } from '../../components/common/Card';
import { EvidenceCard } from '../../components/diagnosis/EvidenceCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { Colors, Typography, Spacing } from '../../theme';

interface DiagnosisScreenProps {
  route: any;
  navigation: any;
}

export const DiagnosisScreen: React.FC<DiagnosisScreenProps> = ({
  route,
  navigation,
}) => {
  const { stationId } = route.params || { stationId: 'AWS_DEL_01' };
  const { station, diagnosis, loading, refetch } = useStationDetail(stationId);

  if (loading && !diagnosis) {
    return (
      <View style={styles.screen}>
        <SkeletonLoader height={240} borderRadius={Spacing.radiusLg} />
      </View>
    );
  }

  if (!diagnosis) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>No diagnostic records found for station {stationId}.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.primary} />
      }
    >
      {/* Station Context */}
      <View style={styles.topContext}>
        <View>
          <Text style={styles.subtitle}>EXPLAINABLE-AI ROOT CAUSE AUDIT</Text>
          <Text style={styles.title}>{diagnosis.station_name}</Text>
          <Text style={styles.codeText}>ID: {diagnosis.station_id}</Text>
        </View>
        <StatusBadge status={diagnosis.overall_status} size="lg" />
      </View>

      {/* Plain-English Conclusion Banner */}
      <Card style={styles.conclusionCard} variant={diagnosis.overall_status === 'SERVICE_NOW' ? 'urgent' : 'highlight'}>
        <Text style={styles.conclusionHeading}>DIAGNOSTIC SYNTHESIS & REASONING:</Text>
        <Text style={styles.conclusionBody}>{diagnosis.plain_english_summary}</Text>

        <View style={styles.divider} />

        <Text style={styles.actionHeading}>RECOMMENDED ACTION:</Text>
        <Text style={styles.actionBody}>{diagnosis.recommended_action}</Text>

        {diagnosis.overall_status === 'SERVICE_NOW' && (
          <TouchableOpacity
            style={styles.workOrderBtn}
            onPress={() => navigation.navigate('Maintenance')}
            activeOpacity={0.8}
          >
            <Text style={styles.workOrderBtnText}>DISPATCH WORK ORDER 🛠️</Text>
          </TouchableOpacity>
        )}
      </Card>

      <Text style={styles.evidenceSectionTitle}>
        4-LAYER SENTINEL EVIDENCE PROOFS
      </Text>

      {/* Render 4 Evidence Cards */}
      {diagnosis.evidence_cards.map((ec, idx) => (
        <EvidenceCard key={idx} data={ec} />
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
  errorText: {
    ...Typography.body,
    color: Colors.serviceNow,
    padding: Spacing.lg,
  },
  topContext: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  codeText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  conclusionCard: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.lg,
  },
  conclusionHeading: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  conclusionBody: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: Spacing.md,
  },
  actionHeading: {
    ...Typography.small,
    color: Colors.monitor,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  actionBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  workOrderBtn: {
    backgroundColor: Colors.serviceNow,
    borderRadius: Spacing.radiusSm,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  workOrderBtnText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  evidenceSectionTitle: {
    ...Typography.small,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
});
