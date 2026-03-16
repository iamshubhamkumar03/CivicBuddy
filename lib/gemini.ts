import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API with your key from Google AI Studio
// Keep this key safe!
const genAI = new GoogleGenerativeAI("AIzaSyBP_I9ReO_E65c0Zy9VG8wvPkOO0CAUc9g");

/**
 * FEATURE 1: MISSION GENERATOR
 * This function creates a personalized civic task based on the user's
 * name, age, profession, and category (Teenager vs Adult).
 */
export async function generateCivicMission(userProfile: { 
  name: string, 
  age: number, 
  profession: string, 
  category: string 
}) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" } 
  });

  const prompt = `
    You are the CivicBuddy AI Agent. Your goal is to promote civic sense and responsibility.
    User Profile:
    - Name: ${userProfile.name}
    - Age: ${userProfile.age}
    - Profession: ${userProfile.profession}
    - Category: ${userProfile.category}

    Task: Generate 1 highly specific, actionable, and fun civic sense "Daily Mission" for this user.
    If they are a student, make it about school/college/studying. 
    If they are a professional, make it about work/commuting/office decorum.
    If they are older, make it about home/neighborhood/safety.
    
    Return ONLY a JSON object:
    {
      "missionTitle": "Short, catchy title",
      "missionDescription": "1-2 sentence instructions on what to do",
      "rewardCoins": 5,
      "timePeriod": "Morning/Afternoon/Evening/Night"
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

/**
 * FEATURE 2: VISION VERIFIER
 * This function takes a base64 image from the user's camera and 
 * determines if they actually performed the civic task assigned.
 */
export async function verifyCivicTask(imageBuffer: string, taskDescription: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // The browser sends the image as a DataURL (e.g., "data:image/jpeg;base64,...")
  // We need to strip the prefix to get just the base64 data.
  const base64Data = imageBuffer.split(",")[1];

  const prompt = `
    You are the CivicBuddy Vision Auditor. 
    The user was assigned this civic mission: "${taskDescription}".
    Look at the provided image. Did the user successfully perform this task?
    
    Be strict but fair. If the image is blurry or irrelevant, set verified to false.
    
    Return ONLY a JSON object:
    {
      "verified": true or false,
      "reasoning": "A short 1-sentence explanation of what you see in the photo"
    }
  `;

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      },
    },
    prompt,
  ]);

  const response = await result.response;
  return JSON.parse(response.text());
}