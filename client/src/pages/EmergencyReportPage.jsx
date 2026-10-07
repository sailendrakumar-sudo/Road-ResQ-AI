import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Send, Sparkles, Shield, WifiOff, MapPin, CheckCircle2, PhoneCall, Radio } from 'lucide-react';
import MultimodalInput from '../components/MultimodalInput';
import SafeModeToggle from '../components/SafeModeToggle';
import { useApp } from '../context/AppContext';
import { reportEmergencyApi } from '../services/api';

export default function EmergencyReportPage() {
  const navigate = useNavigate();
  const { coords, isSafeMode, isLowNetwork, setActiveEmergency, setActiveRescue, user } = useApp();

  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [isNight, setIsNight] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description && !imageUrl) {
      alert('Please describe your emergency or upload a photo.');
      return;
    }

    // If Low Network mode is on, simulate instant SMS dispatch
    if (isLowNetwork) {
      setSmsSent(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        description: description || 'Visual vehicle damage requiring roadside assistance',
        lat: coords.lat,
        lng: coords.lng,
        imageUrl: imageUrl || null,
        isNight: Boolean(isNight),
        isFemaleModeRequested: Boolean(isSafeMode),
        vehicleType,
        emergencyContact: user?.emergency_contact || '+919811223344'
      };

      const result = await reportEmergencyApi(payload);
      if (result.success && result.rescue) {
        setActiveEmergency(result.emergency);
        setActiveRescue(result.rescue);
        navigate(`/emergency/tracking/${result.rescue.id}`);
      } else {
        alert('Emergency submitted, but no immediate rescue was assigned.');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to report emergency:', err);
      alert(err.message || 'Error communicating with AI Dispatch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          Immediate Multimodal Intake
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Report Roadside Emergency
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Gemini 1.5 Pro analyzes your photos, voice, or text to diagnose mechanical fault and calculate traveler safety risk.
        </p>
      </div>

      {/* Low-Network Mode Banner */}
      {isLowNetwork && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-bold text-amber-300">Low-Network Mode Active:</span> High-bandwidth images are bypassed. A compressed distress SMS packet will be generated.
            </div>
          </div>
          <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-bold">SMS FALLBACK</span>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* GPS location pill */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <MapPin className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="font-bold text-white">Emergency Location Locked</div>
              <div className="font-mono text-slate-400 text-[11px]">
                Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
              </div>
            </div>
          </div>
          <span className="text-emerald-400 font-bold text-[11px] px-2 py-1 bg-emerald-500/10 rounded-lg">
            GPS Locked
          </span>
        </div>

        {/* Multimodal Input Controls */}
        <MultimodalInput
          description={description}
          setDescription={setDescription}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          vehicleType={vehicleType}
          setVehicleType={setVehicleType}
          isNight={isNight}
          setIsNight={setIsNight}
        />

        {/* Women Safe Mode Switch */}
        <div className="pt-2">
          <SafeModeToggle />
        </div>

        {/* Submit Emergency Dispatch Button */}
        <button
          id="submit-emergency-btn"
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-3 ${
            isSubmitting
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-600/40 active:scale-98'
          }`}
        >
          {isSubmitting ? (
            <>
              <Radio className="w-5 h-5 animate-spin" />
              <span>Diagnosing & Finding Best Responder...</span>
            </>
          ) : isLowNetwork ? (
            <>
              <WifiOff className="w-5 h-5" />
              <span>DISPATCH VIA LOW-NET SMS PACKET</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>DIAGNOSE & DISPATCH RESCUE</span>
            </>
          )}
        </button>
      </form>

      {/* SMS Fallback Modal if triggered in low-network mode */}
      {smsSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-3xl p-6 text-white text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Compressed SMS Payload Ready</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Because data connection is low, the incident was converted into a short SMS distress code to Road ResQ Emergency Gateway.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-amber-300 text-left mb-5 border border-slate-800 break-all">
              ROADRESQ:EMG#{coords.lat.toFixed(4)},{coords.lng.toFixed(4)}|{vehicleType}|NIGHT={isNight ? 1 : 0}|SAFE={isSafeMode ? 1 : 0}|MSG:{description.slice(0, 80)}
            </div>
            <button
              onClick={() => {
                setSmsSent(false);
                navigate('/dashboard');
              }}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs"
            >
              Simulate SMS Sent & Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
