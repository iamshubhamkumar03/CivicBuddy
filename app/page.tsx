"use client";

import { auth, googleProvider, db } from "../lib/firebase";
import { generateCivicMission } from "../lib/gemini";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import Link from "next/link"; // Required for navigation
import { 
  ShieldCheck, 
  Coins, 
  Flame, 
  LogOut, 
  BookOpen, 
  Target, 
  Camera, 
  Scale, 
  Sparkles,
  ChevronRight,
  ArrowLeft 
} from "lucide-react";

export default function CivicBuddyApp() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); 
  const [subStep, setSubStep] = useState(1); 
  
  const [formData, setFormData] = useState({ 
    name: "", 
    age: "", 
    gender: "male", 
    profession: "",
    coins: 0,
    streak: 0
  });

  const [currentMission, setCurrentMission] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setFormData({
            name: data.name || "",
            age: data.age || "",
            gender: data.gender || "male",
            profession: data.profession || "",
            coins: data.coins || 0,
            streak: data.streak || 1
          });
          setStep(3);
        } else {
          setStep(2);
        }
      } else {
        setStep(1);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      alert("Login failed! Please check your connection.");
    }
  };

  const handleOnboardingSubmit = async () => {
    if (!user) return;
    const profile = {
      ...formData,
      email: user.email,
      category: parseInt(formData.age) < 19 ? "Teenager" : "Adult",
      coins: 10,
      streak: 1,
      createdAt: new Date(),
    };
    await setDoc(doc(db, "users", user.uid), profile);
    setFormData(profile as any);
    setStep(3);
  };

  const startAIMission = async () => {
    setIsGenerating(true);
    try {
      const mission = await generateCivicMission({
        ...formData,
        age: parseInt(formData.age),
        category: parseInt(formData.age) < 19 ? "Teenager" : "Adult"
      });
      setCurrentMission(mission);
    } catch (error) {
      alert("The AI Agent is busy. Try again in a moment!");
    }
    setIsGenerating(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black tracking-widest text-xs text-blue-500 uppercase">Syncing AI Brain...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <AnimatePresence mode="wait">
        
        {step === 1 && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
          >
            <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full" />
            <div className="relative bg-slate-900/40 border border-slate-800 p-12 rounded-[3rem] backdrop-blur-xl max-w-lg shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-12">
                 <ShieldCheck size={48} className="text-white -rotate-12" />
              </div>
              <h1 className="text-6xl font-black tracking-tighter mb-4 text-white">CivicBuddy</h1>
              <p className="text-slate-400 text-lg mb-10 italic">"Learn with fun and make your surroundings much better to live"</p>
              <button onClick={handleLogin} className="w-full bg-white text-black px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-blue-50 transition-all active:scale-95 shadow-xl">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6" alt="" />
                Continue with Google
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="onboarding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative">
              <div className="flex gap-1 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= subStep ? "bg-blue-500" : "bg-slate-800"}`} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {subStep === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <h2 className="text-3xl font-black mb-6 text-white leading-tight text-center">First, what is your name?</h2>
                    <input type="text" placeholder="Full Name" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} className="w-full p-4 bg-black/40 rounded-2xl border border-slate-700 focus:border-blue-500 outline-none mb-6 transition-all" />
                    <button onClick={() => setSubStep(2)} className="w-full bg-blue-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">Next Step <ChevronRight size={20}/></button>
                  </motion.div>
                )}

                {subStep === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <h2 className="text-3xl font-black mb-6 text-white leading-tight text-center">Your age & gender?</h2>
                    <div className="flex gap-4 mb-6">
                      <input type="number" placeholder="Age" value={formData.age} onChange={(e)=>setFormData({...formData, age:e.target.value})} className="w-full p-4 bg-black/40 rounded-2xl border border-slate-700 focus:border-blue-500 outline-none" />
                      <select value={formData.gender} onChange={(e)=>setFormData({...formData, gender:e.target.value})} className="w-full p-4 bg-black/40 rounded-2xl border border-slate-700">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setSubStep(1)} className="p-4 bg-slate-800 rounded-2xl"><ArrowLeft size={20}/></button>
                      <button onClick={() => setSubStep(3)} className="w-full bg-blue-600 py-4 rounded-2xl font-bold">Continue</button>
                    </div>
                  </motion.div>
                )}

                {subStep === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-3xl font-black mb-6 text-white leading-tight text-center">What is your profession?</h2>
                    <input type="text" placeholder="e.g. Student, Driver" value={formData.profession} onChange={(e)=>setFormData({...formData, profession:e.target.value})} className="w-full p-4 bg-black/40 rounded-2xl border border-slate-700 focus:border-blue-500 outline-none mb-6" />
                    <button onClick={handleOnboardingSubmit} className="w-full bg-blue-600 py-4 rounded-2xl font-bold">Start My Journey</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto p-6 lg:p-12">
            
            {/* Nav Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
              <div>
                <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] mb-2 flex items-center gap-2">
                  <Sparkles size={14}/> {parseInt(formData.age) < 19 ? "TEENAGER" : "ADULT"} INTERFACE
                </p>
                <h1 className="text-5xl font-black text-white tracking-tighter">Namaste, {formData.name.split(' ')[0]}!</h1>
              </div>
              
              <div className="flex items-center gap-3">
                {/* WALLET LOGIC INTEGRATED HERE */}
                <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-6 shadow-xl">
                  <div className="flex flex-col items-start leading-tight">
                    <div className="flex items-center gap-2 text-yellow-500 font-black">
                      <Coins size={22}/> {formData.coins}
                    </div>
                    <span className="text-slate-500 text-[10px] font-bold mt-1 tracking-wider uppercase">
                      (≈ ₹{(formData.coins / 100).toFixed(2)})
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="flex items-center gap-2 text-orange-500 font-black">
                    <Flame size={22}/> {formData.streak}
                  </div>
                </div>

                <button onClick={() => signOut(auth)} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-all active:scale-90">
                  <LogOut size={20} />
                </button>
              </div>
            </header>

            {/* Feature Cards Grid - Now Linked to Routes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
               <DashboardCard title="Civic Lessons" icon={<BookOpen size={32}/>} color="bg-blue-600" desc="Learn your rights with AI" href="/lessons" />
               <DashboardCard title="Daily Tasks" icon={<Target size={32}/>} color="bg-emerald-600" desc="Community missions" href="/tasks" />
               <DashboardCard title="Report Issue" icon={<Camera size={32}/>} color="bg-purple-600" desc="Use camera to report" href="/report" />
               <DashboardCard title="Legal Helper" icon={<Scale size={32}/>} color="bg-orange-600" desc="Gov regulations AI" href="/legal" />
            </div>

            {/* AI MISSION CONTROL */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0a0a0a] to-black border border-slate-800 rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl">
               <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[120px]" />
               
               {!currentMission ? (
                 <div className="flex flex-col md:flex-row items-center gap-10">
                   <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl relative">
                      <Sparkles size={40} className="text-white animate-pulse" />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl font-black mb-2 text-white">CivicBuddy Agent 1.0</h3>
                      <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
                        Ready to generate your personalized briefing for today?
                      </p>
                      <button onClick={startAIMission} disabled={isGenerating} className="mt-8 bg-white text-black px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl disabled:opacity-50">
                        {isGenerating ? "CALIBRATING AI..." : "GENERATE MISSION"}
                      </button>
                   </div>
                 </div>
               ) : (
                 <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {currentMission.timePeriod} FOCUS
                      </span>
                    </div>
                    <h3 className="text-5xl font-black text-white mb-4 tracking-tighter">{currentMission.missionTitle}</h3>
                    <p className="text-2xl text-slate-400 mb-10 max-w-4xl leading-tight">{currentMission.missionDescription}</p>
                    
                    <div className="flex flex-wrap gap-4">
                      <Link href="/verify">
                        <button className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black shadow-lg shadow-emerald-500/20 flex items-center gap-3 hover:scale-105 transition-all">
                          <Camera size={24}/> VERIFY WITH CAMERA (+{currentMission.rewardCoins} 🪙)
                        </button>
                      </Link>
                      <button onClick={() => setCurrentMission(null)} className="px-8 py-5 text-slate-500 font-bold hover:text-white transition-colors">
                        SKIP THIS TASK
                      </button>
                    </div>
                 </motion.div>
               )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function DashboardCard({title, desc, icon, color, href}: any) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ y: -10, scale: 1.02 }}
        className="group bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] hover:bg-slate-900/60 transition-all cursor-pointer backdrop-blur-md h-full flex flex-col items-center text-center shadow-lg"
      >
        <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-all mb-8`}>
          {icon}
        </div>
        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      </motion.div>
    </Link>
  );
}