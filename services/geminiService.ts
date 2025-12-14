import { GoogleGenAI, Type, Schema } from "@google/genai";

// Safely retrieve API Key to avoid ReferenceError in some mobile WebViews
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.error("Error accessing process.env", e);
  }
  return undefined;
};

const apiKey = getApiKey();

// Helper to create a new client instance
export const getAiClient = () => new GoogleGenAI({ apiKey: apiKey });

const getModePrompt = (mode: 'concise' | 'deep') => {
  return mode === 'deep' 
    ? "Provide a highly detailed, in-depth analysis with scientific context, comprehensive explanations, and extended tips." 
    : "Keep the response concise, brief, and directly to the point. Use short bullet points.";
};

export const analyzeWasteItem = async (
  description: string, 
  imageBase64?: string, 
  language: 'english' | 'hindi' = 'english',
  mode: 'concise' | 'deep' = 'concise'
): Promise<any> => {
  const ai = getAiClient();
  const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
  const modeInstruction = getModePrompt(mode);

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      item: { type: Type.STRING },
      classification: { type: Type.STRING, enum: ['Recyclable', 'Organic', 'Hazardous', 'General Waste'] },
      disposalSteps: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      reuseIdeas: {
        type: Type.ARRAY, 
        items: { type: Type.STRING }
      },
      confidence: { type: Type.NUMBER },
      scrapValue: { type: Type.STRING, description: "Estimated scrap value in INR (e.g., ₹10-20/kg) if applicable, else 'N/A'" },
      environmentalImpact: { type: Type.STRING, description: "Environmental impact description" },
      proTips: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3 specific professional tips to reduce waste related to this item."
      }
    },
    required: ['item', 'classification', 'disposalSteps', 'reuseIdeas', 'scrapValue', 'environmentalImpact', 'proTips']
  };

  const parts: any[] = [];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64
      }
    });
    parts.push({
        text: `Analyze this waste item shown in the image and described as: "${description}". Classify it, provide disposal steps for an Indian context, creative reuse ideas, estimated scrap value in INR (kabadiwala rates), environmental impact, and 3 pro tips for waste reduction. ${modeInstruction} ${langPrompt}`
    });
  } else {
    parts.push({
        text: `Analyze this waste item: "${description}". Classify it, provide disposal steps for an Indian context, creative reuse ideas, estimated scrap value in INR (kabadiwala rates), environmental impact, and 3 pro tips for waste reduction. ${modeInstruction} ${langPrompt}`
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: `You are an expert environmentalist and waste management specialist specifically for the Indian context. ${langPrompt}`
      }
    });
    
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Waste analysis failed", error);
    throw error;
  }
};

export const getCityEcoData = async (
  cityName: string, 
  language: 'english' | 'hindi' = 'english',
  mode: 'concise' | 'deep' = 'concise',
  existingData: any | null = null
): Promise<any> => {
  const ai = getAiClient();
  const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
  const modeInstruction = mode === 'deep' 
    ? "Provide a detailed analysis explaining the environmental situation, pollution sources, and specific green initiatives." 
    : "Keep the analysis brief and to the point.";

  try {
    let prompt = "";
    let config: any = {};

    if (existingData) {
      // Reuse existing stats, only regenerate analysis text
      prompt = `
        I have the following environmental data for ${cityName}: ${JSON.stringify(existingData)}.
        Please strictly maintain the numeric values for 'aqi', 'score' and the text for 'greenCover' and 'wasteManagementRating'.
        Your task is to regenerate the 'analysis' field to be ${mode}. 
        ${modeInstruction}
        ${langPrompt}
        Return the complete JSON object with the same keys and values, but updated analysis.
      `;
      config = {
        responseMimeType: 'application/json'
      };
    } else {
      // Perform fresh search
      prompt = `Search for current environmental data for ${cityName}, India. I need the current AQI, a general eco-score out of 100 based on green cover and cleanliness, waste management rating, and active government green schemes. 
      Return the data as a valid JSON object with keys: 
      aqi (number), 
      score (number), 
      greenCover (string), 
      wasteManagementRating (string), 
      govtSchemes (array of strings), 
      recommendations (array of strings),
      analysis (string - a summary of the city's environmental health, respecting the ${mode} mode). 
      ${modeInstruction} ${langPrompt}`;
      config = {
        tools: [{ googleSearch: {} }],
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: config
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("City data fetch failed", error);
    return {
      aqi: 150,
      score: 65,
      greenCover: "Moderate",
      wasteManagementRating: "Improving",
      govtSchemes: ["Swachh Bharat Abhiyan", "Smart City Mission"],
      recommendations: ["Use public transport", "Plant more trees"],
      analysis: "Could not fetch real-time data. Estimates provided."
    };
  }
};

export const calculateImpact = async (
  productName: string, 
  language: 'english' | 'hindi' = 'english',
  mode: 'concise' | 'deep' = 'concise'
): Promise<any> => {
  const ai = getAiClient();
  const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
  const modeInstruction = getModePrompt(mode);

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING },
      carbonFootprint: { type: Type.STRING, description: "Estimated CO2 e.g., '2.5 kg'" },
      waterUsage: { type: Type.STRING, description: "Estimated water e.g., '500 liters'" },
      overallImpactScore: { type: Type.NUMBER, description: "0 to 100, where 100 is very high impact (bad)" },
      alternatives: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            savings: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the environmental impact of "${productName}". Estimate carbon footprint and water usage. Suggest 2 eco-friendly alternatives. ${modeInstruction} ${langPrompt}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: `You are a sustainability consultant helping consumers make better choices. ${langPrompt}`
      }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Impact calculation failed", error);
    throw error;
  }
};

