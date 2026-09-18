import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Camera, 
  FileSpreadsheet, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Database,
  Sliders,
  HelpCircle,
  Smartphone,
  Check
} from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  onOpenFacePunch?: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenFacePunch
}) => {
  const [activeTopic, setActiveTopic] = useState<'basics' | 'facepunch' | 'reports' | 'overtime'>('basics');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="modal-how-to-use"
        className="bg-[#1e2229] text-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#343a46]"
      >
        {/* Header */}
        <div className="bg-[#181a20] px-5 py-4 flex items-center justify-between border-b border-[#2d323c] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-bold text-gray-950 shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-amber-400 tracking-tight leading-tight">
                How to Use Attendance Plus
              </h2>
              <p className="text-xs text-gray-400">
                उपयोग कैसे करें • Complete Guide & Tips
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Topic Tabs */}
        <div className="flex border-b border-[#2d323c] bg-[#222730] text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTopic('basics')}
            className={`flex-1 min-w-[90px] py-2.5 px-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTopic === 'basics'
                ? 'border-amber-400 text-amber-300 bg-[#29303c]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => setActiveTopic('facepunch')}
            className={`flex-1 min-w-[90px] py-2.5 px-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTopic === 'facepunch'
                ? 'border-purple-400 text-purple-300 bg-[#29303c]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Face Punch</span>
          </button>
          <button
            onClick={() => setActiveTopic('reports')}
            className={`flex-1 min-w-[90px] py-2.5 px-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTopic === 'reports'
                ? 'border-emerald-400 text-emerald-300 bg-[#29303c]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>HR Excel</span>
          </button>
          <button
            onClick={() => setActiveTopic('overtime')}
            className={`flex-1 min-w-[90px] py-2.5 px-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTopic === 'overtime'
                ? 'border-blue-400 text-blue-300 bg-[#29303c]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Overtime</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm leading-relaxed text-gray-200">
          {/* TAB 1: BASICS */}
          {activeTopic === 'basics' && (
            <div className="space-y-4">
              <div className="bg-[#262c37] p-4 rounded-xl border border-[#373f4e]">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" /> 1. Duty / Attendance Kaise Lagayein?
                </h3>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Tool Select Karein:</strong> Neeche diye gaye toolbar se <strong>Work, Half Duty, Overtime, Holiday, Sick</strong> me se koi status chunein.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Date Par Tap Karein:</strong> Calendar mein jis taareekh ki attendance lagani hai, uspe tap karein. Single tap se seedhe status apply ho jayega.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Long Press / Detail:</strong> Kisi bhi date par 1 second hold karne se Time in/out aur Note likhne ka detail window khul jata hai.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#262c37] p-4 rounded-xl border border-[#373f4e]">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2 mb-2">
                  <Sliders className="w-4 h-4" /> 2. Month & Year Badle
                </h3>
                <p className="text-xs text-gray-300">
                  Upar <strong>Left/Right arrow (&lt; &gt;)</strong> se maheene badal sakte hain, aur upar <strong>[2026 ▾]</strong> par click karke kisi bhi saal ka calendar khol sakte hain.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: FACE PUNCH */}
          {activeTopic === 'facepunch' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-950/70 to-[#262c37] p-4 rounded-xl border border-purple-500/40">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Face Punch Duty Verification
                  </h3>
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-400/30">
                    Optional Feature
                  </span>
                </div>
                <p className="text-xs text-gray-300 mb-3">
                  Aap camera se selfie lekar time-stamp ke saath verified duty laga sakte hain, bilkul office biometric machine ki tarah!
                </p>

                <div className="space-y-2 text-xs text-gray-300 bg-black/40 p-3 rounded-lg border border-purple-800/30">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                    <span>Main screen par <strong>[ 🤳 Face Punch ]</strong> button dabayein.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                    <span>Apna chehra camera ke frame mein rakhein aur <strong>Work / Half / Overtime</strong> chunein.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                    <span><strong>"Punch Duty Now"</strong> par click karein. Aaj ki attendance exact time ke saath verify ho jayegi!</span>
                  </div>
                </div>

                {onOpenFacePunch && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFacePunch();
                    }}
                    className="mt-3 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Try Face Punch Now</span>
                  </button>
                )}
              </div>

              <div className="bg-[#262c37] p-3.5 rounded-xl border border-[#373f4e] text-xs text-gray-300">
                <span className="font-bold text-amber-300 block mb-1">💡 Note on Privacy & Control:</span>
                Yeh feature bilkul <strong>Optional</strong> hai. Agar aapko camera use nahi karna, toh aap Settings mein jakar ise band bhi kar sakte hain ya normal calendar tap se duty laga sakte hain. Photo sirf aapke device par rehti hai.
              </div>
            </div>
          )}

          {/* TAB 3: HR EXCEL REPORT */}
          {activeTopic === 'reports' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-950/70 to-[#262c37] p-4 rounded-xl border border-emerald-500/40">
                <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-4 h-4" /> Corporate HR Excel & CSV Export
                </h3>
                <p className="text-xs text-gray-300 mb-3">
                  Company ke HR department ya Contractor ko bhejne ke liye official Muster Roll sheet download karein.
                </p>

                <div className="space-y-2 text-xs text-gray-300">
                  <div className="p-2.5 bg-black/30 rounded-lg border border-emerald-800/30">
                    <strong className="text-emerald-300 block mb-0.5">📑 1. Download HR Excel (.xls):</strong>
                    Formatted styling, Company Name, Employee ID, Present/Half/OT summary table, aur HR Signature block ke saath Excel file save hoti hai.
                  </div>

                  <div className="p-2.5 bg-black/30 rounded-lg border border-emerald-800/30">
                    <strong className="text-emerald-300 block mb-0.5">📊 2. Download HR CSV:</strong>
                    Standard UTF-8 CSV jo kisi bhi computer, WhatsApp ya payroll software mein import ho sakti hai.
                  </div>

                  <div className="p-2.5 bg-black/30 rounded-lg border border-emerald-800/30">
                    <strong className="text-emerald-300 block mb-0.5">🖨️ 3. Print / Save PDF:</strong>
                    Direct A4 size document print karein ya PDF bana kar WhatsApp par share karein.
                  </div>
                </div>
              </div>

              <div className="bg-[#262c37] p-3.5 rounded-xl border border-[#373f4e] text-xs text-gray-300">
                <span className="font-bold text-amber-300 block mb-1">Company & Rate Settings:</span>
                Apna Name, Company Name, Department, Shift Hours aur Daily/Hourly Rate dalne ke liye <strong>Settings (⚙️)</strong> mein jayein taaki report par aapka naam aur sahi hisaab aaye!
              </div>
            </div>
          )}

          {/* TAB 4: OVERTIME */}
          {activeTopic === 'overtime' && (
            <div className="space-y-4">
              <div className="bg-[#262c37] p-4 rounded-xl border border-[#373f4e]">
                <h3 className="font-bold text-blue-300 text-sm flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" /> Overtime Hours & Salary Calculation
                </h3>
                <p className="text-xs text-gray-300 mb-3">
                  App automatically aapke overtime ghante jodkar mahine ki extra kamai (Overtime Pay) calculate karti hai:
                </p>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Calendar date par tap karke <strong>Overtime</strong> select karein.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>1 se 12 hours tak jitna bhi OT kiya ho select karein.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Upar <strong>"Overtime: XX Hours"</strong> badge par click karke poora hisaab dekh sakte hain.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#262c37] p-4 rounded-xl border border-[#373f4e]">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4" /> Offline & Backup
                </h3>
                <p className="text-xs text-gray-300">
                  Yeh app 100% bina internet ke offline chalti hai. Data safe rakhne ke liye Settings &gt; Backup mein jakar <strong>"Export Backup File"</strong> save kar sakte hain.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#181a20] border-t border-[#2d323c] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Attendance Plus v1.0 • Easy & Smart</span>
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-xs"
          >
            Got It (समझ गया)
          </button>
        </div>
      </div>
    </div>
  );
};
