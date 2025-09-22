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
    fontSize: Platform.select({ ios: 16, android: 16, default: 16 }),
    fontWeight: Platform.select({ ios: '400', android: '400', default: '400' }),
    letterSpacing: Platform.select({ ios: -0.2, android: 0, default: 0 }),
    lineHeight: Platform.select({ ios: 24, android: 24, default: 24 }),
  },
  bodyLarge: {
    fontSize: Platform.select({ ios: 18, android: 18, default: 18 }),
    fontWeight: Platform.select({ ios: '400', android: '400', default: '400' }),
    letterSpacing: Platform.select({ ios: -0.3, android: 0, default: 0 }),
    lineHeight: Platform.select({ ios: 28, android: 28, default: 28 }),
  },
  caption: {
    fontSize: Platform.select({ ios: 13, android: 13, default: 13 }),
    fontWeight: Platform.select({ ios: '500', android: '500', default: '500' }),
    letterSpacing: Platform.select({ ios: 0, android: 0, default: 0 }),
    lineHeight: Platform.select({ ios: 18, android: 18, default: 18 }),
  },
};

