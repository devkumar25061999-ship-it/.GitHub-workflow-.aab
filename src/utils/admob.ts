// Utility for handling Google AdMob in both Native (Capacitor/Android) and Web Preview environments

export interface AdMobConfig {
  appId?: string;
  bannerAdUnitId?: string;
  interstitialAdUnitId?: string;
  isTestMode?: boolean;
}

// Google Official Test Ad Unit IDs (guaranteed safe during development & testing)
export const TEST_AD_UNITS = {
  androidBanner: 'ca-app-pub-3940256099942544/6300978111',
  androidInterstitial: 'ca-app-pub-3940256099942544/1033173712',
  androidRewarded: 'ca-app-pub-3940256099942544/5224354917',
};

export class AdMobManager {
  private static isInitialized = false;

  public static isNativeEnvironment(): boolean {
    return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
  }

  public static async init(config?: AdMobConfig): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      if (this.isNativeEnvironment()) {
        const capacitorPlugins = (window as any).Capacitor?.Plugins;
        const adMobPlugin = capacitorPlugins?.AdMob;
        if (adMobPlugin) {
          await adMobPlugin.initialize({
            testingDevices: config?.isTestMode !== false ? ['EMULATOR'] : [],
            initializeForTesting: config?.isTestMode ?? true,
          });
          this.isInitialized = true;
          return true;
        }
      }
      this.isInitialized = true;
      return true;
    } catch (e) {
      console.warn('AdMob SDK not available or running in web preview:', e);
      return false;
    }
  }

  public static async showBanner(adUnitId?: string): Promise<boolean> {
    try {
      if (this.isNativeEnvironment()) {
        const capacitorPlugins = (window as any).Capacitor?.Plugins;
        const adMobPlugin = capacitorPlugins?.AdMob;
        if (adMobPlugin) {
          await adMobPlugin.showBanner({
            adId: adUnitId || TEST_AD_UNITS.androidBanner,
            adSize: 'ADAPTIVE_BANNER',
            position: 'BOTTOM_CENTER',
            margin: 0,
            isTesting: !adUnitId || adUnitId === TEST_AD_UNITS.androidBanner,
          });
          return true;
        }
      }
      return false;
    } catch (e) {
      console.warn('Could not show native AdMob banner:', e);
      return false;
    }
  }

  public static async hideBanner(): Promise<void> {
    try {
      if (this.isNativeEnvironment()) {
        const capacitorPlugins = (window as any).Capacitor?.Plugins;
        await capacitorPlugins?.AdMob?.hideBanner();
      }
    } catch (e) {
      console.warn('Could not hide banner:', e);
    }
  }
}
