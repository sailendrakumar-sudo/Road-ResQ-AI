import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Zap, Wrench, IndianRupee } from 'lucide-react';

export default function DiagnosticCard({ diagnosis, riskScore, responderType, safetyAdvisory, priceMin, priceMax, replanActive, replanReason, destinationFacility }) {
  const [jumperResponse, setJumperResponse] = useState(null);
  const [injuryResponse, setInjuryResponse] = useState(null);

  const getRiskColor = (score) => {
    if (score >= 75) return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/40', bar: 'bg-red-500' };
    if (score >= 50) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/40', bar: 'bg-amber-500' };
    return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/40', bar: 'bg-emerald-500' };
  };

  const risk = getRiskColor(riskScore || 45);

  const isBattery = responderType === 'battery_technician' || (diagnosis && diagnosis.toLowerCase().includes('battery'));
  const isAccident = responderType === 'medical_first_responder' || (diagnosis && diagnosis.toLowerCase().includes('collision'));
  const isOverheating = diagnosis && (diagnosis.toLowerCase().includes('overheat') || diagnosis.toLowerCase().includes('smoke'));

  return (
    <div className={`rounded-2xl p-5 border transition-all ${replanActive ? 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-500/50' : 'bg-slate-900/90 border-slate-800'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-blue-400" />
            AI Multimodal Diagnosis
          </span>
          <h3 className="text-lg font-bold text-white leading-tight">
            {diagnosis || 'Mechanical Assessment in Progress'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 capitalize flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            Assigned Responder Spec: <span className="text-slate-200 font-semibold">{responderType?.replace('_', ' ') || 'General Mechanic'}</span>
          </p>
        </div>

        {/* Risk Score Pill */}
        <div className={`text-right px-3 py-2 rounded-xl border ${risk.bg} ${risk.border}`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Level</div>
          <div className={`text-xl font-black ${risk.text}`}>
            {riskScore || 45}<span className="text-xs font-normal text-slate-400">/100</span>
          </div>
        </div>
      </div>

      {/* Risk Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-700 ${risk.bar}`}
          style={{ width: `${Math.min(100, Math.max(10, riskScore || 45))}%` }}
        />
      </div>

      {/* Agentic Re-planning alert banner if repair failed */}
      {replanActive && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs mb-4">
          <div className="font-bold flex items-center gap-2 text-sm text-amber-300 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Agentic Re-Planning Active: Tow Truck Coordinated
          </div>
          <p className="leading-relaxed">
            {replanReason || 'Initial roadside fix unfeasible.'} System autonomously routed to: <span className="font-semibold text-white">{destinationFacility || 'Apex Authorized Service Center'}</span>.
          </p>
        </div>
      )}

      {/* Safety Advisory Banner */}
      <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
          Immediate Safety Advisory
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {safetyAdvisory || 'Stay inside the vehicle with hazard indicators flashing.'}
        </p>
      </div>

      {/* Adaptive Diagnosis Forms based on issue */}
      {isBattery && (
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 mb-4">
          <div className="text-xs font-bold text-blue-300 flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" />
            Battery Diagnostic Check: Do you have jumper cables in your trunk?
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setJumperResponse('yes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                jumperResponse === 'yes'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              Yes, I have cables
            </button>
            <button
              onClick={() => setJumperResponse('no')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                jumperResponse === 'no'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              No cables available
            </button>
          </div>
          {jumperResponse && (
            <p className="text-[11px] text-blue-400 mt-2">
              ✓ Technician notified: {jumperResponse === 'yes' ? 'Jump start cables on-site' : 'Technician bringing heavy-duty boost pack'}.
            </p>
          )}
        </div>
      )}

      {isAccident && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 mb-4 animate-pulse">
          <div className="text-xs font-bold text-red-300 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            CRITICAL TRAUMA TRIAGE: Are there injuries or passengers in distress?
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setInjuryResponse('yes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                injuryResponse === 'yes'
                  ? 'bg-red-600 text-white border-red-500 ring-2 ring-red-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              YES, Medical Needed
            </button>
            <button
              onClick={() => setInjuryResponse('no')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                injuryResponse === 'no'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              No injuries, vehicle only
            </button>
          </div>
          {injuryResponse === 'yes' && (
            <div className="mt-2 text-xs font-bold text-red-400">
              🚨 Trauma ambulance alert dispatched to Highway First ResQ Network.
            </div>
          )}
        </div>
      )}

      {isOverheating && (
        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 mb-4">
          <p className="text-xs text-rose-300 font-semibold">
            ⚠️ DO NOT open the radiator cap! Boiling coolant under pressure will violently erupt. Stay 15-20 meters clear of the vehicle hood.
          </p>
        </div>
      )}

      {/* Fair Pricing Engine Estimate */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-medium">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
          AI Fair Price Guarantee:
        </span>
        <span className="font-bold text-emerald-400 text-sm">
          ₹{priceMin || 400} - ₹{priceMax || 1200}
        </span>
      </div>
    </div>
  );
}
