import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Phone, MessageCircle, Music2, Mail } from "lucide-react";
import logo from "../../assets/zoeessence logo sm.png"


const items= [
     { icon: Phone, label: "Phone", value: "0802 342 1095", href: "tel:08023421095" },
    { icon: MessageCircle, label: "WhatsApp", value: "0814 440 8429", href: "https://wa.me/2348144408429" },
    { icon: Mail, label: "Email", value: "hello.zoeessence@gmail.com", href: "mailto:hello.zoeessence@gmail.com" },
    { icon: Instagram, label: "Instagram", value: "@__zoeessence", href: "https://instagram.com/__zoeessence" },
    { icon: Music2, label: "TikTok", value: "@_zoeessence", href: "https://tiktok.com/@_zoeessence" },
    { icon: Facebook, label: "Facebook", value: "Zoe Essence", href: "https://facebook.com/" },
  
]

export function Footer() {
  return (
    <footer className="mt-24 bg-secondary/60 border-t border-border">
      <div className="container-zoe py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-3xl">
            <img src={logo} alt="Zoe Essence Logo"  className="w-5/12"/>
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
     <div className="space-y-2.5 text-muted-foreground">
          {items.map((it) => (
          <a
            key={it.href}
            href={it.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-1 hover-lift"
          >
            <div className="h-11 w-11 flex items-center justify-center bg-secondary group-hover:bg-gold/20 transition-colors">
              <it.icon className="h-3 w-3" />
            </div>
            <div>
              <p className="font-serif mt-1">{it.value}</p>
            </div>
          </a>
        ))}
          </div>
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