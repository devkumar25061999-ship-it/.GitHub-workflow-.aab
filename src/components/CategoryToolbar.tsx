import React from 'react';
import { CATEGORIES } from '../utils/categories';
import { AttendanceStatus } from '../types';

interface CategoryToolbarProps {
  activeTool: AttendanceStatus | null;
  onSelectTool: (status: AttendanceStatus) => void;
}

export const CategoryToolbar: React.FC<CategoryToolbarProps> = ({
  activeTool,
  onSelectTool,
}) => {
  return (
    <div id="category-toolbar-section" className="w-full max-w-md px-3 pt-2.5 pb-3">
      {/* Primary Work & Duties Row (4 cols: Work, Half Duty, Overtime, Holiday) */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-2">
        {CATEGORIES.slice(0, 4).map((cat) => {
          const isSelected = activeTool === cat.id;

          return (
            <button
              key={cat.id}
              id={`tool-btn-${cat.id}`}
              type="button"
              onClick={() => onSelectTool(cat.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 px-1 rounded-xl font-bold text-[11px] sm:text-xs tracking-tight transition-all select-none shadow-xs cursor-pointer ${
                cat.bgColor
              } ${cat.textColor} ${
                isSelected
                  ? 'border-2 border-gray-950 ring-2 ring-black/30 scale-[1.03] shadow-md'
                  : 'border border-gray-300/70 hover:brightness-95'
              }`}
            >
              <span className="text-base sm:text-lg leading-none">{cat.emoji}</span>
              <span className="truncate">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Leaves & Emergencies Row (3 cols: Vacation, Sick, Emergency) */}
      <div className="grid grid-cols-3 gap-2">
        {CATEGORIES.slice(4).map((cat) => {
          const isSelected = activeTool === cat.id;

          return (
            <button
              key={cat.id}
              id={`tool-btn-${cat.id}`}
              type="button"
              onClick={() => onSelectTool(cat.id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all select-none shadow-xs cursor-pointer ${
                cat.bgColor
              } ${cat.textColor} ${
                isSelected
                  ? 'border-2 border-gray-950 ring-2 ring-black/30 scale-[1.03] shadow-md'
                  : 'border border-gray-300/70 hover:brightness-95'
              }`}
            >
              <span className="text-base sm:text-lg leading-none">{cat.emoji}</span>
              <span className="truncate">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active tool hint */}
      <div className="mt-2 text-center text-[11px] text-gray-600 font-medium">
        {activeTool ? (
          <span>
            Selected Tool: <strong className="text-gray-900 capitalize">{CATEGORIES.find((c) => c.id === activeTool)?.name || activeTool}</strong> — Tap any calendar date to apply.
          </span>
        ) : (
          <span>Select a category above, then tap any calendar date.</span>
        )}
      </div>
    </div>
  );
};
