"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/api";
import { BrowsePage } from "@/components/browse-page";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    
    // If no token, redirect to login
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Show browse page if authenticated
  return <BrowsePage />;
}