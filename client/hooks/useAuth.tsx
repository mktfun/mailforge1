import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, mockAuth } from "@/lib/supabaseClient";

export type AuthContextValue = {
  user: import("@supabase/supabase-js").User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (
          error &&
          (error.message.includes("Failed to fetch") ||
            error.message.includes("network"))
        ) {
          throw new Error(error.message);
        }

        if (data.session) {
          console.log("Found Supabase session:", data.session.user.email);
          setUser(data.session.user);
        } else {
          console.log("No Supabase session found");
          setUser(null);
        }
        setLoading(false);
      } catch (error) {
        console.warn("Supabase session failed, checking fallback auth:", error);
        try {
          const { data } = await mockAuth.getSession();
          if (!mounted) return;

          if (data.session) {
            console.log("Found fallback session:", data.session.user.email);
            setUser(data.session.user);
          } else {
            console.log("No fallback session found");
            setUser(null);
          }
        } catch (fallbackError) {
          console.error("Fallback session check failed:", fallbackError);
          if (!mounted) return;
          setUser(null);
        }
        setLoading(false);
      }
    }

    getInitialSession();

    // Set up auth state change listener
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.warn("Supabase signOut failed, using fallback:", error);
          await mockAuth.signOut();
        }
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
