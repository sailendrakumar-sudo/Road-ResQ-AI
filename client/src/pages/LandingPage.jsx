import React from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import { Shield, Sparkles, RefreshCw, Eye, BatteryCharging, Wrench, Truck, AlertOctagon, PhoneCall, Cpu, WifiOff } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Core Architectural Pillars */}
      <section className="py-16 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Agentic Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
              Why Road ResQ AI Outperforms Traditional Mechanic Directories
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              We replace panic and guesswork with multimodal reasoning, safety risk calculations, and automated multi-stage contingency dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Multimodal Intake */}
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multimodal Breakdown Intake</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Snap photos of engine smoke, flat tyres, or collision points; dictate symptoms hands-free via real-time speech recognition; or pick one-tap incident tags.
              </p>
            </div>

            {/* 2. Agentic Re-Planning Loop */}
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Autonomous Re-Planning Loop</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If the on-site technician reports "Repair Failed" due to internal engine seize or fractured rims, the AI automatically coordinates a Tow Truck and certified garage routing without user friction.
              </p>
            </div>

            {/* 3. Women Safe Mode */}
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-5">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Women Safe Mode</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nighttime emergencies enforce verified responder filtering (&gt;4.8★), female technician dispatch prioritization, live guardian SMS sync, and exact GPS shielding until dispatch acceptance.
              </p>
            </div>

            {/* 4. Smart Matching Algorithm */}
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Factor Suitability Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Not just proximity. Matches on Specialization (Tyre, EV Battery, Tow, Trauma), ETA, Responder Rating, and Verification credibility to prevent dispatch mismatches.
              </p>
            </div>

            {/* 5. SOS Escalation System */}
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-slate-800 hover:border-red-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-5">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">One-Tap SOS Escalation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single button triggers high-priority override, dispatches GPS distress telemetry to emergency contacts and highway police, and triggers local audio sirens.
              </p>
            </div>

            {/* 6. Low-Network Mode Simulation */}
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Low-Network & Offline Grace</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When 4G/5G signal drops on remote highways, Road ResQ compresses breakdown reports into lightweight SMS-ready payloads to guarantee rescue dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact Bottom CTA */}
      <section className="py-16 bg-gradient-to-t from-red-950/30 to-slate-950 border-t border-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white">
            Stranded on the Road Right Now?
          </h2>
          <p className="text-slate-300 text-sm mt-3 mb-8 max-w-xl mx-auto">
            Our autonomous AI is standing by 24/7. Snap a photo or describe what happened to dispatch verified roadside rescue immediately.
          </p>
          <Link
            to="/emergency/report"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-lg shadow-2xl shadow-red-600/40 transition-all transform hover:scale-105"
          >
            <AlertOctagon className="w-6 h-6" />
            DISPATCH RESCUE TEAM NOW
          </Link>
        </div>
      </section>
    </div>
  );
}
