import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

interface TrendPoint {
  label: string;
  value: number;
}

interface LineTrendChartProps {
  data: TrendPoint[];
  title?: string;
  unit?: string;
  minVal?: number;
  maxVal?: number;
  lineColor?: string;
}

export const LineTrendChart: React.FC<LineTrendChartProps> = ({
  data,
  title,
  unit = '%',
  minVal = 70,
  maxVal = 100,
  lineColor = Colors.primary,
}) => {
  if (!data || data.length === 0) return null;

  const height = 120;
  const values = data.map((d) => d.value);
  const effectiveMin = minVal !== undefined ? minVal : Math.min(...values) - 2;
  const effectiveMax = maxVal !== undefined ? maxVal : Math.max(...values) + 2;
  const range = Math.max(1, effectiveMax - effectiveMin);

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.currentVal}>
            {data[data.length - 1].value.toFixed(1)}
            {unit}
          </Text>
        </View>
      )}

      {/* Chart visualization bars/line simulation */}
      <View style={[styles.chartArea, { height }]}>
        {data.map((pt, idx) => {
          const normHeight = Math.max(8, ((pt.value - effectiveMin) / range) * height);
          const isLast = idx === data.length - 1;

          return (
            <View key={idx} style={styles.col}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: normHeight,
                      backgroundColor: isLast ? lineColor : `${lineColor}88`,
                      borderColor: lineColor,
                      borderTopWidth: 2,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.pointDot,
                    {
                      backgroundColor: isLast ? Colors.paleCyan : lineColor,
                      bottom: normHeight - 4,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.xLabel, isLast && styles.activeXLabel]}>
                {pt.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  currentVal: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 10,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bar: {
    width: '60%',
    maxWidth: 16,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  pointDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  xLabel: {
    ...Typography.small,
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 4,
  },
  activeXLabel: {
    color: Colors.paleCyan,
    fontWeight: '700',
  },
});
