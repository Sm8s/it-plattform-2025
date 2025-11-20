import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("de");

  useEffect(() => {
    const currentLocale = navigator.language?.startsWith("de") ? "de" : "en";
    setLocale(currentLocale);

    // Wenn Supabase nicht konfiguriert ist, einfach als "nicht eingeloggt"
    if (!supabase) {
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session || null);
      setLoading(false);
    };
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const loadProfile = async () => {
      if (!session) {
        setProfile(null);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!error) setProfile(data);
    };
    loadProfile();
  }, [session]);

  const value = { session, profile, loading, locale, setLocale };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
