import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Wrench, Navigation, CheckCircle, AlertTriangle, RefreshCw, PhoneCall, MapPin, Truck, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { getRescueApi, updateRescueStatusApi } from '../services/api';

const FAILURE_REASONS = [
  'Severe sidewall tear and cracked wheel rim - cannot be patched on highway shoulder',
  'Engine block cracked / severe overheating boilover - roadside repair unfeasible',
  'Drivetrain axle fracture / transmission locked in gear',
  'High-voltage battery electrical short / inverter fault',
  'Brake fluid hydraulic line severed - unsafe to drive'
];

export default function MechanicJobPage() {
  const { rescueId } = useParams();
  const navigate = useNavigate();
  const [rescueData, setRescueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failedModalOpen, setFailedModalOpen] = useState(false);
  const [failureReason, setFailureReason] = useState(FAILURE_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [replanResponse, setReplanResponse] = useState(null);

  useEffect(() => {
    getRescueApi(rescueId)
      .then((data) => setRescueData(data))
      .catch((err) => console.warn('Rescue job error:', err))
      .finally(() => setLoading(false));
  }, [rescueId]);

  const handleUpdateStatus = async (status, reason = null) => {
    setUpdating(true);
    try {
      const res = await updateRescueStatusApi(rescueId, status, reason);
      if (res.replanTriggered) {
        setReplanResponse(res);
        setFailedModalOpen(false);
      } else {
        // Refresh local view
        const refreshed = await getRescueApi(rescueId);
        setRescueData(refreshed);
      }
    } catch (err) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmFailed = () => {
    const finalReason = customReason.trim() ? customReason : failureReason;
    handleUpdateStatus('failed', finalReason);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <Navigation className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <h2 className="text-lg font-bold text-white">Loading Rescue Job Execution...</h2>
      </div>
    );
  }

  const rescue = rescueData?.rescue;
  const emergency = rescueData?.emergency;
  const responder = rescueData?.responder;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            Job ID: {rescueId}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Rescue Execution Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Current Status:{' '}
            <span className="font-bold uppercase text-amber-400">
              {rescue?.status || 'dispatched'}
            </span>
          </p>
        </div>

        <Link
          to="/mechanic/dashboard"
          className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 self-start sm:self-center"
        >
          ← Return to Portal
        </Link>
      </div>

      {/* RE-PLANNING HANDOVER BANNER (When mechanic triggered repair failed) */}
      {replanResponse && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-red-950/80 border-2 border-amber-500 shadow-2xl animate-fade-in space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 inline-block mb-1">
                Autonomous Handover Complete
              </span>
              <h2 className="text-xl font-black text-white">
                Agentic Re-Planning Executed: Tow Truck Dispatched!
              </h2>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {replanResponse.replanPlan?.replanSummary}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Secondary Dispatch</span>
              <div className="font-bold text-white text-sm mt-0.5 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                {replanResponse.towResponder?.full_name || 'Vikram Singh'} ({replanResponse.towResponder?.specialization || 'Tow Truck'})
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Destination Workshop</span>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">
                {replanResponse.replanPlan?.destinationFacility || 'Apex Multi-Brand Service Hub'}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/emergency/tracking/${replanResponse.newRescue?.id || rescueId}`}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              Inspect Live Traveler Tracking <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Breakdown & Traveler Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown Incident details */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Breakdown & AI Diagnosis
          </h2>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Reported Problem:</span>
              <p className="text-slate-200 mt-0.5 font-medium">
                "{emergency?.description || 'Front tyre punctured on highway shoulder'}"
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">AI Diagnosis:</span>
              <p className="text-amber-400 font-bold mt-0.5">
                {emergency?.ai_diagnosis?.diagnosis || 'Pneumatic Tyre Puncture'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Risk Assessment:</span>
              <p className="text-red-400 font-bold mt-0.5">
                Risk Score {emergency?.risk_score || 45}/100 {emergency?.safe_mode_active && '• [Women Safe Mode Active]'}
              </p>
            </div>
          </div>

          {/* Destination Coordinates */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white">Traveler Coordinates</span>
                <div className="font-mono text-slate-400 text-[11px]">
                  {emergency?.location_lat || 28.6139}, {emergency?.location_lng || 77.2090}
                </div>
              </div>
            </div>
            <a
              href={`https://maps.google.com/?q=${emergency?.location_lat || 28.6139},${emergency?.location_lng || 77.2090}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 font-bold hover:bg-blue-600/30 text-[11px]"
            >
              Open in GPS
            </a>
          </div>
        </div>

        {/* Action Controls for Responder */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              On-Site Action Controls
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Update status as you proceed. If the mechanical breakdown cannot be resolved roadside, trigger the autonomous re-planning loop.
            </p>

            <div className="space-y-3">
              {/* Mark Arrived */}
              <button
                onClick={() => handleUpdateStatus('arrived')}
                disabled={updating}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                <Navigation className="w-4 h-4" />
                1. Mark Arrived on Scene
              </button>

              {/* Complete Repair */}
              <button
                onClick={() => handleUpdateStatus('completed')}
                disabled={updating}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle className="w-4 h-4" />
                2. Mark Repair Completed (Fixed)
              </button>

              {/* Report Repair Failed / Need Tow */}
              <button
                id="repair-failed-btn"
                onClick={() => setFailedModalOpen(true)}
                disabled={updating}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-600/30"
              >
                <RefreshCw className="w-4 h-4 text-amber-300" />
                3. Repair Failed / Need Tow (Trigger AI Re-Plan)
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center">
            Road ResQ Safety Protocol v2.4 • All status transitions logged
          </div>
        </div>
      </div>

      {/* Repair Failed Modal */}
      {failedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Report Roadside Repair Failed</h3>
                  <p className="text-xs text-red-400">Triggers Autonomous Tow Dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setFailedModalOpen(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Why could the breakdown not be resolved on the roadside? Select the mechanical reason so the AI Agent can dispatch the correct recovery vehicle:
            </p>

            <div className="space-y-2">
              {FAILURE_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`p-3 rounded-xl border block text-xs cursor-pointer transition-all ${
                    failureReason === reason
                      ? 'bg-red-500/10 border-red-500 text-white font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    className="mr-2"
                    checked={failureReason === reason}
                    onChange={() => setFailureReason(reason)}
                  />
                  {reason}
                </label>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Or Custom Technician Note
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g. Engine seized, metallic grinding noise from crank"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              id="confirm-repair-failed-btn"
              onClick={handleConfirmFailed}
              disabled={updating}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-all"
            >
              {updating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Orchestrating Secondary Tow...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Confirm Failure & Dispatch Tow Truck
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
