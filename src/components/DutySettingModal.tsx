import React, { useState, useEffect } from 'react';
import { X, Check, Clock, DollarSign, CalendarCheck2, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';
import { AppSettings } from '../types';

interface DutySettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  currentMonthName?: string;
  holidayDaysCount?: number;
  totalSundaysCount?: number;
}

export function DutySettingModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  currentMonthName = 'This Month',
  holidayDaysCount = 0,
  totalSundaysCount = 4,
}: DutySettingModalProps) {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formData);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  const isSundayOff = formData.sundayWeeklyOff !== false;
  const isPaidHolidays = formData.paidHolidays !== false;
  const isPaidSundays = formData.paidSundays === true;

  const dailyWage = formData.dailyWage || 0;
  const potentialHolidayEarning = isPaidHolidays ? holidayDaysCount * dailyWage : 0;
  const potentialSundayEarning = isPaidSundays ? totalSundaysCount * dailyWage : 0;

  return (
    <div
      id="duty-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="duty-settings-modal-content"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-amber-300">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight leading-tight">Duty Settings (ड्यूटी सेटिंग्स)</h2>
              <p className="text-[11px] text-blue-200 font-medium">Sunday off/on, Holiday salary & Shift rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-gray-800">
          {/* Section 1: Sunday Off ya On */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-gray-900 block">
                  1. Sunday: Off या Working? (रविवार नियम)
                </span>
                <span className="text-[11px] text-gray-500">
                  रविवार को सामान्य अवकाश रखना है या ड्यूटी चालू रहेगी?
                </span>
              </div>
            </div>

            {/* 2-Option selector */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                id="btn-sunday-off"
                onClick={() => setFormData({ ...formData, sundayWeeklyOff: true })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  isSundayOff
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span>🏖️ Sunday OFF (छुट्टी)</span>
              </button>

              <button
                type="button"
                id="btn-sunday-on"
                onClick={() => setFormData({ ...formData, sundayWeeklyOff: false })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  !isSundayOff
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span>💼 Sunday ON (ड्यूटी चालू)</span>
              </button>
            </div>

            {/* Sunday Paid toggle if Sunday is OFF */}
            {isSundayOff && (
              <div className="mt-2 pt-2 border-t border-gray-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">
                    Sunday Paid? (सवेतन रविवार)
                  </span>
                  <span className="text-[11px] text-gray-500">
                    क्या कंपनी रविवार की छुट्टी का भी वेतन देती है?
                  </span>
                </div>
                <button
                  type="button"
                  id="toggle-sunday-paid"
                  onClick={() => setFormData({ ...formData, paidSundays: !formData.paidSundays })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isPaidSundays ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isPaidSundays ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {isSundayOff && isPaidSundays && (
              <div className="text-[11px] bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                <span>✓ {totalSundaysCount} रविवार का पैसा जुड़ेगा:</span>
                <span className="font-bold">+{formData.currency || '₹'}{potentialSundayEarning.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Section 2: Holiday Pay (Hollyday ka paisa company deti hai use salary mein count karo) */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-emerald-950 block">
                    2. Holiday Pay (त्योहार / सरकारी छुट्टी का पैसा)
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-700 text-white rounded-full text-[9px] font-bold">
                    Salary Rule
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800 block mt-0.5">
                  कंपनी Holiday का पैसा देती है, इसे Salary में जोड़ें
                </span>
              </div>
              <button
                type="button"
                id="toggle-holiday-paid"
                onClick={() => setFormData({ ...formData, paidHolidays: !isPaidHolidays })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isPaidHolidays ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isPaidHolidays ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="text-[11px] text-emerald-900 bg-white/70 p-2 rounded-lg border border-emerald-200">
              {isPaidHolidays ? (
                <div className="flex items-center justify-between">
                  <span>
                    ✓ <strong>Holiday Pay Active:</strong> {currentMonthName} में {holidayDaysCount} Holiday का पैसा जुड़ेगा
                  </span>
                  <span className="font-extrabold text-emerald-700 ml-2">
                    +{formData.currency || '₹'}{potentialHolidayEarning.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">
                  ✗ Holiday Pay बंद है: केवल कार्य दिवस (Work Days) का पैसा गिना जाएगा।
                </span>
              )}
            </div>
          </div>

          {/* Section 3: Shift Timings & Hours */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2.5">
            <span className="text-xs font-black text-indigo-950 block">
              3. Shift Timings (ड्यूटी का समय व घंटे)
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Shift Start (ड्यूटी शुरू)
                </label>
                <input
                  type="time"
                  value={formData.defaultShiftIn || '09:00'}
                  onChange={(e) => setFormData({ ...formData, defaultShiftIn: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Shift End (ड्यूटी समाप्त)
                </label>
                <input
                  type="time"
                  value={formData.defaultShiftOut || '18:00'}
                  onChange={(e) => setFormData({ ...formData, defaultShiftOut: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Duty Duration (ड्यूटी घंटे)
                </label>
                <select
                  value={formData.shiftHours || 8}
                  onChange={(e) => setFormData({ ...formData, shiftHours: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={8}>8 Hours (8 घंटे Shift)</option>
                  <option value={9}>9 Hours (9 घंटे Shift)</option>
                  <option value={10}>10 Hours (10 घंटे Shift)</option>
                  <option value={12}>12 Hours (12 घंटे Shift)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Paid Sick Leave?
                </label>
                <select
                  value={formData.paidSickLeave ? 'yes' : 'no'}
                  onChange={(e) => setFormData({ ...formData, paidSickLeave: e.target.value === 'yes' })}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="no">No (बीमारी का unpaid)</option>
                  <option value="yes">Yes (सवेतन Sick Leave)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Daily Wage & Overtime Rate */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
            <span className="text-xs font-black text-amber-950 block">
              4. Wage & Overtime Rate (वेतन और ओवरटाइम दर)
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Daily Wage (रोजाना वेतन)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-gray-500">
                    {formData.currency || '₹'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formData.dailyWage || 0}
                    onChange={(e) => setFormData({ ...formData, dailyWage: Number(e.target.value) })}
                    className="w-full pl-6 border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-bold bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  OT Rate / Hr (ओवरटाइम प्रति घंटा)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-gray-500">
                    {formData.currency || '₹'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formData.hourlyOvertimeRate || 0}
                    onChange={(e) => setFormData({ ...formData, hourlyOvertimeRate: Number(e.target.value) })}
                    className="w-full pl-6 border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-bold bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-save-duty-settings"
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
          >
            {savedToast ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{savedToast ? 'Saved! (सुरक्षित हो गया)' : 'Save Duty Settings (सेव करें)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
