import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { supabase } from "@/integrations/supabase/client";
import aboutImg from "@/assets/about.jpg";
import { ArrowRight, Scissors, Sparkles, Truck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zoe Essence — Contemporary Fashion" },
      { name: "description", content: "Made-to-order garments, ready-to-wear, and curated accessories. Timeless elegance from Zoe Essence." },
    ],
  }),
  component: HomePage,
});

const categories = [
  { name: "Clothing", value: "Clothing", image: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=900&q=80" },
  { name: "Shoes", value: "Shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=80" },
  { name: "Bags", value: "Bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=80" },
  { name: "Accessories", value: "Accessories", image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&q=80" },
];

const testimonials = [
  { name: "Adaeze O.", text: "My made-to-order gown fit like a dream. The craftsmanship and attention to detail are unmatched." },
  { name: "Tomi A.", text: "Zoe Essence has become my go-to for every occasion. Effortlessly elegant, always on time." },
  { name: "Chiamaka E.", text: "From the fabric to the finishing, everything feels intentional and luxurious." },
];

function HomePage() {
  const [featured, setFeatured] = useState<ProductCardData[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id,title,category,price,image_url,tags")
      .eq("featured", true)
      .limit(4)
      .then(({ data }) => setFeatured((data as ProductCardData[]) ?? []));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-zoe grid lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-12 md:pt-20 pb-20">
          <div className="reveal order-2 lg:order-1">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Contemporary Fashion</p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance">
              Effortless elegance,<br />
              <span className="italic text-gold">crafted for you</span>.
            </h1>
            <p className="mt-6 max-w-md text-base md:text-lg text-muted-foreground leading-relaxed">
              Made-to-order garments, ready-to-wear pieces, and curated accessories for women who value thoughtful design.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Shop Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.2em] border border-foreground/20 hover:border-foreground transition-colors"
              >
                Our story
              </Link>
            </div>
          </div>

          <div className="relative order-1 lg:order-2 fade-up">
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-zoe grid sm:grid-cols-3 gap-8 py-10 text-center">
          {[
            { icon: Scissors, title: "Made-to-Order", desc: "5–7 working days" },
            { icon: Sparkles, title: "Intentional Quality", desc: "Hand-finished pieces" },
            { icon: Truck, title: "Nationwide Delivery", desc: "Across Nigeria" },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-2">
              <f.icon className="h-5 w-5 text-gold" />
              <p className="font-serif text-lg">{f.title}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-zoe py-20 md:py-28">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Featured</p>
            <h2 className="font-serif text-4xl md:text-5xl">New this season</h2>
          </div>
          <Link to="/shop" className="text-xs uppercase tracking-[0.2em] hover:text-gold transition-colors inline-flex items-center gap-2">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 stagger">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Categories */}
      <section className="container-zoe pb-20 md:pb-28">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Shop by</p>
          <h2 className="font-serif text-4xl md:text-5xl">Categories</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 stagger">
          {categories.map((c) => (
            <Link
              key={c.value}
              to="/shop"
              search={{ category: c.value, q: "" }}
              className="group relative aspect-[3/4] overflow-hidden img-zoom block"
            >
              <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <div className="absolute bottom-5 left-5 text-background">
                <p className="font-serif text-2xl">{c.name}</p>
                <p className="text-[11px] uppercase tracking-[0.2em] mt-1 opacity-80">Shop now →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About preview */}
      <section className="bg-secondary/50 py-20 md:py-28">
        <div className="container-zoe grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <img src={aboutImg} alt="Zoe Essence craftsmanship" loading="lazy" width={1200} height={1400} className="w-full h-[55vh] object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Our Philosophy</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">Designed with intention. <span className="italic">Worn with confidence.</span></h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              At Zoe Essence, we believe in slow, thoughtful fashion. Each piece is crafted to honour the woman who wears it — timeless silhouettes, considered fabrics, and finishings that last.
            </p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] border-b border-foreground/40 hover:border-gold hover:text-gold pb-1 transition-colors">
              Read our story <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-zoe py-20 md:py-28">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Loved by women</p>
          <h2 className="font-serif text-4xl md:text-5xl">In their words</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <figure key={t.name} className="bg-card p-8 border border-border hover-lift">
              <blockquote className="font-serif text-xl leading-relaxed">"{t.text}"</blockquote>
              <figcaption className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">— {t.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-zoe text-center max-w-2xl">
          <h2 className="font-serif text-4xl md:text-5xl">Begin your Zoe Essence wardrobe</h2>
          <p className="mt-5 text-primary-foreground/80">Explore made-to-order pieces and timeless ready-to-wear.</p>
          <Link to="/shop" className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.2em] bg-gold text-gold-foreground hover:bg-gold/90 transition-colors">
            Shop the collection <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
