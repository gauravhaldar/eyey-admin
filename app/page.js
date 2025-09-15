"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.replace("/login"); // redirect to login if not logged in
    } else {
      router.replace("/dashboard"); // redirect logged in users to dashboard
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Checking authentication...</p>
      </div>
    );
  }

  return null; // nothing is rendered because we redirect anyway
}
