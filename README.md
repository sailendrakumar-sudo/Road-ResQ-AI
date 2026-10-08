# 🚨 Road ResQ AI — *From Breakdown to Safety.*

An intelligent, multimodal, multilingual, and agentic AI-powered roadside rescue platform. Road ResQ AI does not just answer *"Where is the nearest mechanic?"*—it answers: **"What is happening, who is the safest and most qualified responder, how quickly can they arrive, and what is the autonomous contingency plan if on-site repair fails?"**

---

## 🌟 Key Features

1. **Multimodal Emergency Reporting**
   - Live photo upload for visual engine/puncture assessment.
   - Hands-free voice speech recognition (Web Speech API) and real-time transcription.
   - One-tap symptom quick tags (Flat Tyre, Overheating Smoke, Dead Battery, Collision, Need Tow).
   - Vehicle selector (Sedan, SUV, Two-Wheeler, EV, Commercial).

2. **Gemini 1.5 Pro AI Diagnosis & Safety Triaging**
   - Multimodal mechanical diagnosis (`ai_diagnosis`).
   - Dynamic Risk Score computation (0-100) with vulnerability multipliers.
   - Immediate life-safety advisories (e.g., *"DO NOT open the radiator cap! Boiling coolant under pressure will violently erupt"*).
   - Fair Pricing Engine: transparent cost boundaries (₹ min - max) calculated before dispatch.

3. **Autonomous Agentic Re-Planning Loop**
   - If an on-site technician marks a repair as **"Failed"** (e.g. cracked engine block, shredded tire rim, burnt EV inverter):
   - The AI Orchestrator reasons over the failure reason and automatically coordinates a **Heavy Hydraulic Flatbed Tow Truck** with direct routing to the nearest authorized workshop—**without requiring user re-entry**.

4. **Women Safe Mode**
   - Night-time and remote highway vulnerability escalation.
   - Algorithmic filtering: only verified 5★ responders (≥4.8★) eligible.
   - Priority dispatch bonus for accredited female technicians.
   - Shielded GPS coordinates: exact location is withheld until responder acceptance.
   - Automated emergency SMS sync to trusted guardians.

5. **Multi-Factor Suitability Score Matching**
   - Matches responders using a weighted score:
     $$\text{Score} = (\text{Specialization} \times 35) + (\text{Proximity} \times 25) + (\text{Rating} \times 20) + (\text{Verification} \times 10) + (\text{Demographic Safety} \times 10)$$

6. **One-Tap SOS Escalation**
   - High-contrast floating SOS action button with audio/visual flash.
   - Dispatches priority distress telemetry to highway patrol and trusted contacts.

7. **Low-Network Mode Simulation**
   - Gracefully compresses breakdown reports into lightweight SMS-ready fallback payloads during poor cellular reception.

---

## 🛠️ Technology Stack

- **Frontend:** React 19 (Vite), Tailwind CSS, Lucide React, Leaflet & React-Leaflet.
- **Backend:** Node.js with Express.js, CORS, Multer.
- **AI SDK:** Official `@google/genai` SDK (`gemini-1.5-pro` & `gemini-1.5-flash`) with autonomous heuristic fallback engine.
- **Database & Auth:** Supabase (PostgreSQL with RLS policies, Supabase Auth).
- **Validation:** Zod schema enforcement on all API routes.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ or v24+)
- npm

### 2. Environment Variables Setup

**Server (`server/.env`):**
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

**Client (`client/.env`):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

### 3. Run Backend Server
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 4. Run Frontend Client
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5174
```

---

## 🗄️ Supabase PostgreSQL Setup

Execute the provided schema in your Supabase SQL Editor:
👉 File: [`supabase-schema.sql`](file:///d:/Road%20ResQ%20AI/supabase-schema.sql)

It configures:
- `users`: Traveler and responder accounts.
- `responders`: Verified fleet ratings, specializations, and coordinates.
- `emergencies`: Multimodal incident reports, risk scores, and AI diagnoses.
- `rescues`: Active dispatches, status progression, and re-planning logs.
- Row-Level Security (RLS) policies for data isolation.

---

## 📱 Application Routes

| Route | Description |
|---|---|
| `/` | Landing Page with high-contrast emergency CTA & architectural overview |
| `/auth` | Authentication with one-click demo profiles (Priya, Rajesh, Anita, Vikram) |
| `/dashboard` | Traveler Home with live radar map & active breakdown cards |
| `/emergency/report` | Multimodal intake (Voice mic, camera capture, quick breakdown scenarios) |
| `/emergency/tracking/:rescueId` | Live map, moving responder simulation, ETA countdown, SOS escalation |
| `/mechanic/dashboard` | Responder console, incoming dispatch alerts, suitability breakdown |
| `/mechanic/job/:rescueId` | Job execution, status transitions, and "Repair Failed" Agentic Re-planning trigger |

---

## 👥 Demo Credentials & Test Personas

- **Traveler:** Priya Sharma (`+919876543210`)
- **Tyre Specialist:** Rajesh Kumar (`+919822334455`, 4.95★)
- **Battery/EV Specialist (Safe Mode):** Anita Sharma (`+919833445566`, 4.98★)
- **Tow Truck Operator:** Vikram Singh (`+919844556677`, 4.89★)
