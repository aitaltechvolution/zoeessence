import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { InlineSpinner } from "@/components/site/PageLoader";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { requestAdminPasswordReset } from "@/server/admin-password-reset.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Zoe Essence" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [resetMsg, setResetMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [resetting, setResetting] = useState(false);

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setResetMsg(null);
    if (!email.trim()) {
      setResetMsg({ type: "err", text: "Enter your admin email above." });
      return;
    }
    setResetting(true);
    try {
      const res = await requestAdminPasswordReset({
        data: {
          email: email.trim(),
          redirectTo: `${window.location.origin}/admin/reset-password`,
        },
      });
      if (res.ok) {
        setResetMsg({ type: "ok", text: "Reset link sent. Check your inbox." });
      } else {
        setResetMsg({ type: "err", text: res.error });
      }
    } catch (err) {
      setResetMsg({ type: "err", text: (err as Error).message });
    } finally {
      setResetting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }
    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sign in failed");
      setSubmitting(false);
      return;
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setSubmitting(false);
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <header className="container-zoe py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md bg-card border border-border p-8 md:p-10 fade-up">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Admin</p>
          <h1 className="font-serif text-4xl">Sign in</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage products and orders for Zoe Essence.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-border focus:border-foreground outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-border focus:border-foreground outline-none text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">
                {error}
              </p>
            )}

            <button
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting && <InlineSpinner />}
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            {mode === "signin" ? (
              <button
                type="button"
                onClick={() => { setMode("forgot"); setResetMsg(null); }}
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </button>
            ) : (
              <form onSubmit={handleForgot} className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Enter the admin email above. We'll email a reset link if it matches an admin account.
                </p>
                {resetMsg && (
                  <p className={`text-sm px-3 py-2 border ${resetMsg.type === "ok" ? "text-foreground border-gold/40 bg-gold/5" : "text-destructive border-destructive/30 bg-destructive/5"}`}>
                    {resetMsg.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setMode("signin"); setResetMsg(null); }}
                    className="px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] border border-border hover:border-foreground"
                  >
                    Back
                  </button>
                  <button
                    disabled={resetting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] bg-foreground text-background hover:bg-foreground/90 disabled:opacity-60"
                  >
                    {resetting && <InlineSpinner />}
                    {resetting ? "Sending…" : "Send reset link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
