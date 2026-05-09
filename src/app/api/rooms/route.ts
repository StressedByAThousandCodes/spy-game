import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { generateRoomCode } from "@/lib/generateRoomCode";

export async function POST() {
  try {
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

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code: roomCode,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      roomId: data.id,
      roomCode: data.code,
      shareUrl: `/room/${data.code}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create room",
      },
      {
        status: 500,
      }
    );
  }
}