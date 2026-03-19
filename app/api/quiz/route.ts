import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  let userProfile = { age: "citizen", gender: "person", profession: "professional" };
  
  try {
    const body = await request.json();
    if (body.age) userProfile.age = body.age;
    if (body.gender) userProfile.gender = body.gender;
    if (body.profession) userProfile.profession = body.profession;
  } catch (e) {
    // ignore body parsing errors
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key is missing." },
      { status: 500 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an educator. Generate a daily 10-question multiple-choice quiz about Indian civic duties, fundamental rights, and the law.
      CRITICAL REQUIREMENT: Make the questions HIGHLY tailored to a ${userProfile.age}-year-old ${userProfile.gender} working as a ${userProfile.profession} in India.
      Do NOT ask dry academic facts. Ask ONLY real-life, practical, situational questions that this specific person might encounter in their daily life. 
      Keep the language simple and accessible. Make sure the correct action aligns with Indian law and civic responsibilities.
      
      Output ONLY a valid JSON array of 10 objects. Do not wrap it in markdown blockquotes like \`\`\`json.
      Each object must match this structure exactly:
      {
        "id": number (1 to 10),
        "question": string (the situational scenario),
        "options": array of 4 strings,
        "correctAnswer": string (must exactly match one of the options)
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let parsedText = text.trim();
    if (parsedText.startsWith("\`\`\`json")) {
      parsedText = parsedText.replace(/^\`\`\`json\s*/, "").replace(/\s*\`\`\`$/, "");
    } else if (parsedText.startsWith("\`\`\`")) {
      parsedText = parsedText.replace(/^\`\`\`\s*/, "").replace(/\s*\`\`\`$/, "");
    }

    const quizData = JSON.parse(parsedText);

    return NextResponse.json({ quiz: quizData }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    
    // Fallback static quiz due to API Key issues, tailored to be more situational and easy
    const fallbackQuiz = [
      { id: 1, question: "You see someone skipping the queue at the billing counter. What is the most civic-minded action?", options: ["Yell at them loudly", "Politely ask them to go to the back", "Skip the line yourself", "Ignore it completely"], correctAnswer: "Politely ask them to go to the back" },
      { id: 2, question: "You notice a tap leaking continuously in a public park. What should you do?", options: ["Walk away, it's not your problem", "Try to close it or report it to park authorities", "Complain on social media only", "Break the tap further"], correctAnswer: "Try to close it or report it to park authorities" },
      { id: 3, question: "While driving to work, the traffic light turns yellow just before you reach the zebra crossing. You should:", options: ["Speed up to cross quickly", "Stop before the zebra crossing", "Stop on the zebra crossing", "Honk continuously"], correctAnswer: "Stop before the zebra crossing" },
      { id: 4, question: "Your neighbor plays loud music past 11 PM every night, disturbing your sleep. How do you handle this?", options: ["Play even louder music", "Call the police immediately every time", "Politely discuss the issue with them first", "Throw stones at their window"], correctAnswer: "Politely discuss the issue with them first" },
      { id: 5, question: "You buy a packaged food item and notice it has crossed its expiry date. You should:", options: ["Eat it anyway", "Throw it away and forget it", "Return it to the shopkeeper and ask for a replacement or refund", "Sell it to someone else"], correctAnswer: "Return it to the shopkeeper and ask for a replacement or refund" },
      { id: 6, question: "A shopkeeper refuses to give you a printed bill for an electronic purchase. What is your right?", options: ["Accept it to save tax", "Demand a proper GST invoice for consumer protection", "Argue and leave without the item", "Pay extra cash"], correctAnswer: "Demand a proper GST invoice for consumer protection" },
      { id: 7, question: "You witness a road accident and the victim needs help. As a Good Samaritan in India, are you legally protected from police harassment if you help?", options: ["No, you will be definitely harassed", "Yes, the Good Samaritan Law protects you from unnecessary legal hassles", "Only if you cause the accident", "It depends on the victim"], correctAnswer: "Yes, the Good Samaritan Law protects you from unnecessary legal hassles" },
      { id: 8, question: "You are casting your vote during elections. A political party worker offers you money to vote for them. You should:", options: ["Take the money and vote for them", "Take the money and vote for someone else", "Reject the money and report it to the Election Commission", "Ask for more money"], correctAnswer: "Reject the money and report it to the Election Commission" },
      { id: 9, question: "You are required to submit an official document but an officer asks for a 'small fee' (bribe) to pass your file quicker. What do you do?", options: ["Pay the bribe to save time", "Refuse and file a complaint with the Anti-Corruption Bureau", "Yell at the officer in the office", "Give up on the document altogether"], correctAnswer: "Refuse and file a complaint with the Anti-Corruption Bureau" },
      { id: 10, question: "You find a lost wallet containing cash and ID cards on the street. The correct civic action is:", options: ["Keep the cash and throw the wallet", "Hand it over to the nearest police station or use the ID to contact the owner", "Leave it exactly where it is", "Take the ID cards only"], correctAnswer: "Hand it over to the nearest police station or use the ID to contact the owner" }
    ];
    return NextResponse.json({ quiz: fallbackQuiz }, { status: 200 });
  }
}
