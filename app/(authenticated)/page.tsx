"use client";

import { useEffect, useState } from "react";
import { Target, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMissionStats, MissionStats } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Friend");
  const [quizDone, setQuizDone] = useState(false);
  const [stats, setStats] = useState<MissionStats>({ totalRemaining: 0, details: { tasks: 0, quiz: 0 } });

  useEffect(() => {
    const user = localStorage.getItem("civicbuddy_user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.fullName) {
          setUserName(parsed.fullName.split(" ")[0]);
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }
    
    const refreshStats = () => {
      setStats(getMissionStats());
      const today = new Date().toISOString().split("T")[0];
      setQuizDone(!!localStorage.getItem(`civicbuddy_quiz_completed_${today}`));
    };

    refreshStats();

    window.addEventListener("civicbuddy_stats_updated", refreshStats);
    return () => {
      window.removeEventListener("civicbuddy_stats_updated", refreshStats);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="mb-10 mt-4">
        <h1 className="text-4xl font-serif text-brand-brown font-bold mb-2">Namaste, {userName}</h1>
        <p className="text-brand-darkgray">Ready to make a difference today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#e6dac7] flex items-center justify-between col-span-1 md:col-span-2">
          <div>
            <p className="text-xs text-brand-brown font-bold uppercase tracking-widest mb-2">Remaining Missions</p>
            <p className="text-4xl font-black text-brand-darkbrown">{stats.totalRemaining}</p>
            <p className="text-[10px] text-brand-darkgray font-bold mt-1 uppercase tracking-tight opacity-70">
              {stats.details.tasks} in Tasks • {stats.details.quiz} in Quiz
            </p>
          </div>
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-orange-400">
            <Target size={28} />
          </div>
        </div>
      </div>


      {/* Daily Challenge Launcher */}
      <div className="bg-gradient-to-br from-[#1e854a] to-[#2ecc71] rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden mb-12">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -bottom-10 right-32 w-40 h-40 bg-white opacity-10 rounded-full"></div>
        
        <div className="relative z-10 w-2/3">
          <h2 className="text-3xl font-serif font-bold mb-4">Daily Civic Quiz</h2>
          <p className="text-green-50 text-lg mb-8 opacity-90">Test your knowledge on civic duties and earn bonus coins (1 coin = 1 paise)!</p>
          
          <button 
            onClick={() => router.push("/quiz")}
            className="bg-white text-[#1e854a] px-8 py-4 rounded-full font-bold flex items-center space-x-3 hover:bg-gray-50 transition-colors shadow-lg"
          >
            <span>{quizDone ? "Quiz Completed" : "Start Quiz"}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}


