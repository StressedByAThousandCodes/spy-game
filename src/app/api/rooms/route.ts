import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { generateRoomCode } from "@/lib/generateRoomCode";
import { generateDeviceToken } from "@/lib/deviceToken";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // optional device token from client
    const deviceToken =
      body.deviceToken || generateDeviceToken();

    let roomCode = generateRoomCode();

    // Ensure uniqueness
    let existingRoom = await supabase
      .from("rooms")
      .select("id")
      .eq("code", roomCode)
      .maybeSingle();

    while (existingRoom.data) {
      roomCode = generateRoomCode();

      existingRoom = await supabase
        .from("rooms")
        .select("id")
        .eq("code", roomCode)
        .maybeSingle();
    }

    // 1. CREATE ROOM
    const roomResult = await supabase
      .from("rooms")
      .insert({
        code: roomCode,
      })
      .select()
      .single();

    if (roomResult.error) {
      throw roomResult.error;
    }

    const room = roomResult.data;

    // 2. CREATE HOST AS PLAYER (IMPORTANT FIX)
    const hostResult = await supabase
      .from("players")
      .insert({
        room_id: room.id,
        nickname: "Host",
        device_token: deviceToken,
        is_ready: true,
      })
      .select()
      .single();

    if (hostResult.error) {
      throw hostResult.error;
    }

    // 3. RETURN EVERYTHING NEEDED
    return NextResponse.json({
      roomId: room.id,
      roomCode: room.code,
      shareUrl: `/room/${room.code}`,

      // IMPORTANT: host identity
      hostPlayer: hostResult.data,
      deviceToken,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}