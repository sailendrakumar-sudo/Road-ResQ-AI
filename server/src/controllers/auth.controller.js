import { RegisterUserSchema } from '../utils/zod.js';
import { Repository } from '../db/repository.js';
import { supabase } from '../db/supabase.js';

export async function register(req, res) {
  try {
    const parseResult = RegisterUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    }

    const { phone, fullName, role, emergencyContact, specialization } = parseResult.data;
    const userId = 'u-' + Math.random().toString(36).substring(2, 9);

    const newUser = {
      id: userId,
      role,
      full_name: fullName,
      phone,
      emergency_contact: emergencyContact || null,
      created_at: new Date().toISOString()
    };

    const savedUser = await Repository.createUser(newUser);

    if (role === 'responder') {
      const responderProfile = {
        id: userId,
        specialization: specialization || 'general_mechanic',
        is_verified: true,
        rating: 5.0,
        total_rescues: 0,
        current_lat: 28.6139,
        current_lng: 77.2090,
        is_online: true
      };
      await Repository.updateResponder(userId, responderProfile);
    }

    return res.status(201).json({
      message: 'Registration successful',
      user: savedUser,
      token: `demo-${role === 'responder' ? 'responder-' + userId : 'traveler-token'}`
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

export async function getRespondersList(req, res) {
  try {
    const responders = await Repository.getResponders();
    return res.json({ responders });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateResponderState(req, res) {
  try {
    const { id } = req.params;
    const { isOnline, lat, lng } = req.body;
    const updates = {};
    if (isOnline !== undefined) updates.is_online = isOnline;
    if (lat !== undefined) updates.current_lat = lat;
    if (lng !== undefined) updates.current_lng = lng;

    const updated = await Repository.updateResponder(id, updates);
    return res.json({ success: true, responder: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getMe(req, res) {
  return res.json({ user: req.user });
}
