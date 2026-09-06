import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LiveMap } from "@/components/LiveMap";
import { supabase } from "@/integrations/supabase/client";
import { distanceKm, statusLabel } from "@/lib/queries";
import { rupees } from "@/lib/product-images";

export const Route = createFileRoute("/orders/$orderId/track")({
  head: () => ({
    meta: [
      { title: "Track your delivery — Nathan's Bakery" },
      {
        name: "description",
        content: "Follow your bakery delivery rider live on the map and see how far away they are.",
      },
      { property: "og:title", content: "Track your delivery — Nathan's Bakery" },
      { property: "og:description", content: "Follow your bakery rider live on the map." },
    ],
  }),
  component: Track,
});

type Delivery = {
  id: string;
  rider_name: string;
  rider_phone: string;
  is_sharing: boolean;
  last_lat: number | null;
  last_lng: number | null;
  last_seen_at: string | null;
  completed_at: string | null;
};

function Track() {
  const { orderId } = Route.useParams();
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    refetchInterval: 20000,
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("deliveries")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();
      if (active && data) setDelivery(data as unknown as Delivery);
    };
    load();

    const channel = supabase
      .channel(`delivery-${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deliveries", filter: `order_id=eq.${orderId}` },
        (payload) => setDelivery(payload.new as Delivery),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const rider =
    delivery?.last_lat != null && delivery?.last_lng != null
      ? { lat: delivery.last_lat, lng: delivery.last_lng }
      : null;
  const destination =
    order?.dest_lat != null && order?.dest_lng != null
      ? { lat: order.dest_lat as number, lng: order.dest_lng as number }
      : null;
  const away = rider && destination ? distanceKm(rider, destination) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link to="/orders" className="text-sm text-muted-foreground underline underline-offset-4">
        ← My orders
      </Link>
      <h1 className="mt-4 text-4xl">Your delivery</h1>
      {order && (
        <p className="mt-2 text-muted-foreground">
          Order #{orderId.slice(0, 8).toUpperCase()} · {statusLabel(order.status as string)} ·{" "}
          {rupees(order.total as number)}
        </p>
      )}

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        {delivery?.is_sharing ? (
          <p className="text-sm">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-crust" />
            {delivery.rider_name || "Your rider"} is sharing their location live
            {away != null && ` — about ${away.toFixed(1)} km away`}.
            {delivery.rider_phone && ` Call ${delivery.rider_phone}.`}
          </p>
        ) : delivery?.completed_at ? (
          <p className="text-sm">Delivered. Thank you for ordering with us.</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Waiting for a rider to pick up your order. This page updates by itself the moment they
            start moving.
          </p>
        )}
      </div>

      <div className="mt-5">
        <LiveMap rider={rider} destination={destination} className="h-96 w-full rounded-lg border border-border" />
        {!destination && (
          <p className="mt-2 text-xs text-muted-foreground">
            Tip: pin your exact delivery point at checkout to see the distance countdown.
          </p>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-secondary/40 p-5">
        <h2 className="text-lg">Your consent &amp; order confirmation form</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          When the rider arrives they&rsquo;ll hand you this form to read and sign. Once signed it
          is saved to your account.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/consent/$orderId" params={{ orderId }}>
            View the form
          </Link>
        </Button>
      </div>
    </div>
  );
}
