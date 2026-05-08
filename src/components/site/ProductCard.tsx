import { Link } from "@tanstack/react-router";
import { formatNaira } from "@/lib/format";

export interface ProductCardData {
  id: string;
  title: string;
  category: string;
  price: number;
  image_url: string | null;
  tags?: string[] | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const tag = product.tags?.[0];
  return (
    <Link
      to="/shop/$id"
      params={{ id: product.id }}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted img-zoom">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        {tag && (
          <span className="absolute top-3 left-3 bg-background/90 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1">
            {tag}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </p>
          <h3 className="font-serif text-lg mt-1 leading-tight group-hover:text-gold transition-colors">
            {product.title}
          </h3>
        </div>
        <span className="text-sm whitespace-nowrap pt-5">{formatNaira(product.price)}</span>
      </div>
    </Link>
  );
}
