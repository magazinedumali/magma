import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { LoadingBar } from "@/components/ui/loading-bar";

export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthed(true);
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
        setAuthed(true);
      }
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center font-jost text-[var(--text-muted)] gap-4">
        <LoadingBar variant="full" />
        <div className="flex flex-col items-center mt-8">
           <LoadingBar variant="inline" className="w-48 mt-2" />
           <div className="font-medium text-lg mt-4">Vérification de l'accès...</div>
        </div>
      </div>
    );
  }
  
  if (!authed) return null;
  
  return <>{children}</>;
}