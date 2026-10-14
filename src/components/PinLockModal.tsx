import React, { useState } from 'react';
import {
  Lock,
  Fingerprint,
  Delete,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { SecurityConfig } from '../types';

interface Props {
  security: SecurityConfig;
  onUnlock: () => void;
}

export const PinLockModal: React.FC<Props> = ({ security, onUnlock }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 6) {
      const next = enteredPin + num;
      setEnteredPin(next);
      setErrorMsg(null);

      // Check if matches
      if (next === security.pinCode) {
        onUnlock();
      } else if (next.length >= security.pinCode.length) {
        setErrorShake(true);
        setErrorMsg('Incorrect PIN. Try again.');
        setTimeout(() => {
          setEnteredPin('');
          setErrorShake(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleBiometricAuth = () => {
    setIsBiometricPromptOpen(true);
  };

  const handleSimulateBiometricSuccess = () => {
    setIsBiometricPromptOpen(false);
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950 text-neutral-100 select-none">
      <div className="w-full max-w-sm flex flex-col items-center space-y-6">
        {/* Brand Lock Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="font-brand font-bold text-2xl tracking-wider text-amber-400">
            SAQIB
          </h2>
          <p className="text-xs text-neutral-400">
            Belt Business Manager · Security Gate
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-3 py-2">
          {Array.from({ length: security.pinCode.length || 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                idx < enteredPin.length
                  ? 'bg-amber-400 scale-110 shadow-md shadow-amber-400/50'
                  : 'bg-neutral-800 border border-neutral-700'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="text-xs text-red-400 font-semibold animate-pulse">
            {errorMsg}
          </div>
        )}

        {/* PIN Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 w-64 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-18 h-18 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 text-xl font-bold text-neutral-100 flex items-center justify-center active:bg-amber-500 active:text-neutral-950 transition-colors shadow-sm cursor-pointer"
            >
              {digit}
            </button>
          ))}

          {/* Biometric trigger */}
          <button
            onClick={handleBiometricAuth}
            disabled={!security.biometricEnabled}
            className="w-18 h-18 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-amber-500/50 text-neutral-300 flex items-center justify-center disabled:opacity-30 cursor-pointer"
            title="Biometric Fingerprint Unlock"
          >
            <Fingerprint className="w-6 h-6 text-amber-400" />
          </button>

          {/* Zero */}
          <button
            onClick={() => handleKeyPress('0')}
            className="w-18 h-18 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 text-xl font-bold text-neutral-100 flex items-center justify-center active:bg-amber-500 active:text-neutral-950 transition-colors shadow-sm cursor-pointer"
          >
            0
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="w-18 h-18 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 text-neutral-400 flex items-center justify-center active:bg-neutral-800 cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Default hint for user */}
        <p className="text-[11px] text-neutral-500 text-center">
          Default Master PIN: <span className="font-mono text-amber-400 font-bold">1234</span>
        </p>
      </div>

      {/* Android Biometric Bottom Sheet Simulation */}
      {isBiometricPromptOpen && (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-3xl p-6 space-y-4 shadow-2xl text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Fingerprint className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>

            <h3 className="font-bold text-base text-neutral-100">
              Biometric Authentication
            </h3>
            <p className="text-xs text-neutral-400">
              Touch the fingerprint sensor to unlock SAQIB Belt Business Manager
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleSimulateBiometricSuccess}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer"
              >
                Simulate Fingerprint Match
              </button>
              <button
                onClick={() => setIsBiometricPromptOpen(false)}
                className="w-full py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 cursor-pointer"
              >
                Use PIN Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
