import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  X,
  Flashlight,
  RefreshCw,
  Barcode,
  Search,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BeltProduct } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  products?: BeltProduct[];
  title?: string;
  subtitle?: string;
}

export const BarcodeScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onScan,
  products = [],
  title = 'Scan Product Barcode',
  subtitle = 'Point camera at belt tag barcode or code label',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [scannedSuccess, setScannedSuccess] = useState<string | null>(null);
  const [supportsTorch, setSupportsTorch] = useState(false);

  // Play audio beep feedback
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext unavailable
    }
    if (navigator.vibrate) {
      try {
        navigator.vibrate(100);
      } catch {
        // Vibrate unavailable
      }
    }
  };

  const handleDetected = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    playBeep();
    setScannedSuccess(trimmed);
    setTimeout(() => {
      onScan(trimmed);
      onClose();
    }, 400);
  };

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) {
      setScannedSuccess(null);
      setCameraError(null);
      return;
    }

    let currentStream: MediaStream | null = null;
    let detectorTimer: number | null = null;
    let isCancelled = false;

    const startCamera = async () => {
      try {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API is not supported in this browser environment.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        currentStream = stream;
        setHasCamera(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // Check torch support
        const track = stream.getVideoTracks()[0];
        if (track && (track.getCapabilities as any)) {
          const caps = (track.getCapabilities as any)();
          if (caps && caps.torch) {
            setSupportsTorch(true);
          }
        }

        // BarcodeDetector setup
        if ('BarcodeDetector' in window) {
          try {
            const formats = await (window as any).BarcodeDetector.getSupportedFormats();
            const detector = new (window as any).BarcodeDetector({
              formats: formats.length > 0 ? formats : ['ean_13', 'code_128', 'qr_code', 'upc_a'],
            });

            const scanInterval = window.setInterval(async () => {
              if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                try {
                  const barcodes = await detector.detect(videoRef.current);
                  if (barcodes && barcodes.length > 0) {
                    const detectedVal = barcodes[0].rawValue;
                    if (detectedVal) {
                      window.clearInterval(scanInterval);
                      handleDetected(detectedVal);
                    }
                  }
                } catch {
                  // Frame capture error, ignore and continue
                }
              }
            }, 250);
            detectorTimer = scanInterval;
          } catch {
            // BarcodeDetector failed to init
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setHasCamera(false);
          setCameraError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access in browser settings, or enter/select the product barcode below.'
              : err.message || 'Unable to access camera.'
          );
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (detectorTimer) clearInterval(detectorTimer);
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Torch toggle
  const toggleTorch = async () => {
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (track && (track.applyConstraints as any)) {
      try {
        await (track.applyConstraints as any)({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      } catch {
        // Torch constraint not supported
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in no-print">
      <div className="w-full max-w-lg bg-neutral-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-neutral-100 text-sm sm:text-base">
                {title}
              </h3>
              <p className="text-[11px] text-neutral-400">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-neutral-800 border-neutral-700 text-amber-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}
              title={soundEnabled ? 'Mute beep' : 'Enable audio beep'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative bg-black h-64 sm:h-72 overflow-hidden flex items-center justify-center">
          {/* Active Video */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Aiming Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Darkened backdrop frame */}
            <div className="relative w-56 h-40 sm:w-64 sm:h-44 border-2 border-amber-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] flex items-center justify-center">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl-xl -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr-xl -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl-xl -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br-xl -mb-1 -mr-1" />

              {/* Red laser scanning line animation */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-pulse" />

              {/* Tag indicator */}
              <div className="absolute bottom-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-amber-300">
                ALIGN BELT CODE
              </div>
            </div>
          </div>

          {/* Success Overlay Flash */}
          {scannedSuccess && (
            <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-200 animate-fade-in z-20">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce mb-2" />
              <div className="font-bold text-sm">Code Detected!</div>
              <div className="font-mono text-xs bg-black/60 px-3 py-1 rounded-lg border border-emerald-500/50 text-white mt-1">
                {scannedSuccess}
              </div>
            </div>
          )}

          {/* Camera Permission / Error Fallback message */}
          {cameraError && !scannedSuccess && (
            <div className="absolute inset-0 bg-neutral-950/90 p-4 flex flex-col items-center justify-center text-center z-10 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-xs text-neutral-300 max-w-xs">{cameraError}</p>
              <div className="text-[11px] text-amber-300">
                You can enter or select the belt code below to instantly scan!
              </div>
            </div>
          )}

          {/* Floating Camera Controls */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
            {supportsTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl backdrop-blur-md text-xs cursor-pointer shadow-lg transition-colors ${
                  torchOn ? 'bg-amber-500 text-neutral-950' : 'bg-black/60 text-white hover:bg-black/80'
                }`}
                title="Toggle Torch / Flashlight"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md text-xs cursor-pointer shadow-lg transition-colors"
              title="Switch Camera (Front / Back)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Manual Barcode Input & Quick Selector */}
        <div className="p-4 bg-neutral-950 space-y-3 overflow-y-auto">
          {/* Manual input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) {
                handleDetected(manualCode.trim());
              }
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Type or paste belt barcode / code (e.g. BELT-001)"
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-neutral-100 text-xs font-mono uppercase focus:border-amber-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup</span>
            </button>
          </form>

          {/* Quick Select from Catalog for Instant Testing */}
          {products.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 mb-1.5 flex items-center justify-between">
                <span>Quick Scan from Catalog:</span>
                <span className="text-[10px] text-neutral-500">{products.length} products available</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-neutral-900/60 rounded-xl border border-neutral-800">
                {products.slice(0, 10).map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleDetected(prod.code)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500/20 hover:border-amber-500/50 border border-neutral-700/80 text-[11px] font-mono text-neutral-200 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span className="font-bold text-amber-400">{prod.code}</span>
                    <span className="text-neutral-400 truncate max-w-[80px]">({prod.name})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
