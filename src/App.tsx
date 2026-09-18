import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceStatus, AttendanceDatabase, DayRecord, AppSettings } from './types';
import {
  MONTH_NAMES,
  getCalendarGrid,
  calculateMonthlySummary,
} from './utils/calendar';
import {
  loadStoredRecords,
  saveStoredRecords,
  loadStoredSettings,
  saveStoredSettings,
  getLastSyncTime,
  setLastSyncTime,
} from './utils/storage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Header } from './components/Header';
import { MonthNavigator } from './components/MonthNavigator';
import { CalendarGrid } from './components/CalendarGrid';
import { CategoryToolbar } from './components/CategoryToolbar';
import { YearPickerModal } from './components/YearPickerModal';
import { ReportModal } from './components/ReportModal';
import { OvertimeModal } from './components/OvertimeModal';
import { DayDetailModal } from './components/DayDetailModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { SettingsAndSyncModal } from './components/SettingsAndSyncModal';
import { OfflineBanner } from './components/OfflineBanner';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { AdMobBanner } from './components/AdMobBanner';
import { AppOpenAdModal } from './components/AppOpenAdModal';
import { HowToUseModal } from './components/HowToUseModal';
import { FacePunchModal } from './components/FacePunchModal';
import { DutySettingModal } from './components/DutySettingModal';
import { Camera, HelpCircle, SlidersHorizontal } from 'lucide-react';

