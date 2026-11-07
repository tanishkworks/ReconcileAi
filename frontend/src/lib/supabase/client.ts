import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project"));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth helper for Google OAuth
export async function signInWithGoogle() {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    if (error) throw error;
    return data;
  } else {
    // Demo fallback for instant access
    const demoUser = {
      id: "usr_demo_cfo_01",
      email: "finance.controller@reconcileai.io",
      name: "Alex Morgan",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      role: "Lead Financial Controller",
      company: "Acme Enterprises Inc",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("reconcile_user", JSON.stringify(demoUser));
    }
    return { user: demoUser };
  }
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("reconcile_user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return {
    id: "usr_demo_cfo_01",
    email: "finance.controller@reconcileai.io",
    name: "Alex Morgan",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    role: "Lead Financial Controller",
    company: "Acme Enterprises Inc",
  };
}

export function signOutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("reconcile_user");
  }
  if (supabase) {
    supabase.auth.signOut();
  }
}
