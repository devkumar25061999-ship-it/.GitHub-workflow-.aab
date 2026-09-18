import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  CheckCircle2,
  Calendar,
  Clock,
  Camera,
  FileSpreadsheet,
  ShieldCheck,
  HeartHandshake,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface ReferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferModal: React.FC<ReferModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://attendanceplus.app';

  // Professional, policy-compliant greeting message and feature highlights
  const referralShareText = `नमस्ते दोस्त! 🙏\n\nमैंने अपनी रोज़ाना की ड्यूटी, हाज़िरी (Attendance), ओवरटाइम (OT) और सैलरी का हिसाब रखने के लिए *Attendance Plus* ऐप शुरू किया है, और यह सच में बहुत मददगार है!\n\n✨ *यह ऐप आपके किस काम आएगा?*\n\n1️⃣ *1-Tap Daily Attendance:* Work, Half-day, Holiday, Sick, Vacation बस 1-क्लिक में मार्क करें।\n2️⃣ *Exact Salary & OT Calculator:* रोज़ की दिहाड़ी और प्रति घंटा ओवरटाइम रेट सेट करें—महीने की कुल कमाई अपने आप सटीक जुड़ जाएगी।\n3️⃣ *Duty & Sunday Settings:* Sunday छुट्टी का पैसा और Company Paid Holiday का हिसाब ऑटोमैटिक।\n4️⃣ *Biometric Face Punch (Optional):* ड्यूटी पर आने-जाने का सेल्फ़ी/टाइम रिकॉर्ड।\n5️⃣ *HR Report & Excel Export:* हर महीने का पूरा हाज़िरी कार्ड PDF या Excel/CSV में डाउनलोड कर मालिक/ठेकेदार को भेजें।\n6️⃣ *100% Secure & Offline Ready:* बिना इंटरनेट भी पूरा काम करता है, आपका सारा डेटा फोन में सुरक्षित रहता है।\n\n👉 *अभी इस्तेमाल करके देखें (फ्री):*\n${currentAppUrl}\n\nआप भी आज ही इंस्टॉल करके अपनी हाज़िरी और पैसे का हिसाब रखना आसान बनाएं! 📱`;

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralShareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = referralShareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Attendance Plus - हाज़िरी, ओवरटाइम और सैलरी ट्रैकर',
          text: referralShareText,
          url: currentAppUrl,
        });
        setSharedSuccess(true);
        setTimeout(() => setSharedSuccess(false), 3000);
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          handleWhatsAppShare();
        }
      }
    } else {
      handleWhatsAppShare();
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(referralShareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-refer-friend"
        className="bg-[#1e2229] text-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#343a46]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 px-5 py-4 flex items-center justify-between border-b border-emerald-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-800 flex items-center justify-center font-bold shadow-md shrink-0">
              <Share2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight leading-tight flex items-center gap-1.5">
                <span>Refer to Friend</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                  Share App
                </span>
              </h2>
              <p className="text-xs text-emerald-200/90 font-medium">
                दोस्तों को शेयर करें • हाज़िरी और सैलरी का आसान हिसाब
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/20 text-emerald-200 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm text-gray-200 flex-1">
          {/* Friendly Greeting Card */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-950/70 to-[#182a25] border border-emerald-600/40 rounded-xl">
            <div className="flex items-start gap-2.5">
              <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  दोस्त को शेयर करने पर क्या मैसेज जाएगा?
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  जब आप किसी दोस्त को यह ऐप रेफर करेंगे, तो उन्हें एक आदरणीय नमस्ते (Greeting) और ऐप के सभी मुख्य फायदे (Features) अपने आप लिखकर जाएंगे, जिससे उन्हें पता चलेगा कि यह उनके काम की ऐप है।
                </p>
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div>
            <span className="text-xs font-bold text-gray-300 block mb-2">
              मैसेज में शामिल प्रमुख विशेषताएं (App Highlights):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#252a33] border border-gray-700/60 rounded-lg flex items-start gap-2">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-100 block">1-Tap Attendance</span>
                  <span className="text-[11px] text-gray-400">Work, Half Duty, Holiday व Sick Leave</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#252a33] border border-gray-700/60 rounded-lg flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-100 block">Salary & OT Calculator</span>
                  <span className="text-[11px] text-gray-400">दिहाड़ी + ओवरटाइम की ऑटो गणना</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#252a33] border border-gray-700/60 rounded-lg flex items-start gap-2">
                <Camera className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-100 block">Face Punch Duty</span>
                  <span className="text-[11px] text-gray-400">कैमरा सेल्फ़ी व टाइम रिकॉर्ड</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#252a33] border border-gray-700/60 rounded-lg flex items-start gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-100 block">HR Excel Report</span>
                  <span className="text-[11px] text-gray-400">ठेकेदार/मालिक को भेजने हेतु Excel/CSV</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview of the Referral Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">
                मैसेज का प्रीव्यू (Referral Message Preview):
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="p-3 bg-[#16181d] border border-gray-700 rounded-xl text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap max-h-44 overflow-y-auto">
              {referralShareText}
            </div>
          </div>

          {/* Privacy & Compliance Assurance */}
          <div className="p-2.5 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-center gap-2 text-[11px] text-blue-300">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Google Play Console & AdMob Policy Compliant • 100% सुरक्षित और स्पैम-फ्री इनविटेशन लिंक।
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#181a20] p-4 border-t border-[#2d323c] flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full sm:flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-gray-950 font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-xs sm:text-sm"
          >
            <MessageCircle className="w-4 h-4 text-gray-950 fill-current" />
            <span>WhatsApp पर शेयर करें</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-xs sm:text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>{sharedSuccess ? 'Sent Successfully!' : 'अन्य ऐप्स पर शेयर (All Apps)'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="w-full sm:w-auto py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl border border-gray-700 transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            title="पूरा मैसेज कॉपी करें"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'कॉपी हो गया' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
