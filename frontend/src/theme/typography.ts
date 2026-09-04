import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  default: 'System',
});

export const Typography: Record<string, TextStyle> = {
  hero: {
    fontFamily,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1.0,
    lineHeight: 56,
  },
  display: {
    fontFamily,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  title1: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  title2: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  title3: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  body: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodyBold: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  caption: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  captionBold: {
    fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  small: {
    fontFamily,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
};
