import 'dotenv/config';
const APP_BRAND = process.env.APP_BRAND;
const APP_VARIANT = process.env.APP_VARIANT || "production";

const IS_DEV = APP_VARIANT === "development";
const IS_PREVIEW = APP_VARIANT === "preview";


const APP_CONFIG = {
  aubizo: {
    name: "Aubizo",
    slug: "AUBIZO",
    icons: {
      icon: "./assets/aubizo/images/adaptive-icon.png",
      adaptiveForeground: "./assets/aubizo/images/adaptive-icon.png",
      splash: {
        light: "./assets/aubizo/images/splash-icon-light.png",
        dark: "./assets/aubizo/images/splash-icon-dark.png",
      },
      ios: {
        light: "./assets/aubizo/images/ios-light.png",
        dark: "./assets/aubizo/images/ios-dark.png",
        tinted: "./assets/aubizo/images/ios-tinted.png",
      }
    },
    androidPackage: {
      dev: "com.ashwamedhgroup.AUBIZO.dev",
      preview: "com.ashwamedhgroup.AUBIZO.preview",
      prod: "com.ashwamedhgroup.AUBIZO",
    },
    iosBundleId: {
      dev: "com.ashwamedhgroup.AUBIZO.dev",
      preview: "com.ashwamedhgroup.AUBIZO.preview",
      prod: "com.ashwamedhgroup.AUBIZO",
    },
    easProjectId: "a75af2e9-f700-4b79-b729-8498f0340e19",
  },
  ashwamedh: {
    name: "Ashwamedh Group",
    slug: "ashwamedhgroup",
    icons: {
      icon: "./assets/images/ashwamedh/images/adaptive-icon.png",
      adaptiveForeground: "./assets/ashwamedh/images/adaptive-icon.png",
      splash: {
        light: "./assets/ashwamedh/images/splash-icon-light.png",
        dark: "./assets/ashwamedh/images/splash-icon-dark.png",
      },
      ios: {
        light: "./assets/ashwamedh/images/ios-light.png",
        dark: "./assets/ashwamedh/images/ios-dark.png",
        tinted: "./assets/ashwamedh/images/ios-tinted.png",
      }
    },
    androidPackage: {
      dev: "com.aswamedh.ASHWAMEDHGROUP.dev",
      preview: "com.aswamedh.ASHWAMEDHGROUP.preview",
      prod: "com.aswamedh.ASHWAMEDHGROUP",
    },
    iosBundleId: {
      dev: "com.aswamedh.ASHWAMEDHGROUP.dev",
      preview: "com.aswamedh.ASHWAMEDHGROUP.preview",
      prod: "com.aswamedh.ASHWAMEDHGROUP",
    },
    easProjectId: "d9fe71cd-3cf5-4d85-a04c-7a757c0ff04a",
  },
};

if (!APP_BRAND || !APP_CONFIG[APP_BRAND]) {
  throw new Error(
    `❌ Invalid APP_BRAND "${APP_BRAND}". Check EAS Dashboard environment variables.`
  );
}

const BRAND = APP_CONFIG[APP_BRAND];

const getAndroidPackage = () =>
  IS_DEV ? BRAND.androidPackage.dev : IS_PREVIEW ? BRAND.androidPackage.preview : BRAND.androidPackage.prod;

const getIosBundleId = () =>
  IS_DEV ? BRAND.iosBundleId.dev : IS_PREVIEW ? BRAND.iosBundleId.preview : BRAND.iosBundleId.prod;


const getAppName = () =>
  IS_DEV ? `${BRAND.name} (Dev)` : IS_PREVIEW ? `${BRAND.name} (Preview)` : BRAND.name;



export default ({ config }) => ({
  ...config,
  expo: {
    name: getAppName(),
    slug: BRAND.slug,
    version: "1.0.0",
    orientation: "portrait",
    icon: BRAND.icons.icon,
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: BRAND.icons.splash.light,
      resizeMode: "contain",
      backgroundColor: "#ffffff",
      dark: {
        image: BRAND.icons.splash.dark,
        backgroundColor: "#000000",
      },
    },
    ios: {
      ...config.ios,
      icon: {
        light: BRAND.icons.ios.light,
        dark: BRAND.icons.ios.dark,
        tinted: BRAND.icons.ios.tinted,
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
      bundleIdentifier: getIosBundleId(),

    },
    android: {
      adaptiveIcon: {
        foregroundImage: BRAND.icons.adaptiveForeground,
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: getAndroidPackage(),
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
      enableExperimentalNewArchitecture: true,
      softwareKeyboardLayoutMode: "pan",
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
          image: BRAND.icons.splash.light,
          dark: { image: BRAND.icons.splash.dark, backgroundColor: "#000000" },
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
      APP_BRAND,
      googleApiKey: process.env.GOOGLE_API_KEY,
      eas: {
        projectId: BRAND.easProjectId
      },
    },
    updates: {
      url: `https://u.expo.dev/${BRAND.easProjectId}`,
    },
  },
});
