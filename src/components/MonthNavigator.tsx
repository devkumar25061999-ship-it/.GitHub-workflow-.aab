import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthNavigatorProps {
  monthName: string;
  workDays: number;
  overtimeHours: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  monthName,
  workDays,
  overtimeHours,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <div id="month-navigation-section" className="w-full flex flex-col items-center gap-2.5 pt-3 pb-2 px-3">
      {/* Month Bar: Dark rounded container with circular arrows and golden month text */}
      <div className="w-full max-w-md bg-[#25282d] text-[#facc15] rounded-xl px-3 py-2 flex items-center justify-between shadow-inner border border-gray-800">
        <button
          id="btn-prev-month"
          onClick={onPrevMonth}
          className="w-9 h-9 rounded-full bg-[#353942] hover:bg-[#434854] active:scale-95 flex items-center justify-center text-[#facc15] transition cursor-pointer"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5 fill-current stroke-[2.5]" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-[#facc15] select-none">
          {monthName}
        </h2>

        <button
          id="btn-next-month"
          onClick={onNextMonth}
          className="w-9 h-9 rounded-full bg-[#353942] hover:bg-[#434854] active:scale-95 flex items-center justify-center text-[#facc15] transition cursor-pointer"
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5 fill-current stroke-[2.5]" />
        </button>
      </div>

      {/* Summary Cards: Work: X Days | Overtime: Y Hours matching screenshot */}
      <div className="w-full max-w-md grid grid-cols-2 gap-3">
        {/* Work card */}
        <div
          id="card-work-summary"
          className="bg-[#fef9c3] border border-amber-300/80 rounded-lg py-1.5 px-3 text-center shadow-xs flex items-center justify-center"
        >
          <span className="text-gray-900 font-bold text-sm sm:text-base">
            Work: <span className="text-gray-950 font-black">{workDays} Days</span>
          </span>
        </div>

        {/* Overtime card with green bold hours */}
        <div
          id="card-overtime-summary"
          className="bg-[#fef9c3] border border-amber-300/80 rounded-lg py-1.5 px-3 text-center shadow-xs flex items-center justify-center"
        >
          <span className="text-gray-900 font-bold text-sm sm:text-base">
            Overtime:{' '}
            <span className="text-emerald-700 font-black">
              {overtimeHours % 1 !== 0 ? `${overtimeHours}h` : `${overtimeHours} Hours`}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
