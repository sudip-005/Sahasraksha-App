import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card } from '../../components/common/Card';
import { Colors, Typography, Spacing } from '../../theme';

/**
 * Honest Evaluation
 *
 * Every figure on this screen is reproducible from the public Kaggle
 * notebook. Nothing here is illustrative. Where our own evaluation was
 * found to be flawed, the flawed number is shown alongside the corrected
 * one rather than replaced silently.
 */
export const ValidationScreen: React.FC = () => {
  // Causal evaluation -- scored only on a held-out final 25% that no
  // model ever trained on. Source: notebook Part 24.
  const causalStory = [
    {
      name: 'Original (leaky evaluation)',
      precision: 0.825,
      recall: 0.764,
      far: 0.014,
      f1: null as number | null,
      note: 'Climatology fitted on the full timeline, including the test period.',
      tone: 'urgent' as const,
    },
    {
      name: 'Causal split, static fit',
      precision: 0.175,
      recall: 0.768,
      far: 0.250,
      f1: 0.286,
      note: 'The honest test. Precision collapsed -- we reported this openly.',
      tone: 'urgent' as const,
    },
    {
      name: 'Causal split, walk-forward refit',
      precision: 0.663,
      recall: 0.655,
      far: 0.023,
      f1: 0.659,
      note: 'The fix: climatology refit as time advances, never extrapolated.',
      tone: 'highlight' as const,
    },
  ];

  // Measured operating points -- not a tuning choice still being made.
  const frontier = [
    { mode: 'Network monitoring', k: '3.0', drift: 0.232, far: 0.023, f1: 0.659 },
    { mode: 'Calibration audit', k: '2.0', drift: 0.697, far: 0.094, f1: 0.508 },
  ];

  // Upgrade hypotheses tested against the walk-forward baseline.
  const rejected: [string, string][] = [
    ['Slower refit cadence recovers drift', 'F1 flat 0.63-0.66 across 24h-1440h'],
    ['Sub-weekly cadence keeps improving', '0.03 F1 spread -- indistinguishable from noise'],
    ['Lower CUSUM gain on a quieter baseline', 'Clean monotonic trade-off, no free gain'],
    ['Decouple k_slow from k_fast', 'k_fast had no measurable effect at all'],
    ['Purpose-built rolling-slope drift detector', 'ROC-AUC 0.601, below the 0.65 bar set in advance'],
    ['Per-station adaptive thresholds', '12-27% worse than a single global threshold'],
  ];

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>EVIDENCE, INCLUDING WHAT DID NOT WORK</Text>
        <Text style={styles.title}>Honest Evaluation</Text>
      </View>

      <Card style={styles.card} variant="highlight">
        <Text style={styles.cardHeading}>DATASET AND GROUND TRUTH</Text>
        <Text style={styles.cardBody}>
          2,625,379 real observations from 60 Indian weather stations in the NOAA
          Integrated Surface Database. Independent expert quality flags were used
          only to evaluate, never to train. Every figure below is reproducible
          from the public notebook.
        </Text>
      </Card>

      <Text style={styles.sectionHeader}>WE TESTED OUR OWN EVALUATION, AND IT FAILED</Text>

      {causalStory.map((row, idx) => (
        <Card key={idx} style={styles.modelCard} variant={row.tone}>
          <Text style={styles.modelName}>{row.name}</Text>
          <View style={styles.statRow}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{pct(row.precision)}</Text>
              <Text style={styles.statLabel}>Precision</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{pct(row.recall)}</Text>
              <Text style={styles.statLabel}>Recall</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{pct(row.far)}</Text>
              <Text style={styles.statLabel}>False Alarms</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: Colors.primary }]}>
                {row.f1 === null ? '--' : pct(row.f1)}
              </Text>
              <Text style={styles.statLabel}>F1</Text>
            </View>
          </View>
          <Text style={styles.rowNote}>{row.note}</Text>
        </Card>
      ))}

      <Card style={styles.card}>
        <Text style={styles.cardHeading}>READ THE RECALL COLUMN CAREFULLY</Text>
        <Text style={styles.cardBody}>
          The static causal row appears to have the best recall of the three. It
          does not. It was flagging 25% of all clean observations -- that recall
          is the product of indiscriminate flagging, not detection. Walk-forward
          flags 2.3%, an order of magnitude fewer, and F1 improves 2.3x. Recall
          alone is not a meaningful score at a 25% false-alarm rate.
        </Text>
      </Card>

      <Text style={styles.sectionHeader}>DRIFT IS A FRONTIER, NOT A DEFECT</Text>

      <Card style={styles.card}>
        <Text style={styles.cardBody}>
          Five separate attempts failed to raise drift recall without paying
          proportionally in false alarms. What they produced instead is a cleanly
          measured operating curve. Neither point is correct in the abstract --
          this is a deployment choice.
        </Text>
      </Card>

      {frontier.map((f, idx) => (
        <Card key={idx} style={styles.modelCard}>
          <View style={styles.frontierHead}>
            <Text style={styles.modelName}>{f.mode}</Text>
            <Text style={styles.kTag}>k_slow = {f.k}</Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{pct(f.drift)}</Text>
              <Text style={styles.statLabel}>Drift Recall</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{pct(f.far)}</Text>
              <Text style={styles.statLabel}>False Alarms</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: Colors.primary }]}>{pct(f.f1)}</Text>
              <Text style={styles.statLabel}>F1</Text>
            </View>
          </View>
        </Card>
      ))}

      <Text style={styles.sectionHeader}>SIX UPGRADES ATTEMPTED, SIX REJECTED</Text>

      <Card style={styles.card}>
        <Text style={styles.cardBody}>
          A system that reports only its successful experiments is not reporting
          its evidence. Each hypothesis below was tested against the walk-forward
          baseline and rejected by measurement.
        </Text>
      </Card>

      {rejected.map(([hypothesis, verdict], idx) => (
        <Card key={idx} style={styles.rejectCard}>
          <Text style={styles.rejectName}>{hypothesis}</Text>
          <Text style={styles.rejectVerdict}>{verdict}</Text>
        </Card>
      ))}

      <Text style={styles.sectionHeader}>EVIDENCE THE LAYERS ARE GENUINELY SEPARATE</Text>

      <Card style={styles.card} variant="highlight">
        <Text style={styles.cardHeading}>FROZEN RECALL: 95.1%, INVARIANT</Text>
        <Text style={styles.cardBody}>
          Frozen-fault recall measured 0.9508 at every refit cadence and every
          CUSUM gain tested -- complete invariance. The physics gate does not
          depend on the harmonic or CUSUM layers in any way, which is exactly
          what the "physics first, AI last" ordering was designed to guarantee.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardHeading}>A BELOW-CHANCE SCORE THAT WAS NOT A FAILURE</Text>
        <Text style={styles.cardBody}>
          One station scored ROC-AUC 0.4388 on the residual statistic -- below
          chance. Tracing it showed the station received only dropout faults, and
          dropout is missing data, which a residual cannot rank by construction.
          The responsible layer caught 191 of 191 with zero false positives. The
          score was a metric-attribution artifact, and we report it rather than
          averaging it away.
        </Text>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Reproducible end to end: public Kaggle notebook and open GitHub
          repository. Every number on this screen can be regenerated.
        </Text>
      </View>
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
  sectionHeader: {
    ...Typography.small,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  modelCard: {
    padding: Spacing.md,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.sm,
  },
  modelName: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: Spacing.xs,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  rowNote: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    lineHeight: 16,
  },
  frontierHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kTag: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '700',
  },
  rejectCard: {
    padding: Spacing.sm,
    borderRadius: Spacing.radiusSm,
    marginBottom: Spacing.xs,
  },
  rejectName: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  rejectVerdict: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    ...Typography.small,
    color: Colors.textMuted,
    lineHeight: 16,
  },
});
