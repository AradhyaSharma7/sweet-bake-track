import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { rupees } from "@/lib/product-images";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Nathan's Bakery" },
      {
        name: "description",
        content:
          "Choose pickup or delivery, confirm your details and place your bakery order with live rider tracking.",
      },
      { property: "og:title", content: "Checkout — Nathan's Bakery" },
      { property: "og:description", content: "Place your bakery order for pickup or delivery." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { lines, total, clear } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [advance, setAdvance] = useState("0");
  const [dest, setDest] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName((n) => n || (user.user_metadata?.["full_name"] as string) || "");
    supabase
      .from("profiles")
      .select("full_name, phone, address")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setName((n) => n || data.full_name);
        setPhone((p) => p || data.phone);
        setAddress((a) => a || data.address);
      });
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl">Sign in to order</h1>
        <p className="mt-3 text-muted-foreground">
          We keep your orders, delivery tracking and signed forms in your account.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth" search={{ redirect: "/checkout" }}>
            Sign in or create an account
          </Link>
        </Button>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl">Your basket is empty</h1>
        <Button asChild className="mt-6">
          <Link to="/shop">Browse the counter</Link>
        </Button>
      </div>
    );
  }

  async function placeOrder() {
    if (!user) return;
    if (!name.trim() || !phone.trim()) {
      toast.error("Please add your name and phone number");
      return;
    }
    if (fulfilment === "delivery" && !address.trim()) {
      toast.error("Please add a delivery address");
      return;
    }
    setBusy(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        fulfilment,
        customer_name: name,
        phone,
        email: user.email ?? "",
        address: fulfilment === "delivery" ? address : "Collect at the shop",
        notes,
        slot,
        total,
        advance_paid: Number(advance) || 0,
        dest_lat: dest?.lat ?? null,
        dest_lng: dest?.lng ?? null,
      })
      .select()
      .single();

    if (error || !order) {
      setBusy(false);
      toast.error(error?.message ?? "We couldn't place that order");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.productId,
        name: l.name,
        unit_price: l.price,
        quantity: l.quantity,
        flavour: l.flavour ?? "",
        weight: l.weight ?? "",
        design_notes: l.designNotes ?? "",
      })),
    );
    if (itemsError) {
      setBusy(false);
      toast.error(itemsError.message);
      return;
    }

    await supabase
      .from("profiles")
      .update({ full_name: name, phone, address })
      .eq("id", user.id);

    clear();
    toast.success("Order placed! Follow your rider on the tracking page.");
    navigate({ to: "/orders/$orderId/track", params: { orderId: order.id } });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr]">
      <div>
        <h1 className="text-4xl">Checkout</h1>

        <div className="mt-8 grid gap-5">
          <div>
            <Label>How would you like it?</Label>
            <div className="mt-2 flex gap-2">
              {(["delivery", "pickup"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFulfilment(f)}
                  className={
                    fulfilment === f
                      ? "rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
                      : "rounded-full border border-border px-5 py-2 text-sm hover:bg-secondary"
                  }
                >
                  {f === "delivery" ? "Delivery" : "Pickup at the shop"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {fulfilment === "delivery" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="address">Delivery address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat, street, landmark, pin code"
                />
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-4">
                <p className="text-sm">
                  Pin your exact spot so your rider&rsquo;s live position is measured against the
                  right door.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        toast.error("This device can't share a location");
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (p) => {
                          setDest({ lat: p.coords.latitude, lng: p.coords.longitude });
                          toast.success("Delivery point pinned");
                        },
                        () => toast.error("We couldn't get your location"),
                      );
                    }}
                  >
                    Use my current location
                  </Button>
                  {dest && (
                    <span className="text-xs text-muted-foreground">
                      Pinned at {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="slot">Preferred date &amp; time</Label>
            <Input
              id="slot"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              placeholder="e.g. tomorrow, 5pm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Special instructions</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, message on the cake, gate code…"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="advance">Advance paid (₹)</Label>
            <Input
              id="advance"
              type="number"
              min={0}
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
              className="w-40"
            />
            <p className="text-xs text-muted-foreground">
              Custom cakes usually need an advance. The balance is collected on delivery.
            </p>
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((l) => (
            <li key={l.slug} className="flex justify-between gap-4">
              <span>
                {l.name} × {l.quantity}
              </span>
              <span>{rupees(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-display text-xl">{rupees(total)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-muted-foreground">
            <span>Balance due on handover</span>
            <span>{rupees(Math.max(0, total - (Number(advance) || 0)))}</span>
          </div>
        </div>
        <Button className="mt-6 w-full" size="lg" disabled={busy} onClick={placeOrder}>
          {busy ? "Placing order…" : "Place order"}
        </Button>
      </aside>
    </div>
  );
}
