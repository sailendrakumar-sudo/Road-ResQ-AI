import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Wifi, WifiOff, Car, Wrench, AlertTriangle, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const location = useLocation();
  const { user, role, switchRole, isSafeMode, setIsSafeMode, isLowNetwork, setIsLowNetwork } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
              Road ResQ <span className="text-red-500 font-extrabold text-sm px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 hidden sm:block">
              From Breakdown to Safety
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/60 text-xs font-semibold">
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-xl transition-all ${
              location.pathname === '/dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Traveler Radar
          </Link>
          <Link
            to="/emergency/report"
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              location.pathname === '/emergency/report'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Report Breakdown
          </Link>
          <Link
            to="/mechanic/dashboard"
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              location.pathname.startsWith('/mechanic')
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            Responder Portal
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Low Network Simulation Toggle */}
          <button
            onClick={() => setIsLowNetwork(!isLowNetwork)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isLowNetwork
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Low-Network / SMS Fallback mode"
          >
            {isLowNetwork ? <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Wifi className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isLowNetwork ? 'Low-Net Mode: ON' : 'Data Mode'}</span>
          </button>

          {/* Women Safe Mode indicator */}
          <button
            onClick={() => setIsSafeMode(!isSafeMode)}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
              isSafeMode
                ? 'bg-pink-600/20 border-pink-500/50 text-pink-300 safe-mode-glow'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-pink-300'
            }`}
            title="Toggle Women Safe Mode"
          >
            <Shield className={`w-4 h-4 ${isSafeMode ? 'text-pink-400 animate-pulse' : ''}`} />
            {isSafeMode && <span className="text-[11px] font-bold text-pink-300 hidden sm:inline">Safe Mode</span>}
          </button>

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => switchRole('traveler')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                role === 'traveler'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-3 h-3" />
              <span className="hidden sm:inline">Traveler</span>
            </button>
            <button
              onClick={() => switchRole('responder')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                role === 'responder'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3 h-3" />
              <span className="hidden sm:inline">Mechanic</span>
            </button>
          </div>

          {/* User Auth Link */}
          <Link
            to="/auth"
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-all"
            title={`Logged in as ${user?.full_name || 'Demo User'}`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
