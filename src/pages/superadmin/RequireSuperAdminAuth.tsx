import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function RequireSuperAdminAuth({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.user_metadata?.role === "superadmin") {
          setAuthed(true);
        } else {
          setAuthed(false);
          navigate("/admin/login", { replace: true });
        }
      } else {
        setAuthed(false);
        navigate("/admin/login", { replace: true });
      }
      setChecking(false);
    };
    check();
    // Écoute les changements d'auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthed(false);
        navigate("/admin/login", { replace: true });
      } else {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user && user.user_metadata?.role === "superadmin") {
            setAuthed(true);
          } else {
            setAuthed(false);
            navigate("/admin/login", { replace: true });
          }
        });
      }
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, [navigate]);

  if (checking) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Chargement...</div>;
  }
  if (!authed) return null;
  return <>{children}</>;
} 