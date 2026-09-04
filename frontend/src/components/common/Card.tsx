import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'highlight' | 'urgent';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  const getBorderColor = () => {
    if (variant === 'highlight') return Colors.primary;
    if (variant === 'urgent') return Colors.serviceNow;
    return Colors.border;
  };

  return (
    <View style={[styles.card, { borderColor: getBorderColor() }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    borderWidth: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
});
