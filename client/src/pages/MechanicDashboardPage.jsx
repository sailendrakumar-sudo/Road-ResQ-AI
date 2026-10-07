import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, ShieldCheck, Power, Navigation, Clock, CheckCircle, AlertTriangle, ArrowRight, User, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getEmergencyApi, updateResponderStateApi } from '../services/api';

export default function MechanicDashboardPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [isOnline, setIsOnline] = useState(true);
  const [incomingJobs, setIncomingJobs] = useState([]);

  // Mock incoming dispatch request matching this mechanic
  useEffect(() => {
    // Check if there are active rescues in local storage or recent test
    fetch('/api/emergencies')
      .then((r) => r.json())
      .then((d) => {
        if (d.emergencies && d.emergencies.length > 0) {
          const latest = d.emergencies[0];
          setIncomingJobs([
            {
              emergencyId: latest.id,
              description: latest.description,
              diagnosis: latest.ai_diagnosis?.diagnosis || 'Roadside breakdown',
              specializationNeeded: latest.ai_diagnosis?.responderType || 'tyre_specialist',
              riskScore: latest.risk_score || 45,
              distanceKm: 2.1,
              etaMinutes: 7,
              suitabilityScore: 98,
              travelerPhone: '+919876543210'
            }
          ]);
        } else {
          // Default demo incoming request
          setIncomingJobs([
            {
              emergencyId: 'emg-demo-101',
              description: 'Front tyre punctured on highway shoulder, completely flat, rim touching tarmac',
              diagnosis: 'Punctured or Deflated Tyre (Pneumatic Failure)',
              specializationNeeded: 'tyre_specialist',
              riskScore: 65,
              distanceKm: 2.4,
              etaMinutes: 8,
              suitabilityScore: 96,
              travelerPhone: '+919876543210'
            }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const toggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (user?.id) {
      await updateResponderStateApi(user.id, { isOnline: nextState }).catch(() => {});
    }
  };

  const handleAcceptJob = (job) => {
    navigate(`/mechanic/job/rescue-zifqh24q`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile & Online Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-amber-600/30">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Responder Portal
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Responder
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              {user?.full_name || 'Rajesh Kumar (Express Tyre Fix)'}
            </h1>
            <p className="text-xs text-slate-400 capitalize">
              Specialization: <strong className="text-amber-400">{user?.specialization?.replace('_', ' ') || 'Tyre Specialist'}</strong> • Rating: <strong className="text-white">★ 4.95</strong> (184 completed rescues)
            </p>
          </div>
        </div>

        {/* Online / Offline switch */}
        <button
          onClick={toggleOnline}
          className={`px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl ${
            isOnline
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/50'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
          }`}
        >
          <Power className="w-4 h-4" />
          {isOnline ? 'Online & Receiving Dispatches' : 'Offline (Paused)'}
        </button>
      </div>

      {/* Incoming Rescue Dispatch Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-amber-400" />
              Incoming Emergency Dispatches
            </h2>
            <p className="text-xs text-slate-400">
              Ranked in real-time by the Road ResQ Suitability Score algorithm
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {incomingJobs.length} Dispatch Alert
          </span>
        </div>

        {incomingJobs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No pending breakdown dispatches in your radius. Radar listening...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {incomingJobs.map((job, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950">
                      HIGH SUITABILITY MATCH: {job.suitabilityScore}%
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30">
                      Risk Score: {job.riskScore}/100
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      ETA ~ {job.etaMinutes} mins ({job.distanceKm} km away)
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {job.diagnosis}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    User Reported: "{job.description}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleAcceptJob(job)}
                    className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-all"
                  >
                    Accept Dispatch & Navigate
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Jobs & Execution Direct Links */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-400" />
          Active Job Console
        </h2>
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm text-white">
              Active Job #rescue-zifqh24q (Tyre & Pneumatic Emergency)
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Traveler: Priya Sharma • Delhi Highway Belt • Status: <span className="text-blue-400 font-semibold">Dispatched / En-Route</span>
            </div>
          </div>
          <Link
            to="/mechanic/job/rescue-zifqh24q"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30"
          >
            Open Job Execution Screen
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
