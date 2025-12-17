import { StyleSheet, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DESIGN from "../../../theme";

function AppInputText({ icon, placeholder, style, iconStyle, rightIcon, ...otherProps }, ref) {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={"#007955"}
          style={[styles.icon, iconStyle]}
        />
      )}

      <TextInput
        ref={ref}
        placeholder={placeholder}
        placeholderTextColor={DESIGN.colors.textTertiary}
        style={[styles.input]}
        {...otherProps}
      />
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: DESIGN.colors.background,
    borderRadius: DESIGN.borderRadius.sm,
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    paddingHorizontal: DESIGN.spacing.sm,
  },
  icon: {
    marginRight: DESIGN.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: DESIGN.colors.textPrimary,
  },
  rightIcon: {
    position: "absolute",
    right: DESIGN.spacing.md,
  },
});

export default AppInputText;
