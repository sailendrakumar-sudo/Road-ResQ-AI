import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SOSButton() {
  const { setSosModalOpen, sosAlertSent } = useApp();

  return (
    <button
      id="global-sos-btn"
      onClick={() => setSosModalOpen(true)}
      aria-label="One-tap Emergency SOS"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-full font-bold shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
        sosAlertSent
          ? 'bg-red-600 text-white ring-4 ring-red-500/50 animate-pulse'
          : 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-900/40 hover:shadow-red-600/50'
      }`}
    >
      <div className="relative">
        <AlertTriangle className="w-6 h-6 animate-bounce" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-200"></span>
        </span>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs uppercase tracking-wider font-extrabold text-red-200 leading-none">
          EMERGENCY
        </span>
        <span className="text-base tracking-wider font-black leading-tight">
          ONE-TAP SOS
        </span>
      </div>
    </button>
  );
}
