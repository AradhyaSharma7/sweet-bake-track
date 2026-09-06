import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, Star, Truck } from "lucide-react";
import heroImage from "@/assets/hero-bakery.jpg";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, categorySlug, imageFor } from "@/lib/product-images";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nathan's Bakery — freshly baked bread, pastries & cakes" },
      {
        name: "description",
        content:
          "Sourdough, croissants and celebration cakes baked from 4am. Order for pickup or delivery and follow your rider live on a map.",
      },
      { property: "og:title", content: "Nathan's Bakery — freshly baked happiness" },
      {
        property: "og:description",
        content:
          "Sourdough, croissants and celebration cakes baked from 4am, with live delivery tracking.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products } = useQuery(productsQuery);
  const highlights = (products ?? []).filter((p) =>
    ["country-sourdough", "butter-croissant", "chocolate-fudge-cake", "almond-macarons"].includes(
      p.slug,
    ),
  );

  return (
    <>
      <section className="paper-grain border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
              Small-batch since 1998
            </p>
            <h1 className="mt-4 text-5xl leading-[1.05] md:text-6xl">
              Freshly baked
              <span className="block text-crust italic">happiness</span>
            </h1>
            <p className="mt-5 max-w-md text-muted-foreground">
              Nathan&rsquo;s Bakery wakes at 4am so your morning smells like butter and warm crust.
              Slow ferments, local grain, and cakes worth cancelling plans for.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/shop">Browse the counter</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Find the shop</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-honey" /> 4.9 from 1,240 reviews
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> First bake out at 6:30am
              </span>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Golden sourdough loaves, croissants and a layer cake on a rustic bakery counter"
              width={1200}
              height={900}
              className="aspect-4/3 w-full rounded-lg object-cover shadow-lg"
            />
            <div className="absolute -bottom-6 left-6 rounded-lg border border-border bg-card px-5 py-3 shadow-md">
              <p className="font-display text-2xl">480</p>
              <p className="text-xs text-muted-foreground">loaves baked daily</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl">Shop by counter</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/shop/$category"
              params={{ category: categorySlug(c) }}
              className="group relative overflow-hidden rounded-lg border border-border"
            >
              <img
                src={imageFor(
                  c === "Breads"
                    ? "sourdough"
                    : c === "Pastries"
                      ? "croissant"
                      : c === "Cakes"
                        ? "chocolatecake"
                        : "macarons",
                )}
                alt={c}
                loading="lazy"
                width={800}
                height={800}
                className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-4 py-1.5 text-sm font-medium">
                {c}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
              Today&rsquo;s counter
            </p>
            <h2 className="mt-2 text-3xl">Baked this morning</h2>
          </div>
          <Link to="/shop" className="text-sm underline underline-offset-4">
            See everything
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3">
          <div>
            <Truck className="h-6 w-6 text-crust" />
            <h3 className="mt-3 text-lg">Live delivery tracking</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The moment your order leaves the shop you get a map showing exactly where your rider
              is and how far away they are.
            </p>
          </div>
          <div>
            <MapPin className="h-6 w-6 text-crust" />
            <h3 className="mt-3 text-lg">Signed on the doorstep</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your rider carries the order confirmation and consent form. You read it, tick your
              choices and sign right on their screen.
            </p>
          </div>
          <div>
            <Clock className="h-6 w-6 text-crust" />
            <h3 className="mt-3 text-lg">Pickup in an hour</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Prefer to collect? We hold pickup orders at the counter until closing time.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Our story</p>
        <h2 className="mt-3 text-3xl">One oven, one family, three decades of early mornings</h2>
        <p className="mt-4 text-muted-foreground">
          Nathan started with a single deck oven and a stubborn belief that bread needs time, not
          shortcuts. Every loaf still rests overnight before it ever sees heat.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/about">Read our story</Link>
        </Button>
      </section>
    </>
  );
}
