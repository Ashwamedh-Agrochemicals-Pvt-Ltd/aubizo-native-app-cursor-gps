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
          "Aubizo needs your location to record your daily punch in and punch out times for accurate attendance tracking. For example, when you tap Punch In, we record your GPS coordinates along with the timestamp to document your work location and hours.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "Aubizo needs your location to record your daily punch in and punch out times for accurate attendance tracking, and to show nearby dealers and farmers in your sales territory. For example, when you tap Punch In or Punch Out, we record your GPS coordinates along with the timestamp to document your work location and hours.",
        NSCameraUsageDescription: 
          "Aubizo uses your camera to capture photos of payment receipts and invoices. For example, when recording a payment transaction, you can take a photo of the receipt to upload as proof of payment, which helps reconcile accounts and prevent disputes.",
        NSPhotoLibraryUsageDescription: 
          "Aubizo accesses your photo library to attach receipt images and documents as proof of payment transactions. For example, when you record a collection payment, you can select a previously saved receipt photo from your library to attach to the transaction record.",
        NSPhotoLibraryAddUsageDescription:
          "Aubizo needs permission to save receipt photos to your photo library. For example, we may save captured receipt images to your library so you have a backup record of all payment documents."
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
            "Aubizo needs your location to record your daily punch in and punch out times for accurate attendance tracking. For example, when you tap Punch In, we record your GPS coordinates along with the timestamp to document your work location and hours.",
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
          photosPermission: "Aubizo accesses your photo library to attach receipt images and documents as proof of payment transactions. For example, when you record a collection payment, you can select a previously saved receipt photo from your library to attach to the transaction record.",
          cameraPermission: "Aubizo uses your camera to capture photos of payment receipts and invoices. For example, when recording a payment transaction, you can take a photo of the receipt to upload as proof of payment, which helps reconcile accounts and prevent disputes.",
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
