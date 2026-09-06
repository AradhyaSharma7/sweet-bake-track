import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductCard } from "@/components/ProductCard";
import { imageFor, rupees } from "@/lib/product-images";
import { productsQuery } from "@/lib/queries";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} — Nathan's Bakery` },
        {
          name: "description",
          content: `${name} from Nathan's Bakery, baked fresh each morning. Order for pickup or delivery.`,
        },
        { property: "og:title", content: `${name} — Nathan's Bakery` },
        {
          property: "og:description",
          content: `${name} from Nathan's Bakery, baked fresh each morning.`,
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: products, isLoading } = useQuery(productsQuery);
  const product = products?.find((p) => p.slug === slug);
  const { add } = useCart();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [flavour, setFlavour] = useState("");
  const [weight, setWeight] = useState("");
  const [designNotes, setDesignNotes] = useState("");

  if (isLoading) return <p className="mx-auto max-w-6xl px-4 py-16 text-muted-foreground">Loading…</p>;
  if (!product)
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl">We can&rsquo;t find that item</h1>
        <Link to="/shop" className="mt-4 inline-block underline underline-offset-4">
          Back to the counter
        </Link>
      </div>
    );

  const isCake = product.category === "Cakes";
  const related = (products ?? []).filter(
    (p) => p.category === product.category && p.id !== product.id,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link to="/shop" className="text-sm text-muted-foreground underline underline-offset-4">
        ← All products
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <img
          src={imageFor(product.image_key)}
          alt={product.name}
          width={800}
          height={800}
          className="aspect-square w-full rounded-lg object-cover"
        />
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            {product.category}
          </p>
          <h1 className="mt-2 text-4xl">{product.name}</h1>
          <p className="mt-3 font-display text-2xl">{rupees(product.price)}</p>
          <p className="mt-4 text-muted-foreground">{product.long_description}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Contains / may contain:</span>{" "}
            {product.allergens || "Ask us in store"}
          </p>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-28"
              />
            </div>
            {isCake && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="flavour">Flavour</Label>
                  <Input
                    id="flavour"
                    placeholder="e.g. dark chocolate, vanilla, red velvet"
                    value={flavour}
                    onChange={(e) => setFlavour(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    placeholder="e.g. 1 kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="design">Design / theme &amp; special instructions</Label>
                  <Textarea
                    id="design"
                    placeholder="Message on the cake, colours, theme, allergies…"
                    value={designNotes}
                    onChange={(e) => setDesignNotes(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => {
                add({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: Number(product.price),
                  imageKey: product.image_key,
                  quantity,
                  flavour,
                  weight,
                  designNotes,
                });
                toast.success(`${product.name} added to your basket`);
              }}
            >
              Add to basket
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                add({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: Number(product.price),
                  imageKey: product.image_key,
                  quantity,
                  flavour,
                  weight,
                  designNotes,
                });
                navigate({ to: "/checkout" });
              }}
            >
              Order now
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl">More {product.category.toLowerCase()}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
