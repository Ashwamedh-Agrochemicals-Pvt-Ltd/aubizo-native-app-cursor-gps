import 'dotenv/config';

const APP_VARIANT = process.env.APP_VARIANT || "production";

const IS_DEV = APP_VARIANT === "development";
const IS_PREVIEW = APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) return "com.ashwamedhgroup.AUBIZO.dev";
  if (IS_PREVIEW) return "com.ashwamedhgroup.AUBIZO.preview";
  return "com.ashwamedhgroup.AUBIZO";
};

const getAppName = () => {
  if (IS_DEV) return "Aubizo (Dev)";
  if (IS_PREVIEW) return "Aubizo (Preview)";
  return "Aubizo";
};

export default ({ config }) => ({
  ...config,
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
      ...config.ios,
      icon: {
        dark: "./assets/images/ios-dark.png",
        light: "./assets/images/ios-light.png",
        tinted: "./assets/images/ios-tinted.png"
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIViewControllerBasedStatusBarAppearance: "NO",
        NSLocationWhenInUseUsageDescription:
          "Aubizo uses your location to record attendance, show nearby dealers and farmers, and track your visits.",
        NSCameraUsageDescription: 
          "Aubizo needs camera access to take photos of payment receipts and invoices for record keeping and transaction verification.",
        NSPhotoLibraryUsageDescription: 
          "Aubizo needs photo library access to select receipt images and documents to attach as proof of payment transactions."
      },
      supportsTablet: true,
      runtimeVersion: "1.0.0",
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
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "FOREGROUND_SERVICE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      enableExperimentalNewArchitecture: true
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
          dark: {
            image: "./assets/images/splash-icon-dark.png",
            backgroundColor: "#000000",
          },
          imageWidth: 200,
        },
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Aubizo uses your location to record attendance, show nearby dealers and farmers, and track your visits.",
          isAndroidBackgroundLocationEnabled: false,
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "aubizo",
          organization: "ashwamedhgroup"
        }
      ],
       [
        "expo-screen-orientation",
        {
          initialOrientation: "DEFAULT"
        }
      ],
      [
        "expo-document-picker",
        {
          // No specific configuration needed
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Aubizo needs access to your photos to upload receipt attachments.",
          cameraPermission: "Aubizo needs access to your camera to take photos of receipts.",
          // Enable all media types
          mediaTypesAllowed: "All"
        }
      ],
    ],
    extra: {
      APP_VARIANT,
      googleApiKey: process.env.GOOGLE_API_KEY,
      eas: {
        projectId: "a75af2e9-f700-4b79-b729-8498f0340e19",
      },
    },
    updates: {
      url: "https://u.expo.dev/a75af2e9-f700-4b79-b729-8498f0340e19",
    },
  },
});
