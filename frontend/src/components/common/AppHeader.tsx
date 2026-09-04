import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  liveBadgeText?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'SAHASRAKSHA',
  subtitle = 'सहस्राक्ष · National Network',
  showBack = false,
  onBack,
  rightAction,
  liveBadgeText = 'LIVE · INSAT-3DR',
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, height: 64 + insets.top }]}>
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="radar" size={20} color={Colors.onPrimary} />
          </View>
        )}

        <View style={styles.titleCol}>
          <View style={styles.titleRow}>
            <Text style={styles.appTitle}>{title}</Text>
            <View style={styles.imdBadge}>
              <Text style={styles.imdBadgeText}>IMD</Text>
            </View>
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {rightAction ? (
          rightAction
        ) : (
          <View style={styles.livePill}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>{liveBadgeText}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(218, 226, 253, 0.6)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radiusMd,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  titleCol: {
    justifyContent: 'center',
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    ...Typography.title3,
    color: Colors.onSurface,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  imdBadge: {
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: Spacing.radiusXs,
    marginLeft: 6,
  },
  imdBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    ...Typography.small,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: Spacing.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.healthy,
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: 0.4,
  },
});
