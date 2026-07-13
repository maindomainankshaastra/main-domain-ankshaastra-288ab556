import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "staff" | "moderator" | "user";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: Role | null;
  loading: boolean;
  canViewModule: (module: string) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  canViewModule: () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
  // Defer DB call to avoid deadlock
  setTimeout(() => {
    fetchRole(newSession.user.id);
    fetchPermissions(newSession.user.id);
  }, 0);
} else {
  setRole(null);
  setPermissions([]);
}
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
  fetchRole(existing.user.id);
  fetchPermissions(existing.user.id);
}
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("role", { ascending: true }) // admin < moderator < user alphabetically -> pick highest priv
      .limit(1)
      .maybeSingle();
    // Prefer admin if present
    const { data: adminCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setRole((adminCheck?.role as Role) || (data?.role as Role) || "user");
  };
const fetchPermissions = async (userId: string) => {
  const { data } = await supabase
    .from("admin_module_permissions")
    .select("module")
    .eq("user_id", userId)
    .eq("can_view", true);

  setPermissions(data?.map((p) => p.module) || []);

};

const canViewModule = (module: string) => {
  if (role === "admin") return true;
  return permissions.includes(module);
};
  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut, canViewModule, }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


