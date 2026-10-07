import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { register, getRespondersList, updateResponderState, getMe } from '../controllers/auth.controller.js';
import { reportEmergency, getEmergency, listEmergencies, triggerSOS } from '../controllers/emergency.controller.js';
import { matchDispatch, getRescue, updateRescueStatus, updateResponderLocation } from '../controllers/rescue.controller.js';
import { Repository } from '../db/repository.js';

const router = Router();

// Health & System status
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    supabaseLive: Repository.isSupabaseLive(),
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Auth & Users
router.post('/auth/register', register);
router.get('/auth/me', authenticate, getMe);
router.get('/responders', getRespondersList);
router.patch('/responders/:id/status', updateResponderState);

// Emergency Routes
router.post('/emergency/report', authenticate, reportEmergency);
router.get('/emergency/:id', getEmergency);
router.get('/emergencies', listEmergencies);
router.post('/emergency/:id/sos', triggerSOS);

// Dispatch & Rescues
router.post('/dispatch/match', authenticate, matchDispatch);
router.get('/rescue/:rescueId', getRescue);
router.patch('/rescue/:rescueId/status', updateRescueStatus);
router.patch('/responder/:responderId/location', updateResponderLocation);

export default router;
