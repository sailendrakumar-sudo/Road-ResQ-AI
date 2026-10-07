import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Zap, ArrowRight, Eye, PhoneCall, Sparkles, RefreshCw } from 'lucide-react';
import SafeModeToggle from './SafeModeToggle';

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-red-600/15 via-pink-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission & High Contrast Emergency CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
              Multimodal Agentic Roadside Rescue Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              From Breakdown <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
                to Absolute Safety.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Traditional apps only ask <em>"Where is the nearest mechanic?"</em>. <br className="hidden sm:inline" />
              <strong className="text-white">Road ResQ AI</strong> reasons <em>what is happening</em> via multimodal vision & audio, calculates safety risk, dispatches verified 5★ specialists, and executes an <strong className="text-amber-400">autonomous re-planning loop</strong> if roadside repair fails.
            </p>

            {/* High Contrast Emergency Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                id="hero-report-btn"
                to="/emergency/report"
                className="group px-7 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-base shadow-2xl shadow-red-600/40 hover:shadow-red-500/60 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <AlertTriangle className="w-5 h-5 animate-pulse text-amber-200" />
                REPORT STRANDED BREAKDOWN
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/dashboard"
                className="px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2"
              >
                Launch Traveler Radar
              </Link>
            </div>

            {/* Women Safe Mode Toggle Featurette */}
            <div className="pt-4 max-w-xl mx-auto lg:mx-0">
              <SafeModeToggle />
            </div>
          </div>

          {/* Right Column: Interactive Diagnostic Preview Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-6 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
              <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Agentic Orchestration Active
              </div>

              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase font-extrabold text-slate-400">Live Breakdown Observation</div>
                  <div className="text-sm font-bold text-white">Multimodal Vision & Voice Triaging</div>
                </div>
              </div>

              {/* Sample Breakdown Scenario */}
              <div className="space-y-3.5 mb-6 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">User Input:</span> Snaps smoking engine & says "Car suddenly stalled on highway".
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">AI Diagnosis:</span> Severe Radiator Overheating (Risk Score 75). Directs traveler: <em className="text-rose-300">"DO NOT open radiator cap!"</em>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">Smart Suitability Match:</span> Dispatches Arjun Patel (Engine Specialist, 4.88★, 2.1km away, ETA 7m).
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 flex items-start gap-3">
                  <RefreshCw className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 animate-spin" />
                  <div>
                    <span className="font-bold text-amber-200">Autonomous Re-Planning Loop:</span> If mechanic marks "Engine block cracked", AI automatically dispatches a Hydraulic Flatbed Tow without stranded user intervention!
                  </div>
                </div>
              </div>

              {/* Live Metric Bar */}
              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-800">
                <div className="p-2 rounded-xl bg-slate-800/40">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Avg Arrival</div>
                  <div className="text-base font-black text-emerald-400">8.4 mins</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/40">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Verified Network</div>
                  <div className="text-base font-black text-blue-400">100% 5★</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/40">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Fair Pricing</div>
                  <div className="text-base font-black text-amber-400">Guaranteed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
