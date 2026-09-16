import React, { useState, useRef } from 'react';
import { X, Cloud, CloudOff, RefreshCw, Download, Upload, Check, DollarSign, Smartphone, ShieldCheck, Megaphone, ExternalLink } from 'lucide-react';
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
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [syncing, setSyncing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
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

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="settings-modal-content"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 text-white px-5 py-3.5 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold">Settings & Offline Sync</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-sm text-gray-800">
          {/* Offline / Online status card */}
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
                ? 'Your attendance entries are saved safely on this device and verified.'
                : 'No internet connection. Data is saved locally in browser storage and will be synchronized when connection returns.'}
            </p>

            {lastSyncTime && (
              <span className="text-[11px] text-gray-500">
                Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* PWA Install Button if available */}
          {isInstallable && onInstallPWA && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-700" />
                <div>
                  <span className="text-xs font-bold text-indigo-950 block">Install Attendance Plus App</span>
                  <span className="text-[11px] text-indigo-700">Add to home screen for 1-tap offline access</span>
                </div>
              </div>
              <button
                onClick={onInstallPWA}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Install
              </button>
            </div>
          )}

          {/* Wage & Rate Settings */}
          <form onSubmit={handleSave} className="space-y-3">
            <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Wage & Calculation Settings
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Daily Wage ({formData.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dailyWage}
                  onChange={(e) => setFormData({ ...formData, dailyWage: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Hourly Overtime ({formData.currency}/hr)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.hourlyOvertimeRate}
                  onChange={(e) => setFormData({ ...formData, hourlyOvertimeRate: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Employee / Name</label>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  placeholder="My Name"
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Google AdMob Settings */}
            <div className="pt-2 border-t border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-600" />
                Google AdMob Monetization
              </span>
              <p className="text-[11px] text-gray-600">
                Play Store par upload hone ke baad live ads chalane ke liye apna AdMob Banner Ad Unit ID enter karein.
              </p>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  AdMob Banner Ad Unit ID
                </label>
                <input
                  type="text"
                  value={formData.admobBannerId || ''}
                  onChange={(e) => setFormData({ ...formData, admobBannerId: e.target.value })}
                  placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
                  className="w-full font-mono text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-amber-50/70 border border-amber-200 rounded-lg">
                <div>
                  <span className="text-xs font-bold text-amber-950 block">AdMob Test Mode</span>
                  <span className="text-[10px] text-amber-800">
                    Google Test ads will show. Turn OFF when publishing live to Play Store.
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
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                    formData.admobTestMode !== false
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {formData.admobTestMode !== false ? 'TEST ON' : 'LIVE ON'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
              <span>{savedSuccess ? 'Settings Saved!' : 'Save Calculation & Ad Settings'}</span>
            </button>
          </form>

          {/* Privacy Policy & Google Play Console Submission */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Play Console Compliance & Privacy
            </span>
            <p className="text-xs text-gray-600">
              Google Play Console requires an accessible Privacy Policy mentioning AdMob and local storage data safety.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {onOpenPrivacy && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPrivacy();
                  }}
                  className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>View Privacy Policy</span>
                </button>
              )}

              <a
                href="/privacy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
              >
                <span>Open /privacy.html</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
              Data Backup & Restore (Offline File)
            </span>
            <p className="text-xs text-gray-600">
              Download your entire attendance records as a JSON file to transfer between devices or keep safe offline.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExportBackup}
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-gray-300"
              >
                <Download className="w-4 h-4 text-gray-700" />
                <span>Export Backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-gray-300"
              >
                <Upload className="w-4 h-4 text-gray-700" />
                <span>Restore Backup</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
              />
            </div>

            {importStatus && (
              <div
                className={`p-2 text-xs rounded-lg ${
                  importStatus.startsWith('Error')
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
