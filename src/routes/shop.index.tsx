import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, categorySlug } from "@/lib/product-images";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop the counter — Nathan's Bakery" },
      {
        name: "description",
        content:
          "Every loaf, pastry, cake and cookie we bake, ready for pickup or delivery across the city.",
      },
      { property: "og:title", content: "Shop the counter — Nathan's Bakery" },
      {
        property: "og:description",
        content: "Every loaf, pastry, cake and cookie we bake, ready for pickup or delivery.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { data: products, isLoading } = useQuery(productsQuery);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">The whole counter</p>
      <h1 className="mt-2 text-4xl">Everything we bake</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Twenty things come out of our ovens each day. Add what you like to your basket, then choose
        pickup or delivery at checkout.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <span className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground">
          All
        </span>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            to="/shop/$category"
            params={{ category: categorySlug(c) }}
            className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-secondary"
          >
            {c}
          </Link>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading the counter…</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(products ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
