"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Target, MessageSquare, Camera, Scale, Coins, Users } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { getCoins } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const refreshCoins = () => {
      setCoins(getCoins());
    };

    // Initial load
    refreshCoins();

    // Listen for custom event from other components
    window.addEventListener("civicbuddy_coins_updated", refreshCoins);
    
    return () => {
      window.removeEventListener("civicbuddy_coins_updated", refreshCoins);
    };
  }, [pathname]);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Daily Tasks", href: "/tasks", icon: Target },
    { name: "Community Feed", href: "/feed", icon: Users },
    { name: "AI Guide", href: "/ai", icon: MessageSquare },
    { name: "Report Issue", href: "/report", icon: Camera },
    { name: "Civic Rules", href: "/rules", icon: Scale },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <div className="w-64 bg-white/50 border-r border-gray-200 h-screen flex flex-col p-6 sticky top-0">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-brand-darkgray text-white font-bold text-xl w-10 h-10 flex items-center justify-center rounded-xl">
          CB
        </div>
        <span className="text-xl font-serif text-brand-brown font-bold tracking-tight">CivicBuddy</span>
      </div>

      <div className="bg-[#f0e8dc] text-[10px] text-brand-darkbrown font-bold uppercase tracking-wider text-center p-3 rounded-2xl mb-10 mx-2 shadow-sm border border-[#e6dac7]">
        Learn with fun and make your surroundings much better to live
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? item.name === "Report Issue"
                    ? "bg-[#9e2a2b] text-white font-bold"
                    : "bg-brand-brown text-white font-bold"
                  : "text-gray-500 hover:bg-gray-100 font-medium"
              }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "text-gray-400"} />
              <span className="flex-1 text-sm">{item.name}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-lightgreen"></div>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Stats */}
      <div className="mt-auto">
        <div className="bg-brand-darkgray text-white rounded-3xl p-5 mb-6 flex flex-col items-center shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold tracking-widest text-[#a1a1a1] mb-2 z-10 text-center">TOTAL EARNED COINS</span>
          <div className="flex items-center space-x-2 z-10 mb-1">
            <Coins size={20} className="text-brand-lightgreen" />
            <span className="text-3xl font-black text-brand-lightgreen">{coins}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors pt-2 mx-2"
        >
          <div className="w-8 h-8 rounded-full bg-brand-darkgray text-white flex items-center justify-center">
            N
          </div>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
