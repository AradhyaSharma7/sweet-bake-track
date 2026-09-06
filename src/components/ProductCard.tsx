import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { imageFor, rupees } from "@/lib/product-images";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/queries";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden"
      >
        <img
          src={imageFor(product.image_key)}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
            {product.badge}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{product.category}</p>
        <h3 className="mt-1 text-base">
          <Link to="/product/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg">{rupees(product.price)}</span>
          <Button
            size="sm"
            onClick={() => {
              add({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: Number(product.price),
                imageKey: product.image_key,
                quantity: 1,
              });
              toast.success(`${product.name} added to your basket`);
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
