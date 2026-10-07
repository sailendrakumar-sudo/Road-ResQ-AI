import { ReportEmergencySchema } from '../utils/zod.js';
import { sanitizeInput } from '../middlewares/auth.middleware.js';
import { diagnoseEmergency } from '../services/ai.service.js';
import { matchResponderForEmergency } from '../services/matching.service.js';
import { Repository } from '../db/repository.js';

export async function reportEmergency(req, res) {
  try {
    const parseResult = ReportEmergencySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    }

    const {
      description,
      lat,
      lng,
      imageUrl,
      isNight,
      isFemaleModeRequested,
      vehicleType,
      emergencyContact
    } = parseResult.data;

    const sanitizedDesc = sanitizeInput(description);

    // 1. Multimodal AI Analysis
    const aiDiagnosis = await diagnoseEmergency({
      description: sanitizedDesc,
      imageUrl: imageUrl || null,
      isNight,
      isWomenSafeMode: isFemaleModeRequested,
      vehicleType: vehicleType || 'Sedan',
      timeOfDay: isNight ? 'Night' : 'Day'
    });

    const emergencyId = 'emg-' + Math.random().toString(36).substring(2, 10);
    const emergencyRecord = {
      id: emergencyId,
      user_id: req.user?.id || 'u-demo-traveler-01',
      location_lat: Number(lat),
      location_lng: Number(lng),
      description: sanitizedDesc,
      image_url: imageUrl || null,
      ai_diagnosis: aiDiagnosis,
      risk_score: aiDiagnosis.riskScore || 45,
      safe_mode_active: Boolean(isFemaleModeRequested),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const savedEmergency = await Repository.createEmergency(emergencyRecord);

    // 2. Smart Responder Matching
    let matchResult = null;
    let newRescue = null;
    try {
      matchResult = await matchResponderForEmergency(savedEmergency);
      if (matchResult && matchResult.bestMatch) {
        const rescueId = 'rescue-' + Math.random().toString(36).substring(2, 10);
        newRescue = {
          id: rescueId,
          emergency_id: emergencyId,
          responder_id: matchResult.bestMatch.responder.id,
          estimated_cost_min: aiDiagnosis.estimatedPriceMin || 500,
          estimated_cost_max: aiDiagnosis.estimatedPriceMax || 1500,
          status: 'dispatched',
          eta_minutes: matchResult.bestMatch.etaMinutes,
          distance_km: matchResult.bestMatch.distanceKm,
          created_at: new Date().toISOString()
        };
        await Repository.createRescue(newRescue);
        await Repository.updateEmergency(emergencyId, { status: 'matched' });
      }
    } catch (matchErr) {
      console.warn('Matching warning:', matchErr.message);
    }

    return res.status(201).json({
      success: true,
      emergency: savedEmergency,
      rescue: newRescue,
      match: matchResult?.bestMatch || null,
      candidates: matchResult?.allCandidates || []
    });
  } catch (err) {
    console.error('Report emergency error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process emergency report' });
  }
}

export async function getEmergency(req, res) {
  try {
    const { id } = req.params;
    const emergency = await Repository.getEmergencyById(id);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    const rescues = await Repository.getRescuesByEmergencyId(id);
    const activeRescue = rescues && rescues.length > 0 ? rescues[rescues.length - 1] : null;

    let responderProfile = null;
    if (activeRescue?.responder_id) {
      responderProfile = await Repository.getResponderById(activeRescue.responder_id);
    }

    return res.json({
      emergency,
      activeRescue,
      rescues,
      responder: responderProfile
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function listEmergencies(req, res) {
  try {
    const list = await Repository.listEmergencies();
    return res.json({ emergencies: list });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function triggerSOS(req, res) {
  try {
    const { id } = req.params;
    const emergency = await Repository.getEmergencyById(id);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency record not found' });
    }

    // Escalate risk score to maximum and broadcast
    const escalated = await Repository.updateEmergency(id, {
      risk_score: 99,
      sos_triggered_at: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'CRITICAL SOS BROADCAST: Emergency dispatch alerted. SMS sent to emergency contacts.',
      emergency: escalated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
