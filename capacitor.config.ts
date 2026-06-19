import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kbv.lyon",
  appName: "KBV-LYON-VISITS",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#003893",
      showSpinner: false,
    },
    CapacitorHttp: {
      enabled: false,
    },
  },
};

export default config;

