import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SignaturePad } from "@/components/SignaturePad";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/rider/$orderId/consent")({
  head: () => ({
    meta: [
      { title: "Consent form — Nathan's Bakery" },
      {
        name: "description",
        content: "Bakery customer consent and order confirmation form, signed at handover.",
      },
      { property: "og:title", content: "Consent form — Nathan's Bakery" },
      { property: "og:description", content: "Signed at handover by the customer." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RiderConsent,
});

function RiderConsent() {
  const { orderId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    order_date: "",
    delivery_datetime: "",
    product_name: "",
    flavour: "",
    weight: "",
    design_theme: "",
    special_instructions: "",
    allergies: "",
    total_amount: 0,
    advance_paid: 0,
    fulfilment: "delivery",
  });
  const [checks, setChecks] = useState({
    approve_design: false,
    accept_handmade_variation: false,
    informed_allergies: false,
    accept_allergen_environment: false,
    accept_no_allergen_free_guarantee: false,
    marketing_consent: false,
    acknowledged: false,
  });
  const [customerSignature, setCustomerSignature] = useState("");
  const [repSignature, setRepSignature] = useState("");
  const [signedName, setSignedName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const items = (data.order_items ?? []) as { name: string; flavour: string; weight: string; design_notes: string }[];
        setForm((f) => ({
          ...f,
          customer_name: data.customer_name as string,
          phone: data.phone as string,
          email: data.email as string,
          order_date: new Date(data.created_at as string).toLocaleDateString(),
          delivery_datetime: (data.slot as string) || new Date().toLocaleString(),
          product_name: items.map((i) => i.name).join(", "),
          flavour: items.map((i) => i.flavour).filter(Boolean).join(", "),
          weight: items.map((i) => i.weight).filter(Boolean).join(", "),
          design_theme: items.map((i) => i.design_notes).filter(Boolean).join(", "),
          special_instructions: (data.notes as string) || "",
          total_amount: Number(data.total),
          advance_paid: Number(data.advance_paid),
          fulfilment: data.fulfilment as string,
        }));
        setSignedName(data.customer_name as string);
      });
  }, [orderId]);

  const balance = Math.max(0, form.total_amount - form.advance_paid);

  async function save() {
    if (!checks.acknowledged || !customerSignature) {
      toast.error("The customer must acknowledge and sign the form");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("consent_forms").upsert(
      {
        order_id: orderId,
        ...form,
        ...checks,
        invoice_no: orderId.slice(0, 8).toUpperCase(),
        balance_due: balance,
        customer_signature: customerSignature,
        customer_signed_name: signedName,
        rep_signature: repSignature,
        rep_name: (user?.user_metadata?.["full_name"] as string) || user?.email || "",
        payment_status: balance === 0 ? "Paid" : "Balance due",
        signed_at: new Date().toISOString(),
      },
      { onConflict: "order_id" },
    );
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    await supabase.from("orders").update({ status: "delivered" }).eq("id", orderId);
    await supabase
      .from("deliveries")
      .update({ is_sharing: false, completed_at: new Date().toISOString() })
      .eq("order_id", orderId);
    toast.success("Form signed and saved");
    navigate({ to: "/consent/$orderId", params: { orderId } });
  }

  const field = (key: keyof typeof form, label: string, multiline = false) => (
    <div className="grid gap-2">
      <Label htmlFor={key}>{label}</Label>
      {multiline ? (
        <Textarea
          id={key}
          value={String(form[key])}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ) : (
        <Input
          id={key}
          value={String(form[key])}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      )}
    </div>
  );

  const check = (key: keyof typeof checks, label: string) => (
    <label className="flex items-start gap-3 text-sm">
      <Checkbox
        checked={checks[key]}
        onCheckedChange={(v) => setChecks({ ...checks, [key]: Boolean(v) })}
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl">🍰 Bakery customer consent &amp; order confirmation</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Hand the device to the customer to read, complete and sign.
      </p>

      <section className="mt-8 grid gap-4">
        <h2 className="text-xl">Customer details</h2>
        {field("customer_name", "Full name")}
        {field("phone", "Phone")}
        {field("email", "Email")}
      </section>

      <section className="mt-8 grid gap-4">
        <h2 className="text-xl">Order details</h2>
        {field("order_date", "Order date")}
        {field("delivery_datetime", "Delivery / pickup date & time")}
        {field("product_name", "Product")}
        {field("flavour", "Flavour")}
        {field("weight", "Size / weight")}
        {field("design_theme", "Design or theme")}
        {field("special_instructions", "Special instructions", true)}
      </section>

      <section className="mt-8 grid gap-3">
        <h2 className="text-xl">Custom design consent</h2>
        {check("approve_design", "I approve the design, colour and message as described above.")}
        {check(
          "accept_handmade_variation",
          "I understand every item is handmade, so slight variations in shade, finish and decoration are expected.",
        )}
      </section>

      <section className="mt-8 grid gap-3">
        <h2 className="text-xl">Allergen &amp; ingredient declaration</h2>
        {field("allergies", "Allergies or dietary requirements", true)}
        {check("informed_allergies", "I have informed the bakery of all allergies.")}
        {check(
          "accept_allergen_environment",
          "I understand the kitchen handles nuts, eggs, dairy, wheat and soy.",
        )}
        {check(
          "accept_no_allergen_free_guarantee",
          "I accept that the bakery cannot guarantee a completely allergen-free product.",
        )}
      </section>

      <section className="mt-8 grid gap-4">
        <h2 className="text-xl">Payment</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Order amount (₹)</Label>
            <Input
              type="number"
              value={form.total_amount}
              onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Advance paid (₹)</Label>
            <Input
              type="number"
              value={form.advance_paid}
              onChange={(e) => setForm({ ...form, advance_paid: Number(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Balance due (₹)</Label>
            <Input value={balance} readOnly />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-3">
        <h2 className="text-xl">Photography &amp; marketing</h2>
        {check(
          "marketing_consent",
          "Yes, the bakery may photograph my order and use the pictures on its website and social media.",
        )}
      </section>

      <section className="mt-8 grid gap-3">
        <h2 className="text-xl">Acknowledgement</h2>
        {check(
          "acknowledged",
          "I confirm the details above are correct, I have read the cancellation and allergen terms, and I accept the order as delivered.",
        )}
      </section>

      <section className="mt-8 grid gap-6">
        <div className="grid gap-2">
          <Label>Customer signature</Label>
          <SignaturePad onChange={setCustomerSignature} />
          <Input
            value={signedName}
            onChange={(e) => setSignedName(e.target.value)}
            placeholder="Name in capitals"
          />
        </div>
        <div className="grid gap-2">
          <Label>Bakery representative signature</Label>
          <SignaturePad onChange={setRepSignature} />
        </div>
      </section>

      <Button className="mt-8 w-full" size="lg" disabled={busy} onClick={save}>
        {busy ? "Saving…" : "Save signed form & mark delivered"}
      </Button>
    </div>
  );
}
