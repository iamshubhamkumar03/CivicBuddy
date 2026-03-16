"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Sun, CloudSun, Moon, Star, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";

// Helper for the 4 periods of the day
const periods = [
  { id: 'morning', label: 'Morning', icon: <Sun className="text-orange-400" /> },
  { id: 'afternoon', label: 'Afternoon', icon: <CloudSun className="text-yellow-500" /> },
  { id: 'evening', label: 'Evening', icon: <Star className="text-indigo-400" /> },
  { id: 'night', label: 'Night', icon: <Moon className="text-blue-400" /> }
];

export default function TasksCalendarPage() {
  // Mock data for the week to show the UI (In Phase 4, we'll fetch this from Firestore)
  const [weekData, setWeekData] = useState([
    { day: "Mon", status: { morning: "done", afternoon: "done", evening: "missed", night: "done" } },
    { day: "Tue", status: { morning: "done", afternoon: "done", evening: "done", night: "done" } },
    { day: "Wed", status: { morning: "done", afternoon: "pending", evening: "pending", night: "pending" } },
    { day: "Thu", status: { morning: "pending", afternoon: "pending", evening: "pending", night: "pending" } },
    { day: "Fri", status: { morning: "pending", afternoon: "pending", evening: "pending", night: "pending" } },
  ]);

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-500 mb-8 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Hub
        </Link>

        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">My Progress</h1>
            <p className="text-slate-400">Keep your streak alive to earn double coins!</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="font-bold text-white">7</span>
            </div>
            <span className="font-black text-xs uppercase tracking-widest text-orange-500">Day Streak</span>
          </div>
        </header>

        {/* Legend */}
        <div className="flex gap-6 mb-8 bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800">
          {periods.map(p => (
            <div key={p.id} className="flex items-center gap-2 text-sm font-bold text-slate-400">
              {p.icon} {p.label}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 gap-4">
          {weekData.map((day, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={day.day} 
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] flex items-center justify-between"
            >
              <div className="w-16">
                <span className="text-2xl font-black text-white">{day.day}</span>
              </div>

              <div className="flex-1 grid grid-cols-4 gap-4 px-8">
                {periods.map(p => (
                  <div key={p.id} className="flex flex-col items-center gap-2">
                    <StatusIcon status={(day.status as any)[p.id]} />
                  </div>
                ))}
              </div>

              <div className="w-20 text-right">
                <span className={`text-xs font-bold uppercase tracking-widest ${idx === 2 ? "text-blue-500" : "text-slate-600"}`}>
                  {idx === 2 ? "Today" : ""}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatusIcon({ status }: { status: 'done' | 'missed' | 'pending' }) {
  if (status === 'done') return <CheckCircle2 size={32} className="text-emerald-500 shadow-lg shadow-emerald-500/20" />;
  if (status === 'missed') return <XCircle size={32} className="text-red-500 shadow-lg shadow-red-500/20" />;
  return <div className="w-8 h-8 rounded-full border-4 border-slate-800" />;
}