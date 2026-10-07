import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed initial dataset
const INITIAL_DATA = {
  users: [
    {
      id: 'u-demo-traveler-01',
      role: 'traveler',
      full_name: 'Priya Sharma',
      phone: '+919876543210',
      emergency_contact: '+919811223344',
      created_at: new Date().toISOString()
    },
    {
      id: 'resp-rajesh-01',
      role: 'responder',
      full_name: 'Rajesh Kumar (Express Tyre Fix)',
      phone: '+919822334455',
      emergency_contact: '+919822334400',
      created_at: new Date().toISOString()
    },
    {
      id: 'resp-anita-02',
      role: 'responder',
      full_name: 'Anita Sharma (VoltCare EV & Battery)',
      phone: '+919833445566',
      emergency_contact: '+919833445500',
      created_at: new Date().toISOString()
    },
    {
      id: 'resp-vikram-03',
      role: 'responder',
      full_name: 'Vikram Singh (Hydraulic Towing Solutions)',
      phone: '+919844556677',
      emergency_contact: '+919844556600',
      created_at: new Date().toISOString()
    },
    {
      id: 'resp-arjun-04',
      role: 'responder',
      full_name: 'Arjun Patel (Apex Engine & Mechanical)',
      phone: '+919855667788',
      emergency_contact: '+919855667700',
      created_at: new Date().toISOString()
    },
    {
      id: 'resp-priya-05',
      role: 'responder',
      full_name: 'Dr. Priya V. (Road ResQ Trauma Medic)',
      phone: '+919866778899',
      emergency_contact: '+919866778800',
      created_at: new Date().toISOString()
    }
  ],
  responders: [
    {
      id: 'resp-rajesh-01',
      full_name: 'Rajesh Kumar',
      phone: '+919822334455',
      specialization: 'tyre_specialist',
      is_verified: true,
      rating: 4.95,
      total_rescues: 184,
      current_lat: 28.6139,
      current_lng: 77.2090,
      is_online: true,
      is_female: false,
      vehicle: 'Rapid Tyre Mobile Van (MH-02-CD-4421)'
    },
    {
      id: 'resp-anita-02',
      full_name: 'Anita Sharma',
      phone: '+919833445566',
      specialization: 'battery_technician',
      is_verified: true,
      rating: 4.98,
      total_rescues: 216,
      current_lat: 28.6250,
      current_lng: 77.2180,
      is_online: true,
      is_female: true,
      vehicle: 'VoltCare Rapid EV Support (DL-01-EV-8899)'
    },
    {
      id: 'resp-vikram-03',
      full_name: 'Vikram Singh',
      phone: '+919844556677',
      specialization: 'tow_truck',
      is_verified: true,
      rating: 4.89,
      total_rescues: 340,
      current_lat: 28.6320,
      current_lng: 77.2010,
      is_online: true,
      is_female: false,
      vehicle: 'Hydraulic Flatbed Tow (DL-04-TW-1092)'
    },
    {
      id: 'resp-arjun-04',
      full_name: 'Arjun Patel',
      phone: '+919855667788',
      specialization: 'general_mechanic',
      is_verified: true,
      rating: 4.88,
      total_rescues: 142,
      current_lat: 28.6080,
      current_lng: 77.2210,
      is_online: true,
      is_female: false,
      vehicle: 'Mobile Auto Workshop (DL-09-ME-3011)'
    },
    {
      id: 'resp-priya-05',
      full_name: 'Dr. Priya V.',
      phone: '+919866778899',
      specialization: 'medical_first_responder',
      is_verified: true,
      rating: 5.00,
      total_rescues: 79,
      current_lat: 28.6190,
      current_lng: 77.2150,
      is_online: true,
      is_female: true,
      vehicle: 'First ResQ Paramedic Bike (DL-02-AM-9911)'
    }
  ],
  emergencies: [],
  rescues: []
};

function loadLocalDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
    return INITIAL_DATA;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return { ...INITIAL_DATA, ...data };
  } catch (err) {
    console.error('Error reading local db file, re-initializing:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
    return INITIAL_DATA;
  }
}

function saveLocalDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving local db file:', err);
  }
}

let isSupabaseOnline = false;

// Probe Supabase once on boot
(async () => {
  try {
    const { error } = await supabase.from('emergencies').select('id').limit(1);
    if (!error) {
      isSupabaseOnline = true;
      console.log('✅ Supabase PostgreSQL is connected and schema cache is active.');
    } else {
      console.log('ℹ️ Supabase schema cache pending SQL migration. Using resilient repository.');
    }
  } catch {
    isSupabaseOnline = false;
  }
})();

export const Repository = {
  isSupabaseLive: () => isSupabaseOnline,

  // USERS
  async createUser(userData) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('users').insert(userData).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase fallback:', e.message);
      }
    }
    const db = loadLocalDb();
    const existingIdx = db.users.findIndex(u => u.id === userData.id || (userData.phone && u.phone === userData.phone));
    if (existingIdx >= 0) {
      db.users[existingIdx] = { ...db.users[existingIdx], ...userData };
      saveLocalDb(db);
      return db.users[existingIdx];
    }
    db.users.push(userData);
    saveLocalDb(db);
    return userData;
  },

  async getUserById(id) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    return db.users.find(u => u.id === id) || null;
  },

  async getUserByPhone(phone) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    return db.users.find(u => u.phone === phone) || null;
  },

  // RESPONDERS
  async getResponders(filter = {}) {
    if (isSupabaseOnline) {
      try {
        let query = supabase.from('responders').select('*');
        if (filter.isOnline !== undefined) query = query.eq('is_online', filter.isOnline);
        if (filter.specialization) query = query.eq('specialization', filter.specialization);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    return db.responders.filter(r => {
      if (filter.isOnline !== undefined && r.is_online !== filter.isOnline) return false;
      if (filter.specialization && r.specialization !== filter.specialization) return false;
      return true;
    });
  },

  async getResponderById(id) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('responders').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    return db.responders.find(r => r.id === id) || null;
  },

  async updateResponder(id, updates) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('responders').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    const idx = db.responders.findIndex(r => r.id === id);
    if (idx >= 0) {
      db.responders[idx] = { ...db.responders[idx], ...updates };
      saveLocalDb(db);
      return db.responders[idx];
    }
    return null;
  },

  // EMERGENCIES
  async createEmergency(emergencyData) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('emergencies').insert(emergencyData).select().single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    db.emergencies.push(emergencyData);
    saveLocalDb(db);
    return emergencyData;
  },

  async getEmergencyById(id) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('emergencies').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    return db.emergencies.find(e => e.id === id) || null;
  },

  async updateEmergency(id, updates) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('emergencies').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    const idx = db.emergencies.findIndex(e => e.id === id);
    if (idx >= 0) {
      db.emergencies[idx] = { ...db.emergencies[idx], ...updates };
      saveLocalDb(db);
      return db.emergencies[idx];
    }
    return null;
  },

  async listEmergencies() {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('emergencies').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    return [...db.emergencies].reverse();
  },

  // RESCUES
  async createRescue(rescueData) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('rescues').insert(rescueData).select().single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    db.rescues.push(rescueData);
    saveLocalDb(db);
    return rescueData;
  },

  async getRescueById(id) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('rescues').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    return db.rescues.find(r => r.id === id) || null;
  },

  async getRescuesByEmergencyId(emergencyId) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('rescues').select('*').eq('emergency_id', emergencyId);
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    return db.rescues.filter(r => r.emergency_id === emergencyId);
  },

  async getRescuesByResponderId(responderId) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('rescues').select('*').eq('responder_id', responderId);
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    return db.rescues.filter(r => r.responder_id === responderId);
  },

  async updateRescue(id, updates) {
    if (isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('rescues').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (e) {}
    }
    const db = loadLocalDb();
    const idx = db.rescues.findIndex(r => r.id === id);
    if (idx >= 0) {
      db.rescues[idx] = { ...db.rescues[idx], ...updates };
      saveLocalDb(db);
      return db.rescues[idx];
    }
    return null;
  }
};
