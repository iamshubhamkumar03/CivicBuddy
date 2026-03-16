"use client";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Search, ShieldCheck, ArrowLeft, Info, Gavel } from "lucide-react";
import Link from "next/link";

export default function LegalHelperPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askLegalAI = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Use your API key here
      const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are the CivicBuddy Legal Expert. 
        Focus on Indian Government Rules, Municipal Bylaws, and the Indian Penal Code (IPC) related to civic sense.
        User Question: "${query}"
        
        Provide:
        1. The specific Rule or Section (e.g., Section 268 of IPC for Public Nuisance).
        2. The Fine or Penalty (if applicable).
        3. A simple 1-sentence explanation for a common citizen.
        
        Use bold text for keywords. Use emojis.
      `;

      const result = await model.generateContent(prompt);
      setAnswer(result.response.text());
    } catch (e) {
      setAnswer("The Legal Database is currently updating. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-500 mb-8 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <header className="mb-12">
          <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-orange-600/20">
            <Scale size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Legal Helper</h1>
          <p className="text-slate-400">Search government rules and penalties for civic violations.</p>
        </header>

        {/* Search Box */}
        <div className="bg-slate-900 border border-slate-800 p-2 rounded-[2rem] flex items-center gap-2 mb-10 shadow-2xl">
          <div className="pl-6 text-slate-500"><Search size={20}/></div>
          <input 
            type="text" 
            placeholder="e.g. Fine for littering in public?" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent px-2 py-4 outline-none font-medium"
            onKeyPress={(e) => e.key === 'Enter' && askLegalAI()}
          />
          <button 
            onClick={askLegalAI}
            disabled={loading}
            className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-500 transition-all disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Result Area */}
        <AnimatePresence>
          {answer && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-orange-500/20 p-8 rounded-[3rem] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 text-orange-500"><Gavel size={100}/></div>
              <div className="flex items-center gap-2 text-orange-500 font-bold mb-4 uppercase tracking-widest text-xs">
                <ShieldCheck size={16}/> Verified Regulation
              </div>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Links */}
        <div className="mt-12">
          <h3 className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mb-6 text-center">Popular Topics</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {["Littering", "Public Nuisance", "Traffic Fines", "Noise Pollution"].map(t => (
              <button 
                key={t}
                onClick={() => {setQuery(t); }}
                className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-full text-sm font-bold hover:border-orange-500 transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}