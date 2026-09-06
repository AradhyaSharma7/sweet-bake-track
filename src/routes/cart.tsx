import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { imageFor, rupees } from "@/lib/product-images";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your basket — Nathan's Bakery" },
      {
        name: "description",
        content: "Review the bakery items in your basket before choosing pickup or delivery.",
      },
      { property: "og:title", content: "Your basket — Nathan's Bakery" },
      { property: "og:description", content: "Review your bakery basket and check out." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, total, setQuantity, remove } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl">Your basket</h1>

      {lines.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">Nothing in here yet.</p>
          <Button asChild className="mt-4">
            <Link to="/shop">Browse the counter</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
            {lines.map((line) => (
              <li key={line.slug} className="flex flex-wrap items-center gap-4 p-4">
                <img
                  src={imageFor(line.imageKey)}
                  alt={line.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="h-20 w-20 rounded-md object-cover"
                />
                <div className="min-w-40 flex-1">
                  <p className="font-medium">{line.name}</p>
                  <p className="text-sm text-muted-foreground">{rupees(line.price)} each</p>
                  {(line.flavour || line.weight || line.designNotes) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[line.flavour, line.weight, line.designNotes].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <Input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => setQuantity(line.slug, Number(e.target.value))}
                  className="w-20"
                />
                <p className="w-24 text-right font-display text-lg">
                  {rupees(line.price * line.quantity)}
                </p>
                <Button variant="ghost" size="icon" onClick={() => remove(line.slug)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-5">
            <span className="text-lg">Total</span>
            <span className="font-display text-2xl">{rupees(total)}</span>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button asChild variant="outline">
              <Link to="/shop">Keep shopping</Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/checkout">Checkout</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
