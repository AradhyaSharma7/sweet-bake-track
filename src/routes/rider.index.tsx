import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LiveMap } from "@/components/LiveMap";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { rupees } from "@/lib/product-images";
import { statusLabel } from "@/lib/queries";

export const Route = createFileRoute("/rider/")({
  head: () => ({
    meta: [
      { title: "Rider dashboard — Nathan's Bakery" },
      {
        name: "description",
        content:
          "Delivery riders claim orders, share their live location with the customer and collect the signed consent form.",
      },
      { property: "og:title", content: "Rider dashboard — Nathan's Bakery" },
      { property: "og:description", content: "Claim deliveries and share your live location." },
    ],
  }),
  component: RiderPage,
});

type Row = {
  id: string;
  status: string;
  customer_name: string;
  phone: string;
  address: string;
  total: number;
  rider_id: string | null;
  created_at: string;
  deliveries: { id: string; is_sharing: boolean; rider_id: string | null }[] | null;
};

function RiderPage() {
  const { user, isRider, loading } = useAuth();
  const [orders, setOrders] = useState<Row[]>([]);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const watchId = useRef<number | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, deliveries(*)")
      .eq("fulfilment", "delivery")
      .neq("status", "delivered")
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as unknown as Row[]);
  }, []);

  useEffect(() => {
    if (user && isRider) load();
  }, [user, isRider, load]);

  useEffect(() => {
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl">Rider sign in</h1>
        <Button asChild className="mt-6">
          <Link to="/auth" search={{ redirect: "/rider" }}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  if (!loading && user && !isRider) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl">This page is for delivery riders</h1>
        <p className="mt-3 text-muted-foreground">
          Create an account and choose &ldquo;Delivery rider&rdquo; to use it.
        </p>
      </div>
    );
  }

  async function claim(order: Row) {
    if (!user) return;
    const { error } = await supabase
      .from("orders")
      .update({ rider_id: user.id, status: "out_for_delivery" })
      .eq("id", order.id);
    if (error) return toast.error(error.message);
    await supabase
      .from("deliveries")
      .update({
        rider_id: user.id,
        rider_name: (user.user_metadata?.["full_name"] as string) || user.email || "Your rider",
        rider_phone: (user.user_metadata?.["phone"] as string) || "",
        started_at: new Date().toISOString(),
      })
      .eq("order_id", order.id);
    toast.success("Order claimed — start sharing your location");
    load();
  }

  async function startSharing(order: Row) {
    const delivery = order.deliveries?.[0];
    if (!delivery) return toast.error("No delivery record for this order");
    if (!navigator.geolocation) return toast.error("This device can't share a location");

    await supabase.from("deliveries").update({ is_sharing: true }).eq("id", delivery.id);
    setSharingId(order.id);
    toast.success("Sharing your live location with the customer");

    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMe(point);
        await supabase
          .from("deliveries")
          .update({
            last_lat: point.lat,
            last_lng: point.lng,
            last_seen_at: new Date().toISOString(),
            is_sharing: true,
          })
          .eq("id", delivery.id);
        await supabase.from("delivery_locations").insert({
          delivery_id: delivery.id,
          lat: point.lat,
          lng: point.lng,
          accuracy: pos.coords.accuracy,
        });
      },
      () => toast.error("Location permission is needed to share your position"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
  }

  async function stopSharing(order: Row) {
    const delivery = order.deliveries?.[0];
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setSharingId(null);
    if (delivery) await supabase.from("deliveries").update({ is_sharing: false }).eq("id", delivery.id);
  }

  const mine = orders.filter((o) => o.rider_id === user?.id);
  const open = orders.filter((o) => !o.rider_id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl">Rider dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Claim a delivery, share your live location, then collect the signed consent form at the
        door.
      </p>

      {sharingId && (
        <div className="mt-6">
          <LiveMap rider={me} className="h-64 w-full rounded-lg border border-border" />
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-2xl">Your deliveries</h2>
        {mine.length === 0 ? (
          <p className="mt-3 text-muted-foreground">Nothing claimed yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {mine.map((o) => (
              <li key={o.id} className="rounded-lg border border-border bg-card p-5">
                <p className="font-medium">
                  #{o.id.slice(0, 8).toUpperCase()} · {o.customer_name} · {rupees(o.total)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{o.address}</p>
                <p className="text-sm text-muted-foreground">
                  {o.phone} · {statusLabel(o.status)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sharingId === o.id ? (
                    <Button size="sm" variant="outline" onClick={() => stopSharing(o)}>
                      Stop sharing location
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => startSharing(o)}>
                      Share my live location
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" asChild>
                    <Link to="/rider/$orderId/consent" params={{ orderId: o.id }}>
                      Open consent form
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Waiting for a rider</h2>
        {open.length === 0 ? (
          <p className="mt-3 text-muted-foreground">No unclaimed deliveries right now.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {open.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-5"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    #{o.id.slice(0, 8).toUpperCase()} · {o.customer_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{o.address}</p>
                </div>
                <Button size="sm" onClick={() => claim(o)}>
                  Claim
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
