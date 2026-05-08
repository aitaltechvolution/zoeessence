import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const schema = z.object({
  email: z.string().email(),
  redirectTo: z.string().url(),
});

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase server credentials");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const requestAdminPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const supabaseAdmin = getAdminClient();
    const email = data.email.trim().toLowerCase();

    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      return { ok: false as const, error: "Unable to verify email at this time." };
    }
    const user = list.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (!user) {
      return { ok: false as const, error: "No admin account found with that email." };
    }

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return { ok: false as const, error: "No admin account found with that email." };
    }

    const { error: resetErr } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: data.redirectTo,
    });
    if (resetErr) {
      return { ok: false as const, error: resetErr.message };
    }
    return { ok: true as const };
  });
