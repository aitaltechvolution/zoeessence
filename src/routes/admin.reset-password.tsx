import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InlineSpinner } from "@/components/site/PageLoader";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Zoe Essence Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase auth-helpers automatically processes the recovery hash on load.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate({ to: "/admin" }), 1500);
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <header className="container-zoe py-6">
        <Link to="/admin/login" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md bg-card border border-border p-8 md:p-10 fade-up">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Admin</p>
          <h1 className="font-serif text-4xl">Set new password</h1>

          {!ready ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Validating reset link… If nothing happens, request a new link from the login page.
            </p>
          ) : success ? (
            <p className="mt-6 text-sm">
              Password updated. Redirecting to admin…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">New password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-border focus:border-foreground outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Confirm password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-border focus:border-foreground outline-none text-sm"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{error}</p>
              )}
              <button
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting && <InlineSpinner />}
                {submitting ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