export const getSmartSubstitution = async (
  item: string, 
  language: 'english' | 'hindi' = 'english',
  mode: 'concise' | 'deep' = 'concise'
): Promise<any> => {
  const ai = getAiClient();
  const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
  const modeInstruction = getModePrompt(mode);

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      originalItem: { type: Type.STRING },
      alternatives: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sustainabilityScore: { type: Type.NUMBER, description: "Score from 1-10" },
            costComparison: { type: Type.STRING, description: "e.g. 'One time investment, cheaper over 1 year'" },
            impactDescription: { type: Type.STRING }
          }
        }
      },
      whySwitch: { type: Type.STRING }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Suggest smart, sustainable substitutions for: "${item}". Focus on practical, daily life items. ${modeInstruction} ${langPrompt}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Substitution analysis failed", error);
    throw error;
  }
};

export const analyzeBill = async (
  electricityUnits: number, 
  waterLiters: number, 
  language: 'english' | 'hindi' = 'english',
  mode: 'concise' | 'deep' = 'concise'
): Promise<any> => {
  const ai = getAiClient();
  const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
  const modeInstruction = getModePrompt(mode);

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      electricityTips: { type: Type.ARRAY, items: { type: Type.STRING } },
      waterTips: { type: Type.ARRAY, items: { type: Type.STRING } },
      potentialSavings: { type: Type.STRING, description: "Estimated savings in INR e.g. '₹500-800 per month'" },
      efficiencyScore: { type: Type.NUMBER, description: "0-100 where 100 is extremely efficient" }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze monthly consumption: Electricity ${electricityUnits} kWh, Water ${waterLiters} liters/day. Provide specific, actionable tips to reduce this bill in an Indian household context. Estimate potential monetary savings. ${modeInstruction} ${langPrompt}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Bill analysis failed", error);
    throw error;
  }
};

export const getLeftoverRecipes = async (
  ingredients: string, 
  diet?: string, 
  language: 'english' | 'hindi' = 'english',
  mode: 'concise' | 'deep' = 'concise'
): Promise<any> => {
  const ai = getAiClient();
  const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
  const modeInstruction = getModePrompt(mode);

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      recipes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            cookingTime: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            calories: { type: Type.STRING }
          }
        }
      }
    }
  };

  const dietPrompt = diet ? `Strictly suggest ${diet} recipes.` : '';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Suggest 3 creative and tasty recipes using these leftover ingredients: "${ingredients}". ${dietPrompt} You can assume basic pantry staples (salt, oil, spices, flour) are available. Focus on minimizing food waste. Return valid JSON. ${modeInstruction} ${langPrompt}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: `You are a creative chef focused on zero-waste cooking. ${langPrompt}`
      }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Recipe generation failed", error);
    throw error;
  }
};

