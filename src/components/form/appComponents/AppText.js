import { Platform, StyleSheet, Text } from "react-native";
import DESIGN from "../../../theme";

function AppText({ children, style, numberOfLines, ellipsizeMode }) {
  return (
    <Text
      style={[styles.text, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: DESIGN.colors.textPrimary,
    lineHeight: DESIGN.typography.lineHeightBase,
    ...Platform.select({
      ios: {
        fontFamily: "Avenir",
        fontSize: DESIGN.typography.fontSizeMd,
      },
      android: {
        fontFamily: "Roboto",
        fontSize: DESIGN.typography.fontSizeMd,
      },
    }),
  },
});

export default AppText;
