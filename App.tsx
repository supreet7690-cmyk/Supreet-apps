import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Home, Calculator, Building2, Bell, Trash2, Award, Globe, Droplet, Zap, Leaf, 
  AlertCircle, CheckCircle, TrendingUp, MapPin, Clock, Search, X, Trophy, Target, 
  Users, Sparkles, ChevronRight, Camera, Flame, Lightbulb, RefreshCw, Sprout, 
  TreeDeciduous, Gift, Share2, Heart, Recycle, ShoppingBag, User, LogOut, Menu,
  Settings, ArrowRight, Plus, IndianRupee, Utensils, ChefHat, Mic, Volume2, StopCircle, AudioWaveform, Map,
  MessageCircle, ScanLine, Send, AlertTriangle, Coins, Lock, Phone, ArrowLeft, ShieldCheck, Thermometer, Brain, HelpCircle,
  Moon, Sun, Image as ImageIcon, Crop, Check, RotateCw, CameraOff, ZoomIn, ZoomOut, Cloud, Edit, Briefcase, BarChart3, Upload,
  Info, Globe2, ShoppingCart, Activity, Train, Car, Bus, Palette, Hammer, Scissors, Package, Bike, Footprints, PenSquare, Languages, Mail, PieChart as PieChartIcon, Sun as SunIcon, CloudRain, BatteryCharging,
  BookOpen
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { analyzeWasteItem, getCityEcoData, calculateImpact, getSmartSubstitution, analyzeBill, getLeftoverRecipes, findRecyclingCenters, chatWithAi, analyzeImageDeep, getAiClient, getEcoQuiz, getGardenAdvice, generateMarketItemDetails, analyzeGreenTech } from './services/geminiService';
import { Challenge, UserProfile, Reminder, CityData, WasteAnalysis, ImpactAnalysis, SubstitutionResult, BillAnalysis, Recipe, ChatMessage, MarketItem, GardenPlan, GreenTechAnalysis } from './types';
import { LiveServerMessage, Modality, Blob } from '@google/genai';

// --- MOCK DATA & CONSTANTS ---

const AVATARS = ['🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '🍀', '🌻', '🎋', '🍂', '🍄'];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Other"
];

const CITIES_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
  "Arunachal Pradesh": ["Itanagar", "Tawang"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Kohima", "Dimapur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Chandigarh"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Sikkim": ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Noida", "Agra"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
  "Chandigarh": ["Chandigarh"],
  "Other": ["Other"]
};

const ecoFacts = [
  "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
  "Glass is 100% recyclable and can be recycled endlessly without loss in quality.",
  "Up to 60% of the rubbish that ends up in the dustbin could be recycled.",
  "A single liter of used oil can ruin a million liters of fresh water.",
  "Plastic bottles take 450+ years to decompose in a landfill.",
  "Composting organic waste can reduce household waste by 30%."
];

// EXPANDED CHALLENGES FOR IDEATHON
const professionChallenges: Record<string, Challenge[]> = {
  student: [
    { id: 1, title: "Zero Waste Lunch", description: "Pack a lunch with zero single-use plastics.", points: 50, duration: 1, icon: "🍱", difficulty: 'Easy' },
    { id: 2, title: "Digital Notes", description: "Use digital notes for one week instead of paper.", points: 100, duration: 7, icon: "📱", difficulty: 'Medium' },
    { id: 11, title: "Refill Bottle", description: "Use a refillable water bottle for a week.", points: 30, duration: 7, icon: "💧", difficulty: 'Easy' },
    { id: 16, title: "Used Book Swap", description: "Trade a textbook instead of buying new.", points: 80, duration: 1, icon: "📚", difficulty: 'Medium' },
    { id: 17, title: "Walking Commute", description: "Walk or cycle to campus for 3 days.", points: 120, duration: 3, icon: "🚲", difficulty: 'Hard' },
    { id: 18, title: "E-Waste Hunt", description: "Collect old batteries/cables for recycling.", points: 60, duration: 1, icon: "🔋", difficulty: 'Easy' },
  ],
  professional: [
    { id: 3, title: "Carpool Week", description: "Carpool or use public transport for work.", points: 150, duration: 5, icon: "🚗", difficulty: 'Medium' },
    { id: 4, title: "Paperless Office", description: "Go completely paperless for meetings.", points: 50, duration: 1, icon: "💳", difficulty: 'Easy' },
    { id: 12, title: "Power Down", description: "Unplug all electronics before leaving work.", points: 20, duration: 1, icon: "🔌", difficulty: 'Easy' },
    { id: 19, title: "Sustainable Coffee", description: "Bring your own mug to the office cafe.", points: 30, duration: 5, icon: "☕", difficulty: 'Easy' },
    { id: 20, title: "Remote Work Day", description: "Work from home to save commute emissions.", points: 100, duration: 1, icon: "🏠", difficulty: 'Medium' },
    { id: 21, title: "Green Procurement", description: "Suggest an eco-friendly vendor at work.", points: 200, duration: 1, icon: "🤝", difficulty: 'Hard' },
  ],
  doctor: [
    { id: 5, title: "Eco Prescriptions", description: "Educate 5 patients about proper med disposal.", points: 100, duration: 1, icon: "💊", difficulty: 'Medium' },
    { id: 13, title: "Green Clinic", description: "Implement one waste reduction strategy.", points: 200, duration: 14, icon: "🏥", difficulty: 'Hard' },
    { id: 22, title: "Digital Records", description: "Maximize digital prescriptions usage.", points: 80, duration: 7, icon: "💻", difficulty: 'Medium' },
    { id: 23, title: "Sustainable Scrubs", description: "Switch to ethically sourced medical wear.", points: 150, duration: 1, icon: "👕", difficulty: 'Hard' },
    { id: 24, title: "Energy Audit", description: "Turn off non-essential clinic lights.", points: 50, duration: 1, icon: "💡", difficulty: 'Easy' },
  ],
  homemaker: [
    { id: 6, title: "Compost King", description: "Start a kitchen compost bin.", points: 200, duration: 30, icon: "🌱", difficulty: 'Hard' },
    { id: 14, title: "Bulk Buying", description: "Buy grains/spices in bulk to reduce packaging.", points: 50, duration: 1, icon: "🛍️", difficulty: 'Easy' },
    { id: 25, title: "DIY Cleaners", description: "Make a natural cleaner (vinegar/lemon).", points: 80, duration: 1, icon: "🍋", difficulty: 'Medium' },
    { id: 26, title: "Energy Peak", description: "Do laundry during off-peak energy hours.", points: 40, duration: 1, icon: "⚡", difficulty: 'Easy' },
    { id: 27, title: "Upcycle Decor", description: "Turn a waste item into home decor.", points: 120, duration: 1, icon: "🎨", difficulty: 'Medium' },
    { id: 28, title: "Local Market", description: "Buy veggies from a local farmer's market.", points: 60, duration: 1, icon: "🥦", difficulty: 'Easy' },
  ],
  other: [
    { id: 7, title: "Plant a Tree", description: "Plant and nurture a sapling.", points: 500, duration: 30, icon: "🌳", difficulty: 'Hard' },
    { id: 15, title: "Community Cleanup", description: "Organize or join a cleanup drive.", points: 150, duration: 1, icon: "🧹", difficulty: 'Medium' },
    { id: 29, title: "Plastic Free Week", description: "Avoid all single-use plastics for 7 days.", points: 250, duration: 7, icon: "🚫", difficulty: 'Hard' },
    { id: 30, title: "Eco Donation", description: "Donate old clothes instead of throwing away.", points: 100, duration: 1, icon: "👕", difficulty: 'Easy' },
  ]
};

const translations = {
  english: {
    welcome: "Welcome back,",
    ecoScore: "Eco Score",
    wasteDetector: "Waste Detective",
    foodRescue: "Food Rescue",
    cityScore: "City Pulse",
    challenges: "Challenges",
    tools: "Eco Tools",
    profile: "Profile",
    home: "Home",
    analyze: "Analyze",
    detecting: "Analyzing...",
    streak: "Day Streak",
    points: "Eco Points",
    level: "Level",
    bill: "Bill Analyzer",
    impact: "Impact Calc",
    subst: "Smart Swaps",
    quiz: "Daily Quiz",
    tasks: "Tasks",
    assistant: "Voice AI",
    chat: "AI Chat",
    scan: "Eco Scanner",
    about: "About EcoWise",
    settings: "Settings",
    language: "Language",
    market: "Eco Market",
    noise: "Noise Patrol",
    garden: "Garden Guru",
    commute: "Green Commute",
    reminders: "Reminders",
    greenTech: "Green Advisor"
  },
  hindi: {
    welcome: "स्वागत है,",
    ecoScore: "इको स्कोर",
    wasteDetector: "कचरा जासूस",
    foodRescue: "भोजन बचाव",
    cityScore: "शहर पल्स",
    challenges: "चुनौतियां",
    tools: "टूल्स",
    profile: "प्रोफाइल",
    home: "होम",
    analyze: "विश्लेषण करें",
    detecting: "विश्लेषण कर रहा है...",
    streak: "लगातार दिन",
    points: "इको अंक",
    level: "स्तर",
    bill: "बिल",
    impact: "प्रभाव",
    subst: "विकल्प",
    quiz: "क्विज़",
    tasks: "कार्य",
    assistant: "आवाज़ AI",
    chat: "AI चैट",
    scan: "स्कैनर",
    about: "EcoWise के बारे में",
    settings: "सेटिंग्स",
    language: "भाषा",
    market: "इको बाजार",
    noise: "ध्वनि मीटर",
    garden: "गार्डन गुरु",
    commute: "हरित यात्रा",
    reminders: "रिमाइंडर्स",
    greenTech: "ग्रीन एडवाइजर"
  }
};

// --- AUDIO UTILS FOR LIVE API ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- SUB-COMPONENTS ---

const AnalysisModeToggle = ({ mode, setMode }: { mode: 'concise' | 'deep', setMode: (m: 'concise' | 'deep') => void }) => (
    <div className="flex justify-center my-4 animate-fade-in">
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md p-1 rounded-xl flex text-xs font-bold border border-white/20">
            <button 
                onClick={() => setMode('concise')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${mode === 'concise' ? 'bg-emerald-500 text-white shadow-lg' : 'opacity-60 hover:bg-white/30'}`}
            >
                <Zap size={14} /> Concise
            </button>
            <button 
                onClick={() => setMode('deep')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${mode === 'deep' ? 'bg-emerald-500 text-white shadow-lg' : 'opacity-60 hover:bg-white/30'}`}
            >
                <BookOpen size={14} /> Deep Analysis
            </button>
        </div>
    </div>
);

const DynamicBackground = ({ darkMode }: { darkMode: boolean }) => {
  // Static background based on mode (No movement animations)
  const isNight = darkMode;
  
  // Static Positions - Adjusted for static look
  const sunBottom = isNight ? -30 : 65; 
  const sunLeft = 70;
  
  const moonBottom = isNight ? 65 : -30; 
  const moonLeft = 20;

  // Static Gradients
  const bgClass = isNight 
    ? "from-[#0f172a] via-[#1e1b4b] to-[#0f172a]" // Deep Night
    : "from-[#7dd3fc] via-[#38bdf8] to-[#0284c7]"; // Clear Day

  // Static stars
  const stars = useMemo(() => [...Array(40)].map((_, i) => ({
      top: `${Math.random() * 60}%`, 
      left: `${Math.random() * 100}%`, 
      width: `${Math.random() * 2 + 1}px`, 
      height: `${Math.random() * 2 + 1}px`,
      opacity: Math.random() * 0.8 + 0.2
  })), []);

  return (
    <div className={`fixed inset-0 w-full h-full z-0 bg-gradient-to-b ${bgClass} transition-colors duration-700 overflow-hidden`}>
       {/* Stars - Static, only visible at night */}
       <div className={`absolute inset-0 transition-opacity duration-700 ${isNight ? 'opacity-100' : 'opacity-0'}`}>
          {stars.map((style, i) => (
            <div key={i} className="absolute bg-white rounded-full" style={style} />
          ))}
       </div>

       {/* Sun - Static */}
       <div 
         className="absolute w-32 h-32 bg-[#fde047] rounded-full shadow-[0_0_100px_rgba(253,224,71,0.8)] transition-all duration-1000 ease-in-out z-0"
         style={{ bottom: `${sunBottom}%`, left: `${sunLeft}%`, opacity: isNight ? 0 : 1 }}
       ></div>

       {/* Moon - Static */}
       <div 
         className="absolute w-24 h-24 bg-slate-100 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-in-out overflow-hidden z-0"
         style={{ bottom: `${moonBottom}%`, left: `${moonLeft}%`, opacity: isNight ? 1 : 0 }}
       >
          <div className="absolute top-4 left-5 w-5 h-5 bg-slate-200/50 rounded-full"></div>
          <div className="absolute bottom-5 right-6 w-6 h-6 bg-slate-200/50 rounded-full"></div>
       </div>

       {/* Clouds - Static */}
       <div className={`absolute top-[15%] w-full flex justify-between px-10 pointer-events-none z-10 transition-opacity duration-700 ${isNight ? 'opacity-10' : 'opacity-70'}`}>
          <Cloud className="text-white" size={100} fill="currentColor" strokeWidth={0} />
          <Cloud className="text-white" size={140} fill="currentColor" strokeWidth={0} style={{ transform: 'translateY(40px)' }} />
          <Cloud className="text-white hidden md:block" size={90} fill="currentColor" strokeWidth={0} />
       </div>

       {/* Landscape Static */}
       <div className={`absolute bottom-0 left-0 right-0 h-48 transition-colors duration-700 ${isNight ? 'text-[#0f172a]' : 'text-[#10b981]'} z-20`}>
          <svg viewBox="0 0 1440 320" className="w-full h-full absolute bottom-0 opacity-80" preserveAspectRatio="none">
             <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
       </div>

       <div className={`absolute bottom-0 left-0 right-0 h-24 transition-colors duration-700 ${isNight ? 'text-[#020617]' : 'text-[#059669]'} z-30`}>
          <svg viewBox="0 0 1440 320" className="w-full h-full absolute bottom-0 opacity-100" preserveAspectRatio="none">
             <path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,266.7C960,267,1056,245,1152,229.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
       </div>
    </div>
  );
};

const WebCamera = ({ onCapture, onClose }: { onCapture: (img: string) => void, onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' // Simplified constraints to improve compatibility
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
              setStreaming(true);
              videoRef.current?.play();
          };
        }
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDismissedError') {
            setError("Permission denied. Please allow camera access in your browser settings.");
        } else {
            setError("Camera error: " + (err.message || "Unknown error"));
        }
        console.error(err);
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && streaming) {
       const video = videoRef.current;
       const canvas = canvasRef.current;
       canvas.width = video.videoWidth;
       canvas.height = video.videoHeight;
       const ctx = canvas.getContext('2d');
       if (ctx) {
         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
         const imageBase64 = canvas.toDataURL('image/jpeg', 1.0); 
         onCapture(imageBase64);
       }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
       {error ? (
         <div className="text-white text-center p-6 max-w-sm glass-card rounded-2xl">
            <div className="bg-red-500/20 p-4 rounded-full inline-block mb-4"><CameraOff size={48} className="text-red-500"/></div>
            <p className="mb-6 font-medium">{error}</p>
            <button onClick={onClose} className="glass-btn px-8 py-3 rounded-full font-bold text-white">Close Camera</button>
         </div>
       ) : (
         <>
           <video ref={videoRef} playsInline muted className={`w-full h-full object-cover transition-opacity duration-500 ${streaming ? 'opacity-100' : 'opacity-0'}`} />
           <canvas ref={canvasRef} className="hidden" />
           <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-start">
               <button onClick={onClose} className="p-2 bg-black/30 text-white rounded-full backdrop-blur-md"><X size={24} /></button>
           </div>
           <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-12">
              <button onClick={handleCapture} className="p-1 border-4 border-white rounded-full transition-transform active:scale-95">
                 <div className="w-16 h-16 bg-white rounded-full"></div>
              </button>
           </div>
         </>
       )}
    </div>
  );
};

