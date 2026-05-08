import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { Phone, MessageCircle, Instagram, Facebook, Music2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Zoe Essence" },
      { name: "description", content: "Reach Zoe Essence by phone, WhatsApp, Instagram, TikTok, or Facebook." },
      { property: "og:title", content: "Contact Zoe Essence" },
      { property: "og:description", content: "We'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const items = [
    { icon: Phone, label: "Phone", value: "0814 440 8429 · 0802 342 1095", href: "tel:08144408429" },
    { icon: MessageCircle, label: "WhatsApp", value: "0814 440 8429", href: "https://wa.me/2348144408429" },
    { icon: Instagram, label: "Instagram", value: "@__zoeessence", href: "https://instagram.com/__zoeessence" },
    { icon: Music2, label: "TikTok", value: "@_zoeessence", href: "https://tiktok.com/@_zoeessence" },
    { icon: Facebook, label: "Facebook", value: "Zoe Essence", href: "https://facebook.com/" },
  ];

  return (
    <Layout>
      <section className="container-zoe pt-16 md:pt-24 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-5">Get in touch</p>
        <h1 className="font-serif text-5xl md:text-7xl max-w-3xl leading-[1.05]">
          We'd love to <span className="italic">hear from you</span>.
        </h1>
        <p className="mt-6 text-muted-foreground max-w-xl">
          For orders, custom requests, or wardrobe management enquiries — reach out via any of the channels below.
        </p>
      </section>

      <section className="container-zoe pb-24 grid sm:grid-cols-2 gap-5">
        {items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-5 p-7 border border-border hover-lift"
          >
            <div className="h-11 w-11 flex items-center justify-center bg-secondary group-hover:bg-gold/20 transition-colors">
              <it.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{it.label}</p>
              <p className="font-serif text-xl mt-1">{it.value}</p>
            </div>
          </a>
        ))}
      </section>
    </Layout>
  );
}
