import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { playerId, isReady } = await req.json();

    const { data, error } = await supabase
      .from("players")
      .update({ is_ready: isReady })
      .eq("id", playerId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update ready state" },
      { status: 500 }
    );
  }
}