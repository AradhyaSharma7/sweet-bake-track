import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Visit or call us — Nathan's Bakery" },
      {
        name: "description",
        content:
          "Opening hours, phone number and email for Nathan's Bakery, plus how custom cake orders work.",
      },
      { property: "og:title", content: "Visit or call us — Nathan's Bakery" },
      {
        property: "og:description",
        content: "Opening hours, phone, email and custom cake ordering at Nathan's Bakery.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl">Come say hello</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        The counter is busiest right after the 6:30am bake. For custom celebration cakes, please
        give us at least 48 hours.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <Phone className="h-5 w-5 text-crust" />
          <h2 className="mt-3 text-lg">Phone</h2>
          <p className="mt-1 text-muted-foreground">892xxxxxxx</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Mail className="h-5 w-5 text-crust" />
          <h2 className="mt-3 text-lg">Email</h2>
          <p className="mt-1 break-all text-muted-foreground">nathan@bakery12345gmail.com</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Clock className="h-5 w-5 text-crust" />
          <h2 className="mt-3 text-lg">Opening hours</h2>
          <p className="mt-1 text-muted-foreground">Every day, 6:30am – 8:00pm</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <MapPin className="h-5 w-5 text-crust" />
          <h2 className="mt-3 text-lg">The shop</h2>
          <p className="mt-1 text-muted-foreground">
            We haven&rsquo;t added the street address yet — send it over and it will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
