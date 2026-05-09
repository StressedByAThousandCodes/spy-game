"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("players")
        .select("*");

      console.log(data, error);
    }

    testConnection();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">
        Supabase Test
      </h1>
    </main>
  );
}