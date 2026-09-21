import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Official Google AdMob Test Ad Unit IDs (Google Play Console ready)
export const ADMOB_CONFIG = {
  // Test IDs provided by Google for testing without policy violations
  BANNER_ID_ANDROID: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL_ID_ANDROID: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED_ID_ANDROID: 'ca-app-pub-3940256099942544/5224354917',
  APP_ID_ANDROID: 'ca-app-pub-3940256099942544~3347511713'
};

let isAdmobInitialized = false;
let isInterstitialLoaded = false;

/**
 * Initialize AdMob on Android Native platforms safely
 */
export async function initializeAdMob() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await AdMob.initialize({
      testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
      initializeForTesting: true,
    });
    isAdmobInitialized = true;
    console.log('[AdMob] Initialized successfully');

    // Preload first interstitial
    preloadInterstitial();
  } catch (err) {
    console.warn('[AdMob] Initialization warning:', err);
  }
}

/**
 * Show Banner Ad at the bottom of the screen
 */
export async function showBannerAd() {
  if (!Capacitor.isNativePlatform() || !isAdmobInitialized) return;

  try {
    const options: BannerAdOptions = {
      adId: ADMOB_CONFIG.BANNER_ID_ANDROID,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true
    };
    await AdMob.showBanner(options);
    console.log('[AdMob] Banner shown');
  } catch (err) {
    console.warn('[AdMob] Banner show error:', err);
  }
}

/**
 * Hide Banner Ad
 */
export async function hideBannerAd() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.hideBanner();
  } catch (err) {
    console.warn('[AdMob] Hide banner error:', err);
  }
}

/**
 * Preload Interstitial Ad
 */
export async function preloadInterstitial() {
  if (!Capacitor.isNativePlatform() || !isAdmobInitialized) return;

  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB_CONFIG.INTERSTITIAL_ID_ANDROID,
      isTesting: true,
    });
    isInterstitialLoaded = true;
    console.log('[AdMob] Interstitial prepared');
  } catch (err) {
    isInterstitialLoaded = false;
    console.warn('[AdMob] Prepare interstitial error:', err);
  }
}

/**
 * Show Interstitial Ad on key user milestones (e.g. after PDF export or batch actions)
 */
export async function showInterstitialAd() {
  if (!Capacitor.isNativePlatform() || !isAdmobInitialized) return;

  try {
    if (isInterstitialLoaded) {
      await AdMob.showInterstitial();
      isInterstitialLoaded = false;
      // Preload next interstitial in background
      setTimeout(preloadInterstitial, 5000);
    } else {
      await preloadInterstitial();
      if (isInterstitialLoaded) {
        await AdMob.showInterstitial();
      }
    }
  } catch (err) {
    console.warn('[AdMob] Show interstitial error:', err);
  }
}
