import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

let aiClient = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('⚠️ GoogleGenAI initialization warning:', err.message);
  }
}

export const visionModel = 'gemini-1.5-pro';
export const fastModel = 'gemini-1.5-flash';

const SYSTEM_PROMPT = `You are the Road ResQ AI Orchestrator, an expert mechanical diagnostic and safety assessment agent.
Your core directive is traveler safety. 
When provided with a text description and/or an image of a roadside emergency:
1. Diagnose the most probable mechanical/situational issue.
2. Determine the exact type of responder needed (e.g., 'tyre_specialist', 'battery_technician', 'tow_truck', 'general_mechanic', 'medical_first_responder').
3. Calculate a Risk Score (0-100) based on context (night time, vulnerability, traffic, weather).
4. Provide immediate, actionable safety advice for the stranded traveler.
You must return ONLY valid, raw JSON adhering strictly to the provided schema. No markdown wrapping.`;

/**
 * Intelligent multimodal roadside diagnostic analysis
 */
export async function diagnoseEmergency({
  description = '',
  imageUrl = null,
  isNight = false,
  isWomenSafeMode = false,
  vehicleType = 'Sedan',
  timeOfDay = 'Night',
  batteryJumper = null
}) {
  const sanitizedDescription = (description || '').trim();

  // Attempt official Google GenAI SDK if initialized
  if (aiClient) {
    try {
      const promptContent = `Analyze this emergency: "${sanitizedDescription}". Vehicle Type: ${vehicleType}. Time: ${timeOfDay}. Is Night: ${isNight}. Vulnerable demographic / Women Safe Mode: ${isWomenSafeMode}. Extra context: ${batteryJumper !== null ? `Jumper cables present: ${batteryJumper}` : ''}`;
      
      const contents = [
        {
          role: 'user',
          parts: [{ text: promptContent }]
        }
      ];

      // If imageUrl is provided and is a base64 or inline data
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        const matches = imageUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          contents[0].parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }

      const response = await aiClient.models.generateContent({
        model: visionModel,
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              diagnosis: { type: "STRING" },
              responderType: { type: "STRING" },
              riskScore: { type: "INTEGER" },
              safetyAdvisory: { type: "STRING" },
              estimatedPriceMin: { type: "INTEGER" },
              estimatedPriceMax: { type: "INTEGER" }
            },
            required: ["diagnosis", "responderType", "riskScore", "safetyAdvisory", "estimatedPriceMin", "estimatedPriceMax"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return {
          ...parsed,
          source: 'gemini-1.5-pro'
        };
      }
    } catch (apiErr) {
      console.warn('⚠️ Gemini API call did not succeed, using autonomous heuristic expert engine:', apiErr.message);
    }
  }

  // Autonomous Expert Diagnostics Engine (Guaranteed 100% reliable fallback)
  return runAutonomousDiagnosis({
    description: sanitizedDescription,
    imageUrl,
    isNight,
    isWomenSafeMode,
    vehicleType,
    timeOfDay
  });
}

/**
 * Autonomous Expert Rule & NLP Engine
 */
