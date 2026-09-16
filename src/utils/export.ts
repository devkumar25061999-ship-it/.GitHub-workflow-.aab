import { AttendanceDatabase, MonthlySummary, AppSettings } from '../types';
import { formatDateString, getDaysInMonth, WEEKDAY_NAMES } from './calendar';

export function generateMonthlyTextReport(
  summary: MonthlySummary,
  settings?: AppSettings
): string {
  const effectiveWork = summary.effectiveWorkDays ?? (summary.workDays + (summary.halfDays || 0) * 0.5);

  let text = `📊 ${summary.monthName} ${summary.year} Report:\n\n`;
  text += `⏱️ Total Overtime: ${summary.overtimeHours} Hours\n`;
  text += `💼 Full Work Days: ${summary.workDays} Days\n`;
  if (summary.halfDays > 0) {
    text += `🌗 Half Duty: ${summary.halfDays} Days (${summary.halfDays * 0.5} Work Days)\n`;
    text += `📈 Total Effective Work: ${effectiveWork} Days\n`;
  }
  text += `🏖️ Vacation: ${summary.vacationDays} Days\n`;
  text += `💊 Sick: ${summary.sickDays} Days\n`;
  text += `🚨 Emergency: ${summary.emergencyDays} Days\n`;
  text += `🎉 Holiday: ${summary.holidayDays} Days\n`;

  if (settings && (settings.dailyWage > 0 || settings.hourlyOvertimeRate > 0)) {
    const baseWage = effectiveWork * settings.dailyWage;
    const otWage = summary.overtimeHours * settings.hourlyOvertimeRate;
    const totalWage = baseWage + otWage;
    text += `\n💰 Estimated Salary:\n`;
    text += `- Base (${effectiveWork} work days @ ${settings.currency}${settings.dailyWage}): ${settings.currency}${baseWage}\n`;
    text += `- Overtime (${summary.overtimeHours} hrs @ ${settings.currency}${settings.hourlyOvertimeRate}): ${settings.currency}${otWage}\n`;
    text += `- Total Earnings: ${settings.currency}${totalWage}\n`;
  }

  text += `\nGenerated via Attendance Plus`;
  return text;
}

export function downloadMonthlyCSV(
  db: AttendanceDatabase,
  year: number,
  month: number,
  monthName: string,
  summary: MonthlySummary,
  settings: AppSettings
): void {
  const totalDays = getDaysInMonth(year, month);
  const rows: string[][] = [];
  const effectiveWork = summary.effectiveWorkDays ?? (summary.workDays + (summary.halfDays || 0) * 0.5);

  // Header meta
  rows.push(['Attendance Plus - Monthly Attendance Report']);
  rows.push(['Month & Year', `${monthName} ${year}`]);
  rows.push(['Generated On', new Date().toLocaleDateString()]);
  rows.push(['Company / Project', settings.companyName]);
  rows.push(['Employee', settings.employeeName]);
  rows.push([]);

  // Summary Table
  rows.push(['Summary Metric', 'Value']);
  rows.push(['Full Work Days', `${summary.workDays} Days`]);
  if (summary.halfDays > 0) {
    rows.push(['Half Duty Days', `${summary.halfDays} Days (${summary.halfDays * 0.5} Work Days)`]);
    rows.push(['Total Effective Work', `${effectiveWork} Days`]);
  }
  rows.push(['Total Overtime', `${summary.overtimeHours} Hours`]);
  rows.push(['Vacation Days', `${summary.vacationDays} Days`]);
  rows.push(['Sick Days', `${summary.sickDays} Days`]);
  rows.push(['Emergency Days', `${summary.emergencyDays} Days`]);
  rows.push(['Holiday Days', `${summary.holidayDays} Days`]);
  
  if (settings.dailyWage > 0 || settings.hourlyOvertimeRate > 0) {
    const basePay = effectiveWork * settings.dailyWage;
    const otPay = summary.overtimeHours * settings.hourlyOvertimeRate;
    rows.push(['Base Pay', `${settings.currency} ${basePay}`]);
    rows.push(['Overtime Pay', `${settings.currency} ${otPay}`]);
    rows.push(['Total Estimated Pay', `${settings.currency} ${basePay + otPay}`]);
  }

  rows.push([]);
  rows.push(['--- Daily Detailed Breakdown ---']);
  rows.push(['Date', 'Day', 'Status', 'Overtime (Hours)', 'Notes']);

  for (let day = 1; day <= totalDays; day++) {
    const dateKey = formatDateString(year, month, day);
    const dateObj = new Date(year, month, day);
    const dayName = WEEKDAY_NAMES[dateObj.getDay()];
    const record = db[dateKey];

    const statusLabel = record?.status && record.status !== 'none'
      ? record.status.toUpperCase()
      : (dateObj.getDay() === 0 || dateObj.getDay() === 6 ? 'WEEKEND' : 'REGULAR');

    const ot = record?.overtimeHours ? `${record.overtimeHours}h` : '0h';
    const notes = record?.notes ? `"${record.notes.replace(/"/g, '""')}"` : '';

    rows.push([dateKey, dayName, statusLabel, ot, notes]);
  }

  // Convert to CSV string
  const csvContent = rows
    .map((row) => row.map((field) => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Attendance_Plus_${monthName}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
