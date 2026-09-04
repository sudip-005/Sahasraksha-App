import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor, getStatusLabel } from '../../utils/statusColor';
import { Typography, Spacing } from '../../theme';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  const getContainerStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smContainer;
      case 'lg':
        return styles.lgContainer;
      default:
        return styles.mdContainer;
    }
  };

  const getTextStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smText;
      case 'lg':
        return styles.lgText;
      default:
        return styles.mdText;
    }
  };

  return (
    <View style={[styles.badge, getContainerStyle(), { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
      {showDot && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={[getTextStyle(), { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.radiusFull,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  smContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  smText: {
    ...Typography.small,
    fontWeight: '700',
  },
  mdContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  mdText: {
    ...Typography.captionBold,
  },
  lgContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  lgText: {
    ...Typography.bodyBold,
  },
});
