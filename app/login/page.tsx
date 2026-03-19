"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/onboarding");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to authenticate with Google. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-brand-beige">
      <div className="flex flex-col items-center bg-white p-10 rounded-3xl shadow-lg max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-brand-darkgray text-white font-bold text-2xl w-12 h-12 flex items-center justify-center rounded-xl">
            CB
          </div>
          <h1 className="text-3xl font-serif text-brand-brown font-bold tracking-tight">CivicBuddy</h1>
        </div>

        <p className="text-brand-darkbrown mb-10 text-lg italic">
          Learn with fun and make your surroundings much better to live
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex items-center justify-center space-x-3 w-full bg-brand-darkbrown hover:bg-brand-brown text-white py-3 px-6 rounded-full font-semibold transition-colors disabled:opacity-70"
        >
          <Mail size={20} />
          <span>{loading ? "Logging in..." : "Login with Gmail"}</span>
        </button>
      </div>
    </div>
  );
}
