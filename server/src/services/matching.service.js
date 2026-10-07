import { Repository } from '../db/repository.js';

/**
 * Calculate distance in kilometers between two lat/lng coordinates (Haversine formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate estimated time of arrival (ETA) in minutes
 */
export function calculateETA(distanceKm) {
  // Average city emergency speed ~ 30 km/h => 2 mins per km + 4 mins preparation buffer
  const minutes = Math.max(5, Math.round(distanceKm * 2.2 + 4));
  return minutes;
}

/**
 * Smart Matching Algorithm
 * Calculates Suitability Score:
 * Score = (Specialization Match * 35) + (Proximity * 25) + (Rating * 20) + (Verification * 10) + (Demographic Safe Bonus * 10)
 */
export async function matchResponderForEmergency(emergency) {
  const responders = await Repository.getResponders({ isOnline: true });
  
  if (!responders || responders.length === 0) {
    throw new Error('No active responders currently available in the network.');
  }

  const requestedType = emergency.ai_diagnosis?.responderType || 'general_mechanic';
  const isSafeMode = emergency.safe_mode_active === true;
  const userLat = emergency.location_lat || 28.6139;
  const userLng = emergency.location_lng || 77.2090;

  // Filter responders based on safety criteria
  let eligibleResponders = responders;
  if (isSafeMode) {
    // Women Safe Mode: Require verified and rating >= 4.7
    eligibleResponders = responders.filter(r => r.is_verified && Number(r.rating) >= 4.7);
    if (eligibleResponders.length === 0) {
      // Graceful fallback to verified if none >= 4.7
      eligibleResponders = responders.filter(r => r.is_verified);
    }
  }

  // Calculate scores for each eligible responder
  const scoredResponders = eligibleResponders.map(responder => {
    const distanceKm = calculateDistance(
      userLat,
      userLng,
      responder.current_lat || 28.6139,
      responder.current_lng || 77.2090
    );
    const etaMinutes = calculateETA(distanceKm);

    // 1. Specialization Score (max 35)
    let specScore = 10;
    if (responder.specialization === requestedType) {
      specScore = 35; // Exact match
    } else if (responder.specialization === 'general_mechanic' && requestedType !== 'medical_first_responder') {
      specScore = 24; // General mechanic can handle basic tyre/battery/engine
    } else if (requestedType === 'tow_truck' && responder.specialization === 'tow_truck') {
      specScore = 35;
    }

    // 2. Proximity Score (max 25)
    // Closer is better. Under 3km gives full points, decays linearly up to 25km
    const proximityScore = Math.max(0, Math.round(25 - (distanceKm * 0.9)));

    // 3. Rating Score (max 20)
    // 5.0 rating = 20 pts, 4.0 rating = 14 pts
    const ratingScore = Math.round((Number(responder.rating || 4.5) / 5) * 20);

    // 4. Verification Bonus (max 10)
    const verificationScore = responder.is_verified ? 10 : 0;

    // 5. Women Safe Mode Demographic Bonus (max 10)
    let safeModeBonus = 0;
    if (isSafeMode) {
      if (responder.is_female) {
        safeModeBonus = 15; // Prioritize female mechanic/responder
      } else if (Number(responder.rating) >= 4.9) {
        safeModeBonus = 10; // Top-tier verified male responder
      }
    }

    const suitabilityScore = Math.min(100, specScore + proximityScore + ratingScore + verificationScore + safeModeBonus);

    return {
      responder,
      distanceKm,
      etaMinutes,
      suitabilityScore,
      scoreBreakdown: {
        specialization: specScore,
        proximity: proximityScore,
        rating: ratingScore,
        verification: verificationScore,
        safeModeBonus
      }
    };
  });

  // Sort descending by Suitability Score
  scoredResponders.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const bestMatch = scoredResponders[0];

  return {
    bestMatch,
    allCandidates: scoredResponders
  };
}
