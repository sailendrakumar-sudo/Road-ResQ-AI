import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SafeModeToggle() {
  const { isSafeMode, setIsSafeMode } = useApp();

  return (
    <div
      onClick={() => setIsSafeMode(!isSafeMode)}
      className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-4 flex items-center justify-between border ${
        isSafeMode
          ? 'bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-pink-900/40 border-pink-500/50 safe-mode-glow'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            isSafeMode
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Shield className={`w-5 h-5 ${isSafeMode ? 'animate-pulse' : ''}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-wide text-white">
              Women Safe Mode
            </span>
            {isSafeMode && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                <Sparkles className="w-3 h-3 text-pink-400" />
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
            {isSafeMode
              ? 'Prioritizing top-rated 5★ verified & female responders. Exact location shared only upon acceptance.'
              : 'Enable for heightened safety protocols, verified female responders, & instant guardian SMS.'}
          </p>
        </div>
      </div>

      {/* Switch Toggle */}
      <div className="ml-4 flex-shrink-0">
        <div
          className={`w-14 h-8 rounded-full transition-colors relative flex items-center p-1 ${
            isSafeMode ? 'bg-pink-500' : 'bg-slate-700'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
              isSafeMode ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
