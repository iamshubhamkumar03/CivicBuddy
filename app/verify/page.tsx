"use client";
import { useState } from "react";
import { verifyCivicTask } from "../../lib/gemini";
import { db, auth } from "../../lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, XCircle, Loader2, ArrowLeft, Coins } from "lucide-react";
import Link from "next/link";

export default function VerifyTaskPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCapture = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processWithAI = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const aiResponse = await verifyCivicTask(image, "Evidence of a completed civic duty or community improvement.");
      setResult(aiResponse);

      if (aiResponse.verified && auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { 
          coins: increment(5) 
        });
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI Agent is temporarily offline. Please try again.");
    }
    setIsAnalyzing(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-slate-500 mb-10 hover:text-white transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
        </Link>

        <h1 className="text-5xl font-black mb-2 tracking-tighter">Vision Audit</h1>
        <p className="text-slate-400 mb-10 text-lg">Show the AI Guide your completed mission.</p>

        <AnimatePresence mode="wait">
          {!image ? (
            <motion.label 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full aspect-square border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all bg-slate-900/20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
              <Camera size={56} className="text-slate-700 group-hover:text-blue-500 mb-4 transition-all group-hover:scale-110" />
              <span className="font-black text-slate-500 group-hover:text-white tracking-widest text-xs uppercase">Open Camera</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
            </motion.label>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="relative group">
                <img src={image} className="w-full aspect-square object-cover rounded-[3rem] border-4 border-blue-600/20 shadow-2xl" alt="Capture" />
                {!result && (
                   <button onClick={() => setImage(null)} className="absolute top-4 right-4 bg-black/60 p-3 rounded-full hover:bg-red-500 transition-colors">
                     <XCircle size={20} />
                   </button>
                )}
              </div>
              
              {!result ? (
                <button 
                  onClick={processWithAI}
                  disabled={isAnalyzing}
                  className="w-full bg-blue-600 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? <><Loader2 className="animate-spin" /> Agent is Analyzing...</> : "Submit to Agent"}
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className={`p-10 rounded-[3rem] border-2 shadow-2xl ${result.verified ? "bg-emerald-500/5 border-emerald-500/30" : "bg-red-500/5 border-red-500/30"}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {result.verified ? <CheckCircle className="text-emerald-500" size={40} /> : <XCircle className="text-red-500" size={40} />}
                    <h3 className="text-3xl font-black">{result.verified ? "Verified!" : "Refused"}</h3>
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed mb-8">{result.reasoning}</p>
                  
                  {result.verified && (
                    <div className="flex items-center gap-3 bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/30">
                       <Coins className="text-yellow-500" />
                       <span className="font-black text-emerald-400 tracking-wider text-sm uppercase">+5 GOLD COINS ADDED</span>
                    </div>
                  )}
                  
                  <button onClick={() => {setImage(null); setResult(null);}} className="w-full mt-8 py-4 bg-slate-900 rounded-2xl font-bold text-slate-400 hover:text-white transition-all">
                    Try Again
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}