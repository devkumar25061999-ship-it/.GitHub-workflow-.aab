import { AttendanceDatabase, AppSettings, MonthlySummary } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function downloadHRCSV(
  summary: MonthlySummary,
  records: AttendanceDatabase,
  settings: AppSettings
) {
  const { year, month } = summary;
  const monthName = MONTH_NAMES[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const lines: string[] = [];

  // 1. Company & Document Header
  lines.push(`"${(settings.companyName || 'ATTENDANCE PLUS').toUpperCase()} - OFFICIAL MONTHLY MUSTER ROLL"`);
  lines.push(`"DOCUMENT TYPE: HR Attendance & Timesheet Statement","MONTH / YEAR: ${monthName} ${year}"`);
  lines.push(`"GENERATED ON: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}"`);
  lines.push('');

  // 2. Employee Profile Block
  lines.push('"EMPLOYEE DETAILS"');
  lines.push(`"Employee Name:","${settings.employeeName || 'Employee'}","Employee ID:","${settings.employeeId || 'EMP-001'}"`);
  lines.push(`"Department:","${settings.department || 'Operations'}","Shift Timings:","${settings.defaultShiftIn || '09:00 AM'} - ${settings.defaultShiftOut || '06:00 PM'}"`);
  lines.push(`"Daily Wage Rate:","${settings.currency || '₹'}${settings.dailyWage || 0}","Hourly OT Rate:","${settings.currency || '₹'}${settings.hourlyOvertimeRate || 0}"`);
  lines.push('');

  // 3. Executive HR Summary Block
  const baseSalary = summary.effectiveWorkDays * (settings.dailyWage || 0);
  const otEarnings = summary.overtimeHours * (settings.hourlyOvertimeRate || 0);
  const grossPay = baseSalary + otEarnings;

  lines.push('"MONTHLY EXECUTIVE SUMMARY"');
  lines.push(`"Total Calendar Days:","${daysInMonth}","Present Full Duty:","${summary.workDays} days"`);
  lines.push(`"Half Days:","${summary.halfDays} days","Effective Duty Days:","${summary.effectiveWorkDays} days"`);
  lines.push(`"Total Overtime:","${summary.overtimeHours} hrs","Paid Holidays:","${summary.holidayDays} days"`);
  lines.push(`"Sick Leave:","${summary.sickDays} days","Vacation / Privilege:","${summary.vacationDays} days"`);
  lines.push(`"Emergency Leave:","${summary.emergencyDays} days","Estimated Gross Pay:","${settings.currency || '₹'}${grossPay.toLocaleString('en-IN')}"`);
  lines.push('');

  // 4. Day-by-Day Muster Roll Table
  lines.push('"DAY-BY-DAY ATTENDANCE LOG"');
  lines.push('"Date","Day","Status Code","In Time","Out Time","Overtime (Hrs)","Punch Verification","Remarks / Notes"');

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month, day);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const rec = records[dateKey];

    let statusCode = 'ABSENT';
    let inTime = '-';
    let outTime = '-';
    let otHours = '0';
    let punchMethod = 'Manual';
    let notes = '';

    if (rec) {
      statusCode = rec.status ? rec.status.toUpperCase() : 'NONE';
      if (rec.inTime) inTime = rec.inTime;
      if (rec.outTime) outTime = rec.outTime;
      if (rec.overtimeHours) otHours = `${rec.overtimeHours}`;
      if (rec.punchMethod === 'face_punch') punchMethod = 'Face Punch (Biometric)';
      if (rec.notes) notes = rec.notes.replace(/"/g, '""');
    }

    lines.push(`"${dateKey}","${dayName}","${statusCode}","${inTime}","${outTime}","${otHours}","${punchMethod}","${notes}"`);
  }

  // 5. Official Signatures Block
  lines.push('');
  lines.push('"AUTHORIZATION & SIGNATURES"');
  lines.push('"Employee Signature: _______________________","Date: _____________"');
  lines.push('"HR / Dept Manager Approval: _______________________","Seal / Stamp: _____________"');

  // Generate file with UTF-8 BOM so Excel opens Hindi / INR characters cleanly
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HR_Muster_Roll_${monthName}_${year}_${settings.employeeName || 'Staff'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadHRExcelFile(
  summary: MonthlySummary,
  records: AttendanceDatabase,
  settings: AppSettings
) {
  const { year, month } = summary;
  const monthName = MONTH_NAMES[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const baseSalary = summary.effectiveWorkDays * (settings.dailyWage || 0);
  const otEarnings = summary.overtimeHours * (settings.hourlyOvertimeRate || 0);
  const grossPay = baseSalary + otEarnings;

  let rowsHtml = '';
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month, day);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = dateObj.getDay() === 0; // Sunday
    const rec = records[dateKey];

    let statusText = 'Absent';
    let statusBg = '#ffffff';
    let inTime = '-';
    let outTime = '-';
    let otHours = 0;
    let punchMethod = 'Manual';
    let notes = '';

    if (rec) {
      otHours = rec.overtimeHours || 0;
      inTime = rec.inTime || (rec.status === 'work' ? (settings.defaultShiftIn || '09:00 AM') : '-');
      outTime = rec.outTime || (rec.status === 'work' ? (settings.defaultShiftOut || '06:00 PM') : '-');
      if (rec.punchMethod === 'face_punch') punchMethod = 'Face Punch (Selfie)';
      if (rec.notes) notes = rec.notes;

      switch (rec.status) {
        case 'work':
          statusText = 'Present (Work)';
          statusBg = '#e6f4ea'; // Soft Green
          break;
        case 'halfday':
          statusText = 'Half Duty';
          statusBg = '#e8f0fe'; // Soft Blue
          break;
        case 'holiday':
          statusText = 'Holiday / Off';
          statusBg = '#fef7e0'; // Soft Yellow
          break;
        case 'vacation':
          statusText = 'Vacation';
          statusBg = '#e0f2f1'; // Teal
          break;
        case 'sick':
          statusText = 'Sick Leave';
          statusBg = '#fce8e6'; // Soft Red
          break;
        case 'emergency':
          statusText = 'Emergency';
          statusBg = '#fff8e1';
          break;
        default:
          statusText = rec.status;
      }
    } else if (isWeekend) {
      statusText = 'Sunday Off';
      statusBg = '#f8f9fa';
    }

    rowsHtml += `
      <tr style="background-color: ${isWeekend ? '#f1f3f4' : '#ffffff'};">
        <td style="padding: 6px; border: 1px solid #dadce0; text-align: center;">${dateKey}</td>
        <td style="padding: 6px; border: 1px solid #dadce0; text-align: center; font-weight: ${isWeekend ? 'bold' : 'normal'}; color: ${isWeekend ? '#c5221f' : '#202124'};">${dayName}</td>
        <td style="padding: 6px; border: 1px solid #dadce0; text-align: center; background-color: ${statusBg}; font-weight: bold;">${statusText}</td>
        <td style="padding: 6px; border: 1px solid #dadce0; text-align: center;">${inTime}</td>
        <td style="padding: 6px; border: 1px solid #dadce0; text-align: center;">${outTime}</td>
        <td style="padding: 6px; border: 1px solid #dadce0; text-align: center; font-weight: ${otHours > 0 ? 'bold' : 'normal'}; color: ${otHours > 0 ? '#137333' : '#5f6368'};">${otHours > 0 ? otHours + ' hrs' : '-'}</td>
        <td style="padding: 6px; border: 1px solid #dadce0; text-align: center;">${punchMethod}</td>
        <td style="padding: 6px; border: 1px solid #dadce0; text-align: left;">${notes}</td>
      </tr>
    `;
  }

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${monthName} ${year} Attendance</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #202124; }
        .header-title { font-size: 16pt; font-weight: bold; background-color: #1e3a8a; color: #ffffff; text-align: center; padding: 12px; }
        .sub-header { font-size: 10pt; color: #5f6368; padding: 4px; }
        .section-title { font-size: 12pt; font-weight: bold; background-color: #f1f5f9; padding: 8px; border-left: 4px solid #1e3a8a; }
        .summary-card { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; }
        .table-header { background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: center; padding: 8px; border: 1px solid #475569; }
      </style>
    </head>
    <body>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td colspan="8" class="header-title">${(settings.companyName || 'ATTENDANCE PLUS').toUpperCase()} - MONTHLY MUSTER ROLL</td>
        </tr>
        <tr>
          <td colspan="4" class="sub-header"><strong>Period:</strong> ${monthName} ${year}</td>
          <td colspan="4" class="sub-header" style="text-align: right;"><strong>Generated On:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
        </tr>
      </table>

      <!-- Employee Information -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #cbd5e1;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px; font-weight: bold; width: 15%;">Employee Name:</td>
          <td style="padding: 8px; width: 35%;">${settings.employeeName || 'Staff Member'}</td>
          <td style="padding: 8px; font-weight: bold; width: 15%;">Employee ID:</td>
          <td style="padding: 8px; width: 35%;">${settings.employeeId || 'EMP-001'}</td>
        </tr>
        <tr style="background-color: #ffffff;">
          <td style="padding: 8px; font-weight: bold;">Department:</td>
          <td style="padding: 8px;">${settings.department || 'General Operations'}</td>
          <td style="padding: 8px; font-weight: bold;">Shift Timings:</td>
          <td style="padding: 8px;">${settings.defaultShiftIn || '09:00 AM'} - ${settings.defaultShiftOut || '06:00 PM'}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px; font-weight: bold;">Base Daily Wage:</td>
          <td style="padding: 8px;">${settings.currency || '₹'}${settings.dailyWage || 0} / day</td>
          <td style="padding: 8px; font-weight: bold;">Hourly OT Rate:</td>
          <td style="padding: 8px;">${settings.currency || '₹'}${settings.hourlyOvertimeRate || 0} / hr</td>
        </tr>
      </table>

      <!-- HR Summary Numbers -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #cbd5e1;">
        <tr style="background-color: #e2e8f0; font-weight: bold;">
          <td style="padding: 8px; text-align: center; border: 1px solid #cbd5e1;">Present Days</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #cbd5e1;">Half Duty</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #cbd5e1;">Effective Days</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #cbd5e1;">Overtime Hours</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #cbd5e1;">Holidays / Off</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #cbd5e1;">Leaves (Sick/Vac)</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #cbd5e1; background-color: #dcfce7; color: #14532d; font-size: 12pt;">Est. Gross Pay</td>
        </tr>
        <tr style="background-color: #ffffff; text-align: center; font-size: 11pt; font-weight: bold;">
          <td style="padding: 8px; border: 1px solid #cbd5e1; color: #166534;">${summary.workDays}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; color: #1e40af;">${summary.halfDays}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; color: #0f172a;">${summary.effectiveWorkDays}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; color: #b45309;">${summary.overtimeHours} hrs</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b;">${summary.holidayDays}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; color: #991b1b;">${summary.sickDays + summary.vacationDays + summary.emergencyDays}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; background-color: #f0fdf4; color: #15803d; font-size: 13pt;">${settings.currency || '₹'}${grossPay.toLocaleString('en-IN')}</td>
        </tr>
      </table>

      <!-- Daily Records Muster Roll -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <thead>
          <tr>
            <th class="table-header">Date</th>
            <th class="table-header">Day</th>
            <th class="table-header">Status</th>
            <th class="table-header">Punch In</th>
            <th class="table-header">Punch Out</th>
            <th class="table-header">OT (Hrs)</th>
            <th class="table-header">Verification</th>
            <th class="table-header">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- Signatures Footer -->
      <table style="width: 100%; margin-top: 30px; border-collapse: collapse;">
        <tr>
          <td style="width: 45%; border-top: 2px solid #334155; padding-top: 8px; text-align: center; font-weight: bold;">
            Employee Signature<br/>
            <span style="font-size: 9pt; color: #64748b; font-weight: normal;">(I confirm the attendance entries above are true)</span>
          </td>
          <td style="width: 10%;"></td>
          <td style="width: 45%; border-top: 2px solid #334155; padding-top: 8px; text-align: center; font-weight: bold;">
            HR Manager / Authorized Signatory<br/>
            <span style="font-size: 9pt; color: #64748b; font-weight: normal;">(Verified & Approved for Payroll Processing)</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HR_Attendance_Sheet_${monthName}_${year}_${settings.employeeName || 'Staff'}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printHRTimesheet(
  summary: MonthlySummary,
  records: AttendanceDatabase,
  settings: AppSettings
) {
  const { year, month } = summary;
  const monthName = MONTH_NAMES[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print attendance sheet');
    return;
  }

  const baseSalary = summary.effectiveWorkDays * (settings.dailyWage || 0);
  const otEarnings = summary.overtimeHours * (settings.hourlyOvertimeRate || 0);
  const grossPay = baseSalary + otEarnings;

  let rows = '';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dt = new Date(year, month, d);
    const day = dt.toLocaleDateString('en-US', { weekday: 'short' });
    const rec = records[dateKey];
    const status = rec ? rec.status.toUpperCase() : (dt.getDay() === 0 ? 'SUNDAY' : '-');
    const ot = rec?.overtimeHours ? `${rec.overtimeHours} hrs` : '-';
    const inT = rec?.inTime || '-';
    const outT = rec?.outTime || '-';
    const method = rec?.punchMethod === 'face_punch' ? 'Face Punch' : 'Manual';
    
    rows += `<tr>
      <td>${dateKey}</td>
      <td>${day}</td>
      <td><strong>${status}</strong></td>
      <td>${inT}</td>
      <td>${outT}</td>
      <td>${ot}</td>
      <td>${method}</td>
      <td>${rec?.notes || ''}</td>
    </tr>`;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>HR Muster Roll - ${monthName} ${year}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 20px; color: #111; }
          h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
          .header-box { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 15px; }
          .summary-grid { display: flex; gap: 15px; background: #f3f4f6; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: center; }
          th { background: #eee; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; font-size: 13px; }
          .sig-line { width: 220px; border-top: 1px solid #000; text-align: center; padding-top: 5px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h1>${settings.companyName || 'ATTENDANCE PLUS'} - OFFICIAL ATTENDANCE RECORD</h1>
          <p style="margin: 4px 0 0; color: #555; font-size: 12px;">Monthly Timesheet & Duty Muster Roll | ${monthName} ${year}</p>
        </div>
        <div class="meta-grid">
          <div><strong>Employee Name:</strong> ${settings.employeeName || 'Staff'}</div>
          <div><strong>Employee ID:</strong> ${settings.employeeId || 'EMP-001'}</div>
          <div><strong>Department:</strong> ${settings.department || 'Operations'}</div>
          <div><strong>Shift Hours:</strong> ${settings.defaultShiftIn || '09:00 AM'} - ${settings.defaultShiftOut || '06:00 PM'}</div>
        </div>
        <div class="summary-grid">
          <div><strong>Present:</strong> ${summary.workDays} days</div>
          <div><strong>Half Days:</strong> ${summary.halfDays} days</div>
          <div><strong>Effective:</strong> ${summary.effectiveWorkDays} days</div>
          <div><strong>Overtime:</strong> ${summary.overtimeHours} hrs</div>
          <div><strong>Est. Gross Pay:</strong> ${settings.currency || '₹'}${grossPay.toLocaleString('en-IN')}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Day</th><th>Status</th><th>In Time</th><th>Out Time</th><th>OT</th><th>Method</th><th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="signatures">
          <div class="sig-line">Employee Signature</div>
          <div class="sig-line">HR Manager / Seal</div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}
