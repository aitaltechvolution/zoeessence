import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

const CATEGORIES = ["All", "Clothing", "Shoes", "Bags", "Accessories"] as const;

type ShopSearch = { category?: string; q?: string };

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop — Zoe Essence" },
      { name: "description", content: "Browse made-to-order garments, ready-to-wear, shoes, bags, and accessories from Zoe Essence." },
      { property: "og:title", content: "Shop Zoe Essence" },
      { property: "og:description", content: "Curated contemporary fashion for women." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const activeCategory = search.category ?? "All";
  const query = search.q ?? "";

  useEffect(() => {
    setLoading(true);
    supabase
      .from("products")
      .select("id,title,category,price,image_url,tags")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as ProductCardData[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const inCat = activeCategory === "All" || p.category === activeCategory;
      const inQ = !query || p.title.toLowerCase().includes(query.toLowerCase());
      return inCat && inQ;
    });
  }, [products, activeCategory, query]);

  return (
    <Layout>
      <section className="container-zoe pt-12 md:pt-20 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">The Collection</p>
        <h1 className="font-serif text-5xl md:text-6xl">Shop</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Made-to-order garments, ready-to-wear, and considered accessories.
        </p>
      </section>

      <section className="container-zoe pb-20">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-5 mb-10 border-y border-border py-5">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = activeCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => navigate({ search: (prev: ShopSearch) => ({ ...prev, category: c === "All" ? undefined : c }) })}
                  className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="md:ml-auto relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => navigate({ search: (prev: ShopSearch) => ({ ...prev, q: e.target.value }) })}
              placeholder="Search products"
              className="w-full pl-10 pr-3 py-2.5 text-sm bg-transparent border border-border focus:border-foreground outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <div className="h-4 w-2/3 bg-muted mt-4 animate-pulse" />
                <div className="h-3 w-1/3 bg-muted mt-2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="font-serif text-2xl mb-2">Nothing here yet</p>
            <p className="text-sm">Try a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
