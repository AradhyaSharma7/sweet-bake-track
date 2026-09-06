import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { rupees } from "@/lib/product-images";

export const Route = createFileRoute("/consent/$orderId")({
  head: () => ({
    meta: [
      { title: "Signed order form — Nathan's Bakery" },
      {
        name: "description",
        content: "Your signed bakery consent and order confirmation form, ready to save or print.",
      },
      { property: "og:title", content: "Signed order form — Nathan's Bakery" },
      { property: "og:description", content: "Your signed bakery order confirmation form." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConsentView,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-border py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value || "—"}</span>
    </div>
  );
}

function ConsentView() {
  const { orderId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["consent", orderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("consent_forms")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) return <p className="mx-auto max-w-2xl px-4 py-16">Loading…</p>;

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl">Not signed yet</h1>
        <p className="mt-3 text-muted-foreground">
          Your rider will bring this form to your door. Once you sign it, it appears here.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/orders">Back to my orders</Link>
        </Button>
      </div>
    );
  }

  const yn = (v: boolean) => (v ? "Yes" : "No");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="no-print mb-6 flex justify-between">
        <Link to="/orders" className="text-sm underline underline-offset-4">
          ← My orders
        </Link>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          Save as PDF
        </Button>
      </div>

      <h1 className="text-3xl">🍰 Bakery customer consent &amp; order confirmation</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Invoice {data.invoice_no} · signed {new Date(data.signed_at).toLocaleString()}
      </p>

      <h2 className="mt-8 text-xl">Customer details</h2>
      <Row label="Name" value={data.customer_name} />
      <Row label="Phone" value={data.phone} />
      <Row label="Email" value={data.email} />

      <h2 className="mt-8 text-xl">Order details</h2>
      <Row label="Order date" value={data.order_date} />
      <Row label="Delivery / pickup" value={data.delivery_datetime} />
      <Row label="Product" value={data.product_name} />
      <Row label="Flavour" value={data.flavour} />
      <Row label="Size / weight" value={data.weight} />
      <Row label="Design / theme" value={data.design_theme} />
      <Row label="Special instructions" value={data.special_instructions} />

      <h2 className="mt-8 text-xl">Consent</h2>
      <Row label="Design approved" value={yn(data.approve_design)} />
      <Row label="Handmade variation accepted" value={yn(data.accept_handmade_variation)} />
      <Row label="Allergies declared" value={data.allergies} />
      <Row label="Allergies informed" value={yn(data.informed_allergies)} />
      <Row label="Shared-kitchen risk accepted" value={yn(data.accept_allergen_environment)} />
      <Row
        label="No allergen-free guarantee accepted"
        value={yn(data.accept_no_allergen_free_guarantee)}
      />
      <Row label="Photography & marketing" value={yn(data.marketing_consent)} />
      <Row label="Acknowledged" value={yn(data.acknowledged)} />

      <h2 className="mt-8 text-xl">Payment</h2>
      <Row label="Order amount" value={rupees(Number(data.total_amount))} />
      <Row label="Advance paid" value={rupees(Number(data.advance_paid))} />
      <Row label="Balance due" value={rupees(Number(data.balance_due))} />
      <Row label="Status" value={data.payment_status} />

      <h2 className="mt-8 text-xl">Signatures</h2>
      <div className="mt-3 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Customer</p>
          {data.customer_signature && (
            <img
              src={data.customer_signature}
              alt="Customer signature"
              className="mt-2 h-24 rounded border border-border bg-white"
            />
          )}
          <p className="mt-1 text-sm">{data.customer_signed_name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Bakery representative</p>
          {data.rep_signature && (
            <img
              src={data.rep_signature}
              alt="Bakery representative signature"
              className="mt-2 h-24 rounded border border-border bg-white"
            />
          )}
          <p className="mt-1 text-sm">{data.rep_name}</p>
        </div>
      </div>

      <footer className="mt-10 border-t border-border pt-4 text-sm text-muted-foreground">
        NATHAN&rsquo;S BAKERY · Phone 892xxxxxxx · nathan@bakery12345gmail.com
      </footer>
    </div>
  );
}
