import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface YearPickerModalProps {
  isOpen: boolean;
  selectedYear: number;
  onSelectYear: (year: number) => void;
  onClose: () => void;
}

export const YearPickerModal: React.FC<YearPickerModalProps> = ({
  isOpen,
  selectedYear,
  onSelectYear,
  onClose,
}) => {
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  // Generate years range 2000 to 2060 as shown in screenshot title ("Work Calendar 2000-2060")
  const years: number[] = [];
  for (let y = 2000; y <= 2060; y++) {
    years.push(y);
  }

  useEffect(() => {
    if (isOpen && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="year-picker-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="year-picker-modal"
        className="w-full max-w-xs bg-[#fffaf5] rounded-3xl shadow-2xl border border-rose-100 overflow-hidden max-h-[78vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Select Year</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-rose-100 transition cursor-pointer"
            aria-label="Close Year Picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Year List with Radio circles matching Screenshot 3 */}
        <div className="overflow-y-auto divide-y divide-rose-100/60 p-1">
          {years.map((year) => {
            const isCurrent = year === selectedYear;

            return (
              <button
                key={year}
                ref={isCurrent ? selectedRef : null}
                type="button"
                onClick={() => {
                  onSelectYear(year);
                  onClose();
                }}
                className={`w-full py-3.5 px-6 flex items-center justify-between text-left transition cursor-pointer ${
                  isCurrent
                    ? 'bg-rose-100/60 text-gray-950 font-extrabold'
                    : 'hover:bg-rose-50/60 text-gray-800 font-semibold'
                }`}
              >
                <span className="text-xl tracking-wide">{year}</span>

                {/* Radio button matching screenshot 3 (circle with center dot if active) */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isCurrent
                      ? 'border-[#70243e] bg-[#fffaf5]'
                      : 'border-gray-500 bg-transparent'
                  }`}
                >
                  {isCurrent && (
                    <div className="w-3 h-3 rounded-full bg-[#70243e]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
