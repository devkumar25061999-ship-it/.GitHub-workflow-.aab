import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  Upload,
  Check,
  DollarSign,
  Smartphone,
  ShieldCheck,
  Megaphone,
  ExternalLink,
  Play,
  Copy,
  Sliders,
  Database,
  HelpCircle,
  Package,
} from 'lucide-react';
import { AppSettings, AttendanceDatabase } from '../types';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';

interface SettingsAndSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  records: AttendanceDatabase;
  onRestoreBackup: (records: AttendanceDatabase, settings?: AppSettings) => void;
  isOnline: boolean;
  onManualSync: () => void;
  lastSyncTime: number | null;
  onInstallPWA?: () => void;
  isInstallable?: boolean;
  onOpenPrivacy?: () => void;
  onTestAppOpenAd?: () => void;
  initialTab?: 'general' | 'admob' | 'backup' | 'apk';
}

export const SettingsAndSyncModal: React.FC<SettingsAndSyncModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  records,
  onRestoreBackup,
  isOnline,
  onManualSync,
  lastSyncTime,
  onInstallPWA,
  isInstallable,
  onOpenPrivacy,
  onTestAppOpenAd,
  initialTab = 'general',
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'admob' | 'backup' | 'apk'>(initialTab);
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [syncing, setSyncing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
      if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, settings, initialTab]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTriggerSync = () => {
    setSyncing(true);
    onManualSync();
    setTimeout(() => setSyncing(false), 800);
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJSON(records, formData);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_plus_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJSON(content);
      if (res.success && res.records) {
        onRestoreBackup(res.records, res.settings);
        if (res.settings) setFormData(res.settings);
        setImportStatus('Backup restored successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(`Error: ${res.error || 'Invalid file'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copySample = (val: string, key: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="settings-modal-content"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-yellow-400" />
            <h3 className="text-base sm:text-lg font-bold">Settings & Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-100 p-1.5 gap-1 text-xs font-bold select-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>General (वेतन)</span>
          </button>

          <button
            onClick={() => setActiveTab('admob')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'admob'
                ? 'bg-amber-500 text-gray-950 font-black shadow-xs'
                : 'text-gray-700 hover:text-gray-900 hover:bg-amber-100/70'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-gray-900" />
            <span>💰 Ads Setup (कमाई)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Data (बैकअप)</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-emerald-600 text-white font-black shadow-xs'
                : 'text-gray-700 hover:text-gray-900 hover:bg-emerald-100/70'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>📦 .APK / .AAB</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm text-gray-800 flex-1">
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <strong>वेतन गणना सेटिंग्स:</strong> यहाँ आप अपनी रोज़ की दिहाड़ी (Daily Wage) और ओवरटाइम का प्रति घंटा रेट सेट कर सकते हैं। रिपोर्ट में कुल सैलरी अपने आप कैलकुलेट होगी।
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Daily Wage ({formData.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dailyWage}
                    onChange={(e) => setFormData({ ...formData, dailyWage: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                  <span className="text-[10px] text-gray-500">रोज़ाना की दिहाड़ी</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Hourly OT ({formData.currency}/hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.hourlyOvertimeRate}
                    onChange={(e) => setFormData({ ...formData, hourlyOvertimeRate: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                  <span className="text-[10px] text-gray-500">प्रति घंटा ओवरटाइम</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                  <span className="text-[10px] text-gray-500">मुद्रा चिन्ह (₹, $, AED, SAR)</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Employee / Worker Name</label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    placeholder="Dev Kumar"
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                  <span className="text-[10px] text-gray-500">कर्मचारी / वर्कर का नाम</span>
                </div>
              </div>

              {/* Install PWA Prompt if applicable */}
              {isInstallable && onInstallPWA && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-700" />
                    <div>
                      <span className="text-xs font-bold text-indigo-950 block">Install Mobile App</span>
                      <span className="text-[11px] text-indigo-700">Phone screen par 1-tap app banayein</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onInstallPWA}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Install
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <span>Save General Settings</span>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: GOOGLE ADMOB SETUP (ADS & EARNING) */}
          {activeTab === 'admob' && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Highlight Box */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-xl text-xs space-y-1.5 text-gray-900">
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-sm">
                  <Megaphone className="w-4 h-4 text-amber-700" />
                  <span>Google AdMob Ads Setup (कमाई का सेटअप)</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Jab aapka app <strong>Google Play Store</strong> ya <strong>Amazon Appstore</strong> par publish hoga, tab yahan dali gayi IDs se asli ads chalenge aur kamaai seedhe aapke AdMob wallet/bank account mein aayegi.
                </p>
              </div>

              {/* Mode Selector: Test Mode vs Live Mode */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">AdMob Advertising Mode</span>
                    <span className="text-[11px] text-gray-600">
                      {formData.admobTestMode !== false
                        ? '🧪 Currently: Google Official Test Ads (Surakshit Testing)'
                        : '🟢 Currently: LIVE REAL ADS (Publishing Mode)'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        admobTestMode: formData.admobTestMode === false ? true : false,
                      })
                    }
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer flex items-center gap-1 ${
                      formData.admobTestMode !== false
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {formData.admobTestMode !== false ? 'TEST MODE' : 'LIVE ADS ON'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">
                  {formData.admobTestMode !== false
                    ? 'Tip: Publish karne se pehle Test Mode on rakhein taaki Google AdMob account ban na ho. Store par submit karte waqt "LIVE ADS ON" select karein.'
                    : 'Live Ads activate hain! Google AdMob se verified ads deliver honge.'}
                </p>
              </div>

              {/* Input 1: AdMob App ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-800">
                    1. Google AdMob App ID
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">Format: ca-app-pub-XXX~YYY</span>
                </div>
                <input
                  type="text"
                  value={formData.admobAppId || ''}
                  onChange={(e) => setFormData({ ...formData, admobAppId: e.target.value.trim() })}
                  placeholder="ca-app-pub-2133508635089094~1211511400"
                  className="w-full font-mono text-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <span className="text-[10px] text-gray-500">
                  Yeh aapke AdMob dashboard mein App Settings mein milta hai.
                </span>
              </div>

              {/* Input 2: Banner Ad Unit ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-800">
                    2. Bottom Banner Ad Unit ID
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">Format: ca-app-pub-XXX/YYY</span>
                </div>
                <input
                  type="text"
                  value={formData.admobBannerId || ''}
                  onChange={(e) => setFormData({ ...formData, admobBannerId: e.target.value.trim() })}
                  placeholder="ca-app-pub-2133508635089094/7668217896"
                  className="w-full font-mono text-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <span className="text-[10px] text-gray-500">
                  Yeh calendar ke neeche sticky banner ad dikhata hai.
                </span>
              </div>

              {/* Input 3: App Open Fullscreen Ad Unit ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-800">
                    3. App Open Full-Screen Ad Unit ID
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">Format: ca-app-pub-XXX/YYY</span>
                </div>
                <input
                  type="text"
                  value={formData.admobAppOpenId || ''}
                  onChange={(e) => setFormData({ ...formData, admobAppOpenId: e.target.value.trim() })}
                  placeholder="ca-app-pub-2133508635089094/1169248997"
                  className="w-full font-mono text-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <span className="text-[10px] text-gray-500">
                  Yeh app start hote waqt full-screen ad show karta hai (Sabse zyada kamaai deta hai).
                </span>
              </div>

              {/* Interactive Test Action */}
              {onTestAppOpenAd && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-900 block">Ad Testing Preview</span>
                    <span className="text-[10px] text-blue-700">Check karein ki ad screen par kaisa dikhega</span>
                  </div>
                  <button
                    type="button"
                    onClick={onTestAppOpenAd}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Test Ad Now</span>
                  </button>
                </div>
              )}

              {/* Step-by-Step Guide Card */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Google AdMob se ID kaise nikaalein? (3 Steps):
                </span>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-gray-700">
                  <li>
                    <a
                      href="https://admob.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-bold"
                    >
                      admob.google.com
                    </a>{' '}
                    par Gmail se sign-in karke <strong>Apps $\rightarrow$ Add App</strong> karein (Name: Attendance Plus).
                  </li>
                  <li>
                    Wahan se <strong>AdMob App ID</strong> copy karke upar pehle box mein paste karein.
                  </li>
                  <li>
                    <strong>Ad Units</strong> mein jaakar ek <em>Banner</em> aur ek <em>App Open</em> banayein aur unke codes yahan paste karke Save daba dein.
                  </li>
                </ol>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>Ads Configuration Saved!</span>
                  </>
                ) : (
                  <span>Save &amp; Activate AdMob IDs</span>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: BACKUP, SYNC & PRIVACY */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              {/* Online/Offline status card */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                    )}
                    <span className="font-bold text-gray-900">
                      {isOnline ? 'Online (Connected)' : 'Offline Mode (Local)'}
                    </span>
                  </div>

                  <button
                    onClick={handleTriggerSync}
                    disabled={syncing}
                    className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </button>
                </div>

                <p className="text-xs text-gray-600">
                  {isOnline
                    ? 'Aapki attendance entries aapke phone storage mein safe hain aur verified hain.'
                    : 'Bina internet ke bhi app 100% chalta rahega. Data phone mein surakshit hai.'}
                </p>

                {lastSyncTime && (
                  <span className="text-[11px] text-gray-500">
                    Last active: {new Date(lastSyncTime).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* JSON Backup & Restore */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  Offline Data Backup &amp; Restore
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 shadow-2xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export Backup (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 shadow-2xs transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Restore Backup</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {importStatus && (
                  <div className="p-2 bg-blue-100 text-blue-900 rounded-lg text-xs font-medium">
                    {importStatus}
                  </div>
                )}
              </div>

              {/* Privacy Policy Link Card */}
              {onOpenPrivacy && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-gray-700" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Privacy Policy</span>
                      <span className="text-[11px] text-gray-600">Google &amp; Amazon Store compliance document</span>
                    </div>
                  </div>
                  <button
                    onClick={onOpenPrivacy}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <span>View Policy</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BUILD .APK & .AAB (PACKAGE GENERATOR) */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              {/* Highlight Intro */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl text-xs space-y-1.5 text-gray-900">
                <div className="flex items-center gap-1.5 text-emerald-950 font-black text-sm">
                  <Package className="w-4 h-4 text-emerald-700" />
                  <span>Android .APK &amp; .AAB Package Builder</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Aapka app, AdMob integration aur metadata poori tarah ready hai. Neeche diye gaye tarike se aap turant <strong>.APK</strong> (Mobile install aur Amazon ke liye) aur <strong>.AAB</strong> (Google Play Console ke liye) prapt kar sakte hain.
                </p>
              </div>

              {/* METHOD 1: PWABUILDER (INSTANT 1-CLICK) */}
              <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    Option 1: 1-Click Instant .APK / .AAB Generator
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    Fastest (1 Min)
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">
                  Microsoft PWABuilder official service aapke is app ko 30 seconds mein real, signed Android <strong>.apk</strong> aur Google Play Store <strong>.aab</strong> mein pack kar deti hai.
                </p>

                <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs space-y-2">
                  <div className="font-bold text-gray-800">Signed APK Download Karne Ka Tarika (Mobile Install Ke Liye):</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-700 text-[11px]">
                    <li>Neeche <strong>"Open 1-Click APK Generator"</strong> dabayein.</li>
                    <li>Wahan <strong>"Package for Android"</strong> par click karein.</li>
                    <li>
                      <span className="font-bold text-amber-700">⚠️ Zaroori Step:</span> Wahan <strong>"Signing Key"</strong> option par click karein aur <strong>"Create new"</strong> ya <strong>"Generate key"</strong> select karein (is-se APK <em>Signed</em> banti hai).
                    </li>
                    <li>Fir <strong>"Generate"</strong> dabayein. Ab zip ke andar <strong>app-release-signed.apk</strong> milegi jo kisi bhi phone par 1-click install hogi!</li>
                  </ol>
                </div>

                <a
                  href="https://www.pwabuilder.com/?url=https%3A%2F%2Fais-pre-liqqz543mk2kiyzq4rqaxw-767041030593.asia-southeast1.run.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Open 1-Click APK Generator (PWABuilder)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              {/* QUICK SIGN FOR EXISTING UNSIGNED APK */}
              <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Unsigned APK ko 1-Click Mein "Signed" Banayein
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    30 Seconds Fix
                  </span>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed">
                  Agar aapne pehle se <code>app-release-unsigned.apk</code> download kar li hai, toh use dobara banane ki zaroorat nahi hai. Aap free online tool se use turant <strong>Signed (Installable)</strong> bana sakte hain:
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href="https://apk-signer.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <span>1. Online Signer (apk-signer.com)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=kellinwood.zipsigner2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <span>2. Phone App (ZipSigner / APK Signer)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* METHOD 2: GITHUB ACTIONS AUTO BUILD */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-600" />
                    Option 2: GitHub Actions Automated Build
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                    Official Gradle
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">
                  Project mein <code>.github/workflows/build-aab.yml</code> pehle se configure kiya gaya hai.
                </p>

                <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs space-y-1.5">
                  <div className="font-bold text-gray-800">Kaise download karein:</div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 text-[11px]">
                    <li>Upar right side <strong>Settings Menu</strong> par click karke <strong>"Export to GitHub"</strong> karein.</li>
                    <li>Apne GitHub repo mein jakar <strong>"Actions"</strong> tab par click karein.</li>
                    <li>Workflow run khatam hote hi <strong>Artifacts</strong> se dono files mil jayengi:
                      <div className="pl-4 pt-1 font-mono text-[10px] text-gray-800 space-y-0.5">
                        <div>• <code>AttendancePlus-Amazon-Release-APK</code> (.apk)</div>
                        <div>• <code>AttendancePlus-PlayStore-Release-AAB</code> (.aab)</div>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              {/* METHOD 3: DIRECT INSTALL ON DEVICE */}
              {isInstallable && onInstallPWA && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-950 block">Option 3: Phone Direct Install</span>
                    <span className="text-[11px] text-blue-800">Bina file download kiye seedhe apne phone screen par install karein</span>
                  </div>
                  <button
                    onClick={onInstallPWA}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs transition active:scale-95 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Install Now</span>
                  </button>
                </div>
              )}

              {/* APP STORE SUBMISSION METADATA (COPY BOX) */}
              <div className="p-3 bg-gray-100 rounded-xl border border-gray-300 space-y-2">
                <span className="text-xs font-bold text-gray-800 block uppercase tracking-wider">
                  Store Upload Details (Copy Karein)
                </span>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Package Name</span>
                      <span className="font-mono font-bold text-gray-900">com.devkumar.attendanceplus</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('com.devkumar.attendanceplus');
                        setCopiedId('pkg');
                        setTimeout(() => setCopiedId(null), 1500);
                      }}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] flex items-center gap-1"
                    >
                      {copiedId === 'pkg' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'pkg' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                    <div>
                      <span className="text-[10px] text-gray-500 block">App Name</span>
                      <span className="font-bold text-gray-900">Attendance Plus</span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono">v1.0.0</span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                    <div>
                      <span className="text-[10px] text-gray-500 block">AdMob App ID</span>
                      <span className="font-mono text-[11px] text-gray-900">ca-app-pub-2133508635089094~1211511400</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('ca-app-pub-2133508635089094~1211511400');
                        setCopiedId('appid');
                        setTimeout(() => setCopiedId(null), 1500);
                      }}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] flex items-center gap-1"
                    >
                      {copiedId === 'appid' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'appid' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
