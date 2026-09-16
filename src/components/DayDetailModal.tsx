import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, Trash2, Check } from 'lucide-react';
import { DayRecord, AttendanceStatus } from '../types';
import { CATEGORIES } from '../utils/categories';

interface DayDetailModalProps {
  isOpen: boolean;
  dateStr: string;
  record?: DayRecord;
  onSave: (record: DayRecord) => void;
  onDelete: (dateStr: string) => void;
  onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  dateStr,
  record,
  onSave,
  onDelete,
  onClose,
}) => {
  const [status, setStatus] = useState<AttendanceStatus>(record?.status || 'work');
  const [overtimeHours, setOvertimeHours] = useState<number>(record?.overtimeHours || 0);
  const [notes, setNotes] = useState<string>(record?.notes || '');

  useEffect(() => {
    if (record) {
      setStatus(record.status || 'work');
      setOvertimeHours(record.overtimeHours || 0);
      setNotes(record.notes || '');
    } else {
      setStatus('work');
      setOvertimeHours(0);
      setNotes('');
    }
  }, [record, dateStr]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      date: dateStr,
      status,
      overtimeHours,
      notes: notes.trim(),
      updatedAt: Date.now(),
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(dateStr);
    onClose();
  };

  return (
    <div
      id="day-detail-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="day-detail-content"
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Day Details: {dateStr}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status selection */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wide">
              Attendance Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setStatus(cat.id)}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                    cat.bgColor
                  } ${cat.textColor} ${
                    status === cat.id
                      ? 'border-2 border-black ring-2 ring-black/20 shadow-xs'
                      : 'border border-gray-300/80 hover:brightness-95'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overtime selector */}
          <div>
            <label className="text-xs font-bold text-gray-700 flex items-center justify-between mb-1.5 uppercase tracking-wide">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Overtime Hours
              </span>
              <span className="text-emerald-700 font-extrabold text-sm">
                {overtimeHours === 0.5
                  ? '30 Min (0.5h)'
                  : overtimeHours % 1 !== 0
                  ? `${Math.floor(overtimeHours)}h 30m (${overtimeHours}h)`
                  : `${overtimeHours} Hours`}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="16"
                step="0.5"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {[0, 0.5, 1, 1.5, 2, 3, 4, 6, 8].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setOvertimeHours(h)}
                  className={`px-2 py-1 rounded-md text-xs font-bold shrink-0 transition ${
                    overtimeHours === h
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : h === 0.5 || h === 1.5
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {h === 0 ? '0h' : h === 0.5 ? '30m' : `${h}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes field */}
          <div>
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1 mb-1.5 uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5 text-gray-600" />
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Night shift, Site inspection, Extra work"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2">
          {record && (
            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            <span>Save Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
