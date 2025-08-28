import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NavigationModel from "./NavigationModel";
import styles from "../../styles/appHeader.style"
import DESIGN from "../../theme";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomHeader = ({
  userType = "guest",
  menuItems = [],
  item = [],
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        translucent={true}
        barStyle="light-content"
        // apply backgroundColor for Android only (iOS will ignore this prop)
        backgroundColor={Platform.OS === "android" ? DESIGN.colors.primary : "transparent"}
      />
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Aubizo</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.menuButton}
            activeOpacity={0.6}
            accessibilityLabel="Open navigation menu"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="menu"
              size={28}
              color={DESIGN.colors.surface}
            />
          </TouchableOpacity>
        </View>
      </View>
      <NavigationModel
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userType={userType}
        menuItems={menuItems}
        item={item}
      />

    </>
  );
};

export default CustomHeader;
