import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { generateDeviceToken } from "@/lib/deviceToken";

interface JoinBody {
  nickname: string;
  deviceToken?: string;
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      code: string;
    }>;
  }
) {
  try {
    const { code } = await context.params;

    const body: JoinBody = await request.json();

    const nickname = body.nickname?.trim();

    if (!nickname) {
      return NextResponse.json(
        { error: "Nickname required" },
        { status: 400 }
      );
    }

    const roomCode = code.toUpperCase();

    const roomResult = await supabase
      .from("rooms")
      .select("*")
      .eq("code", roomCode)
      .single();

    if (roomResult.error || !roomResult.data) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    const room = roomResult.data;

    if (room.status !== "lobby") {
      return NextResponse.json(
        { error: "Game already started" },
        { status: 400 }
      );
    }
    
    const playersResult = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room.id);
    
    const playerCount = playersResult.count ?? 0;
    
    if (playerCount >= 16) {
        return NextResponse.json(
            { error: "Room full" },
            { status: 400 }
        );
    }
    
    const deviceToken =
    body.deviceToken || generateDeviceToken();
    
    const existingPlayer = await supabase
        .from("players")
        .select("*")
        .eq("room_id", room.id)
        .eq("device_token", deviceToken)
        .maybeSingle();

    if (existingPlayer.data) {
    return NextResponse.json({
        room,
        player: existingPlayer.data,
        deviceToken,
        alreadyJoined: true,
    });
    }

    const playerResult = await supabase
      .from("players")
      .insert({
        room_id: room.id,
        nickname,
        device_token: deviceToken,
      })
      .select()
      .single();

    if (playerResult.error) {
      throw playerResult.error;
    }

    return NextResponse.json({
      room,
      player: playerResult.data,
      deviceToken,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}