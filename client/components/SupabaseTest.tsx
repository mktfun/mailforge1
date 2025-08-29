import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Testing...");

  useEffect(() => {
    async function testConnection() {
      try {
        console.log("Testing Supabase connection...");

        // Test basic auth session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth session error:", error);
          setStatus(`❌ Auth Error: ${error.message}`);
          return;
        }

        console.log("Auth session test passed:", data);
        setStatus("✅ Auth connection successful!");

      } catch (err) {
        console.error("Connection test error:", err);
        setStatus(`❌ Connection Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-semibold">Supabase Connection Test</h3>
      <p className="text-sm">{status}</p>
    </div>
  );
}
