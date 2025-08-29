import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Testing...");

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus(`Auth Error: ${error.message}`);
          return;
        }
        
        // Try a simple query
        const { data: testData, error: queryError } = await supabase
          .from('profiles')
          .select('count', { count: 'exact', head: true });
        
        if (queryError) {
          if (queryError.message.includes('relation "profiles" does not exist')) {
            setStatus("✅ Connection OK - Database tables need to be created");
          } else {
            setStatus(`Query Error: ${queryError.message}`);
          }
        } else {
          setStatus("✅ Full connection successful!");
        }
        
      } catch (err) {
        setStatus(`Connection Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
    
    testConnection();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-semibold">Supabase Connection Test</h3>
      <p>{status}</p>
    </div>
  );
}
