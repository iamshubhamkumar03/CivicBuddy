"use client";

import { useState, useEffect, useRef } from "react";
import { Sunrise, Sun, Sunset, Moon, ChevronRight, Trophy, Camera, Mic, Shield, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { addCoins, syncMissionStats } from "@/lib/utils";

export default function DailyTasksPage() {
  const [activeTab, setActiveTab] = useState("Morning");
  const [tasksMap, setTasksMap] = useState<Record<string, any[]>>({});
  const [loadingTasks, setLoadingTasks] = useState(true);
  
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<Record<string, "completed" | "failed">>({});

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [selectedTaskObj, setSelectedTaskObj] = useState<any>(null);

  const tabs = [
    { name: "Morning", icon: Sunrise, required: 3, color: "text-orange-400" },
    { name: "Afternoon", icon: Sun, required: 3, color: "text-yellow-500" },
    { name: "Evening", icon: Sunset, required: 3, color: "text-purple-400" },
    { name: "Night", icon: Moon, required: 3, color: "text-indigo-400" },
  ];

  useEffect(() => {
    // Set initial tab based on device time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setActiveTab("Morning");
    else if (hour >= 12 && hour < 17) setActiveTab("Afternoon");
    else if (hour >= 17 && hour < 21) setActiveTab("Evening");
    else setActiveTab("Night");

    // Manage tracking calendar data
    const getTrackingData = () => {
      const raw = localStorage.getItem("civicbuddy_daily_calendar_tracking");
      return raw ? JSON.parse(raw) : {};
    };
    
    const track = getTrackingData();
    const newTracking = { ...track };
    const todayObj = new Date();
    todayObj.setHours(0,0,0,0);
    
    let trackingChanged = false;
    for (let i = 1; i <= 7; i++) {
      const pastDate = new Date(todayObj);
      pastDate.setDate(pastDate.getDate() - i);
      const dateStr = pastDate.toISOString().split("T")[0];
      
      // If a past day was not completed, it has failed.
      if (newTracking[dateStr] !== "completed" && newTracking[dateStr] !== "failed") {
        newTracking[dateStr] = "failed";
        trackingChanged = true;
      }
    }
    
    if (trackingChanged) {
      localStorage.setItem("civicbuddy_daily_calendar_tracking", JSON.stringify(newTracking));
    }
    setTrackingData(newTracking);
    
    // Fetch and load tasks
    const fetchTasks = async () => {
      const today = new Date().toISOString().split("T")[0];
      const cacheKey = `civicbuddy_tasks_${today}_v2`;
      const completedKey = `civicbuddy_tasks_completed_${today}`;
      
      const cachedCompleted = localStorage.getItem(completedKey);
      if (cachedCompleted) {
        setCompletedTaskIds(JSON.parse(cachedCompleted));
      }

      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTasksMap(JSON.parse(cached));
        setLoadingTasks(false);
        return;
      }

      const userStr = localStorage.getItem("civicbuddy_user");
      let userData = { age: "citizen", gender: "person", profession: "professional" };
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          userData = { ...userData, ...parsed };
        } catch (e) {}
      }

      const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userData,
            dayOfWeek: isWeekend ? "Weekend" : "Weekday"
          })
        });
        const data = await res.json();
        if (data.tasks) {
          setTasksMap(data.tasks);
          localStorage.setItem(cacheKey, JSON.stringify(data.tasks));
        }
      } catch (err) {
        console.error("Failed to load tasks");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskClick = (task: any) => {
    if (completedTaskIds.includes(task.id) || verifyingId) return;
    setSelectedTaskObj(task);
    if (task.proofType === "audio" && audioInputRef.current) {
      audioInputRef.current.click();
    } else if (task.proofType === "video" && videoInputRef.current) {
      videoInputRef.current.click();
    } else if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTaskObj) return;

    e.target.value = '';
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      await verifyTaskProof(selectedTaskObj, base64Data);
    };
    reader.readAsDataURL(file);
  };

  const verifyTaskProof = async (task: any, base64Data: string) => {
    setVerifyingId(task.id);
    try {
      const res = await fetch("/api/verify-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofData: base64Data, title: task.title })
      });
      const data = await res.json();
      
      if (data.verified || data.warning) {
        const newCompleted = [...completedTaskIds, task.id];
        setCompletedTaskIds(newCompleted);
        
        const todayStr = new Date().toISOString().split("T")[0];
        localStorage.setItem(`civicbuddy_tasks_completed_${todayStr}`, JSON.stringify(newCompleted));

        // Award coins using centralized utility
        addCoins(task.xp || 10);
        
        // Sync mission stats
        syncMissionStats();
        
        // Evaluate full day completion mapping
        let totalDailyTasks = 0;
        Object.values(tasksMap).forEach(arr => { totalDailyTasks += arr.length; });
        const requiredCount = totalDailyTasks > 0 ? totalDailyTasks : 12; // fallback 12

        if (newCompleted.length >= requiredCount) {
          const curTrack = JSON.parse(localStorage.getItem("civicbuddy_daily_calendar_tracking") || "{}");
          curTrack[todayStr] = "completed";
          localStorage.setItem("civicbuddy_daily_calendar_tracking", JSON.stringify(curTrack));
          setTrackingData(curTrack);
        }
      } else {
        alert("Verification failed: " + (data.reason || "Image didn't clearly show task completion. Try again."));
      }
    } catch (err) {
      alert("Error verifying task.");
    } finally {
      setVerifyingId(null);
      setSelectedTaskObj(null);
    }
  };

  const todayStr = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const currentTabTasks = tasksMap[activeTab] || [];

  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        dateStr: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        dateNum: d.getDate(),
        isToday: i === 0
      });
    }
    return days;
  };
  const calendarDays = getCalendarDays();
  
  let totalDailyTasks = 0;
  Object.values(tasksMap).forEach(arr => { totalDailyTasks += arr.length; });
  const requiredCountForToday = totalDailyTasks > 0 ? totalDailyTasks : 12;

  return (
    <div className="max-w-4xl mx-auto py-4">
      <input type="file" accept="image/*" capture="environment" ref={imageInputRef} className="hidden" onChange={onFileChange} />
      <input type="file" accept="audio/*" ref={audioInputRef} className="hidden" onChange={onFileChange} />
      <input type="file" accept="video/*" capture="environment" ref={videoInputRef} className="hidden" onChange={onFileChange} />

      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Daily Tasks</h1>
        <p className="text-gray-500 font-medium">{todayStr}</p>
      </div>

      <div className="bg-brand-green rounded-3xl p-8 text-white shadow-md mb-8 relative overflow-hidden">
        <div className="mb-4">
          <p className="text-sm font-bold tracking-widest uppercase mb-1 opacity-90">Today's Progress</p>
          <div className="flex items-end">
            <span className="text-4xl font-black">{completedTaskIds.length}</span>
            <span className="text-xl font-bold opacity-80 mb-1">/{requiredCountForToday}</span>
          </div>
        </div>
        
        <div className="h-4 bg-[#147a40] rounded-full overflow-hidden w-full max-w-2xl mt-4 border border-[#1e9955]">
          <div className="h-full bg-brand-lightgreen rounded-full transition-all duration-500" style={{ width: `${(completedTaskIds.length / Math.max(1, requiredCountForToday)) * 100}%` }}></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          const Icon = tab.icon;
          const completedInTab = (tasksMap[tab.name] || []).filter(t => completedTaskIds.includes(t.id)).length;
          
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex flex-col items-center p-4 rounded-3xl transition-all ${
                isActive
                  ? "bg-[#ebf8f0] border-2 border-brand-green shadow-sm"
                  : "bg-[#f8f9fa] border-2 border-transparent hover:bg-gray-100"
              }`}
            >
              <Icon size={28} className={`${tab.color} mb-2`} />
              <span className={`font-bold text-[15px] ${isActive ? "text-brand-green" : "text-gray-600"}`}>
                {tab.name}
              </span>
              <span className={`text-xs font-semibold ${isActive ? "text-brand-green opacity-80" : "text-gray-400"}`}>
                {completedInTab}/{tasksMap[tab.name]?.length || tab.required}
              </span>
            </button>
          );
        })}
      </div>

      {/* Calendar Tracking */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Streak Tracker</h2>
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
          {calendarDays.map((day, idx) => {
            const status = trackingData[day.dateStr];
            const isCompletedToday = day.isToday && completedTaskIds.length >= requiredCountForToday;
            const finalStatus = day.isToday ? (isCompletedToday ? "completed" : "pending") : status;

            return (
              <div key={idx} className={`flex flex-col items-center ${day.isToday ? 'scale-110 mx-2' : 'opacity-80'}`}>
                <span className="text-xs font-bold text-gray-400 mb-2">{day.dayName}</span>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-sm
                  ${finalStatus === "completed" ? "bg-brand-green text-white" :
                    finalStatus === "failed" ? "bg-red-50 text-red-500 border-2 border-red-200" :
                    day.isToday ? "bg-brand-lightgreen text-white ring-2 ring-green-100 ring-offset-2" :
                    "bg-gray-100 text-gray-500"}`
                }>
                  {finalStatus === "completed" ? <CheckCircle2 size={24} className="text-white" /> :
                   finalStatus === "failed" ? <XCircle size={24} /> :
                   day.dateNum}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!loadingTasks && completedTaskIds.length < requiredCountForToday && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8 flex items-start space-x-4 shadow-sm">
          <AlertTriangle className="text-orange-500 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-orange-800 text-lg">Incomplete Daily Missions</h3>
            <p className="text-orange-700 text-sm mt-1 leading-relaxed">
              You have <span className="font-bold text-orange-900">{requiredCountForToday - completedTaskIds.length} tasks</span> remaining. Completing tasks in every period (Morning, Afternoon, Evening, Night) is required to secure your daily green tick!
            </p>
          </div>
        </div>
      )}

      {loadingTasks ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-green w-10 h-10 mb-4" />
          <p className="text-gray-500 font-medium">Generating your personalized civic tasks...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentTabTasks.map((task: any) => {
            const isCompleted = completedTaskIds.includes(task.id);
            const isVerifying = verifyingId === task.id;

            return (
              <div 
                key={task.id} 
                onClick={() => handleTaskClick(task)}
                className={`bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm transition-all border
                  ${isCompleted ? "border-brand-green bg-green-50 opacity-80 cursor-default" : "border-gray-100 hover:shadow-md cursor-pointer"}
                `}
              >
                <div className="flex items-center space-x-6 pr-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isCompleted ? "bg-green-100 text-brand-green" : "bg-[#f4f7fb] text-brand-darkgray"}`}>
                    {isCompleted ? <CheckCircle2 size={24} /> : <Shield size={24} />}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-2 ${isCompleted ? "text-green-800" : "text-gray-900"}`}>{task.title}</h3>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1 bg-[#fff8e1] text-[#f59e0b] px-2 py-1 rounded-md text-xs font-bold">
                        <Trophy size={14} />
                        <span>{task.xp || 10} XP</span>
                      </span>
                      {!isCompleted && (
                        <span className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-bold ${
                          task.proofType === "audio" ? "bg-purple-50 text-purple-600" : 
                          task.proofType === "video" ? "bg-red-50 text-red-600" :
                          "bg-[#e0f2fe] text-[#0284c7]"
                        }`}>
                          {task.proofType === "audio" ? <Mic size={14} /> : 
                           task.proofType === "video" ? <Camera size={14} /> : // Reusing Camera icon for simplicity or I could use a Video icon
                           <Camera size={14} />}
                          <span>
                            {task.proofType === "audio" ? "AUDIO PROOF" : 
                             task.proofType === "video" ? "VIDEO PROOF" : 
                             "PHOTO PROOF"}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {isVerifying ? (
                  <div className="flex items-center space-x-2 text-brand-green mr-4">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-sm font-bold opacity-80">Verifying...</span>
                  </div>
                ) : isCompleted ? (
                   <CheckCircle2 className="text-brand-green" size={28} />
                ) : (
                  <ChevronRight className="text-gray-300 flex-shrink-0" size={24} />
                )}
              </div>
            );
          })}
          
          {currentTabTasks.length === 0 && (
            <div className="text-center py-10 text-gray-500 font-medium">
              No tasks available for this period.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
