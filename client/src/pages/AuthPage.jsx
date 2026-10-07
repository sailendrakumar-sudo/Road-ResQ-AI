import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Wrench, Shield, ArrowRight, CheckCircle2, Phone, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { registerUserApi } from '../services/api';

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginUser, switchRole } = useApp();
  const [tab, setTab] = useState('traveler'); // 'traveler' or 'responder'
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState('tyre_specialist');
  const [loading, setLoading] = useState(false);

  // Fast Demo Logins
  const handleDemoLogin = (profile, token, targetRoute) => {
    loginUser(profile, token);
    navigate(targetRoute);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !fullName) return;

    setLoading(true);
    try {
      const res = await registerUserApi({
        phone,
        fullName,
        role: tab,
        specialization: tab === 'responder' ? specialization : undefined,
        emergencyContact: '+919811223344'
      });

      if (res.user) {
        loginUser(res.user, res.token);
        navigate(tab === 'responder' ? '/mechanic/dashboard' : '/dashboard');
      }
    } catch (err) {
      console.warn('Register fallback:', err);
      // Fallback local session
      const fallbackUser = {
        id: 'u-' + Math.random().toString(36).substring(2, 8),
        role: tab,
        full_name: fullName,
        phone,
        specialization: tab === 'responder' ? specialization : undefined
      };
      loginUser(fallbackUser, `demo-${tab}-token`);
      navigate(tab === 'responder' ? '/mechanic/dashboard' : '/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-red-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Access Road ResQ AI
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in as a stranded traveler or an accredited roadside responder
          </p>
        </div>

        {/* Quick Demo Logins Section */}
        <div className="mb-8 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Quick One-Click Demo Profiles
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() =>
                handleDemoLogin(
                  {
                    id: 'u-demo-traveler-01',
                    role: 'traveler',
                    full_name: 'Priya Sharma (Stranded Traveler)',
                    phone: '+919876543210',
                    emergency_contact: '+919811223344'
                  },
                  'demo-traveler-token',
                  '/dashboard'
                )
              }
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-left transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <div className="font-bold">Priya Sharma</div>
                <div className="text-[10px] text-slate-400">Stranded Traveler</div>
              </div>
            </button>

            <button
              onClick={() =>
                handleDemoLogin(
                  {
                    id: 'resp-rajesh-01',
                    role: 'responder',
                    full_name: 'Rajesh Kumar (Express Tyre Fix)',
                    phone: '+919822334455',
                    specialization: 'tyre_specialist',
                    rating: 4.95,
                    total_rescues: 184
                  },
                  'demo-responder-resp-rajesh-01',
                  '/mechanic/dashboard'
                )
              }
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-left transition-all flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-bold">Rajesh Kumar</div>
                <div className="text-[10px] text-slate-400">Tyre Specialist (4.95★)</div>
              </div>
            </button>

            <button
              onClick={() =>
                handleDemoLogin(
                  {
                    id: 'resp-anita-02',
                    role: 'responder',
                    full_name: 'Anita Sharma (VoltCare EV)',
                    phone: '+919833445566',
                    specialization: 'battery_technician',
                    rating: 4.98,
                    total_rescues: 216,
                    is_female: true
                  },
                  'demo-responder-resp-anita-02',
                  '/mechanic/dashboard'
                )
              }
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-200 hover:text-white border border-pink-500/30 text-left transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-pink-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-pink-300">Anita Sharma</div>
                <div className="text-[10px] text-slate-400">Female Battery Tech (Safe Mode)</div>
              </div>
            </button>

            <button
              onClick={() =>
                handleDemoLogin(
                  {
                    id: 'resp-vikram-03',
                    role: 'responder',
                    full_name: 'Vikram Singh (Tow Solutions)',
                    phone: '+919844556677',
                    specialization: 'tow_truck',
                    rating: 4.89,
                    total_rescues: 340
                  },
                  'demo-responder-resp-vikram-03',
                  '/mechanic/dashboard'
                )
              }
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-left transition-all flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <div className="font-bold">Vikram Singh</div>
                <div className="text-[10px] text-slate-400">Tow Truck Operator</div>
              </div>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl mb-6 border border-slate-700/80">
          <button
            onClick={() => setTab('traveler')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'traveler'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Traveler Account
          </button>
          <button
            onClick={() => setTab('responder')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'responder'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Responder / Mechanic
          </button>
        </div>

        {/* Registration / Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={tab === 'traveler' ? 'e.g. Priya Sharma' : 'e.g. Rajesh Kumar'}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {tab === 'responder' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Specialization
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="tyre_specialist">Tyre Specialist</option>
                <option value="battery_technician">Battery & EV Technician</option>
                <option value="tow_truck">Tow Truck Operator</option>
                <option value="general_mechanic">General Automotive Mechanic</option>
                <option value="medical_first_responder">Medical First Responder</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 ${
              tab === 'traveler'
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
            }`}
          >
            {loading ? 'Authenticating...' : `Enter as ${tab === 'traveler' ? 'Traveler' : 'Responder'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
