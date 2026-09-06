import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-bakery.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our story — Nathan's Bakery" },
      {
        name: "description",
        content:
          "One oven, one family and three decades of early mornings. How Nathan's Bakery bakes bread the slow way.",
      },
      { property: "og:title", content: "Our story — Nathan's Bakery" },
      {
        property: "og:description",
        content: "One oven, one family and three decades of early mornings.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Our story</p>
      <h1 className="mt-2 text-4xl">One oven, one family, three decades of early mornings</h1>
      <img
        src={heroImage}
        alt="Bread and cakes cooling on the bakery counter"
        loading="lazy"
        width={1200}
        height={900}
        className="mt-8 aspect-16/9 w-full rounded-lg object-cover"
      />
      <div className="mt-8 space-y-5 text-muted-foreground">
        <p>
          Nathan started with a single deck oven and a stubborn belief that bread needs time, not
          shortcuts. Every loaf still rests overnight before it ever sees heat.
        </p>
        <p>
          We mill-order our flour from two farms within sixty miles, churn our own cultured butter
          for the croissants, and refuse to bake anything we wouldn&rsquo;t put on our own breakfast
          table.
        </p>
        <p>
          Whatever isn&rsquo;t sold by closing goes to the shelter two streets over. Nothing good
          should go stale in a bin.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          { n: "27", l: "Years baking" },
          { n: "480", l: "Loaves each day" },
          { n: "4.9", l: "Average rating" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border border-border bg-card p-6 text-center">
            <p className="font-display text-3xl">{s.n}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
      <Button asChild className="mt-10">
        <Link to="/shop">See what&rsquo;s baking</Link>
      </Button>
    </div>
  );
}
