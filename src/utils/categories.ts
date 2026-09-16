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
    id: 'overtime',
    name: 'Overtime',
    emoji: '⏱️',
    bgColor: 'bg-[#bbf7d0] hover:bg-[#86efac]',
    textColor: 'text-gray-900',
    borderColor: 'border-emerald-400',
    activeRing: 'ring-3 ring-emerald-700 shadow-md',
  },
];

export function getCategoryDef(status: AttendanceStatus): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === status);
}

export function getCellVisuals(status: AttendanceStatus, hasOvertime: boolean, isWeekend: boolean): {
  bgClass: string;
  textClass: string;
} {
  // If overtime is present and no other prominent status or status is work/overtime
  if (hasOvertime) {
    return {
      bgClass: 'bg-[#4ade80]',
      textClass: 'text-gray-900 font-bold',
    };
  }

  switch (status) {
    case 'work':
      return {
        bgClass: 'bg-[#2563eb]',
        textClass: 'text-white font-bold',
      };
    case 'vacation':
      return {
        bgClass: 'bg-[#2dd4bf]',
        textClass: 'text-gray-950 font-bold',
      };
    case 'sick':
      return {
        bgClass: 'bg-[#f87171]',
        textClass: 'text-white font-bold',
      };
    case 'emergency':
      return {
        bgClass: 'bg-[#facc15]',
        textClass: 'text-gray-950 font-bold',
      };
    case 'holiday':
      return {
        bgClass: 'bg-[#fb923c]',
        textClass: 'text-gray-950 font-bold',
      };
    default:
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
