import { useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../../styles/appHeader.style" // Ensure this path is correct
import DESIGN from "../../theme";
import AnimatedMenuItem from "./AnimatedMenuItem";
// import { navigation } from "../../../navigation/NavigationService"
import { useNavigation } from "@react-navigation/native";


// import useAuth from "../../Auth/useAuth";
import useAuth from "../../auth/useAuth";
import logoutApi from "../../api/logout";
import showToast from "../../utility/showToast";

const NavigationModel = ({ visible, onClose, userType,item, menuItems }) => {
  const { logOut } = useAuth();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const navigation =useNavigation();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigation = async (route) => {
    onClose();

    if (route === "Login") {
      try {
        if (__DEV__) {
          console.log("Attempting logout...");
        }
        const result = await logOut();
        if (__DEV__) {
          console.log("Logout result:", result);
        }
        if (result && result.success) {
          // Logout successful - the auth context will handle navigation to Login
          showToast.success("Logged out successfully.");
        } else {
          showToast.error("Failed to log out. Try again.", "Error");
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Logout error:", error);
        }
        showToast.error("Failed to log out. Try again.", "Error");
      }
      return;
    }

    setTimeout(() => {
      if (route) navigation.navigate(route);
    }, 100);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
  
    >
      <Animated.View style={[styles.modalOverlay]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlayTouch} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View style={[styles.modalContent,]}>
        {Platform.OS === "ios" && <View style={styles.modalHandle} />}

        {/* Header with close button */}
        <View style={styles.modalHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {userType === "auth" ? "Logged in" : "Guest User"}
          </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={DESIGN.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Home / Dashboard button */}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() =>
            handleNavigation(userType === "auth" ? "Main" : "Login")
          }
        >
          <View style={styles.homeButtonContent}>
            <MaterialCommunityIcons
              name={userType === "auth" ? "view-dashboard" : "home-variant"}
              size={24}
              color={DESIGN.colors.surface}
            />
            <Text style={styles.homeButtonText}>
              {userType === "auth" ? "Dashboard" : "Login"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Dynamic Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <AnimatedMenuItem
              key={item.id}
              item={item}
              index={index}
              onPress={handleNavigation}
              isLogout={item.id === "logout"}
            />
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
};

export default NavigationModel;
