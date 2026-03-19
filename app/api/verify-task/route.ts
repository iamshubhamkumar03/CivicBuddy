import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { proofData, title } = body; 

    if (!proofData || !title) {
      return NextResponse.json({ error: "Missing proofData or title" }, { status: 400 });
    }

    if (!apiKey) {
      throw new Error("Missing API Key");
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // We need a vision-capable model to do image verification
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are a strict civic duty validator for an app called CivicBuddy. 
      The user is submitting proof for the following task: "${title}".

      CRITICAL VERIFICATION RULES:
      1. If the proof is an IMAGE: It MUST clearly show the task being performed or its result (e.g., a clean street, a planted sapling, a recycled bin).
      2. If the proof is AUDIO: It MUST contain relevant sounds or a verbal report of the task being completed.
      3. If the proof is VIDEO: It MUST show the user performing the task. 
      4. REJECT generic photos, unrelated selfies, black screens, or blurred/unclear images.
      5. "Task-relatedness" is the primary criteria. If the image is just a person smiling without the task context, REJECT it.

      Respond with ONLY a JSON object: 
      {"verified": true, "reason": "Brief success message"} 
      or 
      {"verified": false, "reason": "Specific reason why the proof was rejected (e.g., 'Image does not show any signs of street cleaning')"}
      
      Do not include any other text or markdown formatting.`;

      // Extract base64 part safely if it contains data prefix
      let base64Data = proofData;
      let mimeType = "image/jpeg"; // default
      
      if (proofData.includes(",")) {
        const parts = proofData.split(",");
        const prefix = parts[0]; 
        base64Data = parts[1];
        
        const match = prefix.match(/data:(.*?);/);
        if (match) {
          mimeType = match[1];
        } else if (prefix.includes("audio")) {
          mimeType = "audio/webm";
        } else if (prefix.includes("video")) {
          mimeType = "video/mp4";
        } else if (prefix.includes("image")) {
          mimeType = "image/jpeg";
        }
      }

      const mediaPart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };

      const result = await model.generateContent([prompt, mediaPart]);
      const text = result.response.text();

      let parsedText = text.trim();
      // Remove possible markdown code blocks
      parsedText = parsedText.replace(/^\`\`\`(json)?\s*/, "").replace(/\s*\`\`\`$/, "");
      
      try {
        const verification = JSON.parse(parsedText);
        return NextResponse.json(verification, { status: 200 });
      } catch (parseError) {
        console.error("Failed to parse AI response:", text);
        return NextResponse.json({ verified: false, reason: "AI response was malformed. Please try again with a clearer photo." }, { status: 200 });
      }

    } catch (modelError: any) {
      console.error("AI verification error:", modelError);
      return NextResponse.json({ 
        verified: false, 
        reason: "Verification service is temporarily unavailable. Please try again later." 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Verification Request failed:", error);
    return NextResponse.json({ error: "Could not verify" }, { status: 500 });
  }
}
