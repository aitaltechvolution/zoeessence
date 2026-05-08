import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { Package, ShoppingBag, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

interface Stats {
  productCount: number;
  orderCount: number;
  pendingOrders: number;
  revenue: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: productCount }, { count: orderCount }, { count: pendingOrders }, { data: paid }, { data: recentOrders }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("total"),
        supabase.from("orders").select("id,customer_name,product_title,total,status,created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      const revenue = (paid ?? []).reduce((sum, r: any) => sum + Number(r.total ?? 0), 0);
      setStats({
        productCount: productCount ?? 0,
        orderCount: orderCount ?? 0,
        pendingOrders: pendingOrders ?? 0,
        revenue,
      });
      setRecent(recentOrders ?? []);
    })();
  }, []);

  return (
    <div className="max-w-6xl">
      <h1 className="font-serif text-4xl mb-2">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">Overview of your shop activity.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger">
        {[
          { label: "Products", value: stats?.productCount ?? "—", icon: Package },
          { label: "Total Orders", value: stats?.orderCount ?? "—", icon: ShoppingBag },
          { label: "Pending", value: stats?.pendingOrders ?? "—", icon: Clock },
          { label: "Revenue", value: stats ? formatNaira(stats.revenue) : "—", icon: CheckCircle2 },
        ].map((c) => (
          <div key={c.label} className="bg-card border border-border p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <p className="text-[11px] uppercase tracking-[0.2em]">{c.label}</p>
              <c.icon className="h-4 w-4" />
            </div>
            <p className="font-serif text-3xl mt-3">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-serif text-2xl">Recent orders</h2>
        </div>
        {recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((o) => (
              <div key={o.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{o.product_title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatNaira(Number(o.total))}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
