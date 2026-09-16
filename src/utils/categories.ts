import { AttendanceStatus, CategoryDef } from '../types';

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'work',
    name: 'Work',
    emoji: '💼',
    bgColor: 'bg-[#93c5fd] hover:bg-[#60a5fa]',
    textColor: 'text-gray-900',
    borderColor: 'border-blue-400',
    activeRing: 'ring-3 ring-blue-700 shadow-md',
  },
  {
    id: 'halfday',
    name: 'Half Duty',
    emoji: '🌗',
    bgColor: 'bg-[#c7d2fe] hover:bg-[#a5b4fc]',
    textColor: 'text-indigo-950',
    borderColor: 'border-indigo-400',
    activeRing: 'ring-3 ring-indigo-700 shadow-md',
  },
  {
    id: 'overtime',
    name: 'Overtime',
    emoji: '⏱️',
    bgColor: 'bg-[#bbf7d0] hover:bg-[#86efac]',
    textColor: 'text-gray-900',
    borderColor: 'border-emerald-400',
    activeRing: 'ring-3 ring-emerald-700 shadow-md',
  },
  {
    id: 'holiday',
    name: 'Holiday',
    emoji: '🎉',
    bgColor: 'bg-[#fed7aa] hover:bg-[#fdba74]',
    textColor: 'text-gray-900',
    borderColor: 'border-orange-400',
    activeRing: 'ring-3 ring-orange-700 shadow-md',
  },
  {
    id: 'vacation',
    name: 'Vacation',
    emoji: '🏖️',
    bgColor: 'bg-[#99f6e4] hover:bg-[#5eead4]',
    textColor: 'text-gray-900',
    borderColor: 'border-teal-400',
    activeRing: 'ring-3 ring-teal-700 shadow-md',
  },
  {
    id: 'sick',
    name: 'Sick',
    emoji: '💊',
    bgColor: 'bg-[#fca5a5] hover:bg-[#f87171]',
    textColor: 'text-gray-900',
    borderColor: 'border-red-400',
    activeRing: 'ring-3 ring-red-700 shadow-md',
  },
  {
    id: 'emergency',
    name: 'Emergency',
    emoji: '🚨',
    bgColor: 'bg-[#fef08a] hover:bg-[#fde047]',
    textColor: 'text-gray-900',
    borderColor: 'border-amber-400',
    activeRing: 'ring-3 ring-amber-700 shadow-md',
  },
];

export function getCategoryDef(status: AttendanceStatus): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === status);
}

export function getCellVisuals(
  status: AttendanceStatus,
  hasOvertime: boolean,
  isWeekend: boolean,
  isOtherMonth?: boolean
): {
  bgClass: string;
  textClass: string;
} {
  // If halfday is selected, give it distinct prominent styling
  if (status === 'halfday') {
    return {
      bgClass: isOtherMonth ? 'bg-[#6366f1]/60' : 'bg-[#6366f1]',
      textClass: 'text-white font-bold',
    };
  }

  // If overtime is present
  if (hasOvertime) {
    return {
      bgClass: isOtherMonth ? 'bg-[#4ade80]/60' : 'bg-[#4ade80]',
      textClass: 'text-gray-900 font-bold',
    };
  }

  switch (status) {
    case 'work':
      return {
        bgClass: isOtherMonth ? 'bg-[#2563eb]/60' : 'bg-[#2563eb]',
        textClass: 'text-white font-bold',
      };
    case 'vacation':
      return {
        bgClass: isOtherMonth ? 'bg-[#2dd4bf]/60' : 'bg-[#2dd4bf]',
        textClass: 'text-gray-950 font-bold',
      };
    case 'sick':
      return {
        bgClass: isOtherMonth ? 'bg-[#f87171]/60' : 'bg-[#f87171]',
        textClass: 'text-white font-bold',
      };
    case 'emergency':
      return {
        bgClass: isOtherMonth ? 'bg-[#facc15]/60' : 'bg-[#facc15]',
        textClass: 'text-gray-950 font-bold',
      };
    case 'holiday':
      return {
        bgClass: isOtherMonth ? 'bg-[#fb923c]/60' : 'bg-[#fb923c]',
        textClass: 'text-gray-950 font-bold',
      };
    default:
      if (isOtherMonth) {
        return {
          bgClass: 'bg-[#fefce8]/60 hover:bg-[#fef9c3]',
          textClass: isWeekend ? 'text-rose-400 font-medium' : 'text-gray-400 font-medium',
        };
      }
      if (isWeekend) {
        return {
          bgClass: 'bg-[#dbeafe]/70',
          textClass: 'text-gray-800 font-medium',
        };
      }
      return {
        bgClass: 'bg-transparent',
        textClass: 'text-gray-900 font-semibold',
      };
  }
}
