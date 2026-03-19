"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { addCoins, syncMissionStats } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function QuizPage() {
  const router = useRouter();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      const today = new Date().toISOString().split("T")[0];
      const completedKey = `civicbuddy_quiz_completed_${today}`;
      const questionsKey = `civicbuddy_quiz_questions_${today}`;

      // Check if done today
      if (localStorage.getItem(completedKey)) {
        setQuizCompleted(true);
        setLoading(false);
        return;
      }

      // Check if we already have questions for today cached
      const cached = localStorage.getItem(questionsKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuestions(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore cache error and fetch again
        }
      }

      // Fetch user demographic info
      const userStr = localStorage.getItem("civicbuddy_user");
      let userData = { age: "citizen", gender: "person", profession: "professional" };
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          userData = { ...userData, ...parsed };
        } catch (e) {}
      }

      // Fetch from API
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        
        if (res.ok && data.quiz) {
          setQuestions(data.quiz);
          localStorage.setItem(questionsKey, JSON.stringify(data.quiz));
        } else {
          throw new Error(data.error || "Failed to fetch questions");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, []);

  const handleSelectAnswer = (option: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(option);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;
    setIsAnswerChecked(true);

    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const today = new Date().toISOString().split("T")[0];
    const completedKey = `civicbuddy_quiz_completed_${today}`;

    // Mark as completed
    localStorage.setItem(completedKey, "true");

    // Award coins using centralized utility
    addCoins(correctCount);
    
    // Sync mission stats
    syncMissionStats();

    setQuizCompleted(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-green w-12 h-12 mb-4" />
        <p className="text-xl font-serif text-brand-brown">Generating Your Daily Quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <XCircle className="text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-3xl font-serif text-brand-brown mb-2">Oops!</h2>
        <p className="text-brand-darkgray mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-brand-green text-white px-8 py-3 rounded-full font-bold hover:bg-[#25a25a] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (quizCompleted && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CheckCircle2 className="text-brand-green w-16 h-16 mb-4" />
        <h2 className="text-3xl font-serif text-brand-brown mb-2">All Done For Today!</h2>
        <p className="text-brand-darkgray mb-6">You've already completed today's quiz. Come back tomorrow for new questions.</p>
        <button 
          onClick={() => router.push("/")} 
          className="bg-brand-green text-white px-8 py-3 rounded-full font-bold hover:bg-[#25a25a] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (quizCompleted && questions.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CheckCircle2 className="text-brand-green w-20 h-20 mb-4" />
        <h2 className="text-4xl font-serif text-brand-brown mb-2 font-bold">Quiz Completed!</h2>
        <p className="text-brand-darkgray text-lg mb-8">
          You scored <span className="font-bold text-brand-green text-2xl">{correctCount} / {questions.length}</span>
        </p>
        <p className="bg-green-50 text-brand-green px-6 py-4 rounded-xl font-bold mb-8 shadow-sm border border-green-100">
          🎉 You earned {correctCount} coins today! (₹{(correctCount / 100).toFixed(2)})
        </p>
        <button 
          onClick={() => router.push("/")} 
          className="bg-brand-green text-white px-8 py-4 rounded-full font-bold hover:bg-[#25a25a] transition-colors shadow-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-brand-brown font-bold">Daily Civic Quiz</h1>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-[#e6dac7] font-bold text-brand-brown">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#e6dac7] mb-8">
        <h2 className="text-2xl font-medium text-brand-darkbrown mb-6 leading-relaxed">
          {question?.question}
        </h2>

        <div className="space-y-4">
          {question?.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correctAnswer;
            
            let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ";
            
            if (!isAnswerChecked) {
              btnClass += isSelected 
                ? "border-brand-green bg-green-50 text-brand-darkbrown font-medium" 
                : "border-gray-200 hover:border-brand-green hover:bg-gray-50 text-gray-700";
            } else {
              if (isCorrect) {
                 btnClass += "border-brand-green bg-green-100 text-brand-green font-bold";
              } else if (isSelected && !isCorrect) {
                 btnClass += "border-red-400 bg-red-50 text-red-600 font-medium";
              } else {
                 btnClass += "border-gray-200 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswerChecked}
                onClick={() => handleSelectAnswer(option)}
                className={btnClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isAnswerChecked && isCorrect && <CheckCircle2 className="text-brand-green" size={20} />}
                  {isAnswerChecked && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        {!isAnswerChecked ? (
          <button
            onClick={checkAnswer}
            disabled={!selectedAnswer}
            className={`px-8 py-3 rounded-full font-bold shadow-sm transition-colors ${
              selectedAnswer 
                ? "bg-brand-green text-white hover:bg-[#25a25a]" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="bg-brand-brown text-white px-8 py-3 rounded-full font-bold shadow-sm hover:bg-[#4a3625] transition-colors flex items-center space-x-2"
          >
            <span>{currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
