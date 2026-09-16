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
    <div id="category-toolbar-section" className="w-full max-w-md px-3 pt-3 pb-4">
      {/* 2x3 Grid matching Screenshot 1 & 4 */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = activeTool === cat.id;

          return (
            <button
              key={cat.id}
              id={`tool-btn-${cat.id}`}
              type="button"
              onClick={() => onSelectTool(cat.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all select-none shadow-sm cursor-pointer ${
                cat.bgColor
              } ${cat.textColor} ${
                isSelected
                  ? 'border-2 border-gray-950 ring-2 ring-black/30 scale-[1.03] shadow-md'
                  : 'border border-gray-300/60 hover:brightness-95'
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
            Selected Tool: <strong className="text-gray-900 capitalize">{activeTool}</strong> — Tap any calendar date to apply.
          </span>
        ) : (
          <span>Select a category above, then tap any calendar date.</span>
        )}
      </div>
    </div>
  );
};
