import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, AlertTriangle, RefreshCw, CheckCircle, Navigation, Clock, User, Wrench, Shield, ArrowRight } from 'lucide-react';
import RescueTracker from '../components/RescueTracker';
import DiagnosticCard from '../components/DiagnosticCard';
import { getRescueApi } from '../services/api';
import { useApp } from '../context/AppContext';

export default function TrackingPage() {
  const { rescueId } = useParams();
  const { setSosModalOpen } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrackingData = () => {
    getRescueApi(rescueId)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.warn('Error fetching rescue:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrackingData();
    // Poll every 3.5 seconds for live status & re-planning updates
    const interval = setInterval(fetchTrackingData, 3500);
    return () => clearInterval(interval);
  }, [rescueId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <Navigation className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Connecting to Emergency Dispatch...</h2>
        <p className="text-xs text-slate-400 mt-1">Locating assigned responder telemetry</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Rescue Record Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error || 'Could not locate this rescue assignment.'}</p>
        <Link to="/dashboard" className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { rescue, emergency, responder, liveDistance, liveEta } = data;
  const isFailed = rescue?.status === 'failed';
  const isCompleted = rescue?.status === 'completed';
  const isReplan = rescue?.is_replan || emergency?.ai_diagnosis?.replanActive;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              Rescue ID: {rescue.id}
            </span>
            {emergency?.safe_mode_active && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase flex items-center gap-1">
                <Shield className="w-3 h-3" /> Women Safe Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {isCompleted
              ? 'Rescue Resolved & Safe'
              : isFailed
              ? 'On-Site Fix Failed: Tow Dispatching'
              : 'Responder En Route to Your Breakdown'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Emergency status:{' '}
            <span className="text-emerald-400 font-semibold capitalize">
              {rescue.status}
            </span>
          </p>
        </div>

        {/* SOS Action button */}
        <button
          onClick={() => setSosModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 self-start sm:self-center"
        >
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          One-Tap SOS Alert
        </button>
      </div>

      {/* AGENTIC RE-PLANNING ALERT BANNER (If repair failed) */}
      {isFailed && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-red-950/70 border-2 border-amber-500/60 shadow-2xl animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-1">
                <span>Autonomous Re-Planning Loop Triggered</span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Agentic Handover
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Initial On-Site Repair Failed: Autonomous Tow Truck Dispatched
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Mechanic reported:{' '}
                <strong className="text-amber-200">
                  "{rescue.failure_reason || 'Damage too severe for roadside repair'}"
                </strong>
                . The Road ResQ AI orchestrator has automatically escalated this to a Heavy Hydraulic Tow service with direct routing to{' '}
                <strong className="text-white">Apex Certified Service Center</strong> without requiring manual re-entry.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Live Map Tracker (Left) & Diagnostic + Responder Info (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Tracker (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <RescueTracker
            userLat={emergency?.location_lat || 28.6139}
            userLng={emergency?.location_lng || 77.2090}
            responderLat={responder?.current_lat || 28.6250}
            responderLng={responder?.current_lng || 77.2180}
            responderName={responder?.full_name || 'Verified Responder'}
            specialization={responder?.specialization?.replace('_', ' ') || 'Mechanic'}
            initialEta={liveEta || 8}
            initialDistance={liveDistance || 2.4}
            status={rescue.status}
          />

          {/* Status Timeline */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Rescue Progression Timeline
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                Reported
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                AI Diagnosed
              </div>
              <div className={`p-2 rounded-xl border font-semibold ${
                rescue.status === 'dispatched' || rescue.status === 'en_route'
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                <Navigation className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                En Route
              </div>
              <div className={`p-2 rounded-xl border font-semibold ${
                rescue.status === 'completed'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : isFailed
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}>
                {isFailed ? (
                  <RefreshCw className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                )}
                {isFailed ? 'Re-Planned' : 'Resolved'}
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic & Responder Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Diagnostic Card */}
          <DiagnosticCard
            diagnosis={emergency?.ai_diagnosis?.diagnosis || emergency?.description}
            riskScore={emergency?.risk_score}
            responderType={emergency?.ai_diagnosis?.responderType}
            safetyAdvisory={emergency?.ai_diagnosis?.safetyAdvisory}
            priceMin={rescue.estimated_cost_min}
            priceMax={rescue.estimated_cost_max}
            replanActive={isFailed || isReplan}
            replanReason={rescue.failure_reason}
            destinationFacility={rescue.destination_facility || emergency?.ai_diagnosis?.destinationFacility}
          />

          {/* Responder Profile Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Assigned Responder Profile
              </span>
              {responder?.is_verified && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Background Verified
                </span>
              )}
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {responder?.full_name?.charAt(0) || 'R'}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                  {responder?.full_name || 'Rajesh Kumar'}
                </h4>
                <p className="text-xs text-slate-400 capitalize">
                  {responder?.specialization?.replace('_', ' ') || 'Tyre Specialist'}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    ★ {responder?.rating || '4.95'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">
                    {responder?.total_rescues || 184} Rescues
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            {responder?.vehicle && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Responder Vehicle: <strong className="text-white">{responder.vehicle}</strong></span>
              </div>
            )}

            {/* Contact Call Button */}
            <a
              href={`tel:${responder?.phone || '+919822334455'}`}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              Direct Call Responder ({responder?.phone || '+91 98223 34455'})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
