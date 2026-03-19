import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!apiKey) {
      throw new Error("Missing API Key");
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const history = messages.slice(0, -1).map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const chat = model.startChat({ history });

      const persona = "Context: You are 'AI Tutor', a highly knowledgeable, conversational, and encouraging AI personal civic sense tutor for citizens in India. Keep answers related to civic duties, laws, Indian society, and practical daily life. Provide helpful, structured, and very concise responses.\nUser Inquiry: ";
      const latestMessage = messages[messages.length - 1].text;
      
      const prompt = history.length === 0 ? persona + latestMessage : latestMessage;

      const result = await chat.sendMessage(prompt);
      const text = result.response.text();

      return NextResponse.json({ reply: text }, { status: 200 });

    } catch (modelError) {
      console.error("Gemini API Error:", modelError);
      return NextResponse.json({ 
        reply: "I am your AI Tutor! Unfortunately, my neural link is currently severed because your Google Gemini API key has been revoked by Google. To ask me real questions, please update your keys in your environment!" 
      }, { status: 200 }); 
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Could not process chat" }, { status: 500 });
  }
}
