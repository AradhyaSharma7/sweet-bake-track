import { Link } from "@tanstack/react-router";
import { CATEGORIES, categorySlug } from "@/lib/product-images";

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-lg">Nathan&rsquo;s Bakery</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Small-batch since 1998. Slow ferments, local grain, and cakes worth cancelling plans
            for.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Counter</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/shop" className="hover:text-foreground">
                Everything
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link
                  to="/shop/$category"
                  params={{ category: categorySlug(c) }}
                  className="hover:text-foreground"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Visit &amp; contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Phone: 892xxxxxxx</li>
            <li>nathan@bakery12345gmail.com</li>
            <li>Open daily 6:30am – 8:00pm</li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Find the shop
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Nathan&rsquo;s Bakery. Baked fresh every morning.
      </div>
    </footer>
  );
}
