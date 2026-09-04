import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../theme';

interface FloatingTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const getTabIconName = (name: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (name) {
      case 'Home':
        return 'thermometer';
      case 'Map':
        return 'compass-outline';
      case 'Alerts':
        return 'bell-outline';
      case 'Stations':
        return 'transmission-tower';
      default:
        return 'view-dashboard-outline';
    }
  };

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View style={styles.container}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const isAlertTab = route.name === 'Alerts';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.name}
              onPress={onPress}
              style={[styles.tab, isFocused && styles.activeTab]}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={getTabIconName(route.name)}
                  size={22}
                  color={isFocused ? Colors.primary : Colors.onSurfaceVariant}
                />
                {isAlertTab && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>12</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isFocused ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: Spacing.radiusFull,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(218, 226, 253, 0.8)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 8,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: Spacing.radiusFull,
  },
  activeTab: {
    backgroundColor: 'rgba(204, 229, 255, 0.4)',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 24,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -10,
    backgroundColor: Colors.serviceNow,
    borderRadius: Spacing.radiusFull,
    paddingHorizontal: 4.5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  inactiveLabel: {
    color: Colors.onSurfaceVariant,
  },
});
