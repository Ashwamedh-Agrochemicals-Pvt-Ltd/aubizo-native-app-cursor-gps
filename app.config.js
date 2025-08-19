const APP_VARIANT = process.env.APP_VARIANT;

const IS_DEV = APP_VARIANT === "development";
const IS_PREVIEW = APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) return "com.ashwamedhgroup.AUBIZO.dev";
  if (IS_PREVIEW) return "com.ashwamedhgroup.AUBIZO.preview";
  return "com.ashwamedhgroup.AUBIZO";
};

const getAppName = () => {
  if (IS_DEV) return "AUBIZO (Dev)";
  if (IS_PREVIEW) return "AUBIZO (Preview)";
  return "AUBIZO";
};

export default {
  expo: {
    name: getAppName(),
    slug: "AUBIZO",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/adaptive-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon-light.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      runtimeVersion: {
        policy: "appVersion",
      },
      bundleIdentifier: getUniqueIdentifier(),
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: getUniqueIdentifier(),
      runtimeVersion: "1.0.0",
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-secure-store",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ffffff",
          image: "./assets/images/splash-icon-light.png",
          imageWidth: 200,
        },
      ],
    ],
    extra: {
      appVariant: APP_VARIANT,
      googleApiKey: process.env.GOOGLE_API_KEY,
      eas: {
        projectId: "a75af2e9-f700-4b79-b729-8498f0340e19",
      },
    },
    updates: {
      url: "https://u.expo.dev/a75af2e9-f700-4b79-b729-8498f0340e19",
    },
  },
};
