import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  "https://jptqwesfjiokzmginteo.supabase.co";
const supabaseAnon =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdHF3ZXNmamloa3ptZ2ludGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Njk2MzYsImV4cCI6MjA3MjA0NTYzNn0.dTjSOFb3jwAP5V0jl8RA_QfUNEd7oMNZKDDpbIIafdA";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key available:", !!supabaseAnon);

if (!supabaseUrl || !supabaseAnon) {
  console.error("Missing Supabase configuration");
  throw new Error(
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

// Create custom fetch with better error handling for browser extension interference
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  try {
    const response = await fetch(url, {
      ...options,
      mode: "cors",
      credentials: "include",
    });
    return response;
  } catch (error) {
    console.error(
      "Network fetch error (possibly browser extension interference):",
      error,
    );
    throw new Error("Failed to fetch - browser extension or network issue");
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    fetch: customFetch,
    headers: {
      "Content-Type": "application/json",
    },
  },
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Simple local fallback for testing
export const mockAuth = {
  async signInWithPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    console.log("Mock auth attempted with:", email, password);
    // For testing purposes - accept any email/password
    if (email && password) {
      const mockUser = {
        id: "mock-user-id",
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store in localStorage for persistence
      localStorage.setItem("mock-user", JSON.stringify(mockUser));

      return {
        data: {
          user: mockUser,
          session: {
            access_token: "mock-token",
            user: mockUser,
          },
        },
        error: null,
      };
    }

    return {
      data: { user: null, session: null },
      error: { message: "Invalid credentials" },
    };
  },

  async signUp({ email, password }: { email: string; password: string }) {
    return this.signInWithPassword({ email, password });
  },

  async getSession() {
    const mockUser = localStorage.getItem("mock-user");
    if (mockUser) {
      const user = JSON.parse(mockUser);
      return {
        data: {
          session: {
            user,
            access_token: "mock-token",
          },
        },
        error: null,
      };
    }
    return {
      data: { session: null },
      error: null,
    };
  },

  async signOut() {
    localStorage.removeItem("mock-user");
    return { error: null };
  },
};
