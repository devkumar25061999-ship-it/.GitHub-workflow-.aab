import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.notpad.mcqmaker',
  appName: 'NOTPAD MCQ MAKER',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    AdMob: {
      appIdAndroid: 'ca-app-pub-3940256099942544~3347511713', // Official Google AdMob Test App ID
    }
  }
};

export default config;
