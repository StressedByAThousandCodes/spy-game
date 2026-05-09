"use client";

import { useState } from "react";

export default function ReadyButton({
  playerId,
  isReady,
}: {
  playerId: string;
  isReady: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function toggleReady() {
    setLoading(true);

    await fetch("/api/players/ready", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerId,
        isReady: !isReady,
      }),
    });

    setLoading(false);
  }

  return (
    <button
      onClick={toggleReady}
      disabled={loading}
      className="rounded bg-blue-600 px-3 py-1 text-white"
    >
      {isReady ? "Unready" : "Ready"}
    </button>
  );
}