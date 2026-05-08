import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import aboutImg from "@/assets/about.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Zoe Essence" },
      { name: "description", content: "The story behind Zoe Essence: made-to-order garments, intentional production, and timeless elegance." },
      { property: "og:title", content: "About Zoe Essence" },
      { property: "og:description", content: "Made-to-order. Intentional. Timeless." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Layout>
      <section className="container-zoe pt-16 md:pt-24 pb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-5">Our Story</p>
        <h1 className="font-serif text-5xl md:text-7xl max-w-4xl leading-[1.05] text-balance">
          Fashion that honours <span className="italic">the woman who wears it</span>.
        </h1>
      </section>

      <section className="container-zoe grid lg:grid-cols-2 gap-12 lg:gap-20 items-center pb-20 md:pb-28">
        <img src={aboutImg} alt="Zoe Essence craftsmanship" loading="lazy" className="w-full h-[60vh] object-cover" />
        <div className="space-y-6 text-lg leading-relaxed text-foreground/85">
          <p>
            Zoe Essence was born from a simple conviction: that fashion should be made with care,
            for women who care. Every silhouette begins as an idea, sketched and refined until it
            captures something quietly powerful.
          </p>
          <p>
            We design and produce in small, intentional batches. Each made-to-order piece is
            crafted in five to seven working days, allowing us to honour fit, fabric, and finishing
            in a way mass production never can.
          </p>
        </div>
      </section>

      <section className="bg-secondary/50 py-20 md:py-28">
        <div className="container-zoe grid md:grid-cols-3 gap-10">
          {[
            { title: "Made-to-Order", body: "Garments crafted to your measurements within 5–7 working days." },
            { title: "Intentional Production", body: "Small batches, considered fabrics, no waste, no compromise." },
            { title: "Timeless Quality", body: "Pieces designed to live in your wardrobe for seasons to come." },
          ].map((b) => (
            <div key={b.title} className="border-l-2 border-gold pl-6">
              <h3 className="font-serif text-2xl mb-3">{b.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-zoe py-20 md:py-28 text-center max-w-2xl">
        <h2 className="font-serif text-4xl md:text-5xl">Discover the collection</h2>
        <p className="mt-5 text-muted-foreground">From signature dresses to curated accessories.</p>
        <Link to="/shop" className="mt-10 inline-flex items-center px-8 py-3.5 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Shop now
        </Link>
      </section>
    </Layout>
  );
}