export default function App() {
  // Initial state defaults to September 2026 matching user's uploaded screenshots
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 = September (0-indexed)
  const [activeTool, setActiveTool] = useState<AttendanceStatus | null>('work');

  // Persistence state
  const [records, setRecords] = useState<AttendanceDatabase>(() => loadStoredRecords());
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [lastSync, setLastSync] = useState<number | null>(() => getLastSyncTime());
  const [pendingSync, setPendingSync] = useState<boolean>(false);

  // Connectivity & PWA
  const isOnline = useOnlineStatus();
  const { isInstallable, install } = usePWAInstall();

  // Modal states
  const [isYearPickerOpen, setIsYearPickerOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'admob' | 'backup' | 'apk'>('general');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState<boolean>(false);
  const [isFacePunchOpen, setIsFacePunchOpen] = useState<boolean>(false);
  const [isDutySettingOpen, setIsDutySettingOpen] = useState<boolean>(false);
  const [overtimeModalDate, setOvertimeModalDate] = useState<string | null>(null);
  const [detailModalDate, setDetailModalDate] = useState<string | null>(null);
  const [isAppOpenAdActive, setIsAppOpenAdActive] = useState<boolean>(false);

  const handleFacePunchSuccess = (data: {
    status: AttendanceStatus;
    inTime: string;
    outTime: string;
    punchType: 'in' | 'out';
    faceSnapshot?: string;
  }) => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    setRecords((prev) => {
      const existing = prev[dateKey] || {
        date: dateKey,
        status: data.status,
        overtimeHours: 0,
        updatedAt: Date.now(),
      };

      const updated: DayRecord = {
        ...existing,
        status: data.status,
        inTime: data.punchType === 'in' ? data.inTime : (existing.inTime || data.inTime),
        outTime: data.punchType === 'out' ? data.outTime : existing.outTime,
        punchMethod: 'face_punch',
        faceSnapshot: data.faceSnapshot || existing.faceSnapshot,
        updatedAt: Date.now(),
      };

      const nextDb = { ...prev, [dateKey]: updated };
      saveStoredRecords(nextDb);
      return nextDb;
    });
    setPendingSync(true);
  };

  const handleOpenAdsSetup = () => {
    setSettingsTab('admob');
    setIsSettingsOpen(true);
  };

  const handleOpenApk = () => {
    setSettingsTab('apk');
    setIsSettingsOpen(true);
  };

  // Trigger Google AdMob App Open Ad when app opens (if enabled)
  useEffect(() => {
    if (settings.enableAppOpenAd !== false) {
      const timer = setTimeout(() => {
        setIsAppOpenAdActive(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [settings.enableAppOpenAd]);

  // Check URL hash for direct #privacy navigation (Play Store compliant)
  useEffect(() => {
    if (window.location.hash === '#privacy' || window.location.pathname === '/privacy') {
      setIsPrivacyOpen(true);
    }
  }, []);

  // Auto-sync simulation when online
  useEffect(() => {
    if (isOnline && pendingSync) {
      const timer = setTimeout(() => {
        const now = Date.now();
        setLastSync(now);
        setLastSyncTime(now);
        setPendingSync(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingSync]);

  // Derived calendar & monthly summary
  const cells = useMemo(() => {
    return getCalendarGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const summary = useMemo(() => {
    return calculateMonthlySummary(records, currentYear, currentMonth);
  }, [records, currentYear, currentMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Helper to persist record changes
  const updateRecords = (updater: (prev: AttendanceDatabase) => AttendanceDatabase) => {
    setRecords((prev) => {
      const updated = updater(prev);
      saveStoredRecords(updated);
      setPendingSync(true);
      return updated;
    });
  };

  // Cell tap interaction
  const handleCellClick = (dateStr: string) => {
    // If clicking a date from previous/next month, smoothly switch to that month
    const [yStr, mStr] = dateStr.split('-');
    const targetYear = Number(yStr);
    const targetMonth = Number(mStr) - 1;
    if (targetYear !== currentYear || targetMonth !== currentMonth) {
      setCurrentYear(targetYear);
      setCurrentMonth(targetMonth);
    }

    if (!activeTool) {
      // If no tool selected, open day details
      setDetailModalDate(dateStr);
      return;
    }

    if (activeTool === 'overtime') {
      // Open overtime modal for this date
      setOvertimeModalDate(dateStr);
      return;
    }

    // Toggle or apply active category
    updateRecords((prev) => {
      const existing = prev[dateStr];
      const now = Date.now();

      if (existing && existing.status === activeTool) {
        // Toggle off if clicking the same status
        if (existing.overtimeHours && existing.overtimeHours > 0) {
          // Keep overtime, reset status to none
          return {
            ...prev,
            [dateStr]: {
              ...existing,
              status: 'none',
              updatedAt: now,
            },
          };
        } else {
          // Remove record completely
          const next = { ...prev };
          delete next[dateStr];
          return next;
        }
      }

      // Set new status (preserve overtime if already recorded)
      return {
        ...prev,
        [dateStr]: {
          date: dateStr,
          status: activeTool,
          overtimeHours: existing?.overtimeHours || 0,
          notes: existing?.notes || '',
          updatedAt: now,
        },
      };
    });
  };

  // Cell long-press or secondary click -> opens DayDetailModal
  const handleCellLongPress = (dateStr: string) => {
    const [yStr, mStr] = dateStr.split('-');
    const targetYear = Number(yStr);
    const targetMonth = Number(mStr) - 1;
    if (targetYear !== currentYear || targetMonth !== currentMonth) {
      setCurrentYear(targetYear);
      setCurrentMonth(targetMonth);
    }
    setDetailModalDate(dateStr);
  };

  // Overtime save handler
  const handleSaveOvertime = (hours: number) => {
    if (!overtimeModalDate) return;
    const dateKey = overtimeModalDate;

    updateRecords((prev) => {
      const existing = prev[dateKey];
      return {
        ...prev,
        [dateKey]: {
          date: dateKey,
          status: existing?.status && existing.status !== 'none' ? existing.status : 'work',
          overtimeHours: hours,
          notes: existing?.notes || '',
          updatedAt: Date.now(),
        },
      };
    });
  };

  // Overtime clear handler
  const handleClearOvertime = () => {
    if (!overtimeModalDate) return;
    const dateKey = overtimeModalDate;

    updateRecords((prev) => {
      const existing = prev[dateKey];
      if (!existing) return prev;

      if (!existing.status || existing.status === 'none') {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      }

      return {
        ...prev,
        [dateKey]: {
          ...existing,
          overtimeHours: 0,
          updatedAt: Date.now(),
        },
      };
    });
  };

  // Day detail save handler
  const handleSaveDayDetail = (updatedRecord: DayRecord) => {
    updateRecords((prev) => ({
      ...prev,
      [updatedRecord.date]: updatedRecord,
    }));
  };

  // Day detail delete handler
  const handleDeleteDay = (dateStr: string) => {
    updateRecords((prev) => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });
  };

  // Clear Month handler
  const handleClearCurrentMonth = () => {
    updateRecords((prev) => {
      const next = { ...prev };
      const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-`;
      for (const key of Object.keys(next)) {
        if (key.startsWith(prefix)) {
          delete next[key];
        }
      }
      return next;
    });
  };

  // Clear All handler
  const handleClearAll = () => {
    updateRecords(() => ({}));
  };

  // Restore demo handler
  const handleRestoreDemo = () => {
    localStorage.removeItem('attendance_plus_records_v1');
    const fresh = loadStoredRecords();
    setRecords(fresh);
    setCurrentYear(2026);
    setCurrentMonth(8);
  };

  // Manual Sync trigger
  const handleManualSync = () => {
    const now = Date.now();
    setLastSync(now);
    setLastSyncTime(now);
    setPendingSync(false);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Restore Backup
  const handleRestoreBackup = (
    restoredRecords: AttendanceDatabase,
    restoredSettings?: AppSettings
  ) => {
    setRecords(restoredRecords);
    saveStoredRecords(restoredRecords);
    if (restoredSettings) {
      setSettings(restoredSettings);
      saveStoredSettings(restoredSettings);
    }
  };

  return (
    <div
      id="app-root"
      className="min-h-screen bg-[#fcf8d8] flex flex-col items-center justify-between font-sans text-gray-900 selection:bg-blue-200"
    >
      {/* Offline Status Banner */}
      <OfflineBanner isOnline={isOnline} />

      {/* Main Container - Responsive on Mobile & Tablet */}
      <div className="w-full max-w-lg flex flex-col items-center flex-1">
        {/* Dark Top Header with Year Selector & Icons */}
        <div className="w-full">
          <Header
            currentYear={currentYear}
            onOpenYearPicker={() => setIsYearPickerOpen(true)}
            onOpenReport={() => setIsReportOpen(true)}
            onOpenReset={() => setIsResetOpen(true)}
            onOpenSettings={() => {
              setSettingsTab('general');
              setIsSettingsOpen(true);
            }}
            onOpenHowToUse={() => setIsHowToUseOpen(true)}
            isOnline={isOnline}
            pendingSync={pendingSync}
            onInstallPWA={install}
            isInstallable={isInstallable}
          />
        </div>

        {/* Month Navigator & Summary Badges */}
        <MonthNavigator
          monthName={MONTH_NAMES[currentMonth]}
          workDays={summary.workDays}
          halfDays={summary.halfDays}
          effectiveWorkDays={summary.effectiveWorkDays}
          overtimeHours={summary.overtimeHours}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Prominent Quick Action Bar for Face Punch, Guide & Duty Setting */}
        <div className="w-full px-3 py-1 flex items-center gap-2">
          {settings.enableFacePunch !== false && (
            <button
              id="btn-prominent-face-punch"
              onClick={() => setIsFacePunchOpen(true)}
              className="flex-1 py-2 px-2.5 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white rounded-xl shadow-xs text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
              title="Camera Face Verification Duty Punch"
            >
              <Camera className="w-4 h-4 text-purple-200 shrink-0" />
              <span className="truncate">Face Punch</span>
            </button>
          )}

          <button
            id="btn-prominent-how-to-use"
            onClick={() => setIsHowToUseOpen(true)}
            className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-xl shadow-xs text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
            title="How to Use Guide"
          >
            <HelpCircle className="w-4 h-4 text-gray-900 shrink-0" />
            <span>Guide</span>
          </button>

          <button
            id="btn-prominent-duty-settings"
            onClick={() => setIsDutySettingOpen(true)}
            className="py-2 px-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl shadow-xs text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
            title="Duty Settings: Sunday off/on, Holiday salary count & Shift timing"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-200 shrink-0" />
            <span>Duty Setting</span>
          </button>
        </div>

        {/* Calendar Grid */}
        <main className="w-full flex justify-center my-1 flex-1">
          <CalendarGrid
            cells={cells}
            records={records}
            onCellClick={handleCellClick}
            onCellLongPress={handleCellLongPress}
          />
        </main>

        {/* Bottom Category Toolbar (2x3 Grid matching Screenshot 1 & 4) */}
        <footer className="w-full">
          <CategoryToolbar
            activeTool={activeTool}
            onSelectTool={(status) => {
              // Tapping the currently selected tool again will keep it or deselect
              setActiveTool((prev) => (prev === status ? null : status));
            }}
          />
        </footer>

        {/* Google AdMob Banner Slot (Google Play Console Policy Compliant) */}
        <div className="w-full mt-2 mb-1">
          <AdMobBanner
            admobBannerId={settings.admobBannerId}
            testMode={settings.admobTestMode}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        </div>

        {/* Clean Application Footer */}
        <div className="w-full text-center text-[11px] text-gray-500 py-1.5 flex items-center justify-center gap-2">
          <span>Attendance Plus v1.0.0</span>
          <span>•</span>
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-gray-900 underline font-medium cursor-pointer"
          >
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Modals */}
      {/* 1. Year Picker Modal (matching Screenshot 3) */}
      <YearPickerModal
        isOpen={isYearPickerOpen}
        selectedYear={currentYear}
        onSelectYear={(year) => setCurrentYear(year)}
        onClose={() => setIsYearPickerOpen(false)}
      />

      {/* 2. Monthly Report & Dashboard Modal (matching Screenshot 2 + user export requests) */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        summary={summary}
        records={records}
        settings={settings}
      />

      {/* 3. Overtime Hours Selector Modal */}
      {overtimeModalDate && (
        <OvertimeModal
          isOpen={!!overtimeModalDate}
          dateStr={overtimeModalDate}
          initialHours={records[overtimeModalDate]?.overtimeHours || 0}
          onSave={handleSaveOvertime}
          onClear={handleClearOvertime}
          onClose={() => setOvertimeModalDate(null)}
        />
      )}

      {/* 4. Day Detail Modal */}
      {detailModalDate && (
        <DayDetailModal
          isOpen={!!detailModalDate}
          dateStr={detailModalDate}
          record={records[detailModalDate]}
          onSave={handleSaveDayDetail}
          onDelete={handleDeleteDay}
          onClose={() => setDetailModalDate(null)}
        />
      )}

      {/* 5. Clear / Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetOpen}
        monthName={MONTH_NAMES[currentMonth]}
        year={currentYear}
        onClearMonth={handleClearCurrentMonth}
        onClearAll={handleClearAll}
        onRestoreDemo={handleRestoreDemo}
        onClose={() => setIsResetOpen(false)}
      />

      {/* 6. Settings, Backup & Offline Sync Modal */}
      <SettingsAndSyncModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        records={records}
        onRestoreBackup={handleRestoreBackup}
        isOnline={isOnline}
        onManualSync={handleManualSync}
        lastSyncTime={lastSync}
        onInstallPWA={install}
        isInstallable={isInstallable}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onTestAppOpenAd={() => setIsAppOpenAdActive(true)}
      />

      {/* 7. Privacy Policy Modal (Google Play Console Mandatory) */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* 8. Google AdMob App Open / Interstitial Full-Screen Ad */}
      <AppOpenAdModal
        isOpen={isAppOpenAdActive}
        onClose={() => setIsAppOpenAdActive(false)}
        adUnitId={settings.admobAppOpenId || 'ca-app-pub-3940256099942544/9257395921'}
        testMode={settings.admobTestMode !== false}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* 9. How to Use Guide Modal */}
      <HowToUseModal
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
        onOpenSettings={() => {
          setIsHowToUseOpen(false);
          setSettingsTab('general');
          setIsSettingsOpen(true);
        }}
        onOpenFacePunch={() => {
          setIsHowToUseOpen(false);
          setIsFacePunchOpen(true);
        }}
      />

      {/* 10. Face Punch Duty Verification Modal */}
      <FacePunchModal
        isOpen={isFacePunchOpen}
        onClose={() => setIsFacePunchOpen(false)}
        onPunchSuccess={handleFacePunchSuccess}
        defaultShiftIn={settings.defaultShiftIn}
        defaultShiftOut={settings.defaultShiftOut}
      />

      {/* 11. Duty Setting Modal (Sunday Off/On, Paid Holiday Salary, Shift Hours) */}
      <DutySettingModal
        isOpen={isDutySettingOpen}
        onClose={() => setIsDutySettingOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        currentMonthName={summary.monthName}
        holidayDaysCount={summary.holidayDays}
        totalSundaysCount={summary.totalSundays}
      />
    </div>
  );
}
