import React, { useState } from 'react';
import { X, Clock, Plus, Minus, Check, Trash2 } from 'lucide-react';

interface OvertimeModalProps {
  isOpen: boolean;
  dateStr: string;
  initialHours: number;
  onSave: (hours: number) => void;
  onClear: () => void;
  onClose: () => void;
}

// Format hours helper (e.g. 0.5 -> "30m (0.5h)", 1.5 -> "1h 30m", 2 -> "2 Hours")
export function formatOvertimeDisplay(h: number): string {
  if (h <= 0) return '0 Hours';
  const wholeHours = Math.floor(h);
  const minutes = Math.round((h - wholeHours) * 60);

  if (wholeHours === 0 && minutes > 0) {
    return `${minutes} Min (${h}h)`;
  }
  if (minutes > 0) {
    return `${wholeHours}h ${minutes}m`;
  }
  return `${wholeHours} Hours`;
}

export const OvertimeModal: React.FC<OvertimeModalProps> = ({
  isOpen,
  dateStr,
  initialHours,
  onSave,
  onClear,
  onClose,
}) => {
  const [hours, setHours] = useState<number>(initialHours > 0 ? initialHours : 2);

  if (!isOpen) return null;

  // Preset overtime options including 30 minutes (0.5h), 1h, 1.5h, 2h, 2.5h, 3h, 4h, 6h, 8h
  const quickPresets = [0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8];

  const handleAdd30Min = () => setHours((prev) => Math.min(24, Math.round((prev + 0.5) * 10) / 10));
  const handleSub30Min = () => setHours((prev) => Math.max(0, Math.round((prev - 0.5) * 10) / 10));
  const handleIncrement1h = () => setHours((prev) => Math.min(24, prev + 1));
  const handleDecrement1h = () => setHours((prev) => Math.max(0, prev - 1));

  return (
    <div
      id="overtime-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="overtime-modal-content"
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
            <Clock className="w-5 h-5 text-emerald-700" />
            <span>Set Overtime (OT)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-center">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Date: <span className="text-gray-900 font-bold">{dateStr}</span>
          </div>

          {/* Main Large Display */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl py-2.5 px-3">
            <div className="text-3xl sm:text-4xl font-black text-emerald-800">
              {formatOvertimeDisplay(hours)}
            </div>
            <div className="text-xs font-semibold text-emerald-700 mt-0.5">
              {hours === 0.5 ? 'Half Hour Overtime' : `${hours} Total OT Hours`}
            </div>
          </div>

          {/* Steppers: +30 Min / -30 Min and +1 Hour / -1 Hour */}
          <div className="space-y-2">
            {/* 30 Minutes buttons */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                id="btn-sub-30m"
                onClick={handleSub30Min}
                className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-lg text-xs font-bold text-gray-800 flex items-center justify-center gap-1 transition cursor-pointer border border-gray-300"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>-30 Min</span>
              </button>

              <button
                type="button"
                id="btn-add-30m"
                onClick={handleAdd30Min}
                className="flex-1 py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 active:scale-95 rounded-lg text-xs font-bold text-emerald-900 flex items-center justify-center gap-1 transition cursor-pointer border border-emerald-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+30 Min (0.5h)</span>
              </button>
            </div>

            {/* 1 Hour Stepper */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                id="btn-sub-1h"
                onClick={handleDecrement1h}
                className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-lg text-xs font-bold text-gray-800 flex items-center justify-center gap-1 transition cursor-pointer border border-gray-300"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>-1 Hour</span>
              </button>

              <button
                type="button"
                id="btn-add-1h"
                onClick={handleIncrement1h}
                className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-lg text-xs font-bold text-gray-800 flex items-center justify-center gap-1 transition cursor-pointer border border-gray-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+1 Hour</span>
              </button>
            </div>
          </div>

          {/* Quick Presets including 30m, 1h, 1.5h, 2h, 2.5h, 3h, 4h, etc. */}
          <div>
            <div className="text-[11px] font-semibold text-gray-400 mb-1.5 uppercase">
              Quick Select (Presets)
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {quickPresets.map((h) => (
                <button
                  key={h}
                  type="button"
                  id={`btn-preset-${h}`}
                  onClick={() => setHours(h)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    hours === h
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : h === 0.5 || h === 1.5 || h === 2.5
                      ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300 font-extrabold'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {h === 0.5 ? '30m' : h % 1 !== 0 ? `${h}h` : `${h}h`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2">
          {initialHours > 0 && (
            <button
              onClick={() => {
                onClear();
                onClose();
              }}
              className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer border border-rose-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={() => {
              onSave(hours);
              onClose();
            }}
            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save {formatOvertimeDisplay(hours)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