const ImageCropper = ({ imageSrc, onConfirm, onCancel }: { imageSrc: string, onConfirm: (img: string) => void, onCancel: () => void }) => {
   const [pos, setPos] = useState({ x: 0, y: 0, scale: 1 });
   const imgRef = useRef<HTMLImageElement>(null);
   const isDragging = useRef(false);
   const lastPos = useRef({ x: 0, y: 0 });
   const [imgDims, setImgDims] = useState({ w: 0, h: 0 });

   const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      isDragging.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      lastPos.current = { x: clientX, y: clientY };
   };

   const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      
      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      
      setPos(p => ({ ...p, x: p.x + dx, y: p.y + dy }));
      lastPos.current = { x: clientX, y: clientY };
   };

   const handleMouseUp = () => {
      isDragging.current = false;
   };

   const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      setImgDims({ w: naturalWidth, h: naturalHeight });
      // Initially fit the image to the 300x300 container
      const scale = Math.max(300 / naturalWidth, 300 / naturalHeight);
      setPos(p => ({ ...p, scale }));
   };

   const doCrop = () => {
      if (!imgRef.current) return;
      
      const canvas = document.createElement('canvas');
      const size = 600; 
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = imgRef.current;
      
      // Coordinate Math:
      // We are looking for the region of the image that corresponds to the 300x300 viewport.
      // The image is translated by (pos.x, pos.y) relative to the center of the viewport.
      // Viewport center in screen pixels: (150, 150) (relative to container).
      // Image center in screen pixels: (150 + pos.x, 150 + pos.y).
      
      // Top Left of viewport relative to Image Center (in SCALED pixels):
      // ViewportTL - ImageCenter = (0, 0) - (150 + pos.x, 150 + pos.y) = (-150 - pos.x, -150 - pos.y)
      
      // Convert to Unscaled (Natural) pixels:
      // x_rel_natural = (-150 - pos.x) / pos.scale
      // y_rel_natural = (-150 - pos.y) / pos.scale
      
      // Coordinates in Source Image (0,0 is top left of image):
      // srcX = NaturalWidth / 2 + x_rel_natural
      // srcY = NaturalHeight / 2 + y_rel_natural
      
      const srcX = (imgDims.w / 2) + (-150 - pos.x) / pos.scale;
      const srcY = (imgDims.h / 2) + (-150 - pos.y) / pos.scale;
      
      const srcW = 300 / pos.scale;
      const srcH = 300 / pos.scale;
      
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, size, size);
      
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      onConfirm(croppedBase64); 
   };

   return (
      <div className="fixed inset-0 z-[70] bg-black/95 flex flex-col items-center justify-center animate-fade-in"
           onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp} onMouseLeave={handleMouseUp}>
         <div className="text-white mb-6 text-center w-full max-w-xs">
            <h3 className="text-xl font-bold mb-1">Adjust Image</h3>
            <p className="text-sm opacity-60">Drag to pan, use slider to zoom</p>
         </div>
         
         {/* Crop Area */}
         <div className="relative w-[300px] h-[300px] overflow-hidden border-2 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.5)] bg-slate-800"
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchMove={handleMouseMove}
         >
            <img 
              ref={imgRef}
              src={imageSrc} 
              onLoad={onImgLoad}
              alt="Crop" 
              className="max-w-none absolute origin-center cursor-move select-none"
              style={{ 
                 transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${pos.scale})`,
                 left: '50%',
                 top: '50%',
                 // IMPORTANT: Do NOT use object-fit or fixed dimensions here to ensure coordinate math works
              }}
              draggable={false}
            />
            {/* Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-3 pointer-events-none opacity-50">
                <div className="border-r border-white/50 h-full"></div>
                <div className="border-r border-white/50 h-full"></div>
            </div>
            <div className="absolute inset-0 grid grid-rows-3 pointer-events-none opacity-50">
                <div className="border-b border-white/50 w-full"></div>
                <div className="border-b border-white/50 w-full"></div>
            </div>
         </div>

         {/* Zoom Control */}
         <div className="mt-8 w-[300px] flex items-center gap-4">
             <ZoomOut size={20} className="text-white/70" />
             <input 
               type="range" 
               min={imgDims.w ? Math.min(300/imgDims.w, 300/imgDims.h) * 0.5 : 0.1}
               max={imgDims.w ? Math.max(300/imgDims.w, 300/imgDims.h) * 5 : 3}
               step="0.01"
               value={pos.scale} 
               onChange={(e) => setPos({...pos, scale: parseFloat(e.target.value)})}
               className="flex-1 accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
             />
             <ZoomIn size={20} className="text-white/70" />
         </div>

         <div className="mt-8 flex gap-8">
            <button onClick={onCancel} className="p-4 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition flex items-center justify-center"><X size={24}/></button>
            <button onClick={doCrop} className="glass-action-btn p-4 rounded-full flex items-center justify-center"><Check size={24}/></button>
         </div>
      </div>
   );
};

const TutorialModal = ({ onClose, language }: { onClose: () => void, language: 'english' | 'hindi' }) => {
    const content = {
        english: {
            title: "Welcome to EcoWise",
            subtitle: "Your personal guide to sustainable living",
            cta: "Get Started",
            items: [
                { icon: Recycle, color: 'text-green-600', bg: 'bg-green-100', title: 'Waste Detective', desc: 'Snap a photo of trash to learn how to recycle or reuse it.' },
                { icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-100', title: 'City Pulse', desc: 'Check local AQI, green cover, and environmental scores.' },
                { icon: Mic, color: 'text-indigo-600', bg: 'bg-indigo-100', title: 'Voice AI', desc: 'Hands-free conversation for eco-tips on the go.' },
                { icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-100', title: 'Daily Challenges', desc: 'Complete daily tasks to earn points and level up.' },
                { icon: IndianRupee, color: 'text-yellow-600', bg: 'bg-yellow-100', title: 'Bill Saver', desc: 'Analyze utility bills to save money and energy.' },
                { icon: SunIcon, color: 'text-orange-600', bg: 'bg-orange-100', title: 'Green Advisor', desc: 'Feasibility analysis for solar, rainwater harvesting, etc.' },
                { icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-100', title: 'Eco Market', desc: 'Buy, sell, or trade sustainable pre-loved items.' },
                { icon: Activity, color: 'text-rose-600', bg: 'bg-rose-100', title: 'Noise Patrol', desc: 'Measure environmental noise levels.' },
                { icon: Sprout, color: 'text-lime-600', bg: 'bg-lime-100', title: 'Garden Guru', desc: 'AI planting advice for your specific space.' },
                { icon: Train, color: 'text-sky-600', bg: 'bg-sky-100', title: 'Green Commute', desc: 'Calculate the carbon footprint of your trips.' },
                { icon: MessageCircle, color: 'text-violet-600', bg: 'bg-violet-100', title: 'AI Chat', desc: 'Chat with EcoWise for any sustainability questions.' },
                { icon: ScanLine, color: 'text-cyan-600', bg: 'bg-cyan-100', title: 'Eco Scanner', desc: 'Identify products via camera to check sustainability.' },
                { icon: Utensils, color: 'text-red-500', bg: 'bg-red-100', title: 'Food Rescue', desc: 'Generate recipes from leftover ingredients.' },
                { icon: Globe, color: 'text-blue-500', bg: 'bg-blue-100', title: 'Impact Calc', desc: 'Calculate the environmental footprint of products.' },
                { icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-100', title: 'Smart Swaps', desc: 'Find eco-friendly alternatives for daily items.' },
                { icon: Award, color: 'text-pink-500', bg: 'bg-pink-100', title: 'Daily Quiz', desc: 'Test your eco-knowledge and earn badges.' }
            ]
        },
        hindi: {
            title: "EcoWise में आपका स्वागत है",
            subtitle: "टिकाऊ जीवन जीने के लिए आपका व्यक्तिगत गाइड",
            cta: "शुरू करें",
            items: [
                { icon: Recycle, color: 'text-green-600', bg: 'bg-green-100', title: 'कचरा जासूस (Waste Detective)', desc: 'कचरे की फोटो लें और उसे रिसाइकिल या रीयूज करना सीखें।' },
                { icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-100', title: 'शहर पल्स (City Pulse)', desc: 'स्थानीय AQI और पर्यावरण स्कोर की जाँच करें।' },
                { icon: Mic, color: 'text-indigo-600', bg: 'bg-indigo-100', title: 'आवाज़ AI (Voice AI)', desc: 'चलते-फिरते इको-टिप्स के लिए हैंड्स-फ्री बातचीत।' },
                { icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-100', title: 'दैनिक चुनौतियां (Challenges)', desc: 'अंक अर्जित करने के लिए दैनिक कार्यों को पूरा करें।' },
                { icon: IndianRupee, color: 'text-yellow-600', bg: 'bg-yellow-100', title: 'बिल सेवर (Bill Saver)', desc: 'पैसे बचाने के लिए बिजली/पानी के बिलों का विश्लेषण करें।' },
                { icon: SunIcon, color: 'text-orange-600', bg: 'bg-orange-100', title: 'ग्रीन एडवाइजर (Green Advisor)', desc: 'सोलर पैनल और वर्षा जल संचयन के लिए सलाह।' },
                { icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-100', title: 'इको बाजार (Eco Market)', desc: 'टिकाऊ वस्तुओं को खरीदें, बेचें या व्यापार करें।' },
                { icon: Activity, color: 'text-rose-600', bg: 'bg-rose-100', title: 'ध्वनि मीटर (Noise Patrol)', desc: 'अपने वातावरण में ध्वनि प्रदूषण के स्तर को मापें।' },
                { icon: Sprout, color: 'text-lime-600', bg: 'bg-lime-100', title: 'गार्डन गुरु (Garden Guru)', desc: 'अपनी जगह के लिए एआई आधारित बागवानी सलाह लें।' },
                { icon: Train, color: 'text-sky-600', bg: 'bg-sky-100', title: 'हरित यात्रा (Green Commute)', desc: 'अपनी यात्राओं के कार्बन पदचिह्न की गणना करें।' },
                { icon: MessageCircle, color: 'text-violet-600', bg: 'bg-violet-100', title: 'AI चैट (AI Chat)', desc: 'स्थिरता संबंधी प्रश्नों के लिए EcoWise से चैट करें।' },
                { icon: ScanLine, color: 'text-cyan-600', bg: 'bg-cyan-100', title: 'इको स्कैनर (Eco Scanner)', desc: 'उत्पादों की स्थिरता जांचने के लिए उन्हें स्कैन करें।' },
                { icon: Utensils, color: 'text-red-500', bg: 'bg-red-100', title: 'भोजन बचाव (Food Rescue)', desc: 'बचे हुए अवयवों से रचनात्मक व्यंजन बनाएं।' },
                { icon: Globe, color: 'text-blue-500', bg: 'bg-blue-100', title: 'प्रभाव कैलकुलेटर (Impact Calc)', desc: 'उत्पादों के पर्यावरणीय पदचिह्न की गणना करें।' },
                { icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-100', title: 'स्मार्ट विकल्प (Smart Swaps)', desc: 'दैनिक वस्तुओं के लिए पर्यावरण के अनुकूल विकल्प खोजें।' },
                { icon: Award, color: 'text-pink-500', bg: 'bg-pink-100', title: 'दैनिक क्विज़ (Daily Quiz)', desc: 'अपने ज्ञान का परीक्षण करें और बैज अर्जित करें।' }
            ]
        }
    };

    const t = content[language];

    return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="glass-card max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-3xl p-6 relative bg-white/90 dark:bg-slate-900/90 scrollbar-hide">
            <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            
            <div className="text-center mb-8 pt-2">
                <div className="inline-block p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mb-3 shadow-lg shadow-emerald-500/20">
                    <Sparkles size={32}/>
                </div>
                <h2 className="text-2xl font-bold mb-1">{t.title}</h2>
                <p className="opacity-60 text-sm">{t.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {t.items.map((item, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                        <div className={`${item.bg} dark:bg-opacity-20 ${item.color} p-3 rounded-2xl h-fit shrink-0`}>
                            <item.icon size={20}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">{item.title}</h3>
                            <p className="text-xs opacity-70 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={onClose} className="w-full glass-action-btn py-4 rounded-xl font-bold mt-8 shadow-lg shadow-emerald-500/20">
                {t.cta}
            </button>
        </div>
    </div>
    );
};

// --- COMPONENT ---

const EcoWiseApp = () => {
  // -- State --
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ecoWiseTheme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');
  const [activeSection, setActiveSection] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Analysis Mode for AI Features
  const [analysisMode, setAnalysisMode] = useState<'concise' | 'deep'>('concise');

  // Auth Inputs
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  // Intro Animation State
  const [showSplash, setShowSplash] = useState(true);
  
  // Gamification
  const [ecoPoints, setEcoPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [plantLevel, setPlantLevel] = useState(1);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<number[]>([]);
  const [hasInvitedFriends, setHasInvitedFriends] = useState(false);
  
  // Impact Stats - NEW FOR IDEATHON
  const [impactStats, setImpactStats] = useState({
     co2: 24.5, // kg
     waste: 8.2, // kg
     water: 350, // liters
     energy: 45 // kWh
  });

  // Features State
  const [cityQuery, setCityQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [loadingCity, setLoadingCity] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');

  // Waste Map State
  const [wasteInput, setWasteInput] = useState('');
  const [wasteResult, setWasteResult] = useState<WasteAnalysis | null>(null);
  const [analyzingWaste, setAnalyzingWaste] = useState(false);
  const [wasteError, setWasteError] = useState(false);
  const [wasteMapData, setWasteMapData] = useState<any[] | null>(null); 
  const [loadingMap, setLoadingMap] = useState(false);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [wasteDeepAnalysis, setWasteDeepAnalysis] = useState<string>('');
  const [loadingWasteDeep, setLoadingWasteDeep] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [expandedCenterIndex, setExpandedCenterIndex] = useState<number | null>(null);

  // Reminders State
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 1, title: 'Water the plants', time: '07:30', triggered: false, enabled: true },
    { id: 2, title: 'Take out recycling', time: '20:00', triggered: false, enabled: true }
  ]);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');

  // Camera State (Custom Web & Crop)
  const [showCamera, setShowCamera] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null); // Before crop
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // After crop
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null); // For Profile Upload

  // Food Rescue State
  const [foodInput, setFoodInput] = useState('');
  const [foodResult, setFoodResult] = useState<{recipes: Recipe[]} | null>(null);
  const [analyzingFood, setAnalyzingFood] = useState(false);

  // Impact
  const [impactInput, setImpactInput] = useState('');
  const [impactResult, setImpactResult] = useState<ImpactAnalysis | null>(null);
  const [analyzingImpact, setAnalyzingImpact] = useState(false);

  // Substitution
  const [subInput, setSubInput] = useState('');
  const [subResult, setSubResult] = useState<SubstitutionResult | null>(null);
  const [analyzingSub, setAnalyzingSub] = useState(false);

  // Bill Calc
  const [elecInput, setElecInput] = useState('');
  const [waterInput, setWaterInput] = useState('');
  const [billResult, setBillResult] = useState<BillAnalysis | null>(null);
  const [analyzingBill, setAnalyzingBill] = useState(false);

  // Garden Guru State
  const [gardenLocation, setGardenLocation] = useState('');
  const [gardenSpace, setGardenSpace] = useState('balcony');
  const [gardenResult, setGardenResult] = useState<GardenPlan | null>(null);
  const [loadingGarden, setLoadingGarden] = useState(false);

  // Market State
  const [marketTab, setMarketTab] = useState<'buy' | 'sell'>('buy');
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([
    { id: '1', title: 'Vintage Denim Jacket', description: 'Upcycled denim, good condition.', ecoCredits: 200, contact: 'User1', type: 'Trade', user: 'other' },
    { id: '2', title: 'Glass Jars (Set of 5)', description: 'Cleaned, perfect for pantry.', ecoCredits: 50, contact: 'User2', type: 'Free', user: 'other' }
  ]);
  const [newMarketItem, setNewMarketItem] = useState<{title: string, desc: string, price: string}>({title: '', desc: '', price: ''});
  const [sellingImage, setSellingImage] = useState<string | null>(null);

  // Commute State
  const [commuteDist, setCommuteDist] = useState('');
  const [commuteMode, setCommuteMode] = useState('car');
  const [commuteResult, setCommuteResult] = useState<any | null>(null);

  // Noise State
  const [isMeasuringNoise, setIsMeasuringNoise] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const noiseContextRef = useRef<AudioContext | null>(null);
  const noiseStreamRef = useRef<MediaStream | null>(null);

  // Live Voice State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveStatus, setLiveStatus] = useState("Ready to connect");
  const [audioLevel, setAudioLevel] = useState(0);
  const liveClientRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scanner State
  const [scannerResult, setScannerResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Quiz State
  const [quizQuestion, setQuizQuestion] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);

  // Green Tech Advisor State (NEW)
  const [greenTechState, setGreenTechState] = useState('');
  const [greenTechCity, setGreenTechCity] = useState('');
  const [tempCityInput, setTempCityInput] = useState('');
  const [greenTechCategory, setGreenTechCategory] = useState<string | null>(null);
  const [greenTechSpec, setGreenTechSpec] = useState('');
  const [greenTechResult, setGreenTechResult] = useState<GreenTechAnalysis | null>(null);
  const [greenTechLoading, setGreenTechLoading] = useState(false);

  // Settings State
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editProfession, setEditProfession] = useState('student');

  const t = translations[language];

  // Derived Global Loading State
  const isAiProcessing = useMemo(() => {
    return loadingCity || analyzingWaste || loadingMap || loadingWasteDeep || 
           analyzingFood || analyzingBill || analyzingImpact || analyzingSub || 
           isChatLoading || quizLoading || loadingGarden || isScanning || greenTechLoading || marketLoading;
  }, [loadingCity, analyzingWaste, loadingMap, loadingWasteDeep, analyzingFood, analyzingBill, analyzingImpact, analyzingSub, isChatLoading, quizLoading, loadingGarden, isScanning, greenTechLoading, marketLoading]);

  // --- FEATURES CONFIG ---
  const FEATURES = [
    { id: 'greenTech', icon: SunIcon, label: t.greenTech, desc: "Solar, Rainwater & more.", color: 'text-orange-600', bg: 'bg-orange-100/50' },
    { id: 'market', icon: ShoppingCart, label: t.market, desc: "Trade, Sell & Reuse.", color: 'text-amber-600', bg: 'bg-amber-100/50' },
    { id: 'noise', icon: Activity, label: t.noise, desc: "Measure noise pollution.", color: 'text-rose-600', bg: 'bg-rose-100/50' },
    { id: 'garden', icon: Sprout, label: t.garden, desc: "AI planting advice.", color: 'text-lime-600', bg: 'bg-lime-100/50' },
    { id: 'commute', icon: Train, label: t.commute, desc: "Calc travel footprint.", color: 'text-sky-600', bg: 'bg-sky-100/50' },
    { id: 'chat', icon: MessageCircle, label: t.chat, desc: "Chat with EcoWise AI.", color: 'text-violet-600', bg: 'bg-violet-100/50' },
    { id: 'scan', icon: ScanLine, label: t.scan, desc: "Identify items with cam.", color: 'text-cyan-600', bg: 'bg-cyan-100/50' },
    { id: 'voice', icon: Mic, label: t.assistant, desc: "Hands-free voice AI.", color: 'text-indigo-600', bg: 'bg-indigo-100/50' },
    { id: 'city', icon: Building2, label: t.cityScore, desc: "Check AQI & Eco Score.", color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
    { id: 'waste', icon: Recycle, label: t.wasteDetector, desc: "Disposal & reuse guide.", color: 'text-green-600', bg: 'bg-green-100/50' },
    { id: 'food', icon: Utensils, label: t.foodRescue, desc: "Leftover recipes.", color: 'text-red-500', bg: 'bg-red-100/50' },
    { id: 'bill', icon: IndianRupee, label: t.bill, desc: "Utility bill savings.", color: 'text-yellow-500', bg: 'bg-yellow-100/50' },
    { id: 'impact', icon: Globe, label: t.impact, desc: "Product footprint.", color: 'text-blue-500', bg: 'bg-blue-100/50' },
    { id: 'sub', icon: RefreshCw, label: t.subst, desc: "Eco-friendly swaps.", color: 'text-purple-500', bg: 'bg-purple-100/50' },
    { id: 'quiz', icon: Award, label: t.quiz, desc: "Test your knowledge.", color: 'text-pink-500', bg: 'bg-pink-100/50' },
    { id: 'challenges', icon: Trophy, label: t.tasks, desc: "Daily eco-challenges.", color: 'text-orange-500', bg: 'bg-orange-100/50' },
  ];

  const GREEN_TECH_OPTIONS = [
    { id: 'solar', title: 'Solar Panels', icon: SunIcon, desc: 'Generate your own electricity.' },
    { id: 'water', title: 'Rainwater Harvesting', icon: Cloud, desc: 'Collect and store rainwater.' },
    { id: 'compost', title: 'Home Biogas', icon: Recycle, desc: 'Turn waste into energy/manure.' },
    { id: 'insulation', title: 'Smart Insulation', icon: Thermometer, desc: 'Passive cooling to reduce AC load.' },
    { id: 'ev', title: 'EV Charging', icon: BatteryCharging, desc: 'Home charging infrastructure.' },
  ];

  // -- Effects --
  
  useEffect(() => {
    // Splash screen timer
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ecoWiseTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ecoWiseTheme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    // UPDATED: Level Calculation (every 400 points)
    const newLevel = Math.floor(ecoPoints / 400) + 1;
    if (newLevel !== plantLevel) {
      setPlantLevel(newLevel);
    }
  }, [ecoPoints, plantLevel]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (analyzingWaste) {
       interval = setInterval(() => {
         setCurrentFactIndex(prev => (prev + 1) % ecoFacts.length);
       }, 3000);
    }
    return () => clearInterval(interval);
  }, [analyzingWaste]);

  useEffect(() => {
    return () => {
      if (activeSection !== 'voice' && isLiveConnected) {
         stopLiveSession();
      }
      if (activeSection !== 'noise' && isMeasuringNoise) {
         stopNoiseMeter();
      }
    };
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSection]);

  const playAlarmSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Alarm like sound sequence
      const now = ctx.currentTime;
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.2);
      osc.frequency.setValueAtTime(440, now + 0.4);
      osc.frequency.setValueAtTime(880, now + 0.6);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.8);
      gain.gain.linearRampToValueAtTime(0, now + 1.0);
      
      osc.start(now);
      osc.stop(now + 1.0);
    } catch(e) {
      console.error("Audio play failed", e);
    }
  };

  // --- Reminders Logic ---
  useEffect(() => {
    // Request Notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      setReminders(prev => prev.map(r => {
        if (r.enabled && r.time === currentTime && !r.triggered) {
          // Trigger Notification
          playAlarmSound();
          if ('Notification' in window && Notification.permission === 'granted') {
             new Notification(`EcoWise Reminder: ${r.title}`);
          } else {
             // Fallback for visual confirmation
             console.log(`⏰ EcoWise Reminder: ${r.title}`);
          }
          return { ...r, triggered: true };
        }
        
        // Reset triggered flag for next day (when time no longer matches)
        if (r.triggered && r.time !== currentTime) {
           return { ...r, triggered: false };
        }
        return r;
      }));
    };

    // Check every 10 seconds to catch the minute
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, []);

  // -- Handlers --

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'signup') {
        if (!loginId || !loginPass || !email) {
            setAuthError("All fields are required.");
            return;
        }
        
        // Mock Username Uniqueness check
        const existingUsers = ['admin', 'ecowise', 'user1', 'test'];
        if (existingUsers.includes(loginId.toLowerCase())) {
            setAuthError("Username is already taken. Please choose another.");
            return;
        }

        // Mock Gmail check
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            setAuthError("Please enter a valid Gmail address (@gmail.com).");
            return;
        }
    }

    if (loginId && loginPass) {
      setIsAuthenticated(true);
      setUserProfile({
        name: loginId,
        avatar: selectedAvatar,
        profession: 'student',
        joinDate: new Date(),
        badges: ['Eco Newbie', 'Master Recycler'],
        weeklyStats: [
          { day: 'Mon', points: 45 },
          { day: 'Tue', points: 120 },
          { day: 'Wed', points: 80 },
          { day: 'Thu', points: 250 },
          { day: 'Fri', points: 160 },
          { day: 'Sat', points: 90 },
          { day: 'Sun', points: 300 },
        ],
        dietaryPreference: 'Vegetarian'
      });
      setChatMessages([{
         id: 'init',
         role: 'model',
         text: `Hello ${loginId}! I'm EcoWise, your sustainability assistant. How can I help you today?`,
         timestamp: new Date()
      }]);
      setTimeout(() => setShowTutorial(true), 500);
    }
  };

  const handleShare = async () => {
    const shareData = {
        title: 'EcoWise',
        text: 'Join me on EcoWise and help save the planet! 🌍',
        url: window.location.href
    };
    
    if (!hasInvitedFriends) {
        setEcoPoints(prev => prev + 200);
        setHasInvitedFriends(true);
        alert("Thanks for sharing! You've earned 200 Eco Points.");
    }

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Error sharing:', err);
        }
    } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard! Share it with your friends.");
    }
  };

  const handleWhatsAppShare = () => {
     const text = "Join me on EcoWise! 🌿 Let's save the planet together. Check it out: " + window.location.href;
     const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
     window.open(url, '_blank');
     
     if (!hasInvitedFriends) {
        setEcoPoints(prev => prev + 200);
        setHasInvitedFriends(true);
        alert("Friends invited via WhatsApp! You earned 200 Eco Points.");
     }
  };

  const handleCitySearch = async () => {
    if (!cityQuery) return;
    setLoadingCity(true);
    try {
      // Append state to query if selected
      const query = selectedState ? `${cityQuery}, ${selectedState}` : cityQuery;
      
      // Check if we are searching for the exact same query as last time to reuse stats
      const isSameCity = query.toLowerCase() === lastSearchedQuery.toLowerCase();
      
      const data = await getCityEcoData(query, language, analysisMode, isSameCity ? cityData : null);
      
      setCityData(data);
      setLastSearchedQuery(query);
    } catch (e) {
      alert("Could not fetch city data.");
    } finally {
      setLoadingCity(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && userProfile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUserProfile({ ...userProfile, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const startCameraFlow = () => {
     setShowCamera(true);
  };
  
  const handleCameraCapture = (imgBase64: string) => {
     setShowCamera(false);
     setTempImage(imgBase64);
     setShowCropper(true);
  };

  const handleCropConfirm = (croppedImg: string) => {
     setCapturedImage(croppedImg);
     setShowCropper(false);
     setTempImage(null);
     
     if (activeSection === 'scan') {
        setScannerResult('');
     }
     if (activeSection === 'waste') {
        setWasteResult(null);
     }
     if (activeSection === 'market') {
        setSellingImage(croppedImg);
        handleAutoMarketDetails(croppedImg);
        setCapturedImage(null); // Clear main capture for market specific state
     }
  };

  const triggerGallery = () => {
      if (galleryInputRef.current) {
          galleryInputRef.current.value = ''; 
          galleryInputRef.current.click();
      }
  };

  const retakePhoto = () => {
      setCapturedImage(null);
      setWasteResult(null);
      setScannerResult('');
  };

  const handleWasteAnalysis = async () => {
    if (!wasteInput && !capturedImage) return;
    setAnalyzingWaste(true);
    setWasteError(false);
    setWasteMapData(null);
    setWasteDeepAnalysis('');
    setExpandedCenterIndex(null);
    
    try {
      let base64Data = undefined;
      if (capturedImage) {
        base64Data = capturedImage.split(',')[1];
      }
      const data = await analyzeWasteItem(wasteInput, base64Data, language, analysisMode);
      setWasteResult(data);
      if (data) {
          setEcoPoints(prev => prev + 50);
          // Impact Update for Recycling
          if (data.classification === 'Recyclable' || data.classification === 'Organic') {
             setImpactStats(prev => ({
                ...prev,
                waste: prev.waste + 0.5,
                co2: prev.co2 + 0.8
             }));
          }
      }

      // Deep analysis text if confidence is low or complex item
      if (capturedImage && data) {
         setLoadingWasteDeep(true);
         analyzeImageDeep(base64Data!, "Provide a very short fun fact about recycling this specific item.", language).then(text => {
             setWasteDeepAnalysis(text);
             setLoadingWasteDeep(false);
         });
      }

      // Map grounding for centers
      if (navigator.geolocation && data) {
        setLoadingMap(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            const centers = await findRecyclingCenters(pos.coords.latitude, pos.coords.longitude, data.item, language);
            setWasteMapData(centers);
            setLoadingMap(false);
        }, (error) => {
            console.error("Geolocation error:", error);
            setLoadingMap(false);
            // Optionally alert user or just fail silently for map
        });
      }

    } catch (e) {
      setWasteError(true);
    } finally {
      setAnalyzingWaste(false);
    }
  };

  const handleAutoMarketDetails = async (img: string) => {
     setMarketLoading(true);
     try {
       const details = await generateMarketItemDetails(img.split(',')[1], language, analysisMode);
       if (details) {
         setNewMarketItem({
            title: details.title || '',
            desc: details.description || '',
            price: details.suggestedEcoCredits ? details.suggestedEcoCredits.toString() : ''
         });
       }
     } catch (e) {
       console.error(e);
     } finally {
       setMarketLoading(false);
     }
  };

  const handleFoodRescue = async () => {
    if (!foodInput) return;
    setAnalyzingFood(true);
    try {
      const data = await getLeftoverRecipes(foodInput, userProfile?.dietaryPreference, language, analysisMode);
      setFoodResult(data);
      if (data) {
          setEcoPoints(prev => prev + 30);
          // Impact Update for Food Rescue
          setImpactStats(prev => ({
              ...prev,
              waste: prev.waste + 1.0, // food waste saved
              co2: prev.co2 + 2.5 // methane prevention
          }));
      }
    } catch (e) {
      alert("Recipe generation failed.");
    } finally {
      setAnalyzingFood(false);
    }
  };

  const handleImpactCalc = async () => {
    if (!impactInput) return;
    setAnalyzingImpact(true);
    try {
      const data = await calculateImpact(impactInput, language, analysisMode);
      setImpactResult(data);
    } catch (e) {
      alert("Impact calculation failed.");
    } finally {
      setAnalyzingImpact(false);
    }
  };

  const handleSmartSub = async () => {
    if (!subInput) return;
    setAnalyzingSub(true);
    try {
      const data = await getSmartSubstitution(subInput, language, analysisMode);
      setSubResult(data);
    } catch (e) {
      alert("Substitution check failed.");
    } finally {
      setAnalyzingSub(false);
    }
  };

  const handleBillAnalysis = async () => {
    if (!elecInput || !waterInput) return;
    setAnalyzingBill(true);
    try {
      const data = await analyzeBill(parseFloat(elecInput), parseFloat(waterInput), language, analysisMode);
      setBillResult(data);
      if (data) {
          setEcoPoints(prev => prev + 40);
          setImpactStats(prev => ({
              ...prev,
              energy: prev.energy + 15,
              water: prev.water + 100
          }));
      }
    } catch (e) {
      alert("Bill analysis failed.");
    } finally {
      setAnalyzingBill(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    
    // Prepare history
    const history = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));

    try {
      const responseText = await chatWithAi(history, userMsg.text, language);
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText, timestamp: new Date() }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I am having trouble connecting.", timestamp: new Date() }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleQuiz = async () => {
     setQuizLoading(true);
     setQuizSelected(null);
     setQuizResult(null);
     try {
       const q = await getEcoQuiz(language);
       setQuizQuestion(q);
     } catch (e) {
       console.error(e);
     } finally {
       setQuizLoading(false);
     }
  };

  const submitQuiz = (index: number) => {
     setQuizSelected(index);
     if (quizQuestion && index === quizQuestion.correctAnswerIndex) {
        setQuizResult('correct');
        setEcoPoints(prev => prev + 50);
     } else {
        setQuizResult('wrong');
     }
  };

  const handleGardenAdvice = async () => {
     if (!gardenLocation) return;
     setLoadingGarden(true);
     try {
        const res = await getGardenAdvice(gardenLocation, gardenSpace, language, analysisMode);
        setGardenResult(res);
     } catch (e) {
        alert("Could not fetch garden advice");
     } finally {
        setLoadingGarden(false);
     }
  };

  const handleCommuteCalc = () => {
     if (!commuteDist) return;
     const dist = parseFloat(commuteDist);
     let co2 = 0;
     // simple factors
     if (commuteMode === 'car') co2 = dist * 0.192;
     if (commuteMode === 'bus') co2 = dist * 0.105;
     if (commuteMode === 'train') co2 = dist * 0.041;
     if (commuteMode === 'bike' || commuteMode === 'walk') co2 = 0;
     
     setCommuteResult({
        co2: co2.toFixed(2),
        trees: (co2 / 20).toFixed(2) // arbitrary tree equivalent
     });
     
     // Update Impact Stats (Offsetting - simulated)
     if (commuteMode === 'bike' || commuteMode === 'walk') {
         setImpactStats(prev => ({
             ...prev,
             co2: prev.co2 + (dist * 0.192) // Saved vs car
         }));
     }
  };

  const startNoiseMeter = async () => {
    try {
       setIsMeasuringNoise(true);
       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
       noiseStreamRef.current = stream;
       const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
       noiseContextRef.current = audioContext;
       const analyser = audioContext.createAnalyser();
       const microphone = audioContext.createMediaStreamSource(stream);
       const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

       analyser.smoothingTimeConstant = 0.8;
       analyser.fftSize = 1024;

       microphone.connect(analyser);
       analyser.connect(scriptProcessor);
       scriptProcessor.connect(audioContext.destination);

       scriptProcessor.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          let values = 0;
          const length = array.length;
          for (let i = 0; i < length; i++) {
             values += array[i];
          }
          const average = values / length;
          setNoiseLevel(Math.round(average)); 
       };
    } catch (e: any) {
       if (e.name === 'NotAllowedError' || e.name === 'PermissionDismissedError') {
          alert("Microphone permission denied. Please allow access.");
       } else {
          alert("Error accessing microphone: " + e.message);
       }
       setIsMeasuringNoise(false);
    }
  };

  const stopNoiseMeter = () => {
    setIsMeasuringNoise(false);
    if (noiseStreamRef.current) {
       noiseStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (noiseContextRef.current) {
       noiseContextRef.current.close();
    }
  };

  const startLiveSession = async () => {
    try {
      setIsLiveConnected(true);
      setLiveStatus("Connecting...");
      
      const ai = getAiClient();
      // Ensure permission is granted first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      audioContextRef.current = audioContext;
      inputSourceRef.current = audioContext.createMediaStreamSource(stream);
      processorRef.current = audioContext.createScriptProcessor(4096, 1, 1);
      
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);
      
      let nextStartTime = 0;
      
      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
           onopen: () => {
              setLiveStatus("Listening...");
              if (!processorRef.current || !inputSourceRef.current) return;
              
              processorRef.current.onaudioprocess = (e) => {
                 const inputData = e.inputBuffer.getChannelData(0);
                 const pcmBlob = createBlob(inputData);
                 liveClientRef.current.sendRealtimeInput({ media: pcmBlob });
                 
                 // Visualizer
                 let sum = 0;
                 for (let i = 0; i < inputData.length; i++) sum += Math.abs(inputData[i]);
                 setAudioLevel(Math.min(100, Math.round((sum / inputData.length) * 500)));
              };
              
              inputSourceRef.current.connect(processorRef.current);
              processorRef.current.connect(audioContext.destination);
           },
           onmessage: async (msg: LiveServerMessage) => {
              const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioData) {
                 const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
                 const source = outputAudioContext.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(outputNode);
                 
                 nextStartTime = Math.max(outputAudioContext.currentTime, nextStartTime);
                 source.start(nextStartTime);
                 nextStartTime += audioBuffer.duration;
              }
           },
           onclose: () => {
              setLiveStatus("Disconnected");
              setIsLiveConnected(false);
           },
           onerror: (e) => {
              console.error(e);
              setLiveStatus("Error");
           }
        },
        config: {
           responseModalities: [Modality.AUDIO],
           speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
           },
           systemInstruction: "You are EcoWise, a friendly sustainability assistant. Keep answers brief and conversational."
        }
      });
      
      liveClientRef.current = session;
      
    } catch (e: any) {
      console.error(e);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDismissedError') {
         setLiveStatus("Permission Denied");
         alert("Please allow microphone access to use Voice AI.");
      } else {
         setLiveStatus("Connection Failed");
      }
      setIsLiveConnected(false);
    }
  };

  const stopLiveSession = () => {
    if (liveClientRef.current) {
       // Stop logic handled by context close usually
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (processorRef.current) processorRef.current.disconnect();
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    setIsLiveConnected(false);
    setLiveStatus("Disconnected");
  };

  const handleEcoScanner = async () => {
    if (!capturedImage) return;
    setIsScanning(true);
    setScannerResult('');
    
    try {
      const base64Data = capturedImage.split(',')[1];
      const result = await analyzeImageDeep(base64Data, "Identify this item and tell me if it is sustainable or eco-friendly. 1 sentence.", language, analysisMode);
      setScannerResult(result);
    } catch (e) {
      setScannerResult("Could not scan item.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleGreenTechAnalysis = async () => {
    if (!greenTechCity || !greenTechCategory) return;
    setGreenTechLoading(true);
    setGreenTechResult(null);
    try {
       const data = await analyzeGreenTech(greenTechCity, greenTechState, greenTechCategory, greenTechSpec, language, analysisMode);
       setGreenTechResult(data);
    } catch (e) {
       alert("Green Tech Analysis failed. Please try again.");
    } finally {
       setGreenTechLoading(false);
    }
  };

  const renderImpactDashboard = () => {
      const data = [
          { name: 'CO2 Saved', value: impactStats.co2, fill: '#10b981', unit: 'kg' },
          { name: 'Waste Diverted', value: impactStats.waste, fill: '#f59e0b', unit: 'kg' },
          { name: 'Water Saved', value: impactStats.water, fill: '#3b82f6', unit: 'L' },
          { name: 'Energy Saved', value: impactStats.energy, fill: '#eab308', unit: 'kWh' },
      ];

      // Level progress calc
      const pointsPerLevel = 400;
      const currentLevelPoints = ecoPoints % pointsPerLevel;
      const progress = (currentLevelPoints / pointsPerLevel) * 100;
      
      // Animation Logic
      let PlantIcon = Sprout;
      if (plantLevel >= 3) {
          PlantIcon = TreeDeciduous;
      }
      
      // Growth factor within the level (0 to 1)
      const growthFactor = currentLevelPoints / pointsPerLevel; 
      
      // Dynamic scaling for plant animation
      let transformScale = 1;
      if (plantLevel === 1) transformScale = 0.5 + (growthFactor * 0.5);
      else if (plantLevel === 2) transformScale = 1.0 + (growthFactor * 0.5);
      else if (plantLevel === 3) transformScale = 0.8 + (growthFactor * 0.3);
      else transformScale = 1.1 + (Math.min(plantLevel - 4, 2) * 0.1) + (growthFactor * 0.1);

      return (
         <div className="space-y-6 animate-fade-in pb-24">
             <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><Globe className="text-emerald-500"/> My Impact</h2>
             </div>

             {/* Level Growth Card */}
             <div className="glass-card p-8 rounded-2xl relative overflow-hidden flex flex-col items-center bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/20">
                 {/* Background Glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
                 
                 {/* Plant Animation */}
                 <div className="relative h-32 w-32 flex items-end justify-center mb-4">
                     <div className="absolute bottom-2 w-16 h-2 bg-black/10 rounded-full blur-sm"></div>
                     <div 
                        className="transition-all duration-700 ease-out origin-bottom"
                        style={{ transform: `scale(${transformScale})` }}
                     >
                        <PlantIcon 
                            size={plantLevel < 3 ? 60 : 80} 
                            className="text-emerald-600 dark:text-emerald-400 drop-shadow-lg" 
                            strokeWidth={plantLevel < 3 ? 2 : 1.5}
                        />
                     </div>
                     
                     {/* Floating particles */}
                     <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute bottom-4 left-0 w-2 h-2 bg-yellow-300 rounded-full animate-float opacity-60" style={{ animationDuration: '3s' }}></div>
                        <div className="absolute top-4 right-4 w-1 h-1 bg-blue-300 rounded-full animate-float opacity-60" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                     </div>
                 </div>

                 <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">Level {plantLevel}</h3>
                 <p className="text-sm font-medium text-emerald-600 uppercase tracking-widest mb-6">Eco Guardian</p>

                 {/* Progress Bar */}
                 <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between text-xs font-bold opacity-60">
                        <span>{currentLevelPoints} / {pointsPerLevel} pts</span>
                        <span>Next Level</span>
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600">
                        <div 
                           className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 relative"
                           style={{ width: `${progress}%`, transition: 'width 1s ease-out' }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                        </div>
                    </div>
                    <p className="text-xs text-center opacity-50 mt-2">Grow your impact to reach the next level!</p>
                 </div>
             </div>

             <div className="glass-card p-6 rounded-2xl text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5"><Globe size={100}/></div>
                 <h3 className="text-lg font-medium opacity-60 uppercase tracking-widest mb-2">Total Carbon Offset</h3>
                 <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{impactStats.co2.toFixed(1)} <span className="text-xl">kg</span></div>
                 <p className="text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 inline-block px-3 py-1 rounded-full font-medium">
                     Equivalent to {Math.max(1, Math.floor(impactStats.co2 / 20))} trees planted! 🌳
                 </p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                     <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Droplet size={24}/></div>
                     <div className="text-2xl font-bold">{impactStats.water} L</div>
                     <div className="text-xs opacity-60">Water Saved</div>
                 </div>
                 <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                     <div className="bg-amber-100 p-3 rounded-full text-amber-600"><Trash2 size={24}/></div>
                     <div className="text-2xl font-bold">{impactStats.waste.toFixed(1)} kg</div>
                     <div className="text-xs opacity-60">Waste Diverted</div>
                 </div>
                 <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                     <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Zap size={24}/></div>
                     <div className="text-2xl font-bold">{impactStats.energy} kWh</div>
                     <div className="text-xs opacity-60">Energy Saved</div>
                 </div>
                 <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                     <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Trophy size={24}/></div>
                     <div className="text-2xl font-bold">{Math.floor(ecoPoints / 100)}</div>
                     <div className="text-xs opacity-60">Badges Earned</div>
                 </div>
             </div>

             <div className="glass-card p-6 rounded-2xl h-80">
                 <h3 className="font-bold mb-4">Impact Distribution</h3>
                 <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                         <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                         <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                         </Bar>
                     </BarChart>
                 </ResponsiveContainer>
             </div>
         </div>
      );
  };

  const renderGreenTech = () => {
    return (
       <div className="space-y-6 animate-fade-in pb-24">
           <div className="flex items-center gap-3">
               <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
               <h2 className="text-2xl font-bold flex items-center gap-2"><SunIcon className="text-orange-500"/> Green Tech Advisor</h2>
           </div>

           {/* Step 1: Location Selection */}
           {!greenTechCity ? (
               <div className="glass-card p-6 rounded-2xl space-y-6 animate-slide-up">
                  <div className="text-center">
                     <MapPin size={48} className="mx-auto text-emerald-500 mb-2"/>
                     <h3 className="text-xl font-bold">Where are you located?</h3>
                     <p className="opacity-60 text-sm">We provide solutions tailored to your city's climate and policies.</p>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold ml-2 opacity-70">State</label>
                        <select 
                           value={greenTechState} 
                           onChange={(e) => setGreenTechState(e.target.value)}
                           className="glass-input w-full p-4 rounded-xl appearance-none"
                        >
                           <option value="">Select State</option>
                           {Object.keys(CITIES_BY_STATE).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                     
                     {greenTechState && (
                        <div className="animate-fade-in">
                           <label className="text-xs font-bold ml-2 opacity-70">City</label>
                           <input 
                              type="text"
                              value={tempCityInput} 
                              onChange={(e) => setTempCityInput(e.target.value)}
                              placeholder="Enter your City"
                              className="glass-input w-full p-4 rounded-xl"
                           />
                        </div>
                     )}

                     {greenTechState && tempCityInput.length > 2 && (
                        <button 
                           onClick={() => setGreenTechCity(tempCityInput)}
                           className="glass-action-btn w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 animate-slide-up"
                        >
                           Next <ArrowRight size={18}/>
                        </button>
                     )}
                  </div>
               </div>
           ) : !greenTechCategory ? (
               /* Step 2: Category Selection */
               <div className="space-y-4 animate-slide-up">
                  <div className="glass-card p-4 rounded-xl flex justify-between items-center bg-emerald-50/50">
                     <div>
                        <p className="text-xs opacity-60">Location</p>
                        <p className="font-bold">{greenTechCity}, {greenTechState}</p>
                     </div>
                     <button onClick={() => { setGreenTechCity(''); setGreenTechCategory(null); setTempCityInput(''); }} className="text-emerald-600 text-xs font-bold">Change</button>
                  </div>
                  
                  <h3 className="font-bold text-lg px-2">Select a Solution to Analyze</h3>
                  <div className="grid grid-cols-2 gap-4">
                     {GREEN_TECH_OPTIONS.map(opt => (
                        <button 
                           key={opt.id} 
                           onClick={() => { setGreenTechCategory(opt.title); setGreenTechResult(null); }}
                           className="glass-card p-4 rounded-2xl text-left hover:scale-[1.02] transition-transform border-b-4 border-transparent hover:border-orange-400"
                        >
                           <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 p-3 rounded-full w-fit mb-3">
                              <opt.icon size={24}/>
                           </div>
                           <h4 className="font-bold">{opt.title}</h4>
                           <p className="text-xs opacity-60 mt-1">{opt.desc}</p>
                        </button>
                     ))}
                  </div>
               </div>
           ) : (
               /* Step 3: Analysis View */
               <div className="space-y-6 animate-slide-up">
                  <div className="glass-card p-4 rounded-xl flex items-center gap-3 bg-orange-50/50">
                     <button onClick={() => setGreenTechCategory(null)} className="p-2 hover:bg-black/5 rounded-full"><ArrowLeft size={16}/></button>
                     <div>
                        <h3 className="font-bold text-lg">{greenTechCategory}</h3>
                        <p className="text-xs opacity-60">Analysis for {greenTechCity}</p>
                     </div>
                  </div>

                  {!greenTechResult ? (
                     <div className="glass-card p-6 rounded-2xl space-y-4">
                        <h4 className="font-bold">Customize Analysis (Optional)</h4>
                        <p className="text-sm opacity-70">Add specific details like '1000 sqft roof', 'budget 5 Lakhs', or 'apartment complex'.</p>
                        <textarea 
                           className="glass-input w-full p-4 rounded-xl h-24" 
                           placeholder="e.g. I live in a 3BHK flat on the 4th floor..."
                           value={greenTechSpec}
                           onChange={(e) => setGreenTechSpec(e.target.value)}
                        />
                        <AnalysisModeToggle mode={analysisMode} setMode={setAnalysisMode} />
                        <button 
                           onClick={handleGreenTechAnalysis} 
                           disabled={greenTechLoading}
                           className="glass-action-btn w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                           {greenTechLoading ? 'Analyzing Feasibility...' : 'Run Analysis'} <Sparkles size={18}/>
                        </button>
                     </div>
                  ) : (
                     <div className="space-y-4 animate-pop-in">
                        {/* Summary Card */}
                        <div className="glass-card p-6 rounded-2xl text-center">
                           <div className="flex justify-center mb-4">
                              <div className="w-24 h-24 rounded-full border-4 border-orange-500 flex items-center justify-center">
                                 <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{greenTechResult.suitabilityScore}</div>
                              </div>
                           </div>
                           <h4 className="font-bold text-lg mb-1">{greenTechResult.feasibility}</h4>
                           <p className="text-sm opacity-60">Suitability Score</p>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-4">
                           <div className="glass-card p-4 rounded-xl">
                              <p className="text-xs opacity-60 mb-1">Estimated Cost</p>
                              <p className="font-bold text-emerald-600">{greenTechResult.estimatedCost}</p>
                           </div>
                           <div className="glass-card p-4 rounded-xl">
                              <p className="text-xs opacity-60 mb-1">ROI Period</p>
                              <p className="font-bold text-blue-600">{greenTechResult.roi}</p>
                           </div>
                        </div>

                        {/* Recommendation */}
                        <div className="glass-card p-5 rounded-xl border-l-4 border-emerald-500">
                           <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><CheckCircle size={16}/> Best Option</h4>
                           <p className="text-sm">{greenTechResult.bestOption}</p>
                        </div>

                        {/* Deep Analysis Text */}
                        <div className="glass-card p-6 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                           <h4 className="font-bold mb-3 flex items-center gap-2 text-violet-600"><Brain size={18}/> Deep Analysis</h4>
                           <p className="text-sm leading-relaxed opacity-80 text-justify">{greenTechResult.deepAnalysis}</p>
                        </div>

                        {/* Govt Incentives */}
                        {greenTechResult.govtIncentives && greenTechResult.govtIncentives.length > 0 && (
                           <div className="glass-card p-5 rounded-xl">
                              <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><Award size={16}/> Govt Incentives & Subsidies</h4>
                              <ul className="list-disc pl-4 text-xs space-y-1 opacity-80">
                                 {greenTechResult.govtIncentives.map((inc, i) => <li key={i}>{inc}</li>)}
                              </ul>
                           </div>
                        )}
                        
                        <button onClick={() => setGreenTechResult(null)} className="glass-btn w-full py-3 rounded-xl font-bold">Analyze Another Option</button>
                     </div>
                  )}
               </div>
           )}
       </div>
    );
  };

  const renderReminders = () => (
    <div className="max-w-md mx-auto animate-fade-in">
       <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Bell className="text-teal-500" /> Reminders</h2>
       </div>

       <div className="glass-card p-6 rounded-2xl mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Reminder</h3>
          <div className="flex flex-col gap-4">
             <input 
               type="text" 
               placeholder="e.g. Water plants" 
               className="glass-input p-3 rounded-xl w-full"
               value={newReminderTitle}
               onChange={(e) => setNewReminderTitle(e.target.value)}
             />
             <div className="flex gap-4">
                <input 
                  type="time" 
                  className="glass-input p-3 rounded-xl flex-1"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                />
                <button 
                  onClick={() => {
                     if (newReminderTitle && newReminderTime) {
                        setReminders([...reminders, {
                           id: Date.now(),
                           title: newReminderTitle,
                           time: newReminderTime,
                           enabled: true,
                           triggered: false
                        }]);
                        setNewReminderTitle('');
                        setNewReminderTime('');
                     }
                  }}
                  className="glass-action-btn px-6 py-3 rounded-xl font-bold"
                >
                  Add
                </button>
             </div>
          </div>
       </div>

       <div className="space-y-4">
          {reminders.map(rem => (
             <div key={rem.id} className={`glass-card p-4 rounded-xl flex items-center justify-between ${rem.triggered ? 'border-teal-500 border-2' : ''}`}>
                <div className="flex items-center gap-4">
                   <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full text-teal-600">
                      <Clock size={20} />
                   </div>
                   <div>
                      <p className="font-semibold">{rem.title}</p>
                      <p className="text-sm opacity-70">{rem.time}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => setReminders(reminders.map(r => r.id === rem.id ? {...r, enabled: !r.enabled} : r))}
                     className={`w-12 h-6 rounded-full relative transition-colors ${rem.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${rem.enabled ? 'left-7' : 'left-1'}`}></div>
                   </button>
                   <button onClick={() => setReminders(reminders.filter(r => r.id !== rem.id))} className="text-red-500 p-2 hover:bg-red-100 rounded-full transition">
                      <Trash2 size={18} />
                   </button>
                </div>
             </div>
          ))}
          {reminders.length === 0 && (
             <div className="text-center py-8 opacity-60">No reminders set.</div>
          )}
       </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-fade-in pb-24">
       <div className="flex items-center gap-3">
          <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
          <h2 className="text-2xl font-bold">Settings & Profile</h2>
       </div>

       {/* Profile Card */}
       <div className="glass-card p-6 rounded-2xl relative overflow-hidden transition-all duration-300">
          {editingProfile ? (
            <div className="space-y-4 animate-fade-in">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Edit size={18} className="text-emerald-500"/> Edit Profile</h3>
                  <button onClick={() => setEditingProfile(false)} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"><X size={20}/></button>
               </div>
               
               <div className="flex justify-center mb-6">
                  <div className="relative group cursor-pointer" onClick={triggerGallery}>
                      <div className="w-28 h-28 rounded-full bg-emerald-100 flex items-center justify-center text-5xl shadow-inner overflow-hidden border-4 border-white group-hover:border-emerald-200 transition-colors">
                        {userProfile?.avatar ? (userProfile.avatar.startsWith('data') ? <img src={userProfile.avatar} className="w-full h-full object-cover"/> : userProfile.avatar) : '🌱'}
                      </div>
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera size={24} className="text-white"/>
                      </div>
                      <button className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 shadow-lg border-2 border-white transform translate-x-1 translate-y-1">
                         <Edit size={14} />
                      </button>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="text-xs font-bold ml-1 opacity-70 uppercase tracking-wider">Display Name</label>
                     <div className="relative">
                        <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                           className="glass-input w-full p-3 pl-10 rounded-xl"
                           value={editName}
                           onChange={(e) => setEditName(e.target.value)}
                           placeholder="Enter your name"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold ml-1 opacity-70 uppercase tracking-wider">Profession</label>
                     <div className="relative">
                        <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <select 
                           className="glass-input w-full p-3 pl-10 rounded-xl appearance-none bg-transparent"
                           value={editProfession}
                           onChange={(e) => setEditProfession(e.target.value)}
                        >
                           <option value="student">Student</option>
                           <option value="professional">Professional</option>
                           <option value="doctor">Doctor</option>
                           <option value="homemaker">Homemaker</option>
                           <option value="other">Other</option>
                        </select>
                        <ChevronRight className="absolute right-3 top-3.5 text-gray-400 rotate-90" size={18} />
                     </div>
                  </div>
               </div>

               <div className="pt-2">
                  <button 
                     onClick={() => {
                        if(editName && userProfile) {
                           setUserProfile({...userProfile, name: editName, profession: editProfession});
                           // Also update challenges if needed based on profession change
                        }
                        setEditingProfile(false);
                     }} 
                     className="glass-action-btn w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                     <Check size={18}/> Save Changes
                  </button>
               </div>
            </div>
          ) : (
            <div className="flex items-center gap-5">
               <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-5xl shadow-inner overflow-hidden border-4 border-white/50">
                     {userProfile?.avatar ? (userProfile.avatar.startsWith('data') ? <img src={userProfile.avatar} className="w-full h-full object-cover"/> : userProfile.avatar) : '🌱'}
                  </div>
               </div>
               
               <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                     <div>
                        <h3 className="text-2xl font-bold truncate">{userProfile?.name}</h3>
                        <p className="text-sm opacity-60 capitalize flex items-center gap-1"><Briefcase size={12}/> {userProfile?.profession}</p>
                     </div>
                     <button 
                        onClick={() => { 
                           setEditName(userProfile?.name || ''); 
                           setEditProfession(userProfile?.profession || 'student');
                           setEditingProfile(true); 
                        }}
                        className="glass-btn p-2.5 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Edit Profile"
                     >
                        <Edit size={18} />
                     </button>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mt-3 bg-emerald-100/50 dark:bg-emerald-900/20 w-fit px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                     <Award size={14} /> Level {plantLevel} Eco Warrior
                  </div>
               </div>
            </div>
          )}
       </div>

       {/* Personalization Section - KEY FOR IDEATHON */}
       <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase opacity-60 ml-2">Eco Persona (AI Context)</h3>
          <div className="glass-card p-4 rounded-xl space-y-4">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="bg-red-100 p-2 rounded-lg text-red-600"><Utensils size={20}/></div>
                   <div>
                      <p className="font-medium">Dietary Preference</p>
                      <p className="text-xs opacity-60">Affects recipe suggestions</p>
                   </div>
                </div>
                <select 
                   value={userProfile?.dietaryPreference || 'Non-Vegetarian'}
                   onChange={(e) => userProfile && setUserProfile({...userProfile, dietaryPreference: e.target.value as any})}
                   className="glass-input p-2 rounded-lg text-sm bg-transparent border-none outline-none text-right"
                >
                   <option value="Non-Vegetarian">Anything</option>
                   <option value="Vegetarian">Vegetarian</option>
                   <option value="Vegan">Vegan</option>
                   <option value="Eggetarian">Eggetarian</option>
                </select>
             </div>
             
             <div className="h-px bg-gray-200/50 dark:bg-gray-700/50"></div>

             <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users size={20}/></div>
                   <div>
                      <p className="font-medium">Household Size</p>
                      <p className="text-xs opacity-60">For accurate savings calc</p>
                   </div>
                </div>
                <select 
                   value={userProfile?.householdSize || 2}
                   onChange={(e) => userProfile && setUserProfile({...userProfile, householdSize: parseInt(e.target.value)})}
                   className="glass-input p-2 rounded-lg text-sm bg-transparent border-none outline-none text-right"
                >
                   <option value={1}>1 Person</option>
                   <option value={2}>2 People</option>
                   <option value={3}>3 People</option>
                   <option value={4}>4 People</option>
                   <option value={5}>5+ People</option>
                </select>
             </div>
          </div>
       </div>

       {/* Community Leaderboard - GAMIFICATION */}
       <div className="space-y-2">
           <h3 className="text-sm font-bold uppercase opacity-60 ml-2">Community Leaderboard</h3>
           <div className="glass-card p-0 rounded-xl overflow-hidden">
               {[
                  { name: "Aarav P.", points: 5200, avatar: "🌳", rank: 1 },
                  { name: "Meera K.", points: 4850, avatar: "🌲", rank: 2 },
                  { name: "You", points: ecoPoints, avatar: userProfile?.avatar || "🌱", rank: 12, highlight: true },
                  { name: "Rohan S.", points: 3100, avatar: "🌵", rank: 3 },
               ].sort((a,b) => b.points - a.points).map((u, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 border-b border-gray-100/50 dark:border-gray-800/50 ${u.highlight ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                      <div className="flex items-center gap-3">
                         <span className={`font-bold w-6 text-center ${i < 3 ? 'text-amber-500' : 'opacity-50'}`}>#{i + 1}</span>
                         <span className="text-xl">{u.avatar.length < 5 ? u.avatar : '👤'}</span>
                         <span className={u.highlight ? 'font-bold text-emerald-700 dark:text-emerald-400' : ''}>{u.name}</span>
                      </div>
                      <span className="font-bold opacity-80">{u.points} pts</span>
                  </div>
               ))}
               <div className="p-3 text-center text-xs opacity-60 hover:opacity-100 cursor-pointer">View Global Rankings</div>
           </div>
       </div>

       {/* App Preferences */}
       <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase opacity-60 ml-2">App Settings</h3>
          <div className="glass-card p-4 rounded-xl space-y-4">
             <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Moon size={20}/></div>
                   <span>Dark Mode</span>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-purple-500' : 'bg-slate-300'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>
             
             <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Languages size={20}/></div>
                   <span>Language</span>
                </div>
                <button onClick={() => setLanguage(l => l === 'english' ? 'hindi' : 'english')} className="text-sm font-bold text-indigo-600">
                   {language === 'english' ? 'English' : 'Hindi'}
                </button>
             </div>
          </div>
       </div>

       {/* Logout */}
       <button onClick={() => setIsAuthenticated(false)} className="w-full glass-card p-4 rounded-xl text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition">
          <LogOut size={20} /> Sign Out
       </button>
       
       <div className="text-center text-xs opacity-40 pt-4 flex flex-col items-center gap-1">
          <span>EcoWise v2.1 • Built for Ideathon</span>
          <span className="font-bold">Created by Supreet and Chirag</span>
       </div>
       
       <input type="file" ref={galleryInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
    </div>
  );

  // --- Render Sections ---
  
  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 pt-6">
              <div>
                <h1 className="text-3xl font-light text-slate-800 dark:text-white">
                  {t.welcome} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{userProfile?.name}</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-1">
                  <span className="text-2xl">{AVATARS[plantLevel - 1] || '🌳'}</span> Level {plantLevel} Eco Warrior
                </p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setShowTutorial(true)} className="glass-btn p-3 rounded-full text-xl" title="How to Use">
                    <HelpCircle size={24} className="text-slate-600 dark:text-white" />
                 </button>
                 <button onClick={() => setLanguage(language === 'english' ? 'hindi' : 'english')} className="glass-btn p-3 rounded-full text-xl" title="Switch Language">
                    <Globe2 size={24} className="text-blue-600"/>
                 </button>
                 <button onClick={() => setDarkMode(!darkMode)} className="glass-btn p-3 rounded-full text-xl">
                   {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-slate-600" />}
                 </button>
                 <button className="glass-btn p-3 rounded-full relative" onClick={() => setActiveSection('reminders')}>
                   <Bell size={24} className="text-slate-600 dark:text-white" />
                   {reminders.filter(r => r.enabled).length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                 </button>
              </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                  onClick={() => setActiveSection('impact-report')}
                  className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group cursor-pointer border-2 border-transparent hover:border-emerald-500 transition-all"
              >
                 <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                    <Leaf size={100} />
                 </div>
                 <div className="flex items-center gap-2 text-emerald-600 font-medium"><Award size={18}/> {t.points}</div>
                 <div className="text-4xl font-bold">{ecoPoints}</div>
                 <div className="text-xs text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-lg w-fit flex items-center gap-1">
                    View Impact <ChevronRight size={12}/>
                 </div>
              </div>
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
                 <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                    <Flame size={100} />
                 </div>
                 <div className="flex items-center gap-2 text-orange-500 font-medium"><Flame size={18}/> {t.streak}</div>
                 <div className="text-4xl font-bold">{streak + 4} <span className="text-lg font-normal opacity-60">days</span></div>
                 <div className="text-xs text-orange-500 bg-orange-100/50 px-2 py-1 rounded-lg w-fit">Keep it up!</div>
              </div>
            </div>

            {/* Main Features Grid */}
            <div>
               <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Sparkles className="text-yellow-500"/> {t.tools}</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {FEATURES.map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => setActiveSection(f.id)}
                      className="glass-card p-4 rounded-2xl flex flex-col items-center text-center gap-3 hover:scale-[1.02] transition-transform duration-300 border-b-4 border-transparent hover:border-b-emerald-400 group"
                    >
                       <div className={`p-3 rounded-full ${f.bg} ${f.color} group-hover:scale-110 transition-transform`}>
                          <f.icon size={28} />
                       </div>
                       <div>
                          <h3 className="font-bold text-sm">{f.label}</h3>
                          <p className="text-[10px] opacity-60 leading-tight mt-1">{f.desc}</p>
                       </div>
                    </button>
                  ))}
               </div>
            </div>
            
            {/* Share & Invite */}
            <div className="flex gap-4">
               <button onClick={handleShare} className="flex-1 glass-card p-4 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-white/40 transition">
                  <Share2 size={18} /> Share App
               </button>
               <button onClick={handleWhatsAppShare} className="flex-1 glass-card p-4 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-white/40 transition text-green-600">
                  <MessageCircle size={18} /> Invite
               </button>
            </div>
          </div>
        );

      case 'waste':
        return (
          <div className="space-y-6 animate-fade-in pb-20 pt-6">
             <div className="flex items-center gap-3">
                <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                <h2 className="text-2xl font-bold">{t.wasteDetector}</h2>
             </div>
             
             {/* Main Action Area */}
             <div className="glass-card p-6 rounded-3xl text-center space-y-6">
                
                {/* Image Preview Area */}
                <div 
                  onClick={!capturedImage ? startCameraFlow : undefined}
                  className={`relative w-full aspect-square max-h-[300px] mx-auto rounded-2xl border-2 border-dashed ${capturedImage ? 'border-transparent' : 'border-slate-300 dark:border-slate-600'} flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-100/50 dark:bg-slate-800/50 transition-all`}
                >
                   {capturedImage ? (
                      <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                   ) : (
                      <>
                        <Camera size={48} className="text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500 font-medium">Tap to Scan Item</p>
                      </>
                   )}
                   
                   {capturedImage && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); retakePhoto(); }} 
                        className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70"
                      >
                         <RefreshCw size={20} />
                      </button>
                   )}
                </div>

                {/* Input Controls */}
                <div className="flex gap-2">
                   <button onClick={triggerGallery} className="glass-btn p-3 rounded-xl flex-1 flex items-center justify-center gap-2 text-sm font-medium">
                      <ImageIcon size={18}/> Gallery
                   </button>
                   <input type="file" ref={galleryInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
                
                <div className="relative">
                   <input 
                     type="text" 
                     className="glass-input w-full p-4 rounded-xl pr-12"
                     placeholder="Or describe item..."
                     value={wasteInput}
                     onChange={(e) => setWasteInput(e.target.value)}
                   />
                   <button 
                     onClick={handleWasteAnalysis}
                     disabled={analyzingWaste}
                     className="absolute right-2 top-2 glass-action-btn p-2 rounded-lg"
                   >
                      {analyzingWaste ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <Search size={20} />}
                   </button>
                </div>
                
                <AnalysisModeToggle mode={analysisMode} setMode={setAnalysisMode} />

             </div>

             {/* Results Area */}
             {analyzingWaste && (
                <div className="text-center py-10 animate-pulse">
                   <div className="inline-block p-4 rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce"><Recycle size={32}/></div>
                   <h3 className="text-lg font-bold mb-2">Analyzing Material...</h3>
                   <p className="text-sm opacity-60 max-w-xs mx-auto">"{ecoFacts[currentFactIndex]}"</p>
                </div>
             )}

             {wasteResult && !analyzingWaste && (
                <div className="animate-slide-up space-y-4">
                   <div className="glass-card p-6 rounded-2xl border-l-8 border-emerald-500">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-xl font-bold">{wasteResult.item}</h3>
                         <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold uppercase">{wasteResult.classification}</span>
                      </div>
                      <p className="text-sm opacity-70 mb-4">{wasteResult.environmentalImpact}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                         <div className="bg-white/40 dark:bg-black/20 p-3 rounded-xl">
                            <div className="text-xs opacity-60 mb-1">Scrap Value</div>
                            <div className="font-bold text-emerald-600">{wasteResult.scrapValue}</div>
                         </div>
                         <div className="bg-white/40 dark:bg-black/20 p-3 rounded-xl">
                             <div className="text-xs opacity-60 mb-1">Confidence</div>
                             <div className="font-bold">{(wasteResult.confidence * 100).toFixed(0)}%</div>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Trash2 size={16}/> Disposal</h4>
                            <ul className="text-sm space-y-1 opacity-80 pl-4 list-disc">
                               {wasteResult.disposalSteps.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                         </div>
                         
                         {/* Reuse Ideas Section */}
                        <div>
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <Lightbulb size={18} className="fill-current" /> Reuse Ideas
                            </h4>
                            <div className="space-y-3">
                                {wasteResult.reuseIdeas.map((idea, i) => {
                                    // Keyword matching for icons
                                    let Icon = Lightbulb;
                                    const text = idea.toLowerCase();
                                    
                                    if (text.includes('plant') || text.includes('garden') || text.includes('grow') || text.includes('pot')) Icon = Sprout;
                                    else if (text.includes('craft') || text.includes('art') || text.includes('paint') || text.includes('decor')) Icon = Palette;
                                    else if (text.includes('build') || text.includes('construct') || text.includes('repair') || text.includes('wood')) Icon = Hammer;
                                    else if (text.includes('cut') || text.includes('shape')) Icon = Scissors;
                                    else if (text.includes('store') || text.includes('box') || text.includes('organize') || text.includes('container') || text.includes('bin')) Icon = Package;
                                    else if (text.includes('gift')) Icon = Gift;
                                    else if (text.includes('food') || text.includes('cook') || text.includes('eat')) Icon = Utensils;
                                    else if (text.includes('clean') || text.includes('wash')) Icon = Sparkles;
                                    
                                    return (
                                        <div key={i} className="flex items-start gap-3 bg-white/50 dark:bg-white/5 p-3 rounded-xl border border-white/20 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                                            <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 p-2 rounded-full shrink-0 mt-0.5">
                                                <Icon size={16} />
                                            </div>
                                            <p className="text-sm opacity-90 leading-relaxed">{idea}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                      </div>
                   </div>

                   {/* Deep Analysis Card */}
                   {wasteDeepAnalysis && (
                      <div className="glass-card p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100">
                         <div className="flex items-start gap-3">
                            <Info className="text-blue-500 shrink-0 mt-1" size={20} />
                            <div>
                               <h4 className="font-bold text-blue-700 dark:text-blue-300 text-sm mb-1">Did you know?</h4>
                               <p className="text-sm opacity-80">{wasteDeepAnalysis}</p>
                            </div>
                         </div>
                      </div>
                   )}

                   {/* Map Results */}
                   {loadingMap && <div className="text-center text-sm opacity-60 py-4">Finding nearby recyclers...</div>}
                   {wasteMapData && (
                      <div className="space-y-3">
                         <h3 className="font-bold text-lg px-2">Nearby Centers</h3>
                         {wasteMapData.map((center, i) => (
                            <div key={i} className="glass-card p-4 rounded-xl flex justify-between items-center group cursor-pointer" onClick={() => setExpandedCenterIndex(expandedCenterIndex === i ? null : i)}>
                               <div>
                                  <h4 className="font-bold text-sm">{center.name}</h4>
                                  <p className="text-xs opacity-60">{center.distance} • {center.rating}⭐</p>
                                  {expandedCenterIndex === i && (
                                     <div className="mt-2 text-xs space-y-1 animate-fade-in">
                                        <p>📍 {center.address}</p>
                                        <p>📞 {center.phone}</p>
                                        <p>🕒 {center.hours}</p>
                                     </div>
                                  )}
                               </div>
                               <button className="p-2 bg-emerald-100 text-emerald-600 rounded-full group-hover:bg-emerald-500 group-hover:text-white transition">
                                  <MapPin size={18} />
                                </button>
                            </div>
                         ))}
                      </div>
                   )}

                   {/* AI Pro Tips Card - NEW */}
                   {wasteResult.proTips && wasteResult.proTips.length > 0 && (
                      <div className="glass-card p-5 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 mt-4 border border-violet-100 dark:border-violet-800">
                         <h4 className="font-bold mb-3 flex items-center gap-2 text-violet-600 dark:text-violet-300">
                            <Sparkles size={18} /> AI Pro Tips
                         </h4>
                         <ul className="list-disc pl-4 text-sm space-y-2 opacity-80">
                            {wasteResult.proTips.map((tip, i) => <li key={i}>{tip}</li>)}
                         </ul>
                      </div>
                   )}
                </div>
             )}
          </div>
        );

      case 'reminders':
        return renderReminders();
      
      case 'settings':
         return renderSettings();

      case 'impact-report':
         return renderImpactDashboard();

      case 'greenTech':
         return renderGreenTech();

      case 'market':
        return (
           <div className="space-y-6 animate-fade-in pb-20 pt-6">
              <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="text-amber-500"/> Eco Market</h2>
              </div>
              
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                 <button onClick={() => setMarketTab('buy')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${marketTab === 'buy' ? 'bg-white text-emerald-600 shadow-sm' : 'opacity-60'}`}>Browse</button>
                 <button onClick={() => setMarketTab('sell')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${marketTab === 'sell' ? 'bg-white text-emerald-600 shadow-sm' : 'opacity-60'}`}>Sell / Trade</button>
              </div>

              {marketTab === 'buy' ? (
                 <div className="grid gap-4">
                    {marketItems.map(item => (
                       <div key={item.id} className="glass-card p-4 rounded-2xl flex gap-4">
                          <div className="w-24 h-24 bg-slate-200 rounded-xl shrink-0 flex items-center justify-center">
                             {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-xl"/> : <Package className="text-slate-400"/>}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <h3 className="font-bold">{item.title}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.type === 'Free' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{item.type}</span>
                             </div>
                             <p className="text-xs opacity-60 mb-2">{item.description}</p>
                             <div className="flex justify-between items-center mt-2">
                                <span className="text-sm font-bold flex items-center gap-1 text-emerald-600"><Coins size={14}/> {item.ecoCredits}</span>
                                <button className="glass-btn px-3 py-1 text-xs rounded-lg">Contact</button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="space-y-4">
                    <div 
                      onClick={startCameraFlow}
                      className="glass-card border-2 border-dashed border-slate-300 p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/40 transition"
                    >
                       {sellingImage ? (
                          <img src={sellingImage} className="h-48 object-contain rounded-xl" />
                       ) : (
                          <>
                             <Camera size={40} className="text-slate-400 mb-2"/>
                             <p className="text-sm font-medium">Take Photo of Item</p>
                          </>
                       )}
                    </div>
                    {sellingImage && (
                       <div className="space-y-3 animate-slide-up">
                          <input type="text" placeholder="Title" value={newMarketItem.title} onChange={e => setNewMarketItem({...newMarketItem, title: e.target.value})} className="glass-input w-full p-3 rounded-xl"/>
                          <textarea placeholder="Description" value={newMarketItem.desc} onChange={e => setNewMarketItem({...newMarketItem, desc: e.target.value})} className="glass-input w-full p-3 rounded-xl h-24"/>
                          <input type="number" placeholder="Eco Credits Price" value={newMarketItem.price} onChange={e => setNewMarketItem({...newMarketItem, price: e.target.value})} className="glass-input w-full p-3 rounded-xl"/>
                          
                          <AnalysisModeToggle mode={analysisMode} setMode={setAnalysisMode} />
                          
                          <button 
                             onClick={() => {
                                setMarketItems([...marketItems, {
                                   id: Date.now().toString(),
                                   title: newMarketItem.title || 'New Item',
                                   description: newMarketItem.desc || 'No desc',
                                   ecoCredits: parseInt(newMarketItem.price) || 0,
                                   contact: 'Me',
                                   type: 'Sale',
                                   user: 'me',
                                   image: sellingImage
                                }]);
                                setMarketTab('buy');
                                setSellingImage(null);
                                setNewMarketItem({title: '', desc: '', price: ''});
                             }}
                             className="glass-action-btn w-full py-3 rounded-xl font-bold"
                          >
                             List Item
                          </button>
                       </div>
                    )}
                 </div>
              )}
           </div>
        );

      case 'garden':
         return (
            <div className="space-y-6 animate-fade-in pb-20 pt-6">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><Sprout className="text-lime-500"/> Garden Guru</h2>
              </div>
              
              <div className="glass-card p-6 rounded-2xl space-y-4">
                 <p className="text-sm opacity-70">Tell us about your space to get AI plant recommendations.</p>
                 <input type="text" placeholder="Your City/Location" value={gardenLocation} onChange={e => setGardenLocation(e.target.value)} className="glass-input w-full p-3 rounded-xl"/>
                 <select value={gardenSpace} onChange={e => setGardenSpace(e.target.value)} className="glass-input w-full p-3 rounded-xl">
                    <option value="balcony">Balcony</option>
                    <option value="window">Window Sill</option>
                    <option value="backyard">Backyard</option>
                    <option value="terrace">Terrace</option>
                    <option value="indoor">Indoor (Low Light)</option>
                 </select>
                 <AnalysisModeToggle mode={analysisMode} setMode={setAnalysisMode} />
                 <button onClick={handleGardenAdvice} disabled={loadingGarden} className="glass-action-btn w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    {loadingGarden ? 'Consulting Nature...' : 'Get Plan'} <Sprout size={18}/>
                 </button>
              </div>

              {gardenResult && (
                 <div className="space-y-4 animate-slide-up">
                    <h3 className="font-bold text-lg">Recommended Plants</h3>
                    {gardenResult.recommendations.map((plant, i) => (
                       <div key={i} className="glass-card p-4 rounded-xl border-l-4 border-lime-500">
                          <div className="flex justify-between">
                             <h4 className="font-bold">{plant.plant}</h4>
                             <span className="text-xs bg-lime-100 text-lime-800 px-2 py-1 rounded-full">{plant.difficulty}</span>
                          </div>
                          <p className="text-xs mt-1 opacity-70">{plant.reason}</p>
                          <div className="mt-2 bg-white/30 p-2 rounded-lg text-xs flex gap-2 items-start">
                             <Thermometer size={14} className="shrink-0 mt-0.5"/> {plant.care}
                          </div>
                       </div>
                    ))}
                    <div className="glass-card p-4 rounded-xl bg-orange-50/50">
                       <h4 className="font-bold text-sm mb-2">Pro Tips</h4>
                       <ul className="text-xs space-y-1 list-disc pl-4 opacity-80">
                          {gardenResult.generalTips.map((tip, i) => <li key={i}>{tip}</li>)}
                       </ul>
                    </div>
                 </div>
              )}
            </div>
         );

      case 'commute':
         return (
            <div className="space-y-6 animate-fade-in pb-20 pt-6">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><Train className="text-sky-500"/> Green Commute</h2>
               </div>
               
               <div className="glass-card p-6 rounded-2xl text-center">
                  <h3 className="text-lg font-bold mb-6">Calculate Trip Footprint</h3>
                  <div className="flex justify-center gap-4 mb-6">
                     {['car', 'bus', 'train', 'bike'].map(mode => (
                        <button 
                           key={mode} 
                           onClick={() => setCommuteMode(mode)}
                           className={`p-4 rounded-xl transition-all ${commuteMode === mode ? 'bg-sky-500 text-white shadow-lg scale-110' : 'glass-btn opacity-60'}`}
                        >
                           {mode === 'car' && <Car size={24}/>}
                           {mode === 'bus' && <Bus size={24}/>}
                           {mode === 'train' && <Train size={24}/>}
                           {mode === 'bike' && <Bike size={24}/>}
                        </button>
                     ))}
                  </div>
                  <div className="flex gap-2 items-center mb-6">
                     <input 
                        type="number" 
                        placeholder="Distance (km)" 
                        value={commuteDist}
                        onChange={e => setCommuteDist(e.target.value)}
                        className="glass-input p-3 rounded-xl flex-1 text-center text-lg"
                     />
                     <span className="font-bold opacity-60">km</span>
                  </div>
                  <button onClick={handleCommuteCalc} className="glass-action-btn w-full py-3 rounded-xl font-bold">Calculate Impact</button>
               </div>

               {commuteResult && (
                  <div className="glass-card p-6 rounded-2xl animate-pop-in text-center">
                     <div className="text-4xl font-bold text-slate-800 dark:text-white mb-1">{commuteResult.co2} <span className="text-lg font-normal">kg CO2</span></div>
                     <p className="text-sm opacity-60 mb-6">Carbon emitted for this trip</p>
                     
                     <div className="bg-emerald-100/50 dark:bg-emerald-900/30 p-4 rounded-xl flex items-center gap-4 text-left">
                        <div className="bg-white p-3 rounded-full text-emerald-600"><TreeDeciduous size={24}/></div>
                        <div>
                           <div className="font-bold text-emerald-800 dark:text-emerald-200">Offset This</div>
                           <p className="text-xs opacity-70">It takes {commuteResult.trees} trees a whole day to absorb this amount.</p>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         );

      case 'chat':
         return (
            <div className="flex flex-col h-[85vh] animate-fade-in pb-16 pt-6">
               <div className="flex items-center gap-3 mb-4 shrink-0">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><MessageCircle className="text-violet-500"/> Eco Chat</h2>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-4 p-2 scrollbar-hide">
                  {chatMessages.map(msg => (
                     <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-violet-500 text-white rounded-br-none' : 'glass-card rounded-bl-none'}`}>
                           {msg.text}
                        </div>
                     </div>
                  ))}
                  {isChatLoading && (
                     <div className="flex justify-start">
                        <div className="glass-card p-3 rounded-2xl rounded-bl-none text-sm opacity-60 flex gap-1">
                           <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                        </div>
                     </div>
                  )}
                  <div ref={chatEndRef}></div>
               </div>

               <div className="mt-4 shrink-0 relative">
                  <input 
                     type="text" 
                     value={chatInput}
                     onChange={e => setChatInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleChat()}
                     placeholder="Ask about recycling, tips..."
                     className="glass-input w-full p-4 pr-12 rounded-full shadow-lg"
                  />
                  <button onClick={handleChat} className="absolute right-2 top-2 p-2 bg-violet-500 text-white rounded-full hover:scale-105 transition">
                     <Send size={20} />
                  </button>
               </div>
            </div>
         );

      case 'scan':
         return (
            <div className="space-y-6 animate-fade-in pb-20 pt-6">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><ScanLine className="text-cyan-500"/> Eco Scanner</h2>
               </div>

               <div className="glass-card p-6 rounded-3xl text-center space-y-6">
                  <div onClick={!capturedImage ? startCameraFlow : undefined} className="relative w-full aspect-square max-h-[300px] mx-auto rounded-2xl border-2 border-dashed border-cyan-300 flex flex-col items-center justify-center cursor-pointer bg-cyan-50/30">
                     {capturedImage ? (
                        <img src={capturedImage} className="w-full h-full object-cover rounded-xl" />
                     ) : (
                        <>
                           <Camera size={48} className="text-cyan-400 mb-2" />
                           <p className="text-sm text-slate-500">Scan any product</p>
                        </>
                     )}
                     {capturedImage && (
                       <button onClick={(e) => {e.stopPropagation(); retakePhoto()}} className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-full"><RefreshCw size={20}/></button>
                     )}
                  </div>
                  
                  {!capturedImage && (
                     <button onClick={triggerGallery} className="glass-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium">
                        <ImageIcon size={18}/> Upload from Gallery
                     </button>
                  )}

                  {capturedImage && !isScanning && !scannerResult && (
                     <>
                        <AnalysisModeToggle mode={analysisMode} setMode={setAnalysisMode} />
                        <button onClick={handleEcoScanner} className="glass-action-btn w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                           Analyze Sustainability <Sparkles size={18}/>
                        </button>
                     </>
                  )}
                  
                  {isScanning && <div className="text-cyan-600 animate-pulse font-medium">Scanning product details...</div>}

                  {scannerResult && (
                     <div className="glass-card p-4 rounded-xl border-l-4 border-cyan-500 text-left animate-slide-up">
                        <h4 className="font-bold mb-1 flex items-center gap-2"><Info size={16}/> AI Assessment</h4>
                        <p className="text-sm leading-relaxed">{scannerResult}</p>
                     </div>
                  )}
               </div>
               <input type="file" ref={galleryInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
         );

      case 'city':
         return (
            <div className="space-y-6 animate-fade-in pb-20 pt-6">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><Building2 className="text-emerald-500"/> City Pulse</h2>
               </div>
               
               <div className="glass-card p-6 rounded-2xl">
                  <div className="flex flex-col gap-3 mb-4">
                     <div className="flex gap-2">
                         <select 
                            value={selectedState} 
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="glass-input w-1/3 p-3 rounded-xl text-sm"
                         >
                            <option value="">State</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                         <input 
                            type="text" 
                            placeholder="City Name" 
                            value={cityQuery}
                            onChange={e => setCityQuery(e.target.value)}
                            className="glass-input flex-1 p-3 rounded-xl"
                         />
                     </div>
                     <AnalysisModeToggle mode={analysisMode} setMode={setAnalysisMode} />
                     <button onClick={handleCitySearch} disabled={loadingCity} className="glass-action-btn p-3 rounded-xl w-full flex justify-center items-center font-bold gap-2">
                        {loadingCity ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/> : <><Search size={20}/> Check Eco Score</>}
                     </button>
                  </div>
                  <p className="text-xs opacity-60 text-center">Get real-time AQI and green rating.</p>
               </div>

               {cityData && (
                  <div className="space-y-4 animate-slide-up">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-4 rounded-xl text-center">
                           <div className="text-sm opacity-60 mb-1">Air Quality</div>
                           <div className={`text-3xl font-bold ${cityData.aqi > 100 ? 'text-red-500' : 'text-emerald-500'}`}>{cityData.aqi}</div>
                           <div className="text-xs mt-1">AQI Index</div>
                        </div>
                        <div className="glass-card p-4 rounded-xl text-center">
                           <div className="text-sm opacity-60 mb-1">Eco Score</div>
                           <div className="text-3xl font-bold text-blue-500">{cityData.score}</div>
                           <div className="text-xs mt-1">/ 100</div>
                        </div>
                     </div>
                     <div className="glass-card p-5 rounded-xl space-y-3">
                        <div className="flex justify-between border-b border-gray-200/50 pb-2">
                           <span className="opacity-70">Green Cover</span>
                           <span className="font-bold">{cityData.greenCover}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200/50 pb-2">
                           <span className="opacity-70">Waste Mgmt</span>
                           <span className="font-bold">{cityData.wasteManagementRating}</span>
                        </div>
                     </div>
                     {/* Analysis Text Card */}
                     {cityData.analysis && (
                        <div className="glass-card p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100">
                           <h4 className="font-bold mb-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                              <BookOpen size={16}/> Analysis
                           </h4>
                           <p className="text-sm opacity-80 leading-relaxed text-justify whitespace-pre-line">{cityData.analysis}</p>
                        </div>
                     )}
                     <div className="glass-card p-5 rounded-xl bg-white/40 dark:bg-white/5">
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Leaf size={16}/> Recommendations</h4>
                        <ul className="list-disc pl-4 text-sm space-y-1 opacity-80">
                           {cityData.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ul>
                     </div>
                  </div>
               )}
            </div>
         );

      case 'food':
         return (
            <div className="space-y-6 animate-fade-in pb-20 pt-6">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><Utensils className="text-red-500"/> Food Rescue</h2>
               </div>
               
               <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold mb-2">What's in your fridge?</h3>
                  <textarea 
                     placeholder="e.g. 2 tomatoes, half onion, stale bread..." 
                     value={foodInput}
                     onChange={e => setFoodInput(e.target.value)}
                     className="glass-input w-full p-3 rounded-xl h-24 mb-4"
                  />
                  {userProfile?.dietaryPreference && (
                     <div className="text-xs text-red-600 mb-2 flex items-center gap-1">
                        <ChefHat size={12}/> Using your preference: <b>{userProfile.dietaryPreference}</b>
                     </div>
                  )}
                  <AnalysisModeToggle mode={analysisMode} setMode={setAnalysisMode} />
                  <button onClick={handleFoodRescue} disabled={analyzingFood} className="glass-action-btn w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                     {analyzingFood ? 'Chef is thinking...' : 'Generate Recipes'} <ChefHat size={20}/>
                  </button>
               </div>

               {foodResult && (
                  <div className="space-y-4 animate-slide-up">
                     {foodResult.recipes.map((recipe, i) => (
                        <div key={i} className="glass-card p-5 rounded-xl">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg text-red-600 dark:text-red-400">{recipe.name}</h3>
                              <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">{recipe.cookingTime}</span>
                           </div>
                           <div className="text-sm opacity-80 mb-3">{recipe.difficulty} • {recipe.calories}</div>
                           <div className="space-y-2">
                              <p className="text-xs font-bold uppercase opacity-60">Instructions</p>
                              <ol className="list-decimal pl-4 text-sm space-y-1">
                                 {recipe.instructions.slice(0, 3).map((step, j) => <li key={j}>{step}</li>)}
                              </ol>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         );

      case 'bill':
         return (
            <div className="space-y-6 animate-fade-in pb-20 pt-6">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="text-yellow-500"/> Bill Saver</h2>
               </div>
               
               <div className="glass-card p-6 rounded-2xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold ml-1 opacity-70">Electricity (Units/mo)</label>
                        <input type="number" value={elecInput} onChange={e => setElecInput(e.target.value)} className="glass-input w-full p-3 rounded-xl mt-1"/>
                     </div>
                     <div>
                        <label className="text-xs font-bold ml-1 opacity-70">Water (Liters/day)</label>
                        <input type="number" value={waterInput} onChange={e => setWaterInput(e.target.value)} className="glass-input w-full p-3 rounded-xl mt-1"/>
                     </div>
                  </div>
                  <AnalysisModeToggle mode={analysisMode} setMode={setAnalysisMode} />
                  <button onClick={handleBillAnalysis} disabled={analyzingBill} className="glass-action-btn w-full py-3 rounded-xl font-bold">
                     {analyzingBill ? 'Calculating...' : 'Analyze Savings'}
                  </button>
               </div>

               {billResult && (
                  <div className="glass-card p-6 rounded-2xl animate-pop-in text-center space-y-4">
                     <div>
                        <div className="text-4xl font-bold text-emerald-500">{billResult.efficiencyScore}</div>
                        <div className="text-xs opacity-60">Efficiency Score</div>
                     </div>
                     <div className="bg-yellow-100/50 dark:bg-yellow-900/30 p-3 rounded-xl text-yellow-800 dark:text-yellow-200 font-bold">
                        Potential Savings: {billResult.potentialSavings}
                     </div>
                     <div className="text-left space-y-3 pt-2">
                        <h4 className="font-bold text-sm">Top Tips</h4>
                        <ul className="text-sm list-disc pl-4 space-y-1 opacity-80">
                           {billResult.electricityTips.slice(0, 2).map((t, i) => <li key={i}>{t}</li>)}
                           {billResult.waterTips.slice(0, 2).map((t, i) => <li key={i+2}>{t}</li>)}
                        </ul>
                     </div>
                  </div>
               )}
            </div>
         );

      case 'impact':
         return (
            <div className="space-y-6 animate-fade-in pb-20 pt-6">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><Globe className="text-blue-500"/> Impact Calc</h2>
               </div>
               
               <div className="glass-card p-6 rounded-2xl">
                  <p className="text-sm opacity-70 mb-2">Check the environmental cost of any product.</p>
                  <div className="flex gap-2">
                     <input type="text" placeholder="e.g. Leather Jacket, Beef Burger" value={impactInput} onChange={e => setImpactInput(e.target.value)} className="glass-input w-full p-3 rounded-xl"/>
                     <button onClick={handleImpactCalc} disabled={analyzingImpact} className="glass-action-btn p-3 rounded-xl">
                        {analyzingImpact ? '...' : <Search size={20}/>}
                     </button>
                  </div>
                  <AnalysisModeToggle mode={analysisMode} setMode={setAnalysisMode} />
               </div>

               {impactResult && (
                  <div className="glass-card p-6 rounded-2xl animate-slide-up">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl">{impactResult.productName}</h3>
                        <div className={`text-lg font-bold ${impactResult.overallImpactScore > 70 ? 'text-red-500' : 'text-emerald-500'}`}>
                           {impactResult.overallImpactScore}/100 Impact
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-center">
                           <Cloud size={20} className="mx-auto mb-1 text-gray-500"/>
                           <div className="font-bold">{impactResult.carbonFootprint}</div>
                           <div className="text-[10px] opacity-60">CO2e</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center">
                           <Droplet size={20} className="mx-auto mb-1 text-blue-500"/>
                           <div className="font-bold">{impactResult.waterUsage}</div>
                           <div className="text-[10px] opacity-60">Water</div>
                        </div>
                     </div>
                     <h4 className="font-bold text-sm mb-2">Better Alternatives</h4>
                     <div className="space-y-2">
                        {impactResult.alternatives.map((alt, i) => (
                           <div key={i} className="flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-lg">
                              <span className="font-medium text-sm">{alt.name}</span>
                              <span className="text-xs text-emerald-600 font-bold">{alt.savings}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         );

      case 'sub':
         return (
            <div className="space-y-6 animate-fade-in pb-20 pt-6">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><RefreshCw className="text-purple-500"/> Smart Swaps</h2>
               </div>
               
               <div className="glass-card p-6 rounded-2xl">
                  <p className="text-sm opacity-70 mb-2">Find eco-friendly replacements for daily items.</p>
                  <div className="flex gap-2">
                     <input type="text" placeholder="e.g. Plastic Toothbrush" value={subInput} onChange={e => setSubInput(e.target.value)} className="glass-input w-full p-3 rounded-xl"/>
                     <button onClick={handleSmartSub} disabled={analyzingSub} className="glass-action-btn p-3 rounded-xl">
                        {analyzingSub ? '...' : <Search size={20}/>}
                     </button>
                  </div>
                  <AnalysisModeToggle mode={analysisMode} setMode={setAnalysisMode} />
               </div>

               {subResult && (
                  <div className="space-y-4 animate-slide-up">
                     <div className="p-4 rounded-xl bg-red-100/50 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                        <h4 className="font-bold text-sm mb-1">Why Switch?</h4>
                        <p className="text-xs opacity-80">{subResult.whySwitch}</p>
                     </div>
                     {subResult.alternatives.map((alt, i) => (
                        <div key={i} className="glass-card p-5 rounded-xl border-l-4 border-emerald-500">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg">{alt.name}</h3>
                              <div className="flex gap-1">
                                 {[...Array(5)].map((_, starI) => (
                                    <Leaf key={starI} size={12} className={starI < alt.sustainabilityScore/2 ? "text-emerald-500 fill-emerald-500" : "text-gray-300"}/>
                                 ))}
                              </div>
                           </div>
                           <p className="text-sm opacity-70 mb-2">{alt.impactDescription}</p>
                           <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                              {alt.costComparison}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         );
      
      case 'quiz':
         return (
            <div className="space-y-6 animate-fade-in pb-20 pt-6">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><Award className="text-pink-500"/> Daily Quiz</h2>
               </div>

               {!quizQuestion ? (
                  <div className="glass-card p-8 rounded-2xl text-center space-y-6">
                     <Brain size={64} className="mx-auto text-pink-400"/>
                     <h3 className="text-xl font-bold">Test Your Eco Knowledge</h3>
                     <p className="opacity-70">Answer correctly to earn 50 Eco Points!</p>
                     <button onClick={handleQuiz} disabled={quizLoading} className="glass-action-btn w-full py-3 rounded-xl font-bold">
                        {quizLoading ? 'Loading Question...' : 'Start Quiz'}
                     </button>
                  </div>
               ) : (
                  <div className="glass-card p-6 rounded-2xl animate-slide-up">
                     <h3 className="font-bold text-lg mb-6">{quizQuestion.question}</h3>
                     <div className="space-y-3">
                        {quizQuestion.options.map((opt: string, i: number) => (
                           <button 
                              key={i}
                              disabled={quizResult !== null}
                              onClick={() => submitQuiz(i)}
                              className={`w-full p-4 rounded-xl text-left transition-all ${
                                 quizResult !== null
                                    ? i === quizQuestion.correctAnswerIndex 
                                       ? 'bg-emerald-500 text-white shadow-lg'
                                       : i === quizSelected ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 opacity-50'
                                    : 'glass-btn hover:bg-white/60'
                              }`}
                           >
                              {opt}
                           </button>
                        ))}
                     </div>
                     {quizResult && (
                        <div className={`mt-6 p-4 rounded-xl ${quizResult === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                           <h4 className="font-bold mb-1">{quizResult === 'correct' ? 'Correct! +50 Points' : 'Oops!'}</h4>
                           <p className="text-sm">{quizQuestion.explanation}</p>
                        </div>
                     )}
                     {quizResult && (
                        <button onClick={() => setQuizQuestion(null)} className="mt-4 glass-btn w-full py-3 rounded-xl font-bold">Next Question</button>
                     )}
                  </div>
               )}
            </div>
         );

      case 'challenges':
         return (
            <div className="space-y-6 animate-fade-in pb-20 pt-6">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-orange-500"/> Challenges</h2>
               </div>
               
               <div className="glass-card p-4 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-200">
                  <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-1">Your Role: <span className="capitalize">{userProfile?.profession}</span></h3>
                  <p className="text-xs text-orange-700 dark:text-orange-300">Curated tasks for your lifestyle.</p>
               </div>

               <div className="space-y-4">
                  {(professionChallenges[userProfile?.profession || 'student'] || []).map(chal => {
                     const isCompleted = completedChallengeIds.includes(chal.id);
                     return (
                     <div key={chal.id} className={`glass-card p-4 rounded-xl flex items-center gap-4 transition ${isCompleted ? 'opacity-70 bg-gray-50/50' : 'group hover:scale-[1.02]'}`}>
                        <div className="text-3xl bg-white/50 p-3 rounded-full">{chal.icon}</div>
                        <div className="flex-1">
                           <h4 className={`font-bold ${isCompleted ? 'line-through opacity-60' : ''}`}>{chal.title}</h4>
                           <p className="text-xs opacity-60 mb-2">{chal.description}</p>
                           <div className="flex gap-2">
                              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{chal.duration} days</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                 {isCompleted ? 'Completed' : `+${chal.points} pts`}
                              </span>
                           </div>
                        </div>
                        <button 
                           onClick={() => {
                              if (isCompleted) return;
                              setCompletedChallengeIds(prev => [...prev, chal.id]);
                              setEcoPoints(p => p + chal.points);
                              setImpactStats(prev => ({ ...prev, co2: prev.co2 + (chal.points / 100) }));
                           }}
                           disabled={isCompleted}
                           className={`p-3 rounded-full transition-all ${isCompleted ? 'bg-emerald-500 text-white' : 'glass-action-btn'}`}
                        >
                           {isCompleted ? <CheckCircle size={20}/> : <Check size={20}/>}
                        </button>
                     </div>
                  )})}
               </div>
            </div>
         );

      case 'voice':
        return (
          <div className="flex flex-col items-center justify-center h-[80vh] animate-fade-in">
             <div className="relative mb-12">
                <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isLiveConnected ? 'bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.6)]' : 'bg-slate-200 dark:bg-slate-800'}`}>
                   {isLiveConnected ? <AudioWaveform size={60} className="text-white animate-pulse" /> : <Mic size={60} className="text-slate-400" />}
                </div>
                {isLiveConnected && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></div>
                )}
             </div>
             
             <h2 className="text-2xl font-bold mb-2">{liveStatus}</h2>
             <p className="text-center opacity-60 max-w-xs mb-10">
               {isLiveConnected ? "I'm listening. Ask me about recycling, energy tips, or sustainable living." : "Connect to have a real-time voice conversation."}
             </p>

             <button 
               onClick={isLiveConnected ? stopLiveSession : startLiveSession}
               className={`px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-transform active:scale-95 flex items-center gap-3 ${isLiveConnected ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}
             >
                {isLiveConnected ? <><StopCircle /> End Session</> : <><Mic /> Start Chat</>}
             </button>
          </div>
        );

      case 'noise':
        return (
          <div className="flex flex-col items-center justify-center h-[80vh] animate-fade-in space-y-8">
             <div className="flex items-center gap-3 absolute top-6 left-6">
                <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full"><ArrowLeft size={20}/></button>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Activity className="text-rose-500" /> Noise Patrol</h2>
             </div>
             
             <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90">
                   <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="15" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                   <circle 
                      cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="15" fill="transparent" 
                      className={`${noiseLevel > 80 ? 'text-red-500' : noiseLevel > 50 ? 'text-yellow-500' : 'text-emerald-500'} transition-all duration-300`}
                      strokeDasharray={754}
                      strokeDashoffset={754 - (754 * noiseLevel / 120)}
                      strokeLinecap="round"
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-6xl font-bold tabular-nums">{noiseLevel}</span>
                   <span className="text-sm opacity-60 uppercase tracking-widest">Decibels</span>
                </div>
             </div>
             
             <div className="glass-card p-4 rounded-xl text-center max-w-xs">
                <p className="font-medium">
                   {noiseLevel < 50 ? "🌿 Peaceful Environment" : noiseLevel < 80 ? "⚠️ Moderate Noise" : "🚨 Hazardous Noise Levels"}
                </p>
             </div>

             <button 
               onClick={isMeasuringNoise ? stopNoiseMeter : startNoiseMeter}
               className={`px-8 py-3 rounded-full font-bold transition-all ${isMeasuringNoise ? 'bg-slate-200 text-slate-800' : 'glass-action-btn'}`}
             >
                {isMeasuringNoise ? "Stop Measuring" : "Start Measuring"}
             </button>
          </div>
        );

      default: {
        return (
          <div className="p-6 animate-fade-in text-center">
             <button onClick={() => setActiveSection('home')} className="glass-btn p-2 rounded-full absolute left-4 top-4"><ArrowLeft/></button>
             <div className="mt-20 opacity-50">
                <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                <p>The {activeSection} feature is under construction.</p>
             </div>
          </div>
        );
      }
    }
  };

  if (showSplash) {
      return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
            <div className="relative z-10 text-center animate-fade-in px-6">
                <div className="inline-block p-6 rounded-full bg-emerald-500/20 mb-6 animate-bounce">
                    <Leaf size={80} className="text-emerald-400" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4 animate-slide-up">
                    Welcome to <span className="text-emerald-400">EcoWise</span>
                </h1>
                <p className="text-xl text-slate-300 animate-pulse">Your Sustainable Living Companion</p>
            </div>
        </div>
      );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <DynamicBackground darkMode={darkMode} />
        
        {/* Tutorial Modal in Login Screen if triggered */}
        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} language={language} />}
        
        {/* Help Button and Language Switcher on Top Right of Login Screen */}
        <div className="absolute top-6 right-6 z-20 flex gap-2">
            <button 
              onClick={() => setLanguage(l => l === 'english' ? 'hindi' : 'english')} 
              className="glass-btn p-3 rounded-full flex items-center gap-2 font-bold text-sm hover:scale-105 transition-transform"
              title="Switch Language"
            >
                <Globe2 size={20} />
            </button>
            <button 
              onClick={() => setShowTutorial(true)} 
              className="glass-btn p-3 rounded-full flex items-center gap-2 font-bold text-sm hover:scale-105 transition-transform"
            >
                <HelpCircle size={20} /> How to Use
            </button>
        </div>

        <div className="glass-card max-w-md w-full p-8 rounded-3xl z-10 animate-pop-in">
           <div className="text-center mb-8">
              <div className="inline-block p-4 rounded-full bg-emerald-500/20 mb-4 animate-float">
                 <Leaf size={48} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">EcoWise</h1>
              <p className="text-slate-600 dark:text-slate-300">Your AI Companion for Sustainable Living</p>
           </div>

           <form onSubmit={handleAuth} className="space-y-4">
              
              {authError && (
                 <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16}/> {authError}
                 </div>
              )}

              {authMode === 'signup' && (
                 <div className="animate-slide-up">
                    <label className="block text-sm font-medium mb-1 ml-1 opacity-70">Email Address (Gmail)</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                          type="email" 
                          required
                          className="glass-input w-full p-3 pl-10 rounded-xl outline-none" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="user@gmail.com"
                        />
                    </div>
                 </div>
              )}

              <div>
                 <label className="block text-sm font-medium mb-1 ml-1 opacity-70">Username</label>
                 <div className="relative">
                    <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      className="glass-input w-full p-3 pl-10 rounded-xl outline-none" 
                      value={loginId} 
                      onChange={(e) => setLoginId(e.target.value)} 
                      placeholder="Choose unique username"
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-medium mb-1 ml-1 opacity-70">Password</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input 
                      type="password" 
                      required
                      className="glass-input w-full p-3 pl-10 rounded-xl outline-none" 
                      value={loginPass} 
                      onChange={(e) => setLoginPass(e.target.value)} 
                      placeholder="••••••••"
                    />
                 </div>
              </div>
              
              <div className="py-2">
                 <label className="block text-sm font-medium mb-3 ml-1 opacity-70">Choose Avatar</label>
                 <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
                    {AVATARS.map(av => (
                       <button 
                         type="button" 
                         key={av} 
                         onClick={() => setSelectedAvatar(av)}
                         className={`text-2xl p-3 rounded-xl transition-all ${selectedAvatar === av ? 'bg-emerald-500 text-white shadow-lg scale-110' : 'bg-white/50 hover:bg-emerald-100'}`}
                       >
                         {av}
                       </button>
                    ))}
                 </div>
              </div>

              <button type="submit" className="glass-action-btn w-full py-4 rounded-xl font-bold text-lg mt-4 flex items-center justify-center gap-2 group">
                 {authMode === 'login' ? 'Login' : 'Create Account'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </button>

              <div className="text-center pt-2">
                 <button 
                   type="button"
                   onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
                   className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                 >
                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                 </button>
              </div>
           </form>
        </div>
        
        {/* Credit Line Login Screen */}
        <div className="absolute bottom-4 z-20 text-center w-full pointer-events-none">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/30 dark:bg-black/30 px-3 py-1 rounded-full inline-block backdrop-blur-sm">Created by Supreet and Chirag</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-sans text-slate-800 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden">
      <DynamicBackground darkMode={darkMode} />
      
      {/* Global Tutorial Modal if Authenticated and Triggered */}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} language={language} />}

      {/* Credit Line - Visible Everywhere */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex justify-center pointer-events-none">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-4 py-1.5 rounded-b-xl border-b border-white/20 shadow-sm flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100 tracking-wide">Created by Supreet and Chirag</span>
          </div>
      </div>
      
      {/* Global Loading Indicator */}
      {isAiProcessing && (
         <div className="fixed top-12 left-0 right-0 z-50 flex justify-center pointer-events-none animate-fade-in">
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-3 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-emerald-500/30">
               <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </div>
               <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Sparkles size={12} className="text-emerald-500"/> AI Processing...
               </span>
            </div>
         </div>
      )}

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto p-4 md:p-6 min-h-screen">
         {renderSection()}
      </main>

      {/* Floating Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav z-40 pb-safe">
         <div className="max-w-md mx-auto flex justify-around p-4 items-center">
            <button onClick={() => setActiveSection('home')} className={`p-2 rounded-full transition-all ${activeSection === 'home' ? 'text-emerald-500 bg-emerald-100/50 scale-110' : 'opacity-60'}`}>
               <Home size={24} />
            </button>
            <button onClick={() => setActiveSection('waste')} className={`p-2 rounded-full transition-all ${activeSection === 'waste' ? 'text-green-500 bg-green-100/50 scale-110' : 'opacity-60'}`}>
               <Recycle size={24} />
            </button>
            <div className="relative -top-6">
               <button 
                 onClick={() => setActiveSection('voice')}
                 className="w-16 h-16 rounded-full glass-action-btn flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-float"
               >
                  <Mic size={28} />
               </button>
            </div>
            <button onClick={() => setActiveSection('challenges')} className={`p-2 rounded-full transition-all ${activeSection === 'challenges' ? 'text-orange-500 bg-orange-100/50 scale-110' : 'opacity-60'}`}>
               <Trophy size={24} />
            </button>
            <button onClick={() => setActiveSection('settings')} className={`p-2 rounded-full transition-all ${activeSection === 'settings' ? 'text-blue-500 bg-blue-100/50 scale-110' : 'opacity-60'}`}>
               <Settings size={24} />
            </button>
         </div>
      </nav>

      {/* Overlays */}
      {showCamera && <WebCamera onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
      {showCropper && tempImage && <ImageCropper imageSrc={tempImage} onConfirm={handleCropConfirm} onCancel={() => { setShowCropper(false); setTempImage(null); }} />}
    </div>
  );
};

export default EcoWiseApp;