export const findRecyclingCenters = async (lat: number, lng: number, itemType: string, language: 'english' | 'hindi' = 'english'): Promise<any> => {
  const ai = getAiClient();
  const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
  
  // Using Google Maps Tool via search grounding
  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find 3 recycling centers or scrap dealers (kabadiwalas) near latitude ${lat}, longitude ${lng} that accept ${itemType}. Return a JSON array with name, address, rating (if available), distance (estimated text), phone (if available), hours (if available). ${langPrompt}`,
        config: {
           tools: [{ googleSearch: {} }] // Maps grounding often accessed via search for general queries
        }
     });
     
     const text = response.text || "[]";
     const jsonMatch = text.match(/\[[\s\S]*\]/);
     if (jsonMatch) return JSON.parse(jsonMatch[0]);
     return [
        { name: "City Recycling Unit", address: "Sector 4, Main Road", rating: 4.5, distance: "2 km", phone: "9876543210", hours: "9 AM - 6 PM" },
        { name: "Green Earth Scrap", address: "Market Lane, Block B", rating: 4.2, distance: "3.5 km", phone: "9898989898", hours: "10 AM - 8 PM" },
        { name: "Eco Waste Solutions", address: "Industrial Area", rating: 4.0, distance: "5 km", phone: "N/A", hours: "9 AM - 5 PM" }
     ];
  } catch (error) {
     console.error("Map search failed", error);
     throw error;
  }
};

export const chatWithAi = async (history: any[], message: string, language: 'english' | 'hindi' = 'english'): Promise<string> => {
   const ai = getAiClient();
   const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
   
   const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
         systemInstruction: `You are EcoWise, a helpful, encouraging, and knowledgeable sustainability assistant. Keep answers concise and actionable. ${langPrompt}`,
      }
   });
   
   const result = await chat.sendMessage({ message: `${message} (${langPrompt})` });
   return result.text || "I'm having trouble connecting right now.";
};

export const analyzeImageDeep = async (
  imageBase64: string, 
  prompt: string, 
  language: 'english' | 'hindi' = 'english',
  mode: 'concise' | 'deep' = 'concise'
): Promise<string> => {
    const ai = getAiClient();
    const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
    const modeInstruction = getModePrompt(mode);

    const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: {
          parts: [
             { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
             { text: `${prompt} ${modeInstruction} ${langPrompt}` }
          ]
       }
    });
    return response.text || "Could not analyze image.";
};

export const getEcoQuiz = async (language: 'english' | 'hindi' = 'english'): Promise<any> => {
   const ai = getAiClient();
   const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";

   const schema: Schema = {
      type: Type.OBJECT,
      properties: {
         question: { type: Type.STRING },
         options: { type: Type.ARRAY, items: { type: Type.STRING } },
         correctAnswerIndex: { type: Type.INTEGER },
         explanation: { type: Type.STRING }
      }
   };
   
   try {
      const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: `Generate a random interesting multiple choice question about sustainability, climate change, or recycling. Difficulty: Medium. ${langPrompt}`,
         config: {
            responseMimeType: 'application/json',
            responseSchema: schema
         }
      });
      return response.text ? JSON.parse(response.text) : null;
   } catch (e) {
      console.error(e);
      throw e;
   }
};

export const getGardenAdvice = async (
  location: string, 
  spaceType: string, 
  language: 'english' | 'hindi' = 'english',
  mode: 'concise' | 'deep' = 'concise'
): Promise<any> => {
  const ai = getAiClient();
  const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
  const modeInstruction = getModePrompt(mode);

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      recommendations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            plant: { type: Type.STRING },
            reason: { type: Type.STRING },
            care: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] }
          }
        }
      },
      generalTips: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  };

  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Suggest 3 best plants for a "${spaceType}" garden in "${location}". ${modeInstruction} ${langPrompt}`,
        config: {
           responseMimeType: 'application/json',
           responseSchema: schema
        }
     });
     return response.text ? JSON.parse(response.text) : null;
  } catch (e) {
     console.error(e);
     throw e;
  }
};

export const generateMarketItemDetails = async (
  imageBase64: string,
  language: 'english' | 'hindi' = 'english',
  mode: 'concise' | 'deep' = 'concise'
): Promise<any> => {
   const ai = getAiClient();
   const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
   
   const schema: Schema = {
      type: Type.OBJECT,
      properties: {
         title: { type: Type.STRING },
         description: { type: Type.STRING },
         suggestedEcoCredits: { type: Type.NUMBER }
      }
   };

   try {
      const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: {
            parts: [
               { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
               { text: `Analyze this image for a secondhand marketplace. Generate a catchy title, a short description (mentioning condition/material), and suggested "Eco Credits" price (10-500). ${langPrompt}` }
            ]
         },
         config: {
            responseMimeType: 'application/json',
            responseSchema: schema
         }
      });
      return response.text ? JSON.parse(response.text) : null;
   } catch (e) {
      console.error(e);
      return null;
   }
};

export const analyzeGreenTech = async (
   city: string,
   state: string,
   category: string,
   spec: string,
   language: 'english' | 'hindi' = 'english',
   mode: 'concise' | 'deep' = 'concise'
): Promise<any> => {
   const ai = getAiClient();
   const langPrompt = language === 'hindi' ? "Respond entirely in Hindi." : "Respond in English.";
   const modeInstruction = getModePrompt(mode);

   const schema: Schema = {
      type: Type.OBJECT,
      properties: {
         suitabilityScore: { type: Type.NUMBER, description: "0-100" },
         feasibility: { type: Type.STRING, description: "High/Medium/Low with brief reason" },
         bestOption: { type: Type.STRING },
         estimatedCost: { type: Type.STRING, description: "Estimated in INR" },
         roi: { type: Type.STRING, description: "Return on Investment period" },
         deepAnalysis: { type: Type.STRING, description: "Detailed explanation" },
         govtIncentives: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
   };

   try {
      const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: `Analyze feasibility of "${category}" in "${city}, ${state}". User specific details: "${spec}". Provide estimated costs, ROI, best specific type (e.g. Monocrystalline vs Polycrystalline for Solar), and government subsidies available in this region. ${modeInstruction} ${langPrompt}`,
         config: {
            responseMimeType: 'application/json',
            responseSchema: schema
         }
      });
      return response.text ? JSON.parse(response.text) : null;
   } catch (e) {
      console.error(e);
      throw e;
   }
};