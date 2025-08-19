import { Platform } from 'react-native';

export default {
  hero: {
    fontSize: Platform.select({ ios: 32, android: 28, default: 30 }),
    fontWeight: Platform.select({ ios: '700', android: 'bold', default: '700' }),
    letterSpacing: Platform.select({ ios: -0.8, android: 0, default: 0 }),
    lineHeight: Platform.select({ ios: 38, android: 34, default: 36 }),
  },
  title: {
    fontSize: Platform.select({ ios: 24, android: 22, default: 23 }),
    fontWeight: Platform.select({ ios: '600', android: 'bold', default: '600' }),
    letterSpacing: Platform.select({ ios: -0.5, android: 0, default: 0 }),
    lineHeight: Platform.select({ ios: 30, android: 28, default: 29 }),
  },
  subtitle: {
    fontSize: Platform.select({ ios: 18, android: 16, default: 17 }),
    fontWeight: Platform.select({ ios: '600', android: 'bold', default: '600' }),
    letterSpacing: Platform.select({ ios: -0.3, android: 0, default: 0 }),
    lineHeight: Platform.select({ ios: 24, android: 22, default: 23 }),
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: Platform.select({ ios: -0.2, android: 0, default: 0 }),
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: Platform.select({ ios: -0.3, android: 0, default: 0 }),
    lineHeight: 28,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0,
  },
};
