import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface EmptyStateProps {
  title: string;
  message: string;
  iconText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  iconText = '🔍',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{iconText}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 42,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.title3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  message: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
});
