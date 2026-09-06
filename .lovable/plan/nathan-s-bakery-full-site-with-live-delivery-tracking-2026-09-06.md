# Nathan's Bakery — full site with live delivery tracking

Note: this project is currently empty. The bakery site you linked lives in a different project, so it gets rebuilt here in the same warm, rustic style (cream/butter background, deep crust brown, serif headings) and then expanded.

## Pages

- **Home** — hero, today's highlights, story, opening hours, contact.
- **Shop** — full product catalogue, far larger than the current 8 items: breads (sourdough, baguette, multigrain, focaccia, rye, brioche, ciabatta, milk bread), pastries (croissant, pain au chocolat, cinnamon roll, danish, puff), cakes (chocolate fudge, red velvet, black forest, cheesecake, custom celebration cakes), cookies & macarons, plus savoury items.
- **Category pages** — Breads, Pastries, Cakes, Cookies, each with its own page and photos.
- **Product page** — one page per item with photo, description, flavour/weight/quantity options, allergen notes, add to basket.
- **Cart & Checkout** — pickup or delivery, address, contact, advance payment amount, special instructions.
- **Order tracking** — live map of the delivery rider, ETA, order status.
- **My orders** — past and active orders for the signed-in customer.
- **Rider page** — the delivery person signs in, sees assigned orders, shares live location, and hands over the consent form at the door.
- **About** and **Contact**.
- **Sign in / Sign up**.

## Theme tab

A "Theme" item in the main navigation with Light and Dark options (plus "match my device"). The choice is remembered between visits and applies to every page.

## Ordering, tracking and the consent form

1. Customer places an order and it is saved to the account.
2. A rider is assigned; the customer's tracking page opens automatically after checkout.
3. The rider's phone shares real location while the delivery is active; the customer sees the marker move on the map in real time with a distance/ETA readout. Tracking stops when the order is completed.
4. On arrival the rider opens the consent form on the delivery, and the customer fills and signs it on the rider's screen with a finger/stylus signature.
5. The signed form is stored against the order and both customer and bakery can view or download it as a PDF afterwards.

The consent form follows your text exactly: customer details, order details, custom design consent checkboxes, allergen and ingredient declaration with a free-text allergy field, customer responsibility, pickup/delivery selection, payment and cancellation totals (order amount, advance paid, balance due in ₹), photography & marketing consent yes/no, acknowledgement list, customer + bakery representative signatures with dates, and the bakery-use-only status block. Footer shows Nathan's Bakery contact details as supplied.

## Accounts and stored data

Lovable Cloud is enabled for this project: email/password sign-in for customers and riders, and storage for products, orders, order items, rider assignments, live location points, and signed consent forms. Each customer only ever sees their own orders; riders only see orders assigned to them.

## Technical notes

- TanStack Start routes: `/`, `/shop`, `/shop/$category`, `/product/$slug`, `/cart`, `/checkout`, `/orders`, `/orders/$id/track`, `/rider`, `/rider/$orderId/consent`, `/consent/$orderId`, `/about`, `/contact`, `/auth`. Each gets its own head() metadata.
- Cloud (Supabase) tables: `profiles`, `user_roles` (customer/rider/admin via a separate roles table + `has_role`), `products`, `orders`, `order_items`, `deliveries`, `delivery_locations`, `consent_forms`. RLS on all, with explicit grants.
- Live location: rider page uses the browser Geolocation watch API, writes points to `delivery_locations`; the customer tracking page subscribes via Cloud realtime.
- Map rendering with a client-only Leaflet + OpenStreetMap component (no API key needed).
- Signature capture on a canvas, stored as an image; consent PDF generated client-side.
- Theme via a class-based dark variant already configured in `src/styles.css`, with a persisted preference.
- Product photography generated as images under `src/assets`.

## Build order

1. Cloud enabled, schema + seeded product catalogue.
2. Design system, layout, theme switcher, home page.
3. Shop, category, product, cart, checkout.
4. Auth and my-orders.
5. Rider page + live location sharing.
6. Customer live tracking map.
7. Consent form, signature, PDF.
