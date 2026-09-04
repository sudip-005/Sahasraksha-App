import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';
import { getStatusColor } from '../../utils/statusColor';

interface StationFilterChipsProps {
  selectedFilter: string;
  onSelect: (filter: string) => void;
  counts?: Record<string, number>;
}

export const StationFilterChips: React.FC<StationFilterChipsProps> = ({
  selectedFilter,
  onSelect,
  counts,
}) => {
  const filters = [
    { key: 'ALL', label: 'All AWS' },
    { key: 'HEALTHY', label: 'Healthy' },
    { key: 'MONITOR', label: 'Monitor' },
    { key: 'SERVICE_NOW', label: 'Service Now' },
    { key: 'NO_DATA', label: 'No Data' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((f) => {
        const isSelected = selectedFilter === f.key;
        const color = f.key === 'ALL' ? Colors.primary : getStatusColor(f.key);
        const count = counts ? counts[f.key] : undefined;

        return (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.chip,
              isSelected && { backgroundColor: `${color}25`, borderColor: color },
            ]}
            onPress={() => onSelect(f.key)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: f.key === 'ALL' ? Colors.primary : color },
              ]}
            />
            <Text
              style={[
                styles.chipText,
                isSelected ? { color: Colors.textPrimary, fontWeight: '700' } : styles.unselectedText,
              ]}
            >
              {f.label}
              {count !== undefined ? ` (${count})` : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  chipText: {
    ...Typography.caption,
  },
  unselectedText: {
    color: Colors.textSecondary,
  },
});
