import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedIndex,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option, idx) => {
        const isSelected = selectedIndex === idx;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.segment, isSelected && styles.selectedSegment]}
            onPress={() => onSelect(idx)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                isSelected ? styles.selectedText : styles.unselectedText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSecondary,
    borderRadius: Spacing.radiusMd,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.radiusSm,
  },
  selectedSegment: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    ...Typography.captionBold,
  },
  selectedText: {
    color: Colors.textInverted,
  },
  unselectedText: {
    color: Colors.textSecondary,
  },
});
