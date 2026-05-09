"use client";

import { useState } from "react";

import {
  getStoredDeviceToken,
  setStoredDeviceToken,
} from "@/lib/localStorage";

interface Props {
  roomCode: string;

  // NEW: callback when join succeeds
  onJoined?: (
    player: any,
    deviceToken: string
  ) => void;
}

export default function JoinRoomForm({
  roomCode,
  onJoined,
}: Props) {
  const [nickname, setNickname] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function joinRoom() {
    try {
      setLoading(true);
      setError("");

      const deviceToken =
        getStoredDeviceToken();

      const response = await fetch(
        `/api/rooms/${roomCode}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            nickname,
            deviceToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // store device identity
      setStoredDeviceToken(
        data.deviceToken
      );

      // IMPORTANT: notify parent
      onJoined?.(
        data.player,
        data.deviceToken
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <input
        value={nickname}
        onChange={(e) =>
          setNickname(e.target.value)
        }
        placeholder="Enter nickname"
        className="rounded border p-3"
      />

      <button
        onClick={joinRoom}
        disabled={loading}
        className="rounded bg-black px-4 py-3 text-white"
      >
        {loading
          ? "Joining..."
          : "Join Room"}
      </button>

      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}