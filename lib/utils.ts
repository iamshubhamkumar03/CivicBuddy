export interface MissionStats {
  totalRemaining: number;
  details: {
    tasks: number;
    quiz: number;
  };
}

export const getCoins = (): number => {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("civicbuddy_coins") || "0", 10);
};

export const addCoins = (amount: number) => {
  if (typeof window === "undefined") return;
  
  const current = getCoins();
  const next = current + amount;
  
  localStorage.setItem("civicbuddy_coins", next.toString());
  
  // Dispatch custom event for real-time sidebar/stats update
  window.dispatchEvent(new Event("civicbuddy_stats_updated"));
  window.dispatchEvent(new Event("civicbuddy_coins_updated")); // Keeping for backward compatibility or specifics
};

export const getMissionStats = (): MissionStats => {
  if (typeof window === "undefined") return { totalRemaining: 0, details: { tasks: 0, quiz: 0 } };

  const today = new Date().toISOString().split("T")[0];
  
  // Tasks Remaining
  const tasksCacheKey = `civicbuddy_tasks_${today}_v2`;
  const tasksCompletedKey = `civicbuddy_tasks_completed_${today}`;
  
  const cachedTasks = localStorage.getItem(tasksCacheKey);
  const completedTasks = localStorage.getItem(tasksCompletedKey);
  
  let remainingTasks = 0;
  if (cachedTasks) {
    try {
      const tasksMap = JSON.parse(cachedTasks);
      let totalTasks = 0;
      Object.values(tasksMap).forEach((arr: any) => { totalTasks += arr.length; });
      
      const completedIds = completedTasks ? JSON.parse(completedTasks) : [];
      remainingTasks = Math.max(0, totalTasks - completedIds.length);
    } catch (e) {}
  } else {
    // If tasks aren't loaded yet, we can't accurately count, but typical is 12
    remainingTasks = 0; 
  }

  // Quiz Remaining
  const quizCompletedKey = `civicbuddy_quiz_completed_${today}`;
  const remainingQuiz = localStorage.getItem(quizCompletedKey) ? 0 : 1;

  return {
    totalRemaining: remainingTasks + remainingQuiz,
    details: {
      tasks: remainingTasks,
      quiz: remainingQuiz,
    }
  };
};

export const syncMissionStats = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("civicbuddy_stats_updated"));
};
