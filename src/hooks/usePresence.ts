import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CHANNEL = "online-users";

/**
 * Tracks online users via Supabase Realtime presence.
 * - When called with no args: just tracks current user's presence and returns the online set.
 * - When called with a userId: returns whether that user is currently online.
 */
export function usePresence(userId?: string | null) {
  const { user } = useAuth();
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase.channel(CHANNEL, {
      config: { presence: { key: user?.id ?? `anon-${Math.random().toString(36).slice(2)}` } },
    });

    const sync = () => {
      const state = channel.presenceState() as Record<string, Array<{ user_id?: string }>>;
      const ids = new Set<string>();
      Object.values(state).forEach((arr) =>
        arr.forEach((p) => p.user_id && ids.add(p.user_id))
      );
      setOnlineIds(ids);
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .on("presence", { event: "join" }, sync)
      .on("presence", { event: "leave" }, sync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user?.id) {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const isOnline = userId ? onlineIds.has(userId) : false;
  return { onlineIds, isOnline };
}