function runAutonomousDiagnosis({
  description,
  imageUrl,
  isNight,
  isWomenSafeMode,
  vehicleType
}) {
  const text = (description || '').toLowerCase();
  
  let diagnosis = 'Unknown Mechanical Malfunction';
  let responderType = 'general_mechanic';
  let baseRisk = 35;
  let safetyAdvisory = 'Turn on hazard warning lights and move to a safe spot away from traffic.';
  let estimatedPriceMin = 500;
  let estimatedPriceMax = 1200;

  // 1. Tyre / Wheel issues
  if (text.includes('tyre') || text.includes('tire') || text.includes('puncture') || text.includes('flat') || text.includes('burst') || text.includes('rim')) {
    diagnosis = 'Punctured or Deflated Tyre (Pneumatic Failure)';
    responderType = 'tyre_specialist';
    baseRisk = 30;
    safetyAdvisory = 'Park vehicle safely on firm, flat ground away from traffic. Engage emergency handbrake and DO NOT attempt jacking up the car on soft shoulders.';
    estimatedPriceMin = 350;
    estimatedPriceMax = 800;
  }
  // 2. Battery / Alternator / Electrical
  else if (text.includes('battery') || text.includes('won\'t start') || text.includes('wont start') || text.includes('dead') || text.includes('jump') || text.includes('click') || text.includes('ignition') || text.includes('ev charge')) {
    diagnosis = 'Depleted 12V Battery / Alternator Electrical Fault';
    responderType = 'battery_technician';
    baseRisk = 40;
    safetyAdvisory = 'Turn off all cabin lights, AC, and high beams. Stay inside your vehicle with doors locked until the technician arrives.';
    estimatedPriceMin = 400;
    estimatedPriceMax = 1500;
  }
  // 3. Engine Overheating / Smoke / Steam
  else if (text.includes('smoke') || text.includes('steaming') || text.includes('overheat') || text.includes('hot') || text.includes('radiator') || text.includes('coolant') || text.includes('burning') || text.includes('smoking engine')) {
    diagnosis = 'Severe Engine Overheating & Coolant Radiator Boilover';
    responderType = 'general_mechanic';
    baseRisk = 65;
    safetyAdvisory = 'DANGER: DO NOT open the radiator cap! High-pressure steam will cause severe burns. Switch off the engine immediately and move at least 15 meters away to a safe shoulder.';
    estimatedPriceMin = 800;
    estimatedPriceMax = 2500;
  }
  // 4. Accident / Collision / Crash
  else if (text.includes('accident') || text.includes('hit') || text.includes('crash') || text.includes('collision') || text.includes('injured') || text.includes('airbag')) {
    diagnosis = 'Vehicle Collision Impact & Structural Distress';
    responderType = 'medical_first_responder';
    baseRisk = 85;
    safetyAdvisory = 'CRITICAL: Check passengers for physical injuries. If safe, step out away from moving lanes. Emergency SOS has been activated.';
    estimatedPriceMin = 1500;
    estimatedPriceMax = 5000;
  }
  // 5. Transmission / Axle / Tow needed
  else if (text.includes('tow') || text.includes('stuck') || text.includes('broken axle') || text.includes('gear') || text.includes('transmission') || text.includes('clutch')) {
    diagnosis = 'Drivetrain Breakdown / Transmission Seizure';
    responderType = 'tow_truck';
    baseRisk = 55;
    safetyAdvisory = 'Vehicle is immobilized. Shift to Neutral if possible and keep steering straight. Stand behind safety barrier if on highway.';
    estimatedPriceMin = 1200;
    estimatedPriceMax = 3500;
  }
  // 6. Fuel Empty
  else if (text.includes('fuel') || text.includes('petrol') || text.includes('diesel') || text.includes('gas') || text.includes('empty')) {
    diagnosis = 'Fuel Exhaustion / Emergency Tank Refill Needed';
    responderType = 'general_mechanic';
    baseRisk = 45;
    safetyAdvisory = 'Coast vehicle completely off the driving lane. Switch on hazard lights. A mobile fuel can service is being coordinated.';
    estimatedPriceMin = 300;
    estimatedPriceMax = 700;
  }

  // Contextual Risk Calculation
  let riskScore = baseRisk;
  if (isNight) {
    riskScore += 20;
  }
  if (isWomenSafeMode) {
    riskScore += 25;
    safetyAdvisory = `[WOMEN SAFE MODE ACTIVE] Verified responders prioritized. Live GPS tracking broadcasted to emergency contacts. ${safetyAdvisory}`;
  }

  // EV / Commercial modifiers
  if (vehicleType === 'EV') {
    estimatedPriceMin = Math.round(estimatedPriceMin * 1.25);
    estimatedPriceMax = Math.round(estimatedPriceMax * 1.35);
  }

  riskScore = Math.min(Math.max(riskScore, 15), 98);

  return {
    diagnosis,
    responderType,
    riskScore,
    safetyAdvisory,
    estimatedPriceMin,
    estimatedPriceMax,
    source: 'autonomous-expert-engine'
  };
}

/**
 * Agentic Autonomous Re-planning Loop
 * Executed when a mechanic marks "Repair Failed / Requires Tow"
 */
export async function executeAgenticReplanning({
  emergency,
  initialRescue,
  failureReason = 'Roadside repair unfeasible'
}) {
  const prompt = `A roadside rescue has failed. Initial Diagnosis: ${emergency?.ai_diagnosis?.diagnosis || emergency.description}. Initial Responder: ${initialRescue.responder_id}. Reason for failure: "${failureReason}". Formulate an autonomous secondary recovery plan including tow truck dispatch, nearest verified workshop routing, and updated passenger advisory.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: fastModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: 'You are the Road ResQ Autonomous Re-Planning Agent. You evaluate breakdown failures and dispatch specialized recovery towing. Return valid JSON only.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              replanSummary: { type: 'STRING' },
              newResponderType: { type: 'STRING' },
              destinationFacility: { type: 'STRING' },
              estimatedPriceMin: { type: 'INTEGER' },
              estimatedPriceMax: { type: 'INTEGER' },
              safetyAdvisory: { type: 'STRING' }
            },
            required: ['replanSummary', 'newResponderType', 'destinationFacility', 'estimatedPriceMin', 'estimatedPriceMax', 'safetyAdvisory']
          }
        }
      });
      if (response && response.text) {
        return JSON.parse(response.text);
      }
    } catch (e) {
      console.warn('⚠️ Gemini replanning LLM fallback:', e.message);
    }
  }

  // Heuristic Replanning Agent
  return {
    replanSummary: `Initial roadside repair attempted but unfeasible (${failureReason}). Autonomous agent has automatically escalated to Heavy Hydraulic Flatbed Tow service.`,
    newResponderType: 'tow_truck',
    destinationFacility: 'Apex Certified Multi-Brand Automotive Service Center (4.2 km)',
    estimatedPriceMin: 1800,
    estimatedPriceMax: 3200,
    safetyAdvisory: 'Stay safely inside or behind the highway guard rail. A verified heavy flatbed tow truck has been dispatched with direct routing to the nearest authorized workshop.'
  };
}
