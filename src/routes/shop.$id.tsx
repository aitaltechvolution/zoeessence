import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { ArrowLeft, Minus, Plus, Check } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { sendOrderConfirmation } from "@/server/order-email.functions";

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string | null;
  image_url: string | null;
  tags: string[] | null;
};

export const Route = createFileRoute("/shop/$id")({
  component: ProductPage,
});

const orderSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "Name is too long")
    .regex(/^[\p{L}\p{M}'\- .]+$/u, "Name can only contain letters, spaces, hyphens and apostrophes"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email")
    .max(255, "Email is too long"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Enter a valid phone number"),
  delivery_location: z
    .string()
    .trim()
    .min(5, "Please enter a complete delivery address")
    .max(500, "Address is too long"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(100, "Maximum 100 per order"),
});

function ProductPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    delivery_location: "",
  });

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data as Product | null);
        setLoading(false);
      });
  }, [id]);

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    const parsed = orderSchema.safeParse({ ...form, quantity: qty });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setSubmitting(true);
    const total = product.price * qty;
    const { error } = await supabase.from("orders").insert({
      ...parsed.data,
      product_id: product.id,
      product_title: product.title,
      unit_price: product.price,
      total,
      status: "pending",
    });
    if (error) {
      setSubmitting(false);
      toast.error("Could not place your order. Please try again.");
      return;
    }
    try {
      await sendOrderConfirmation({
        data: {
          customerName: parsed.data.customer_name,
          customerEmail: parsed.data.email,
          customerPhone: parsed.data.phone,
          address: parsed.data.delivery_location,
          productTitle: product.title,
          quantity: qty,
          unitPrice: product.price,
          total,
        },
      });
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
    setSuccess(true);
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-zoe py-20 grid lg:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-muted animate-pulse" />
            <div className="h-10 w-3/4 bg-muted animate-pulse" />
            <div className="h-6 w-32 bg-muted animate-pulse" />
            <div className="h-4 w-full bg-muted animate-pulse mt-8" />
            <div className="h-4 w-5/6 bg-muted animate-pulse" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-zoe py-32 text-center">
          <h1 className="font-serif text-4xl">Product not found</h1>
          <Link to="/shop" className="inline-flex mt-6 text-xs uppercase tracking-[0.2em] border-b border-foreground pb-1">
            Back to shop
          </Link>
        </div>
      </Layout>
    );
  }

  const total = product.price * qty;

  return (
    <Layout>
      <div className="container-zoe pt-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to shop
        </Link>
      </div>

      <section className="container-zoe py-10 grid lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="img-zoom">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="w-full aspect-[4/5] object-cover" />
          ) : (
            <div className="w-full aspect-[4/5] bg-muted" />
          )}
        </div>

        <div className="lg:sticky lg:top-28 self-start">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">{product.category}</p>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight">{product.title}</h1>
          <p className="mt-4 text-2xl">{formatNaira(product.price)}</p>

          {product.description && (
            <p className="mt-8 text-foreground/80 leading-relaxed">{product.description}</p>
          )}

          {product.category === "Clothing" && (
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Made-to-order · 5–7 working days
            </p>
          )}

          {!showForm && !success && (
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quantity</span>
                <div className="flex items-center border border-border">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="px-5 text-sm">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(100, q + 1))} className="p-2.5 hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="w-full md:w-auto inline-flex items-center justify-center px-10 py-4 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Order Now
              </button>
            </div>
          )}

          {showForm && !success && (
            <form onSubmit={submitOrder} className="mt-10 space-y-5 border-t border-border pt-8">
              <h2 className="font-serif text-2xl">Place your order</h2>
              {[
                { name: "customer_name", label: "Full name", type: "text" },
                { name: "email", label: "Email", type: "email" },
                { name: "phone", label: "Phone number", type: "tel" },
                { name: "delivery_location", label: "Delivery location", type: "text" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    required
                    value={(form as Record<string, string>)[f.name]}
                    onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                    className="w-full px-4 py-3 bg-transparent border border-border focus:border-foreground outline-none text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Quantity</label>
                <div className="flex items-center border border-border w-fit">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="px-5 text-sm">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(100, q + 1))} className="p-2.5 hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-4">
                <span className="uppercase tracking-[0.2em] text-xs text-muted-foreground">Total</span>
                <span className="text-lg">{formatNaira(total)}</span>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3.5 text-xs uppercase tracking-[0.2em] border border-border hover:border-foreground">Cancel</button>
                <button disabled={submitting} className="flex-1 px-6 py-3.5 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                  {submitting ? "Placing order…" : "Submit order"}
                </button>
              </div>
            </form>
          )}

          {success && (
            <div className="mt-10 border border-gold/40 bg-gold/5 p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                <Check className="h-5 w-5 text-gold" />
              </div>
              <h2 className="font-serif text-2xl">Thank you!</h2>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                Your order for <span className="text-foreground">{product.title}</span> has been received.
                Our team will reach out shortly via phone or WhatsApp to confirm details and delivery.
              </p>
              <Link to="/shop" className="mt-6 inline-flex text-xs uppercase tracking-[0.2em] border-b border-foreground pb-1">
                Continue shopping
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
