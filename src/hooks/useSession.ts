import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Client-only session state for header/CTA rendering. */
export function useSession() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUserId(data.session?.user.id ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
      setReady(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { userId, ready, signedIn: !!userId };
}