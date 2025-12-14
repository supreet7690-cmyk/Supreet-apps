

export interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  duration: number;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface UserProfile {
  name: string;
  avatar: string;
  profession: 'student' | 'professional' | 'doctor' | 'homemaker' | 'other';
  joinDate: Date;
  badges: string[];
  weeklyStats?: { day: string; points: number }[];
  // Personalization for AI
  dietaryPreference?: 'Vegetarian' | 'Vegan' | 'Non-Vegetarian' | 'Eggetarian';
  householdSize?: number;
}

export interface Reminder {
  id: number;
  title: string;
  time: string;
  triggered: boolean;
  enabled: boolean;
}

export interface CityData {
  aqi: number;
  score: number;
  greenCover: string;
  wasteManagementRating: string;
  govtSchemes: string[];
  recommendations: string[];
  analysis?: string; // Detailed text analysis
}

export interface WasteAnalysis {
  item: string;
  classification: 'Recyclable' | 'Organic' | 'Hazardous' | 'General Waste';
  disposalSteps: string[];
  reuseIdeas: string[];
  confidence: number;
  scrapValue: string;
  environmentalImpact: string;
  proTips: string[];
}

export interface ImpactAnalysis {
  productName: string;
  carbonFootprint: string;
  waterUsage: string;
  alternatives: Array<{
    name: string;
    savings: string;
    reason: string;
  }>;
  overallImpactScore: number; // 0-100
}

export interface SubstitutionResult {
  originalItem: string;
  alternatives: Array<{
    name: string;
    sustainabilityScore: number; // 0-10
    costComparison: string; // e.g. "Cheaper long term"
    impactDescription: string;
  }>;
  whySwitch: string;
}

export interface BillAnalysis {
  electricityTips: string[];
  waterTips: string[];
  potentialSavings: string;
  efficiencyScore: number; // 0-100
}

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: string;
  calories?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface MarketItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  contact: string;
  type: 'Free' | 'Trade' | 'Sale';
  price?: string;
  user: string; // 'me' or 'other'
  ecoCredits: number;
}

export interface GardenPlan {
  recommendations: Array<{
    plant: string;
    reason: string;
    care: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }>;
  generalTips: string[];
}

export interface GreenTechAnalysis {
  suitabilityScore: number;
  feasibility: string;
  bestOption: string;
  estimatedCost: string;
  roi: string;
  deepAnalysis: string;
  govtIncentives: string[];
}