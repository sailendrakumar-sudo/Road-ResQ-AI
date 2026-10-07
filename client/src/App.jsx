import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import SOSButton from './components/SOSButton';
import SOSModal from './components/SOSModal';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import EmergencyReportPage from './pages/EmergencyReportPage';
import TrackingPage from './pages/TrackingPage';
import MechanicDashboardPage from './pages/MechanicDashboardPage';
import MechanicJobPage from './pages/MechanicJobPage';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/emergency/report" element={<EmergencyReportPage />} />
              <Route path="/emergency/tracking/:rescueId" element={<TrackingPage />} />
              <Route path="/mechanic/dashboard" element={<MechanicDashboardPage />} />
              <Route path="/mechanic/job/:rescueId" element={<MechanicJobPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Floating High-Priority SOS Trigger */}
          <SOSButton />
          
          {/* Emergency Escalation Modal */}
          <SOSModal />

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950 py-10 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-300">Road ResQ AI</span>
                <span>• From Breakdown to Safety.</span>
              </div>
              <div className="flex items-center gap-6">
                <span>National Emergency: <strong className="text-red-400">112</strong></span>
                <span>Highway Patrol: <strong className="text-amber-400">1033</strong></span>
                <span>Ambulance: <strong className="text-emerald-400">108</strong></span>
              </div>
              <div>
                <span>© 2026 Road ResQ AI Inc. All rights reserved.</span>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}
