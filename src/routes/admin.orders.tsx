import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";
import { PageLoader } from "@/components/site/PageLoader";
import { ChevronDown, ChevronUp, Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "confirmed", "in_production", "shipped", "delivered", "cancelled"] as const;

interface Order {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  delivery_location: string;
  product_id: string | null;
  product_title: string;
  quantity: number;
  unit_price: number;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
}

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    setOrders((s) => s.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="max-w-6xl">
      <h1 className="font-serif text-4xl mb-2">Orders</h1>
      <p className="text-sm text-muted-foreground mb-8">{orders.length} total · {orders.filter((o) => o.status === "pending").length} pending</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
        {STATUSES.map((s) => (
          <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>{s.replace("_", " ")}</Chip>
        ))}
      </div>

      {loading ? (
        <PageLoader label="Loading orders" />
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center">
          <p className="font-serif text-2xl mb-2">No orders</p>
          <p className="text-sm text-muted-foreground">Orders will appear here as customers place them.</p>
        </div>
      ) : (
        <div className="bg-card border border-border divide-y divide-border">
          {filtered.map((o) => {
            const open = expanded === o.id;
            return (
              <div key={o.id}>
                <button
                  onClick={() => setExpanded(open ? null : o.id)}
                  className="w-full text-left p-5 flex items-start md:items-center justify-between gap-4 flex-wrap hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {o.product_title} · qty {o.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatNaira(Number(o.total))}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                      {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 ${statusColor(o.status)}`}>
                    {o.status.replace("_", " ")}
                  </span>
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {open && (
                  <div className="px-5 pb-5 border-t border-border bg-secondary/20 fade-up">
                    <div className="grid md:grid-cols-2 gap-6 mt-5">
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Customer</p>
                        <a href={`mailto:${o.email}`} className="flex items-center gap-2 text-sm hover:text-gold">
                          <Mail className="h-3.5 w-3.5" /> {o.email}
                        </a>
                        <a href={`tel:${o.phone}`} className="flex items-center gap-2 text-sm hover:text-gold">
                          <Phone className="h-3.5 w-3.5" /> {o.phone}
                        </a>
                        <p className="flex items-start gap-2 text-sm">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> {o.delivery_location}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Order</p>
                        <p className="text-sm">Unit: {formatNaira(Number(o.unit_price))}</p>
                        <p className="text-sm">Qty: {o.quantity}</p>
                        <p className="text-sm font-medium">Total: {formatNaira(Number(o.total))}</p>
                      </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-border flex items-center gap-3 flex-wrap">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Update status</label>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="px-3 py-2 bg-background border border-border focus:border-foreground outline-none text-sm"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] border transition-colors ${
        active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "pending": return "bg-gold/15 text-gold";
    case "confirmed": return "bg-blush/30 text-foreground";
    case "in_production": return "bg-accent text-foreground";
    case "shipped": return "bg-secondary text-foreground";
    case "delivered": return "bg-primary/10 text-primary";
    case "cancelled": return "bg-destructive/10 text-destructive";
    default: return "bg-muted";
  }
}
