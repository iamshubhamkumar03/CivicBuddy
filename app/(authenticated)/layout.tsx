"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
        router.push("/login");
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (checking) return null;
  if (!isAuth) return null;

  return (
    <div className="flex h-screen bg-brand-beige overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto no-scrollbar relative">
        {children}
      </main>
    </div>
  );
}
