import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Current user state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('resq_user');
    return saved
      ? JSON.parse(saved)
      : {
          id: 'u-demo-traveler-01',
          role: 'traveler',
          full_name: 'Priya Sharma',
          phone: '+919876543210',
          emergency_contact: '+919811223344'
        };
  });

  const [role, setRole] = useState(() => user?.role || 'traveler');
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [isLowNetwork, setIsLowNetwork] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [activeRescue, setActiveRescue] = useState(null);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosAlertSent, setSosAlertSent] = useState(false);

  // User coordinates (default New Delhi center or browser GPS)
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.log('Using default emergency coordinates (GPS denied or timeout)');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Sync user changes to storage
  const loginUser = (newUser, token) => {
    setUser(newUser);
    setRole(newUser.role);
    localStorage.setItem('resq_user', JSON.stringify(newUser));
    if (token) localStorage.setItem('resq_token', token);
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('resq_user');
    localStorage.removeItem('resq_token');
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    if (newRole === 'responder') {
      const respUser = {
        id: 'resp-rajesh-01',
        role: 'responder',
        full_name: 'Rajesh Kumar (Express Tyre Fix)',
        phone: '+919822334455',
        specialization: 'tyre_specialist',
        rating: 4.95,
        total_rescues: 184
      };
      setUser(respUser);
      localStorage.setItem('resq_user', JSON.stringify(respUser));
      localStorage.setItem('resq_token', 'demo-responder-resp-rajesh-01');
    } else {
      const travUser = {
        id: 'u-demo-traveler-01',
        role: 'traveler',
        full_name: 'Priya Sharma',
        phone: '+919876543210',
        emergency_contact: '+919811223344'
      };
      setUser(travUser);
      localStorage.setItem('resq_user', JSON.stringify(travUser));
      localStorage.setItem('resq_token', 'demo-traveler-token');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        coords,
        setCoords,
        isSafeMode,
        setIsSafeMode,
        isLowNetwork,
        setIsLowNetwork,
        activeEmergency,
        setActiveEmergency,
        activeRescue,
        setActiveRescue,
        sosModalOpen,
        setSosModalOpen,
        sosAlertSent,
        setSosAlertSent,
        loginUser,
        logoutUser,
        switchRole
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
