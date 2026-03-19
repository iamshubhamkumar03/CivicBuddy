"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2 } from "lucide-react";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I am your AI Civic Sense Tutor. What would you like to learn about Indian laws or civic duties today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "What are my fundamental duties?",
    "How does the Good Samaritan Law work?",
    "What should I do if I see a traffic violation?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userText = text;
    setInputValue("");
    
    const newUserMsg: Message = { id: Date.now().toString(), sender: "user", text: userText };
    const newMessagesHistory = [...messages, newUserMsg];
    setMessages(newMessagesHistory);
    
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessagesHistory })
      });
      const data = await res.json();
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply || "I encountered an error. Please try again.",
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Sorry, I am having trouble connecting to my servers right now.",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 h-full flex flex-col">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col h-[85vh] overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-brand-lightgreen text-white p-6 flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Tutor</h2>
            <p className="text-green-50 text-sm">Your personal civic sense guide</p>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end space-x-2`}>
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-brand-lightgreen text-white flex items-center justify-center flex-shrink-0 mb-1 shadow-sm">
                  <Bot size={18} />
                </div>
              )}
              <div
                className={`px-5 py-3 rounded-2xl max-w-[75%] shadow-sm ${
                  msg.sender === "user"
                    ? "bg-gray-100 text-gray-800 rounded-br-none border border-gray-200"
                    : "bg-brand-lightgreen text-white rounded-bl-none"
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
             <div className="flex justify-start items-end space-x-2">
               <div className="w-8 h-8 rounded-full bg-brand-lightgreen text-white flex items-center justify-center flex-shrink-0 mb-1 shadow-sm">
                 <Bot size={18} />
               </div>
               <div className="px-5 py-4 rounded-2xl bg-brand-lightgreen text-white rounded-bl-none shadow-sm flex space-x-2 items-center h-[48px]">
                 <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="flex space-x-3 mb-4 overflow-x-auto no-scrollbar pb-1">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion)}
                  disabled={isTyping}
                  className="whitespace-nowrap px-4 py-2 rounded-full border border-[#2ecc71]/30 text-[#2ecc71] text-sm font-semibold hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
              placeholder="Ask your tutor anything..."
              disabled={isTyping}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-brand-lightgreen focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={isTyping || !inputValue.trim()}
              className="bg-brand-lightgreen hover:bg-[#27ae60] transition-colors disabled:bg-gray-300 text-white p-4 rounded-full shadow-md flex items-center justify-center"
            >
              <Send size={20} className="ml-1" />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
