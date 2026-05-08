import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Phone, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-secondary/60 border-t border-border">
      <div className="container-zoe py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-3xl">
            Zoe<span className="text-gold"> Essence</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Contemporary fashion crafted with intention. Made-to-order garments,
            ready-to-wear, and curated accessories for the woman of substance.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground">Shop</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] mb-4">Connect</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> 0814 440 8429</li>
            <li className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp: 0814 440 8429</li>
            <li className="flex items-center gap-2"><Instagram className="h-3.5 w-3.5" /> @__zoeessence</li>
            <li className="flex items-center gap-2"><Facebook className="h-3.5 w-3.5" /> Zoe Essence</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-zoe py-6 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Zoe Essence. All rights reserved.</span>
          <span>Crafted with intention.</span>
        </div>
      </div>
    </footer>
  );
}
