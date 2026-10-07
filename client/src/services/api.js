const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function reportEmergencyApi(payload) {
  const token = localStorage.getItem('resq_token') || 'demo-traveler-token';
  const res = await fetch(`${API_BASE}/emergency/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit emergency report');
  }
  return res.json();
}

export async function getEmergencyApi(id) {
  const res = await fetch(`${API_BASE}/emergency/${id}`);
  if (!res.ok) throw new Error('Failed to fetch emergency details');
  return res.json();
}

export async function getRescueApi(rescueId) {
  const res = await fetch(`${API_BASE}/rescue/${rescueId}`);
  if (!res.ok) throw new Error('Failed to fetch rescue details');
  return res.json();
}

export async function updateRescueStatusApi(rescueId, status, failureReason) {
  const res = await fetch(`${API_BASE}/rescue/${rescueId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, failureReason })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update rescue status');
  }
  return res.json();
}

export async function triggerEmergencySOSApi(emergencyId) {
  const res = await fetch(`${API_BASE}/emergency/${emergencyId}/sos`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to trigger SOS');
  return res.json();
}

export async function getRespondersApi() {
  const res = await fetch(`${API_BASE}/responders`);
  if (!res.ok) throw new Error('Failed to fetch responders');
  return res.json();
}

export async function updateResponderStateApi(id, updates) {
  const res = await fetch(`${API_BASE}/responders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function registerUserApi(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return res.json();
}
