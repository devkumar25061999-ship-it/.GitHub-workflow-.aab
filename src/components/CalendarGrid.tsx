import React from 'react';
import { FileText } from 'lucide-react';
import { CalendarCell, WEEKDAY_NAMES } from '../utils/calendar';
import { AttendanceDatabase, AttendanceStatus } from '../types';
import { getCellVisuals } from '../utils/categories';

interface CalendarGridProps {
  cells: CalendarCell[];
  records: AttendanceDatabase;
  onCellClick: (dateString: string) => void;
  onCellLongPress: (dateString: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  cells,
  records,
  onCellClick,
  onCellLongPress,
}) => {
  return (
    <div id="calendar-wrapper" className="w-full max-w-md px-3">
      <div className="w-full border-2 border-gray-800 bg-[#fef9c3] shadow-md overflow-hidden rounded-sm">
        {/* Weekday Name Headers */}
        <div className="grid grid-cols-7 border-b-2 border-gray-800 bg-[#fef08a]">
          {WEEKDAY_NAMES.map((name, index) => {
            const isWeekend = index === 0 || index === 6;
            return (
              <div
                key={name}
                className={`py-2 text-center text-xs sm:text-sm font-extrabold tracking-wide border-r border-gray-700 last:border-r-0 ${
                  isWeekend ? 'text-red-700 font-black' : 'text-gray-900'
                }`}
              >
                {name}
              </div>
            );
          })}
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            const dateStr = cell.dateString;
            const record = records[dateStr];
            const status: AttendanceStatus = record?.status || 'none';
            const overtimeHours = record?.overtimeHours || 0;
            const hasOvertime = overtimeHours > 0;
            const isWeekend = !!cell.isWeekend;
            const hasNotes = typeof record?.notes === 'string' && record.notes.trim().length > 0;

            const { bgClass, textClass } = getCellVisuals(status, hasOvertime, isWeekend, cell.isOtherMonth);

            return (
              <button
                key={cell.id}
                type="button"
                id={`calendar-cell-${dateStr}`}
                onClick={() => onCellClick(dateStr)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onCellLongPress(dateStr);
                }}
                className={`aspect-square sm:aspect-4/3 flex flex-col items-center justify-center p-0.5 border-b border-r border-gray-500/70 transition-colors relative select-none cursor-pointer focus:outline-none active:brightness-90 ${bgClass}`}
                title={`${dateStr}: ${status.toUpperCase()} ${hasOvertime ? `(${overtimeHours}h OT)` : ''}${hasNotes ? ` • Note: ${record?.notes}` : ''}`}
              >
                {/* Date Number */}
                <span className={`text-base sm:text-lg leading-none ${textClass}`}>
                  {cell.dayNumber}
                </span>

                {/* Half Duty badge */}
                {status === 'halfday' && (
                  <div className="mt-0.5 px-1 py-0.2 bg-white text-indigo-950 font-black text-[9px] sm:text-[10px] rounded-xs shadow-xs leading-tight tracking-tight uppercase">
                    ½ Day
                  </div>
                )}

                {/* Overtime badge matching screenshot (e.g. 30m, 1h, 1.5h, 8h in dark pill) */}
                {hasOvertime && (
                  <div className="mt-0.5 px-1 sm:px-1.5 py-0.5 bg-[#166534] text-white font-extrabold text-[10px] sm:text-[11px] rounded-sm shadow-xs leading-tight">
                    {overtimeHours === 0.5 ? '30m' : `${overtimeHours}h`}
                  </div>
                )}

                {/* Note visual indicator icon for dates with non-empty notes */}
                {hasNotes && (
                  <span
                    id={`note-indicator-${dateStr}`}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-600/30 flex items-center justify-center"
                    title={`Note: ${record?.notes}`}
                  >
                    <FileText className="w-2.5 h-2.5 stroke-[2.5]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
