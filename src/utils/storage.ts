import { AttendanceDatabase, AppSettings, DayRecord } from '../types';

const STORAGE_KEY_RECORDS = 'attendance_plus_records_v1';
const STORAGE_KEY_SETTINGS = 'attendance_plus_settings_v1';
const STORAGE_KEY_LAST_SYNC = 'attendance_plus_last_sync_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  dailyWage: 800,
  hourlyOvertimeRate: 150,
  currency: '₹',
  companyName: 'General Works',
  employeeName: 'Self',
  employeeId: 'EMP-001',
  department: 'Operations',
  defaultShiftIn: '09:00',
  defaultShiftOut: '18:00',
  enableFacePunch: true, // Enabled by default so user can immediately see & test, optional toggle in settings
  admobAppId: 'ca-app-pub-2133508635089094~1211511400',
  admobBannerId: 'ca-app-pub-2133508635089094/7668217896',
  admobInterstitialId: 'ca-app-pub-3940256099942544/1033173712',
  admobAppOpenId: 'ca-app-pub-2133508635089094/1169248997',
  admobTestMode: true,
  enableAppOpenAd: true,
  enableInterstitialOnReport: true,
};

// Initial sample data matching Screenshot 4 (September 2026)
function generateInitialSampleData(): AttendanceDatabase {
  const db: AttendanceDatabase = {};
  const now = Date.now();

  // September 2026 Work days (19 days as shown in screenshot)
  const workDayNumbers = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 16, 18, 20, 21, 23, 24, 25];
  for (const day of workDayNumbers) {
    const key = `2026-09-${String(day).padStart(2, '0')}`;
    db[key] = {
      date: key,
      status: 'work',
      overtimeHours: 0,
      updatedAt: now,
    };
  }

  // Overtime days with hours: 15 (1h), 17 (3h), 19 (8h), 22 (8h), 26 (8h), 28 (6h), 29 (6h) -> sum = 40h
  const overtimeMap: Record<number, number> = {
    15: 1,
    17: 3,
    19: 8,
    22: 8,
    26: 8,
    28: 6,
    29: 6,
  };

  for (const [day, hours] of Object.entries(overtimeMap)) {
    const key = `2026-09-${String(day).padStart(2, '0')}`;
    db[key] = {
      date: key,
      status: 'work', // overtime is performed on work day
      overtimeHours: hours,
      updatedAt: now,
    };
  }

  // Holiday on 30th
  db['2026-09-30'] = {
    date: '2026-09-30',
    status: 'holiday',
    overtimeHours: 0,
    updatedAt: now,
  };

  return db;
}

export function loadStoredRecords(): AttendanceDatabase {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load attendance records from localStorage', err);
  }
  const initial = generateInitialSampleData();
  saveStoredRecords(initial);
  return initial;
}

export function saveStoredRecords(records: AttendanceDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save attendance records to localStorage', err);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.admobAppId || parsed.admobAppId.includes('3940256099942544')) {
        parsed.admobAppId = 'ca-app-pub-2133508635089094~1211511400';
      }
      if (!parsed.admobAppOpenId || parsed.admobAppOpenId.includes('3940256099942544')) {
        parsed.admobAppOpenId = 'ca-app-pub-2133508635089094/1169248997';
      }
      if (!parsed.admobBannerId || parsed.admobBannerId.includes('3940256099942544')) {
        parsed.admobBannerId = 'ca-app-pub-2133508635089094/7668217896';
      }
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      if (merged.enableFacePunch === undefined) {
        merged.enableFacePunch = true;
      }
      return merged;
    }
  } catch (err) {
    console.error('Failed to load settings', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function getLastSyncTime(): number | null {
  try {
    const val = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
    return val ? Number(val) : null;
  } catch {
    return null;
  }
}

export function setLastSyncTime(timestamp: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, String(timestamp));
  } catch {}
}

export function exportBackupJSON(records: AttendanceDatabase, settings: AppSettings): string {
  const payload = {
    version: 1,
    appName: 'Attendance Plus',
    exportedAt: new Date().toISOString(),
    settings,
    records,
  };
  return JSON.stringify(payload, null, 2);
}

export function importBackupJSON(jsonString: string): {
  success: boolean;
  records?: AttendanceDatabase;
  settings?: AppSettings;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.records || typeof parsed.records !== 'object') {
      return { success: false, error: 'Invalid backup format: missing records object' };
    }
    return {
      success: true,
      records: parsed.records as AttendanceDatabase,
      settings: parsed.settings as AppSettings,
    };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || 'Failed to parse JSON file' };
  }
}
