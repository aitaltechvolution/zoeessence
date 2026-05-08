import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/components/site/PageLoader";
import { LayoutDashboard, Package, ShoppingBag, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Zoe Essence" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  const onLoginPage = location.pathname === "/admin/login" || location.pathname === "/admin/reset-password";

  const [roleCheckGrace, setRoleCheckGrace] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setRoleCheckGrace(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading || onLoginPage) return;
    if (!user) {
      navigate({ to: "/admin/login" });
      return;
    }
    if (!isAdmin && !roleCheckGrace) {
      navigate({ to: "/admin/login" });
    }
  }, [user, isAdmin, loading, onLoginPage, navigate, roleCheckGrace]);

  if (onLoginPage) {
    return <Outlet />;
  }

  if (loading || !user || !isAdmin) {
    return <PageLoader label="Verifying access" />;
  }

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package, exact: false },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  ] as const;

  async function handleLogout() {
    await signOut();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      <aside className="hidden md:flex md:w-60 lg:w-64 flex-col border-r border-border bg-background">
        <Link to="/admin" className="px-6 py-6 border-b border-border">
          <p className="font-serif text-2xl">Zoe<span className="text-gold"> Essence</span></p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">Admin</p>
        </Link>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "bg-accent text-foreground" }}
              activeOptions={{ exact: n.exact }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/70 hover:bg-muted transition-colors"
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground truncate mb-3">{user.email}</p>
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] border border-border hover:border-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-5 py-3">
          <Link to="/admin" className="font-serif text-lg">Zoe<span className="text-gold"> Admin</span></Link>
          <button onClick={handleLogout} className="text-[11px] uppercase tracking-[0.2em]">
            Sign out
          </button>
        </div>
        <nav className="flex border-t border-border overflow-x-auto">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "border-foreground text-foreground" }}
              activeOptions={{ exact: n.exact }}
              className="flex-1 text-center px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] border-b-2 border-transparent text-muted-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>

      <main className="flex-1 md:ml-0 mt-[88px] md:mt-0 p-5 md:p-8 lg:p-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
