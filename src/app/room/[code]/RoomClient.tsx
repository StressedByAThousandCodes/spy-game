"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ReadyButton from "@/components/ReadyButton";
import JoinRoomForm from "@/components/JoinRoomForm";

interface Player {
  id: string;
  nickname: string;
  is_ready: boolean;
}

export default function RoomClient({
  roomCode,
}: {
  roomCode: string;
}) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  const code = (roomCode ?? "").toUpperCase();

  // Load device token
  useEffect(() => {
    const token = localStorage.getItem("device_token");
    if (token) setDeviceToken(token);
  }, []);

  // Load room + players
  useEffect(() => {
    async function loadRoom() {
      const roomRes = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .single();

      if (!roomRes.data) return;

      setRoomId(roomRes.data.id);

      const playersRes = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomRes.data.id);

      setPlayers(playersRes.data || []);
    }

    loadRoom();
  }, [code]);

  // Realtime sync
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel("players-room")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          const res = await supabase
            .from("players")
            .select("*")
            .eq("room_id", roomId);

          setPlayers(res.data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const allReady =
    players.length >= 3 &&
    players.every((p) => p.is_ready);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">
        Room {code}
      </h1>

      {/* JOIN FLOW (ONLY IF NOT JOINED) */}
      {!playerId && (
        <JoinRoomForm
          roomCode={code}
          onJoined={(player, token) => {
            setPlayerId(player.id);
            setDeviceToken(token);
          }}
        />
      )}

      {/* LOBBY (ONLY AFTER JOIN) */}
      {playerId && (
        <>
          <div className="w-full max-w-md space-y-2">
            <h2 className="text-xl font-semibold">
              Players ({players.length})
            </h2>

            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded border p-2"
              >
                <span>
                  {p.nickname}
                </span>

                <ReadyButton
                  playerId={p.id}
                  isReady={p.is_ready}
                />
              </div>
            ))}
          </div>

          {allReady && (
            <button className="rounded bg-green-600 px-4 py-2 text-white">
              Start Game
            </button>
          )}
        </>
      )}
    </main>
  );
}