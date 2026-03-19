"use client";
import { useState } from "react";
import { db, auth } from "../../lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Leaf, Recycle, Star, Coins } from "lucide-react";
import Link from "next/link";

const items = [
  { id: 1, name: "Plastic Bottle", type: "dry", icon: "🍼" },
  { id: 2, name: "Banana Peel", type: "wet", icon: "🍌" },
  { id: 3, name: "Old Newspaper", type: "dry", icon: "📰" },
  { id: 4, name: "Leftover Rice", type: "wet", icon: "🍚" },
  { id: 5, name: "Glass Jar", type: "dry", icon: "🫙" },
];

export default function CivicGamePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleSort = async (category: string) => {
    const isCorrect = items[currentIndex].type === category;
    
    if (isCorrect) setScore(s => s + 1);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(s => s + 1);
    } else {
      setGameOver(true);
      if (score + (isCorrect ? 1 : 0) === items.length && auth.currentUser) {
        // Award 5 coins for a perfect score!
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { coins: increment(5) });
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-slate-500 mb-8 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Exit Game
        </Link>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tighter mb-2 italic">Sort-O-Mania</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Mission: Perfect Segregation</p>
        </header>

        <AnimatePresence mode="wait">
          {!gameOver ? (
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }}
              className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl text-center relative overflow-hidden"
            >
              <div className="text-8xl mb-6">{items[currentIndex].icon}</div>
              <h2 className="text-3xl font-black mb-10">{items[currentIndex].name}</h2>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleSort("dry")}
                  className="bg-blue-600 p-6 rounded-3xl font-black text-xl hover:bg-blue-500 transition-all flex flex-col items-center gap-2"
                >
                  <Recycle /> DRY
                </button>
                <button 
                  onClick={() => handleSort("wet")}
                  className="bg-emerald-600 p-6 rounded-3xl font-black text-xl hover:bg-emerald-500 transition-all flex flex-col items-center gap-2"
                >
                  <Leaf /> WET
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-slate-900 p-10 rounded-[3rem] border border-slate-800">
              <Star className="text-yellow-500 mx-auto mb-6" size={64} />
              <h2 className="text-4xl font-black mb-2">Game Over!</h2>
              <p className="text-slate-400 text-lg mb-8">You sorted {score} out of {items.length} items correctly.</p>
              
              {score === items.length ? (
                <div className="bg-emerald-500/10 border border-emerald-500/50 p-6 rounded-2xl mb-8">
                  <p className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                    <Coins /> PERFECT! +5 GOLD COINS EARNED
                  </p>
                </div>
              ) : (
                <p className="text-red-400 font-bold mb-8">Get 100% to earn coins!</p>
              )}

              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex justify-center gap-2">
          {items.map((_, i) => (
            <div key={i} className={`h-2 w-8 rounded-full ${i <= currentIndex ? "bg-blue-500" : "bg-slate-800"}`} />
          ))}
        </div>
      </div>
    </main>
  );
}