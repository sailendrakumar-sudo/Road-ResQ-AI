import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, MicOff, Upload, X, Car, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';

const QUICK_TAGS = [
  { label: 'Flat Tyre / Puncture', text: 'Front tyre punctured on roadside, rim touching road' },
  { label: 'Engine Smoking', text: 'Thick white smoke coming out of car engine hood, temperature gauge high' },
  { label: 'Dead Battery', text: 'Car won\'t start, clicking sound from ignition, lights are dim' },
  { label: 'Accident / Collision', text: 'Rear collision impact, vehicle bumper damaged, need urgent roadside assistance' },
  { label: 'Need Tow Truck', text: 'Car engine seized and transmission locked, vehicle completely immobilized, need flatbed tow' },
  { label: 'Empty EV Battery', text: 'Electric vehicle battery at 0%, stranded without charging station' }
];

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Two-Wheeler', 'EV', 'Commercial'];

export default function MultimodalInput({
  description,
  setDescription,
  imageUrl,
  setImageUrl,
  vehicleType,
  setVehicleType,
  isNight,
  setIsNight
}) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const fileInputRef = useRef(null);

  // Check speech recognition support
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.warn('Speech error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Provide realistic sample photo
  const handleSamplePhoto = () => {
    setImageUrl('https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80');
  };

  return (
    <div className="space-y-4">
      {/* Vehicle Type Pills */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Vehicle Category
        </label>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setVehicleType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                vehicleType === type
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Multimodal Text Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Emergency Description (Text, Voice, or Quick Tags)
          </label>
          {speechSupported && (
            <span className="text-[11px] text-slate-400">
              {isListening ? '🎙️ Listening to speech...' : 'Press Mic to speak'}
            </span>
          )}
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 focus-within:border-blue-500 transition-all">
          <textarea
            id="emergency-description-input"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened... (e.g. 'Car tyre punctured on highway shoulder', 'Smoking engine', 'Battery dead won\'t start')"
            className="w-full bg-transparent p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
          />

          {/* Action toolbar inside input */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border-t border-slate-700/60">
            <div className="flex items-center gap-2">
              {/* Mic button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                title={speechSupported ? 'Record Voice Diagnosis' : 'Speech recognition unavailable'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-400" />}
                <span className="text-[11px] hidden sm:inline">{isListening ? 'Stop' : 'Voice Input'}</span>
              </button>

              {/* Camera Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] hidden sm:inline">Upload Breakdown Photo</span>
              </button>

              {/* Sample Photo Button */}
              {!imageUrl && (
                <button
                  type="button"
                  onClick={handleSamplePhoto}
                  className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] hidden md:inline">Use Sample Photo</span>
                </button>
              )}
            </div>

            {/* Night Time Toggle */}
            <button
              type="button"
              onClick={() => setIsNight(!isNight)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                isNight
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-700 text-slate-400 border-slate-600'
              }`}
            >
              {isNight ? '🌙 Nighttime Active' : '☀️ Daytime'}
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Banner */}
      {imageUrl && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 p-2 flex items-center gap-3">
          <img
            src={imageUrl}
            alt="Breakdown capture"
            className="w-16 h-16 object-cover rounded-xl border border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Breakdown Image Attached
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Multimodal Gemini 1.5 Pro vision engine will inspect visual damage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Emergency Tags */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          One-Click Breakdown Scenarios
        </label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => setDescription(tag.text)}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-left"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
