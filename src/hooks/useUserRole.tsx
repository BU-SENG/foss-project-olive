import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["app_role"] | null;

export const useUserRole = (userId: string | undefined) => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    let attempts = 0;
    const maxAttempts = 5;

    const fetchRole = async () => {
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (data?.role) {
          setRole(data.role as UserRole);
          setLoading(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(fetchRole, 500);
        } else {
          console.error("Failed to fetch user role after multiple attempts.");
          setLoading(false);
        }
      } catch {
        console.error("Error fetching role");
        setLoading(false);
      }
    };

    fetchRole();
    
    return () => { attempts = maxAttempts; }; 
  }, [userId]);

  return { role, loading };
};