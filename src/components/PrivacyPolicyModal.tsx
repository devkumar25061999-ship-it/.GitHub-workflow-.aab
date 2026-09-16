import React from 'react';
import { X, ShieldCheck, Lock, ExternalLink, Mail, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="privacy-policy-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold">Privacy Policy & Compliance</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {/* Badge & Quick Summary */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs uppercase tracking-wide block">
                Google Play Console & AdMob Compliant
              </span>
              <span className="text-xs text-emerald-800">
                Attendance Plus operates on an offline-first privacy model. Your attendance records are stored locally on your device.
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              1. Information Collection & Storage
            </h4>
            <p className="text-xs text-gray-600">
              The application stores daily attendance statuses (Work, Vacation, Sick, Emergency, Holiday), overtime hours, and custom calculation preferences (daily wage & overtime rates). This data remains strictly stored on your phone/browser local storage and is never uploaded to any remote surveillance server.
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
            <h4 className="font-bold text-blue-950 text-xs sm:text-sm">
              2. Google AdMob Advertising Disclosure
            </h4>
            <p className="text-xs text-blue-800">
              This application uses <strong>Google AdMob</strong> to display banner ads. Google AdMob may collect pseudonymous device identifiers (such as Google Advertising ID / GAID), IP address, and interaction data to serve contextual and personalized advertisements according to{' '}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                Google Ad Policies
              </a>.
            </p>
            <p className="text-[11px] text-blue-700">
              You can control or delete your Advertising ID anytime via your Android Settings &gt; Google &gt; Ads.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              3. Data Safety & User Control
            </h4>
            <p className="text-xs text-gray-600">
              You maintain 100% control over your data. You can export a complete JSON backup copy or permanently erase all logs at any time using the in-app "Reset" or "Export Backup" tools.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              4. Children's Privacy (COPPA)
            </h4>
            <p className="text-xs text-gray-600">
              This app is designed for workforce employee management and adult users. It does not knowingly target or collect information from children under 13.
            </p>
          </div>

          {/* Developer Contact & Direct Web Link */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-gray-800 block flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-gray-600" />
              Contact Developer
            </span>
            <div className="text-xs text-gray-600 space-y-0.5">
              <p><strong>Developer:</strong> Dev Kumar</p>
              <p><strong>Email:</strong> devkumar25061999@gmail.com</p>
              <p><strong>Package Name:</strong> com.devkumar.attendanceplus</p>
            </div>

            <div className="pt-1.5 border-t border-gray-200 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Live Public Web URL:</span>
              <a
                href="/privacy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
              >
                <span>Open /privacy.html</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <a
            href="/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
          >
            Full Web Document <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
