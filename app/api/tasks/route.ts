import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  let userProfile = { age: "citizen", gender: "person", profession: "professional" };
  let dateData = { dayOfWeek: "Monday", timePeriod: "Morning" }; // can be used by prompt

  try {
    const body = await request.json();
    if (body.age) userProfile.age = body.age;
    if (body.gender) userProfile.gender = body.gender;
    if (body.profession) userProfile.profession = body.profession;
    if (body.dayOfWeek) dateData.dayOfWeek = body.dayOfWeek;
    if (body.timePeriod) dateData.timePeriod = body.timePeriod;
  } catch (e) {}

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an AI generating daily civic and professional duties.
      The user is a ${userProfile.age}-year-old ${userProfile.gender} working as a ${userProfile.profession}.
      Today is ${dateData.dayOfWeek}, exact date: ${new Date().toLocaleDateString('en-IN')}. (Make sure to generate COMPLETELY UNIQUE and highly varied tasks for today, different from previous days to keep the app feeling fresh).
      
      Output ONLY a valid JSON object mapping 4 time periods (Morning, Afternoon, Evening, Night) to an array of EXACTLY 3 tasks each.
      Each task MUST be something the user can realistically take a photo OR record a short audio snippet to prove they did it.
      Mix general civic sense (saving water, disposing trash, helping others) with profession/weekend specific contexts.
      
      Format:
      {
        "Morning": [
          { "id": "m1", "title": "Turned off tap while brushing", "xp": 10, "steps": 1, "proofType": "photo" },
          { "id": "m2", "title": "Verbally pledged to not waste food today", "xp": 15, "steps": 1, "proofType": "audio" },
          ...
        ],
        "Afternoon": [...],
        "Evening": [...],
        "Night": [...]
      }
      Do NOT inject markdown blockquotes. Output raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    if (text.startsWith("\`\`\`json")) text = text.replace(/^\`\`\`json\s*/, "").replace(/\s*\`\`\`$/, "");
    else if (text.startsWith("\`\`\`")) text = text.replace(/^\`\`\`\s*/, "").replace(/\s*\`\`\`$/, "");

    const tasksData = JSON.parse(text);

    return NextResponse.json({ tasks: tasksData }, { status: 200 });
  } catch (error) {
    console.error("Task generation error:", error);
    
    // Robust fallback tasks in case the API key is invalid/revoked
    const fallbackTasks = {
      "Morning": [
        { id: "m1", title: "Turn off the tap while brushing teeth", xp: 10, steps: 1, proofType: "photo" },
        { id: "m2", title: "Record 5 seconds of the sounds of sorting dry and wet waste", xp: 15, steps: 2, proofType: "audio" },
        { id: "m3", title: "Organize your workspace for the day", xp: 10, steps: 1, proofType: "photo" }
      ],
      "Afternoon": [
        { id: "a1", title: "Use a reusable container for lunch", xp: 15, steps: 1, proofType: "photo" },
        { id: "a2", title: "Clear unnecessary digital clutter (emails)", xp: 10, steps: 1, proofType: "photo" },
        { id: "a3", title: "Verbally state 1 local civic rule you will follow today", xp: 20, steps: 2, proofType: "audio" }
      ],
      "Evening": [
        { id: "e1", title: "Switch off idle electronics to save power", xp: 15, steps: 1, proofType: "photo" },
        { id: "e2", title: "Follow traffic rules and stop exactly at the stop-line on your commute", xp: 20, steps: 1, proofType: "photo" },
        { id: "e3", title: "Speak a sentence appreciating a local vendor or essential worker", xp: 15, steps: 1, proofType: "audio" }
      ],
      "Night": [
        { id: "n1", title: "Ensure main doors and neighborhood gate are locked", xp: 10, steps: 1, proofType: "photo" },
        { id: "n2", title: "Pack a cloth bag for tomorrow's commute", xp: 10, steps: 1, proofType: "photo" },
        { id: "n3", title: "Record silence or low-noise to prove a quiet neighborhood after 10PM", xp: 15, steps: 1, proofType: "audio" }
      ]
    };

    return NextResponse.json({ tasks: fallbackTasks }, { status: 200 });
  }
}
