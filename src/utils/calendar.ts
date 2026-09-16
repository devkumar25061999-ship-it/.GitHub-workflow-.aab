import { AttendanceDatabase, MonthlySummary } from '../types';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function formatDateString(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function parseDateString(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, ...
}

export interface CalendarCell {
  id: string;
  type: 'day';
  dayNumber: number;
  dateString: string;
  year: number;
  month: number;
  isCurrentMonth: boolean;
  isOtherMonth: boolean;
  isSunday?: boolean;
  isSaturday?: boolean;
  isWeekend?: boolean;
}

export function getCalendarGrid(year: number, month: number): CalendarCell[] {
  const firstDay = getFirstDayOfWeek(year, month);
  const totalDays = getDaysInMonth(year, month);
  const cells: CalendarCell[] = [];

  // Previous month filling (no blank holes!)
  if (firstDay > 0) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevDaysCount = getDaysInMonth(prevYear, prevMonth);
    const startDay = prevDaysCount - firstDay + 1;

    for (let p = 0; p < firstDay; p++) {
      const dayNum = startDay + p;
      const dateString = formatDateString(prevYear, prevMonth, dayNum);
      const isSunday = p === 0;
      const isSaturday = p === 6;

      cells.push({
        id: dateString,
        type: 'day',
        dayNumber: dayNum,
        dateString,
        year: prevYear,
        month: prevMonth,
        isCurrentMonth: false,
        isOtherMonth: true,
        isSunday,
        isSaturday,
        isWeekend: isSunday || isSaturday,
      });
    }
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const dayOfWeek = (firstDay + day - 1) % 7;
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const isWeekend = isSunday || isSaturday;
    const dateString = formatDateString(year, month, day);

    cells.push({
      id: dateString,
      type: 'day',
      dayNumber: day,
      dateString,
      year,
      month,
      isCurrentMonth: true,
      isOtherMonth: false,
      isSunday,
      isSaturday,
      isWeekend,
    });
  }

  // Trailing days from next month to complete the week rows (no blank holes!)
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const needed = 7 - remainder;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let n = 1; n <= needed; n++) {
      const isSunday = (cells.length) % 7 === 0;
      const isSaturday = (cells.length) % 7 === 6;
      const dateString = formatDateString(nextYear, nextMonth, n);

      cells.push({
        id: dateString,
        type: 'day',
        dayNumber: n,
        dateString,
        year: nextYear,
        month: nextMonth,
        isCurrentMonth: false,
        isOtherMonth: true,
        isSunday,
        isSaturday,
        isWeekend: isSunday || isSaturday,
      });
    }
  }

  return cells;
}

export function calculateMonthlySummary(db: AttendanceDatabase, year: number, month: number): MonthlySummary {
  const totalDays = getDaysInMonth(year, month);
  let workDays = 0;
  let halfDays = 0;
  let overtimeHours = 0;
  let vacationDays = 0;
  let sickDays = 0;
  let emergencyDays = 0;
  let holidayDays = 0;
  let daysWithOvertime = 0;
  let totalRecordedDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    const dateKey = formatDateString(year, month, day);
    const record = db[dateKey];
    if (record) {
      if (record.status && record.status !== 'none') {
        totalRecordedDays++;
      }
      if (record.status === 'work') {
        workDays++;
      } else if (record.status === 'halfday') {
        halfDays++;
      } else if (record.status === 'vacation') {
        vacationDays++;
      } else if (record.status === 'sick') {
        sickDays++;
      } else if (record.status === 'emergency') {
        emergencyDays++;
      } else if (record.status === 'holiday') {
        holidayDays++;
      }

      if (record.overtimeHours && record.overtimeHours > 0) {
        overtimeHours += record.overtimeHours;
        daysWithOvertime++;
      }
    }
  }

  // Prevent floating point inaccuracies (e.g. 0.1 + 0.2)
  overtimeHours = Math.round(overtimeHours * 10) / 10;
  const effectiveWorkDays = Math.round((workDays + halfDays * 0.5) * 10) / 10;

  return {
    year,
    month,
    monthName: MONTH_NAMES[month],
    workDays,
    halfDays,
    effectiveWorkDays,
    overtimeHours,
    vacationDays,
    sickDays,
    emergencyDays,
    holidayDays,
    totalDays,
    daysWithOvertime,
    totalRecordedDays,
  };
}
