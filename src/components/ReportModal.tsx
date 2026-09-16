import React, { useState } from 'react';
import { X, Download, Copy, Check, Printer, DollarSign, BarChart2 } from 'lucide-react';
import { MonthlySummary, AttendanceDatabase, AppSettings } from '../types';
import { generateMonthlyTextReport, downloadMonthlyCSV } from '../utils/export';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthlySummary;
  records: AttendanceDatabase;
  settings: AppSettings;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  summary,
  records,
  settings,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'dashboard'>('summary');

  if (!isOpen) return null;

  const handleCopyText = async () => {
    const reportText = generateMonthlyTextReport(summary, settings);
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCSV = () => {
    downloadMonthlyCSV(
      records,
      summary.year,
      summary.month,
      summary.monthName,
      summary,
      settings
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Salary calculations
  const effectiveDays = summary.effectiveWorkDays ?? (summary.workDays + (summary.halfDays || 0) * 0.5);
  const baseSalary = effectiveDays * (settings.dailyWage || 0);
  const overtimeSalary = summary.overtimeHours * (settings.hourlyOvertimeRate || 0);
  const totalEstimatedEarnings = baseSalary + overtimeSalary;

  // Attendance rate (work days vs 30/31 days or working days)
  const attendancePercentage = summary.totalDays > 0
    ? Math.round((effectiveDays / (summary.totalDays - 8)) * 100) // approx excluding weekends
    : 0;
  const boundedRate = Math.min(100, Math.max(0, attendancePercentage));

  return (
    <div
      id="report-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="report-modal-content"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1 text-xs sm:text-sm font-bold rounded-lg transition ${
                activeTab === 'summary'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly Report
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 text-xs sm:text-sm font-bold rounded-lg transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Dashboard & Earnings
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition cursor-pointer"
            aria-label="Close Report"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'summary' ? (
            /* Match Screenshot 2: Clean alert dialog styling */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900 border-b pb-2">
                <span className="text-xl">📊</span>
                <span>{summary.monthName} {summary.year} Report:</span>
              </div>

              {/* Exact rows from Screenshot 2 */}
              <div className="space-y-2.5 text-sm sm:text-base font-medium text-gray-800 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between py-1 border-b border-gray-200/70">
                  <span className="flex items-center gap-2">
                    <span>⏱️</span> Total Overtime:
                  </span>
                  <span className="font-bold text-emerald-700">{summary.overtimeHours} Hours</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-200/70">
                  <span className="flex items-center gap-2">
                    <span>💼</span> Work Days:
                  </span>
                  <span className="font-bold text-blue-700">{summary.workDays} Days</span>
                </div>

                {summary.halfDays > 0 && (
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/70">
                    <span className="flex items-center gap-2">
                      <span>🌗</span> Half Duty:
                    </span>
                    <span className="font-bold text-indigo-700">
                      {summary.halfDays} Days ({summary.halfDays * 0.5} Work Days)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1 border-b border-gray-200/70">
                  <span className="flex items-center gap-2">
                    <span>🏖️</span> Vacation:
                  </span>
                  <span className="font-bold text-teal-700">{summary.vacationDays} Days</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-200/70">
                  <span className="flex items-center gap-2">
                    <span>💊</span> Sick:
                  </span>
                  <span className="font-bold text-red-600">{summary.sickDays} Days</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-200/70">
                  <span className="flex items-center gap-2">
                    <span>🚨</span> Emergency:
                  </span>
                  <span className="font-bold text-amber-600">{summary.emergencyDays} Days</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-2">
                    <span>🎉</span> Holiday:
                  </span>
                  <span className="font-bold text-orange-600">{summary.holidayDays} Days</span>
                </div>
              </div>

              {/* Earnings Quick Peek if configured */}
              {totalEstimatedEarnings > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-800 font-semibold block">Total Estimated Earnings</span>
                    <span className="text-lg font-black text-emerald-950">
                      {settings.currency} {totalEstimatedEarnings.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs bg-emerald-200/80 text-emerald-900 px-2 py-1 rounded-md font-bold">
                    {effectiveDays}d Work + {summary.overtimeHours}h OT
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Dashboard & Analytics View */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <span className="text-xs text-blue-800 font-medium block">Total Recorded Days</span>
                  <span className="text-2xl font-black text-blue-950">{summary.totalRecordedDays}</span>
                  <span className="text-[11px] text-blue-700 block mt-0.5">of {summary.totalDays} Days in Month</span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-xs text-emerald-800 font-medium block">Attendance Score</span>
                  <span className="text-2xl font-black text-emerald-950">{boundedRate}%</span>
                  <span className="text-[11px] text-emerald-700 block mt-0.5">Estimated Working Days</span>
                </div>
              </div>

              {/* Salary Breakdown Card */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Salary & Overtime Pay
                  </span>
                  <span className="text-xs text-gray-500">
                    Daily: {settings.currency}{settings.dailyWage} | OT: {settings.currency}{settings.hourlyOvertimeRate}/h
                  </span>
                </div>

                <div className="text-xs space-y-1.5 pt-1 text-gray-700">
                  <div className="flex justify-between">
                    <span>
                      Base Work Pay ({effectiveDays} days × {settings.currency}{settings.dailyWage})
                      {summary.halfDays > 0 ? ` [${summary.workDays} Full + ${summary.halfDays} Half]` : ''}:
                    </span>
                    <span className="font-semibold">{settings.currency} {baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime Pay ({summary.overtimeHours} hrs × {settings.currency}{settings.hourlyOvertimeRate}):</span>
                    <span className="font-semibold text-emerald-700">{settings.currency} {overtimeSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 font-bold text-sm text-gray-900">
                    <span>Net Total:</span>
                    <span className="text-emerald-700 text-base">{settings.currency} {totalEstimatedEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown Bars */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                  Category Distribution
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span className="font-semibold text-blue-700">💼 Work ({summary.workDays} days)</span>
                      <span>{Math.round((summary.workDays / summary.totalDays) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(summary.workDays / summary.totalDays) * 100}%` }}
                      />
                    </div>
                  </div>

                  {summary.halfDays > 0 && (
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="font-semibold text-indigo-700">🌗 Half Duty ({summary.halfDays} days)</span>
                        <span>{Math.round((summary.halfDays / summary.totalDays) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${(summary.halfDays / summary.totalDays) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span className="font-semibold text-emerald-700">⏱️ Overtime Days ({summary.daysWithOvertime} days)</span>
                      <span>{Math.round((summary.daysWithOvertime / summary.totalDays) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(summary.daysWithOvertime / summary.totalDays) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span className="font-semibold text-orange-600">🎉 Holidays & Leaves ({summary.holidayDays + summary.vacationDays + summary.sickDays} days)</span>
                      <span>{Math.round(((summary.holidayDays + summary.vacationDays + summary.sickDays) / summary.totalDays) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${((summary.holidayDays + summary.vacationDays + summary.sickDays) / summary.totalDays) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Export, Copy, Print */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2">
          {/* Download CSV Button */}
          <button
            id="btn-export-csv"
            onClick={handleDownloadCSV}
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {/* Copy Report Button */}
          <button
            id="btn-copy-report"
            onClick={handleCopyText}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm shadow-xs transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          {/* Print Button */}
          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition cursor-pointer"
            title="Print Attendance Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
