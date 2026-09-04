import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme';

interface StationClusterMarkerProps {
  count: number;
}

export const StationClusterMarker: React.FC<StationClusterMarkerProps> = ({ count }) => {
  return (
    <View style={styles.container}>
      <View style={styles.outerCircle}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryDark,
    borderWidth: 2,
    borderColor: Colors.paleCyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  countText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
});
