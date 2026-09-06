import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { myOrdersQuery, statusLabel } from "@/lib/queries";
import { rupees } from "@/lib/product-images";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — Nathan's Bakery" },
      {
        name: "description",
        content: "Every bakery order you've placed, with live tracking and signed order forms.",
      },
      { property: "og:title", content: "My orders — Nathan's Bakery" },
      { property: "og:description", content: "Track your bakery orders and view signed forms." },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { user, loading } = useAuth();
  const { data: orders, isLoading } = useQuery(myOrdersQuery(user?.id));

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl">Sign in to see your orders</h1>
        <Button asChild className="mt-6">
          <Link to="/auth" search={{ redirect: "/orders" }}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl">My orders</h1>
      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading…</p>
      ) : (orders ?? []).length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
          <Button asChild className="mt-4">
            <Link to="/shop">Browse the counter</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {(orders ?? []).map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-5"
            >
              <div className="flex-1">
                <p className="font-medium">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(o.created_at).toLocaleString()} ·{" "}
                  {o.fulfilment === "delivery" ? "Delivery" : "Pickup"} · {statusLabel(o.status)}
                </p>
              </div>
              <span className="font-display text-lg">{rupees(o.total)}</span>
              <div className="flex gap-2">
                {o.fulfilment === "delivery" && (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/orders/$orderId/track" params={{ orderId: o.id }}>
                      Track
                    </Link>
                  </Button>
                )}
                <Button asChild size="sm" variant="ghost">
                  <Link to="/consent/$orderId" params={{ orderId: o.id }}>
                    Form
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
