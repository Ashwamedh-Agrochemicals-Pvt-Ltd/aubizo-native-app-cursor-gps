import Toast from "react-native-toast-message";
import { ToastAndroid, Platform } from "react-native";

export const showAndroidToast = (message) => {
  if (Platform.OS === "android") {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM
    );
  } else {
    // fallback for iOS, you can use your showToast.snackbar here
    console.log("Toast:", message);
  }
};

const showToast = {

  show: (message) => {
    showAndroidToast(message);
  },

  success: (message, title = "Success", position = "top", visibilityTime = 1000) => {
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      position,
      visibilityTime: visibilityTime,
    });
  },
  error: (message, title = "Error", position = "top") => {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position,
      visibilityTime: 2000,
    });
  },
  info: (message, title = "Information", position = "top") => {
    Toast.show({
      type: "info",
      text1: title,
      text2: message,
      position,
      visibilityTime: 1000,
    });
  },
};

export default showToast;
