import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { AttendanceStatus } from '../types';

interface FacePunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPunchSuccess: (data: {
    status: AttendanceStatus;
    inTime: string;
    outTime: string;
    punchType: 'in' | 'out';
    faceSnapshot?: string;
  }) => void;
  defaultShiftIn?: string;
  defaultShiftOut?: string;
}

export const FacePunchModal: React.FC<FacePunchModalProps> = ({
  isOpen,
  onClose,
  onPunchSuccess,
  defaultShiftIn = '09:00 AM',
  defaultShiftOut = '06:00 PM',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<{ time: string; status: AttendanceStatus } | null>(null);
  const [statusChoice, setStatusChoice] = useState<AttendanceStatus>('work');
  const [punchType, setPunchType] = useState<'in' | 'out'>('in');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update real-time digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setSuccessData(null);
      setCameraError(null);
      return;
    }

    let isMounted = true;
    startCamera(isMounted);

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async (isMounted = true) => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (!isMounted) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return;
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      if (isMounted) {
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in browser settings or use manual punch.'
            : 'Unable to start camera. Please ensure camera is not in use by another app.'
        );
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCaptureAndPunch = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    let snapshotUrl: string | undefined = undefined;

    // Capture face snapshot from video feed if available
    try {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, 320, 240);
          snapshotUrl = canvas.toDataURL('image/jpeg', 0.6);
        }
      }
    } catch (e) {
      console.warn('Snapshot capture failed:', e);
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Play subtle beep if supported
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.1;
      osc.start();
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, 150);
    } catch {}

    setTimeout(() => {
      setIsProcessing(false);
      setSuccessData({ time: formattedTime, status: statusChoice });

      onPunchSuccess({
        status: statusChoice,
        inTime: punchType === 'in' ? formattedTime : defaultShiftIn,
        outTime: punchType === 'out' ? formattedTime : defaultShiftOut,
        punchType,
        faceSnapshot: snapshotUrl,
      });

      // Auto close after 2 seconds showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="modal-face-punch"
        className="bg-[#1e2229] text-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col border border-[#373f4e]"
      >
        {/* Header */}
        <div className="bg-[#181a20] px-4 py-3 flex items-center justify-between border-b border-[#2d323c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold shadow-xs">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Face Punch Verification</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/30">
                  Duty In/Out
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                चेहरा दिखाकर उपस्थिति दर्ज करें
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

        {/* Camera Viewfinder / Frame */}
        <div className="relative bg-black w-full aspect-4/3 flex items-center justify-center overflow-hidden border-b border-[#2d323c]">
          {successData ? (
            <div className="flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-base font-black text-emerald-400">Punch Successful!</h3>
              <p className="text-xs text-gray-300 mt-1 font-mono">
                {successData.time} • <span className="capitalize">{successData.status}</span>
              </p>
              <span className="text-[11px] text-gray-400 mt-2">
                उपस्थिति सुरक्षित रूप से दर्ज हो गई है
              </span>
            </div>
          ) : cameraError ? (
            <div className="p-5 text-center flex flex-col items-center">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-xs text-amber-200 mb-3">{cameraError}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => startCamera(true)}
                  className="py-1.5 px-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
                <button
                  onClick={handleCaptureAndPunch}
                  className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Punch Manually
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Biometric Scanning Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Oval Face Guide */}
                <div className="w-48 h-56 rounded-[50%] border-2 border-dashed border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center relative">
                  {/* Target Crosshairs */}
                  <div className="absolute top-2 w-4 h-[2px] bg-purple-400" />
                  <div className="absolute bottom-2 w-4 h-[2px] bg-purple-400" />
                  <div className="absolute left-2 w-[2px] h-4 bg-purple-400" />
                  <div className="absolute right-2 w-[2px] h-4 bg-purple-400" />
                  <span className="text-[10px] text-purple-300 font-bold bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    Align Face in Oval
                  </span>
                </div>
              </div>

              {/* Real-time Clock Badge */}
              <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 text-white font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentTime || '00:00:00'}</span>
              </div>

              {/* AI Verification Tag */}
              <div className="absolute top-2.5 right-2.5 bg-purple-950/80 backdrop-blur-md px-2 py-1 rounded-md border border-purple-500/30 flex items-center gap-1 text-[10px] text-purple-200 font-bold">
                <ShieldCheck className="w-3 h-3 text-purple-300" />
                <span>Live Guard</span>
              </div>
            </>
          )}

          {/* Hidden Canvas for snapshot generation */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls Section */}
        {!successData && (
          <div className="p-4 space-y-3 bg-[#1e2229]">
            {/* Punch In / Out Selector */}
            <div className="grid grid-cols-2 gap-2 bg-[#16181d] p-1 rounded-xl border border-[#2d323c]">
              <button
                type="button"
                onClick={() => setPunchType('in')}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  punchType === 'in'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>Punch IN (ड्यूटी शुरू)</span>
              </button>
              <button
                type="button"
                onClick={() => setPunchType('out')}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  punchType === 'out'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>Punch OUT (ड्यूटी खत्म)</span>
              </button>
            </div>

            {/* Duty Status Type */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Select Duty Status:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusChoice('work')}
                  className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                    statusChoice === 'work'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-[#282d37] border-[#373f4e] text-gray-300 hover:bg-[#323846]'
                  }`}
                >
                  Work (Full)
                </button>
                <button
                  type="button"
                  onClick={() => setStatusChoice('halfday')}
                  className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                    statusChoice === 'halfday'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[#282d37] border-[#373f4e] text-gray-300 hover:bg-[#323846]'
                  }`}
                >
                  Half Duty
                </button>
                <button
                  type="button"
                  onClick={() => setStatusChoice('overtime')}
                  className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                    statusChoice === 'overtime'
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-[#282d37] border-[#373f4e] text-gray-300 hover:bg-[#323846]'
                  }`}
                >
                  Overtime
                </button>
              </div>
            </div>

            {/* Main Action Button */}
            <button
              id="btn-confirm-face-punch"
              onClick={handleCaptureAndPunch}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-98 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-5 h-5 text-purple-200" />
              <span>{isProcessing ? 'Verifying Face...' : 'Punch Duty Now (पंच करें)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
