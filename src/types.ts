export type AttendanceStatus = 'work' | 'halfday' | 'vacation' | 'sick' | 'emergency' | 'holiday' | 'overtime' | 'none';

export interface CategoryDef {
  id: AttendanceStatus;
  name: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  activeRing: string;
}

export interface DayRecord {
  date: string; // 'YYYY-MM-DD'
  status: AttendanceStatus;
  overtimeHours: number;
  inTime?: string;
  outTime?: string;
  punchMethod?: 'manual' | 'face_punch';
  faceSnapshot?: string;
  notes?: string;
  updatedAt: number;
}

export type AttendanceDatabase = Record<string, DayRecord>;

export interface MonthlySummary {
  year: number;
  month: number; // 0-11
  monthName: string;
  workDays: number;
  halfDays: number;
  effectiveWorkDays: number;
  overtimeHours: number;
  vacationDays: number;
  sickDays: number;
  emergencyDays: number;
  holidayDays: number;
  totalDays: number;
  daysWithOvertime: number;
  totalRecordedDays: number;
}

export interface AppSettings {
  dailyWage: number;
  hourlyOvertimeRate: number;
  currency: string;
  companyName: string;
  employeeName: string;
  employeeId?: string;
  department?: string;
  defaultShiftIn?: string;
  defaultShiftOut?: string;
  enableFacePunch?: boolean;
  admobAppId?: string;
  admobBannerId?: string;
  admobInterstitialId?: string;
  admobAppOpenId?: string;
  admobTestMode?: boolean;
  enableAppOpenAd?: boolean;
  enableInterstitialOnReport?: boolean;
}
