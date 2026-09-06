import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, categorySlug } from "@/lib/product-images";
import { productsQuery } from "@/lib/queries";

const titles: Record<string, { title: string; blurb: string }> = {
  breads: {
    title: "Breads",
    blurb: "Slow-fermented loaves, baked on stone and rested overnight before they see heat.",
  },
  pastries: {
    title: "Pastries",
    blurb: "Laminated over three days, folded around cultured butter and baked at six each morning.",
  },
  cakes: {
    title: "Cakes",
    blurb: "Whole cakes and cupcakes for birthdays, weddings and ordinary Tuesdays.",
  },
  cookies: {
    title: "Cookies & macarons",
    blurb: "Brown-butter cookies, crisp macaron shells and buttery shortbread by the box.",
  },
};

export const Route = createFileRoute("/shop/$category")({
  head: ({ params }) => {
    const meta = titles[params.category] ?? { title: "Counter", blurb: "Freshly baked every day." };
    return {
      meta: [
        { title: `${meta.title} — Nathan's Bakery` },
        { name: "description", content: meta.blurb },
        { property: "og:title", content: `${meta.title} — Nathan's Bakery` },
        { property: "og:description", content: meta.blurb },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { data: products, isLoading } = useQuery(productsQuery);
  const meta = titles[category] ?? { title: category, blurb: "Freshly baked every day." };
  const items = (products ?? []).filter((p) => categorySlug(p.category) === category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link to="/shop" className="text-sm text-muted-foreground underline underline-offset-4">
        ← All products
      </Link>
      <h1 className="mt-4 text-4xl">{meta.title}</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">{meta.blurb}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          to="/shop"
          className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-secondary"
        >
          All
        </Link>
        {CATEGORIES.map((c) => {
          const slug = categorySlug(c);
          const active = slug === category;
          return (
            <Link
              key={c}
              to="/shop/$category"
              params={{ category: slug }}
              className={
                active
                  ? "rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground"
                  : "rounded-full border border-border px-4 py-1.5 text-sm hover:bg-secondary"
              }
            >
              {c}
            </Link>
          );
        })}
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-muted-foreground">Nothing on this shelf right now.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
