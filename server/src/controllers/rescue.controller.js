import { RescueUpdateSchema } from '../utils/zod.js';
import { executeAgenticReplanning } from '../services/ai.service.js';
import { matchResponderForEmergency, calculateDistance, calculateETA } from '../services/matching.service.js';
import { Repository } from '../db/repository.js';

export async function getRescue(req, res) {
  try {
    const { rescueId } = req.params;
    const rescue = await Repository.getRescueById(rescueId);
    if (!rescue) {
      return res.status(404).json({ error: 'Rescue not found' });
    }

    const emergency = await Repository.getEmergencyById(rescue.emergency_id);
    const responder = await Repository.getResponderById(rescue.responder_id);

    // Compute live distance & ETA if coordinates available
    let liveDistance = 2.4;
    let liveEta = 8;
    if (emergency && responder) {
      liveDistance = calculateDistance(
        emergency.location_lat,
        emergency.location_lng,
        responder.current_lat,
        responder.current_lng
      );
      liveEta = calculateETA(liveDistance);
    }

    return res.json({
      rescue,
      emergency,
      responder,
      liveDistance,
      liveEta
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function matchDispatch(req, res) {
  try {
    const { emergencyId } = req.body;
    const emergency = await Repository.getEmergencyById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    const matchResult = await matchResponderForEmergency(emergency);
    return res.json(matchResult);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateRescueStatus(req, res) {
  try {
    const { rescueId } = req.params;
    const parseResult = RescueUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parseResult.error.format() });
    }

    const { status, failureReason } = parseResult.data;
    const currentRescue = await Repository.getRescueById(rescueId);
    if (!currentRescue) {
      return res.status(404).json({ error: 'Rescue not found' });
    }

    const emergency = await Repository.getEmergencyById(currentRescue.emergency_id);

    // ==========================================
    // AGENTIC RE-PLANNING LOOP
    // Triggered if mechanic marks repair as 'failed'
    // ==========================================
    if (status === 'failed') {
      const reason = failureReason || 'Mechanical damage too severe for on-site repair';
      
      // 1. Mark current rescue as failed
      await Repository.updateRescue(rescueId, {
        status: 'failed',
        failure_reason: reason,
        failed_at: new Date().toISOString()
      });

      // 2. Mark emergency as re_planning
      await Repository.updateEmergency(emergency.id, {
        status: 're_planning'
      });

      // 3. Autonomous AI Orchestration: Re-plan to dispatch Tow Truck
      const replanPlan = await executeAgenticReplanning({
        emergency,
        initialRescue: currentRescue,
        failureReason: reason
      });

      // 4. Find nearest Tow Truck responder
      const allResponders = await Repository.getResponders({ isOnline: true });
      let towResponder = allResponders.find(r => r.specialization === 'tow_truck');
      if (!towResponder) {
        // Fallback to heavy vehicle responder or any verified
        towResponder = allResponders.find(r => r.is_verified) || allResponders[0];
      }

      // 5. Autonomously create secondary rescue dispatch
      const secondaryRescueId = 'rescue-tow-' + Math.random().toString(36).substring(2, 9);
      const secondaryRescue = {
        id: secondaryRescueId,
        emergency_id: emergency.id,
        responder_id: towResponder?.id || 'resp-vikram-03',
        is_replan: true,
        previous_rescue_id: rescueId,
        replan_reason: reason,
        replan_summary: replanPlan.replanSummary,
        destination_facility: replanPlan.destinationFacility,
        estimated_cost_min: replanPlan.estimatedPriceMin,
        estimated_cost_max: replanPlan.estimatedPriceMax,
        status: 'dispatched',
        created_at: new Date().toISOString()
      };

      await Repository.createRescue(secondaryRescue);

      // 6. Update emergency record with new dispatch & updated safety advisory
      const updatedEmergency = await Repository.updateEmergency(emergency.id, {
        status: 'matched',
        active_rescue_id: secondaryRescueId,
        ai_diagnosis: {
          ...emergency.ai_diagnosis,
          safetyAdvisory: replanPlan.safetyAdvisory,
          replanActive: true,
          replanReason: reason,
          destinationFacility: replanPlan.destinationFacility
        }
      });

      return res.json({
        success: true,
        replanTriggered: true,
        replanPlan,
        previousRescue: { ...currentRescue, status: 'failed' },
        newRescue: secondaryRescue,
        towResponder,
        emergency: updatedEmergency
      });
    }

    // Normal status progression (arrived, completed)
    const updatedRescue = await Repository.updateRescue(rescueId, {
      status,
      updated_at: new Date().toISOString()
    });

    if (status === 'completed') {
      await Repository.updateEmergency(emergency.id, { status: 'resolved' });
    } else if (status === 'arrived') {
      await Repository.updateEmergency(emergency.id, { status: 'en_route' });
    }

    return res.json({
      success: true,
      rescue: updatedRescue,
      emergency
    });
  } catch (err) {
    console.error('Update rescue status error:', err);
    return res.status(500).json({ error: err.message });
  }
}

export async function updateResponderLocation(req, res) {
  try {
    const { responderId } = req.params;
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Lat and lng required' });
    }

    const updated = await Repository.updateResponder(responderId, {
      current_lat: Number(lat),
      current_lng: Number(lng)
    });

    return res.json({ success: true, responder: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
