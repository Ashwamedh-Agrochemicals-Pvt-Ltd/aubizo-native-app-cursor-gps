import { useRef, useEffect } from "react";
import { Animated, TouchableOpacity, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../../styles/appHeader.style"
import DESIGN from "../../theme";

const AnimatedMenuItem = ({ item, onPress, index, isLogout = false }) => {
  const slideAnim = useRef(new Animated.Value(500)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 50;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}
    >
      <TouchableOpacity
        style={[styles.menuItem, isLogout && styles.logoutItem]}
        onPress={() => onPress(item.route)}
        activeOpacity={0.6}
        accessibilityLabel={item.label}
        accessibilityRole="button"
      >
        <View style={styles.menuItemContent}>
          <MaterialCommunityIcons
            name={item.icon}
            size={22}
            color={isLogout ? DESIGN.colors.error : DESIGN.colors.primary}
            style={styles.menuIcon}
          />
          <Text style={[styles.menuText, isLogout && styles.logoutText]}>
            {item.label}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={DESIGN.colors.textTertiary}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedMenuItem;
