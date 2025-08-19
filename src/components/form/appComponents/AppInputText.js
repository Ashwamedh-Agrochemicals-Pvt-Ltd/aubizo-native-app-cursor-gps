import { StyleSheet, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DESIGN from "../../../theme";

function AppInputText({ icon, placeholder, style, iconStyle, rightIcon, ...otherProps }) {
  return (
    <View style={styles.container}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={DESIGN.colors.textSecondary}
          style={[styles.icon, iconStyle]}
        />
      )}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={DESIGN.colors.textTertiary}
        style={[styles.input, style]}
        {...otherProps}
      />
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: DESIGN.colors.border,
    paddingHorizontal: DESIGN.spacing.md,
    ...DESIGN.shadows.subtle,
  },
  icon: {
    marginRight: DESIGN.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: DESIGN.colors.textPrimary,
    paddingVertical: 0,
    fontWeight: '400',
  },
  rightIcon: {
    position: "absolute",
    right: DESIGN.spacing.md,
  },
});

export default AppInputText;
