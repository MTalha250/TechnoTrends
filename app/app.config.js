export default {
  expo: {
    name: "Techno",
    slug: "techno-trends",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      infoPlist: {
        UIBackgroundModes: ["background-processing", "background-fetch"],
      },
      bundleIdentifier: "com.talhaad126.technotrends",
    },
    android: {
      adaptiveIcon: {
        foregroundImage:
          "./assets/icons/android/mipmap-xxxhdpi/ic_launcher_foreground.png",
        backgroundColor: "#fcece8",
      },
      package: "com.talhaad126.technotrends",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
      notification: {
        icon: "./assets/icons/android/mipmap-xxxhdpi/ic_launcher.png",
        color: "#A82F39",
        androidMode: "default",
        androidCollapsedTitle: "#{unread_notifications} new interactions",
        iosDisplayInForeground: true,
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-screen-orientation",
        {
          initialOrientation: "DEFAULT",
        },
      ],
      "expo-font",
      [
        "expo-notifications",
        {
          icon: "./assets/icons/android/mipmap-xxxhdpi/ic_launcher.png",
          color: "#A82F39",
          defaultChannel: "default",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "8d4321f7-71df-4a60-a087-0ad308d69dca",
      },
    },
  },
};
