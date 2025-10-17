import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DESIGN from '../theme';

const HamburgerButton = ({ onPress, isActive = false }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isActive && styles.buttonActive
        ]}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        accessibilityHint="Opens the navigation menu"
      >
        <MaterialCommunityIcons
          name="menu"
          size={24}
          color={DESIGN.colors.surface}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.md,
    backgroundColor: DESIGN.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonActive: {
    backgroundColor: DESIGN.colors.primaryLight,
  },
});

export default HamburgerButton;
