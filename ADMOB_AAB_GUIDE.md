# Guide: Building an Android App Bundle (.aab) with Google AdMob for Google Play Store Approval

This guide explains how to package this Attendance Plus web application into a production-ready Android App Bundle (`.aab`) with **Google AdMob** integration and get approval on the **Google Play Console**.

---

## 1. Quick Architecture Overview

Because this app is built with modern **React, Vite, and Tailwind CSS**, the recommended and standard approach to generate a native `.aab` file for Google Play is using **Capacitor** (by Ionic) or **TWA / Bubblewrap**.

**Capacitor** is preferred because it gives full native access to:
- Official Google Mobile Ads (AdMob) SDK: `@capacitor-community/admob`
- Fast offline performance
- Native Android Bundle (`.aab`) generation via Gradle / Android Studio

---

## 2. Generate Clean `.aab` from Mobile Phone (Cloud GitHub Actions - Zero Third-Party Junk)

If you don't have a PC/laptop and want to avoid third-party converter sites (like PWABuilder) that inject unwanted files and cause Play Console warnings:

1. In AI Studio, click the top-right menu and select **Export to GitHub** (or connect your GitHub account).
2. Open your repository in your phone's browser or the GitHub app.
3. Go to the **Actions** tab.
4. Click on **"Build Clean Android AAB (Google Play Bundle)"**.
5. Click **Run workflow** (you can optionally type your real AdMob App ID or leave it as default test ID).
6. In **3 to 4 minutes**, official Google Android Gradle compiles the `.aab` bundle in the cloud.
7. Tap the completed run and download **`AttendancePlus-PlayStore-Release-AAB`** directly to your phone.

---

## 3. Alternative: Build on PC / Laptop with Android Studio

### Step 3.1: Export & Clone the Project
1. In AI Studio, open the top-right menu and export the project (Download ZIP or Push to GitHub).
2. On your computer (where Node.js and Android Studio are installed), navigate to your project folder:
   ```bash
   cd attendance-plus
   npm install
   ```

### Step 2.2: Add Capacitor & AdMob Plugin
Run the following commands in your project terminal:

```bash
# Install Capacitor core & CLI
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor project
npx cap init "Attendance Plus" "com.devkumar.attendanceplus" --web-dir "dist"

# Install official AdMob Capacitor plugin
npm install @capacitor-community/admob

# Build web assets and add Android native platform
npm run build
npx cap add android
```

---

## 3. Configure Google AdMob in Android

### Step 3.1: Get AdMob App ID & Ad Unit IDs
1. Go to [Google AdMob Console](https://admob.google.com/).
2. Create an App:
   - Platform: **Android**
   - Is the app listed on a supported app store? Select **No** (until published).
   - App Name: `Attendance Plus`
3. Note your **AdMob App ID** (Format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`).
4. Create Ad Units:
   - **Banner Ad**: for bottom or top non-intrusive banners (e.g. `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`).
   - **Interstitial Ad**: shown optionally after generating a monthly report or exporting data.

### Step 3.2: Add App ID to AndroidManifest.xml
Open `android/app/src/main/AndroidManifest.xml` in Android Studio or any code editor, and add the `<meta-data>` tag inside `<application>`:

```xml
<manifest ...>
    <!-- Required permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="com.google.android.gms.permission.AD_ID"/>

    <application ...>
        <!-- Replace with your actual Google AdMob App ID -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
            
        <activity ...>
        </activity>
    </application>
</manifest>
```

---

## 4. Initializing & Displaying Ads in the Code

In your app source code (e.g., `src/utils/admob.ts`), initialize the AdMob SDK:

```typescript
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export async function initializeAdMob() {
  try {
    await AdMob.initialize({
      testingDevices: ['EMULATOR_DEVICE_ID'], // Remove in production
      initializeForTesting: false,
    });
  } catch (error) {
    console.warn('AdMob initialization skipped or running on web:', error);
  }
}

export async function showBottomBanner() {
  const options: BannerAdOptions = {
    adId: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your Banner Unit ID
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: false,
  };
  await AdMob.showBanner(options);
}
```

---

## 5. Generate Signed `.aab` (Android App Bundle)

Google Play Store **strictly requires `.aab` format** (not `.apk`):

1. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
2. In Android Studio:
   - Go to menu: **Build** > **Generate Signed Bundle / APK...**
   - Select **Android App Bundle (`.aab`)** and click **Next**.
   - **Key store path**: Click **Create new...** to create your release keystore (save your `.jks` file, password, and alias safely!).
   - Choose **release** build variant.
   - Click **Finish**.
3. Android Studio will build your file at:
   `android/app/release/app-release.aab`.

---

## 6. Checklist for 100% Google Play & AdMob Policy Approval

To avoid rejection during Google Play and AdMob review, ensure you comply with these mandatory requirements:

1. **Privacy Policy URL (Mandatory)**:
   - Google Play rejects any app requesting advertising ID (`AD_ID`) without a clear Privacy Policy link.
   - Include a statement: *"This app uses Google AdMob to display advertisements. Google may collect advertising IDs and device information to serve relevant ads."*
2. **App-ads.txt Configuration (AdMob Mandatory)**:
   - On your website/domain, host an `app-ads.txt` file (e.g. `https://yourdomain.com/app-ads.txt`) with your publisher ID:
     `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
   - Link that website URL in your Google Play Store listing.
3. **Data Safety Form on Google Play Console**:
   - Declare: Device or other IDs -> Collected -> Advertising / Marketing.
4. **User Messaging Platform (UMP / GDPR Consent)**:
   - For users in EEA/UK, AdMob requires GDPR consent messaging enabled in the AdMob Privacy & Messaging dashboard.
5. **No Accidental Ad Clicks**:
   - Ensure banner ads do not overlap the bottom navigation bar or calendar dates.
