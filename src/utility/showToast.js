  import Toast from "react-native-toast-message";

const showToast = {
  success: (message, title = "Success",position="top") => {
    Toast.show({
      type: "success", 
      text1: title,
      text2: message,
     position,
      visibilityTime: 1000,
    });
  },
  error: (message, title = "Error") => {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position,
      visibilityTime: 1000,
    });
  },
  info: (message, title = "Information") => {
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
