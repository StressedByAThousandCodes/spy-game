"use client";

import { setStoredDeviceToken } from "@/lib/localStorage";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function createRoom() {
    try {
      setLoading(true);

      const response = await fetch("/api/rooms", {
        method: "POST",
      });

      const data = await response.json();

      setStoredDeviceToken(data.deviceToken);

      router.push(data.shareUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button
        onClick={createRoom}
        disabled={loading}
        className="rounded-xl bg-black px-6 py-3 text-white"
      >
        {loading ? "Creating..." : "Create Room"}
      </button>
    </main>
  );
}